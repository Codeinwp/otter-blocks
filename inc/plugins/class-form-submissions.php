<?php
/**
 * Form Block Submissions Storing.
 *
 * Core storage for Form submissions: every valid submission is persisted as an
 * `otter_form_record` post before any delivery action runs, regardless of plan.
 * Pro adds filtering, export and advanced search on top.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Integration\Form_Settings_Data;
use ThemeIsle\GutenbergBlocks\Pro;
use ThemeIsle\GutenbergBlocks\Server\Form_Server;
use WP_Post;
use WP_Query;

/**
 * Class Form_Submissions
 */
class Form_Submissions {
	/**
	 * Form record post type.
	 */
	const FORM_RECORD_TYPE = 'otter_form_record';

	/**
	 * Form record meta key.
	 */
	const FORM_RECORD_META_KEY = 'otter_form_record_meta';

	/**
	 * Delivery status meta key. Values: 'complete' or 'failed'.
	 */
	const DELIVERY_STATUS_META_KEY = 'otter_form_record_delivery_status';

	/**
	 * Delivery errors meta key. An array naming which delivery actions failed and why.
	 */
	const DELIVERY_ERRORS_META_KEY = 'otter_form_record_delivery_errors';

	/**
	 * Delivery status: all primary delivery actions succeeded.
	 */
	const DELIVERY_STATUS_COMPLETE = 'complete';

	/**
	 * Delivery status: at least one primary delivery action failed.
	 */
	const DELIVERY_STATUS_FAILED = 'failed';

	/**
	 * The main instance var.
	 *
	 * @var Form_Submissions|null
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 *
	 * @return void
	 */
	public function init() {
		( new Form_Records_Files() )->register();

		/**
		 * Shim for version skew: an older Otter Pro build with an active license still owns
		 * storage (its Form_Emails_Storing registers the CPT, the dashboard and the save
		 * hook), so defer the UI/CPT registration to it to avoid double registration; the
		 * updated Pro build is a thin extension and exposes the `is_thin_extension` marker.
		 *
		 * Storage ordering must not regress though: the bridge removes the legacy
		 * after-delivery save and lets Lite create the record before delivery, without the
		 * old save-location gate.
		 */
		if (
			class_exists( '\ThemeIsle\OtterPro\Plugins\Form_Emails_Storing' ) &&
			! method_exists( '\ThemeIsle\OtterPro\Plugins\Form_Emails_Storing', 'is_thin_extension' ) &&
			class_exists( '\ThemeIsle\OtterPro\Plugins\License' ) &&
			\ThemeIsle\OtterPro\Plugins\License::has_active_license()
		) {
			add_action( 'otter_form_record_save', array( $this, 'bridge_legacy_pro_store' ) );
			add_action( 'otter_form_after_submit', array( $this, 'record_delivery_status' ), PHP_INT_MAX );
			add_action( 'otter_form_issues_handler', array( $this, 'record_delivery_status' ), PHP_INT_MAX );
			return;
		}

		add_action( 'init', array( $this, 'create_form_records_type' ) );
		add_action( 'admin_init', array( $this, 'set_form_records_cap' ), 10, 0 );

		/**
		 * Save the submission before any delivery action runs, then record the delivery
		 * outcome after all the after-submit actions have finished. The issues handler runs
		 * in the request's `finally` block, so the status is also written when a delivery
		 * handler throws and `otter_form_after_submit` never fires.
		 */
		add_action( 'otter_form_record_save', array( $this, 'store_form_record' ) );
		add_action( 'otter_form_after_submit', array( $this, 'record_delivery_status' ), PHP_INT_MAX );
		add_action( 'otter_form_issues_handler', array( $this, 'record_delivery_status' ), PHP_INT_MAX );

		( new Form_Records_List_Table() )->register();

		// Status mutations triggered from the list table.
		add_filter( 'handle_bulk_actions-edit-' . self::FORM_RECORD_TYPE, array( $this, 'handle_form_record_bulk_actions' ), 0, 3 );
		add_filter( 'wp_untrash_post_status', array( $this, 'restore_status_on_untrash' ), 10, 3 );

		( new Form_Records_Filters() )->register();

		// Implement row actions behaviour.
		add_action( 'admin_action_row-read', array( $this, 'read_otter_form_record' ) );
		add_action( 'admin_action_row-unread', array( $this, 'unread_otter_form_record' ) );
		add_action( 'admin_action_edit', array( $this, 'mark_read_on_edit' ) );

		( new Form_Records_Meta_Box() )->register();

		add_filter( 'otter_form_record_confirm', array( $this, 'confirm_submission' ), 10, 2 );

		add_action( 'draft_to_unread', array( $this, 'apply_hooks_on_draft_transition' ), 10 );
		add_action( 'otter_form_update_record_meta_dump', array( $this, 'update_submission_dump_data' ), 10, 2 );
		add_action( 'otter_form_automatic_confirmation', array( $this, 'move_old_stripe_draft_sessions_to_unread' ) );

		add_action( 'wp_ajax_otter_form_submissions', array( $this, 'export_submissions' ) );
	}

	/**
	 * Get delivery failure actions keyed by response error code.
	 *
	 * @return array<int|string, string>
	 */
	public static function get_delivery_failure_actions() {
		return array(
			Form_Data_Response::ERROR_CAPTCHA_PROVIDER_UNREACHABLE => 'captcha',
			Form_Data_Response::ERROR_EMAIL_NOT_SEND       => 'email',
			Form_Data_Response::ERROR_WEBHOOK_COULD_NOT_TRIGGER => 'webhook',
			Form_Data_Response::ERROR_PROVIDER_SUBSCRIBE_ERROR => 'subscribe',
			Form_Data_Response::ERROR_PROVIDER_CREDENTIAL_ERROR => 'subscribe',
			Form_Data_Response::ERROR_PROVIDER_INVALID_KEY => 'subscribe',
			Form_Data_Response::ERROR_PROVIDER_INVALID_API_KEY_FORMAT => 'subscribe',
			Form_Data_Response::ERROR_PROVIDER_INVALID_EMAIL => 'subscribe',
			Form_Data_Response::ERROR_MISSING_EMAIL        => 'subscribe',
			Form_Data_Response::ERROR_PROVIDER_NOT_REGISTERED => 'provider',
			Form_Data_Response::ERROR_RUNTIME_ERROR        => 'provider',
		);
	}

	/**
	 * Create custom post type for form records.
	 *
	 * @return void
	 */
	public function create_form_records_type() {
		register_post_type(
			self::FORM_RECORD_TYPE,
			array(
				'labels'          => array(
					'name'               => esc_html_x( 'Form Submissions', '', 'otter-blocks' ),
					'singular_name'      => esc_html_x( 'Form Submission', '', 'otter-blocks' ),
					'search_items'       => esc_html__( 'Search Submissions', 'otter-blocks' ),
					'all_items'          => esc_html__( 'Form Submissions', 'otter-blocks' ),
					'view_item'          => esc_html__( 'View Submission', 'otter-blocks' ),
					'update_item'        => esc_html__( 'Update Submission', 'otter-blocks' ),
					'not_found'          => esc_html__( 'No submissions found', 'otter-blocks' ),
					'not_found_in_trash' => esc_html__( 'No submissions found in the Trash', 'otter-blocks' ),
				),
				'capability_type' => self::FORM_RECORD_TYPE,
				'capabilities'    => array(
					'create_posts' => 'create_otter_form_records',
				),
				'description'     => __( 'Holds the data from the form submissions', 'otter-blocks' ),
				'public'          => false,
				'show_ui'         => true,
				'show_in_rest'    => false,
				'supports'        => array( 'title' ),
			)
		);

		register_post_status(
			'read',
			array(
				'label'                     => _x( 'Read', 'otter-form-record', 'otter-blocks' ),
				'public'                    => true,
				'exclude_from_search'       => false,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true,
				/* translators: %s the number of posts */
				'label_count'               => _n_noop(
					'Read <span class="count">(%s)</span>',
					'Read <span class="count">(%s)</span>',
					'otter-blocks'
				),
			)
		);

		register_post_status(
			'unread',
			array(
				'label'                     => _x( 'Unread', 'otter-form-record', 'otter-blocks' ),
				'public'                    => true,
				'exclude_from_search'       => false,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true,
				/* translators: %s the number of posts */
				'label_count'               => _n_noop(
					'Unread <span class="count">(%s)</span>',
					'Unread <span class="count">(%s)</span>',
					'otter-blocks'
				),
			)
		);
	}

	/**
	 * Set custom capabilities for otter_form_record.
	 *
	 * @return void
	 */
	public function set_form_records_cap() {
		$role = get_role( 'administrator' );

		if ( null === $role ) {
			return;
		}

		if ( ! method_exists( $role, 'add_cap' ) ) {
			return;
		}

		$role->add_cap( 'edit_' . self::FORM_RECORD_TYPE );
		$role->add_cap( 'read_' . self::FORM_RECORD_TYPE );
		$role->add_cap( 'delete_' . self::FORM_RECORD_TYPE );
		$role->add_cap( 'edit_' . self::FORM_RECORD_TYPE . 's' );
		$role->add_cap( 'read_' . self::FORM_RECORD_TYPE . 's' );
		$role->add_cap( 'delete_' . self::FORM_RECORD_TYPE . 's' );
		$role->remove_cap( 'create_' . self::FORM_RECORD_TYPE );
		$role->remove_cap( 'create_' . self::FORM_RECORD_TYPE . 's' );
	}

	/**
	 * Store form record in custom post type.
	 *
	 * Runs on `otter_form_record_save`, before primary delivery. Every valid submission
	 * is saved, regardless of plan or the former "Email Only" setting.
	 *
	 * @param Form_Data_Request $form_data The form data object.
	 * @return Form_Data_Request The form data object.
	 */
	public function store_form_record( $form_data ) {
		if (
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof Form_Data_Request ) ||
			$form_data->has_error()
		) {
			return $form_data;
		}

		$form_options = $form_data->get_wp_options();

		if ( ! isset( $form_options ) ) {
			return $form_data;
		}

		/**
		 * Payment confirmation re-fires the submit hooks for a Record that already exists
		 * (the confirmed draft) — never create a second Record for it.
		 */
		if ( $form_data->is_duplicate() || $form_data->has_record_id() ) {
			return $form_data;
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => self::FORM_RECORD_TYPE,
				// An infrastructure failure never reaches payment, so its record is a regular (visible) one.
				'post_status' => $form_data->is_temporary() && ! $form_data->has_infrastructure_failure() ? 'draft' : 'unread',
			)
		);

		if ( ! $post_id ) {
			return $form_data;
		}

		wp_update_post(
			array(
				'ID'         => $post_id,
				/* translators: %s the ID of the submission */
				'post_title' => sprintf( __( 'Submission #%s', 'otter-blocks' ), $post_id ),
			)
		);

		$meta = array(
			'form'     => array(
				'label' => __( 'Form', 'otter-blocks' ),
				'value' => $form_data->get_data_from_payload( 'formId' ),
			),
			'post_url' => array(
				'label' => __( 'Post URL', 'otter-blocks' ),
				'value' => $form_data->get_data_from_payload( 'postUrl' ),
			),
			'post_id'  => array(
				'label' => __( 'Post ID', 'otter-blocks' ),
				'value' => $form_data->get_data_from_payload( 'postId' ),
			),
			'dump'     => array(
				'label' => __( 'Dumped data', 'otter-blocks' ),
				'value' => $form_data->is_temporary() ? $form_data->dump_data() : array(),
			),
		);

		$form_inputs    = $form_data->get_fields();
		$uploaded_files = $form_data->get_uploaded_files_path();
		$media_files    = $form_data->get_files_loaded_to_media_library();

		foreach ( $form_inputs as $input ) {
			if ( ! isset( $input['id'] ) ) {
				continue;
			}

			$id = substr( $input['id'], -8 );

			if ( 'file' === $input['type'] ) {
				$id .= $input['metadata']['name'] . '_' . $input['metadata']['size'];

				$meta['inputs'][ $id ] = array(
					'label'    => $input['label'],
					'value'    => $input['value'],
					'type'     => $input['type'],
					'metadata' => $input['metadata'],
				);

				$file_data_key = $input['metadata']['data'];

				if ( isset( $media_files[ $file_data_key ] ) ) {
					$meta['inputs'][ $id ] = array_merge(
						$meta['inputs'][ $id ],
						array(
							'path'           => $media_files[ $file_data_key ]['file_path'],
							'mime_type'      => $media_files[ $file_data_key ]['file_type'],
							'attachment_id'  => $media_files[ $file_data_key ]['file_id'],
							'saved_in_media' => true,
						)
					);
				} elseif ( isset( $uploaded_files[ $file_data_key ] ) ) {
					$meta['inputs'][ $id ] = array_merge(
						$meta['inputs'][ $id ],
						array(
							'path'           => $uploaded_files[ $file_data_key ]['file_path'],
							'mime_type'      => $uploaded_files[ $file_data_key ]['file_type'],
							'saved_in_media' => false,
						)
					);
				}
			} else {
				$meta['inputs'][ $id ] = array(
					'label'    => $input['label'],
					'value'    => $input['value'],
					'type'     => $input['type'],
					'metadata' => $input['metadata'],
				);
			}
		}

		// Slash the value: add_post_meta() unslashes it, which would otherwise strip backslashes from the submitted data.
		add_post_meta( $post_id, self::FORM_RECORD_META_KEY, wp_slash( $meta ) );

		wp_cache_delete( 'otter_form_records', 'otter_form' );

		$form_data->set_record_id( $post_id );

		if ( $form_data->has_infrastructure_failure() ) {
			$this->write_delivery_meta(
				$post_id,
				self::DELIVERY_STATUS_FAILED,
				array(
					array(
						'action'  => 'captcha',
						'code'    => $form_data->get_infrastructure_failure_code(),
						'message' => Form_Data_Response::get_error_code_message( $form_data->get_infrastructure_failure_code() ),
					),
				)
			);
		}

		return $form_data;
	}

	/**
	 * Bridge the save-before-delivery hook for an older Otter Pro build that still owns
	 * storage UI/CPT registration, and unhook its legacy after-delivery save so the
	 * record is neither lost on delivery failure nor stored twice.
	 *
	 * @param Form_Data_Request $form_data The form data object.
	 * @return Form_Data_Request The form data object.
	 */
	public function bridge_legacy_pro_store( $form_data ) {
		if ( ! class_exists( '\ThemeIsle\OtterPro\Plugins\Form_Emails_Storing' ) ) {
			return $form_data;
		}

		$legacy = \ThemeIsle\OtterPro\Plugins\Form_Emails_Storing::$instance;

		if ( ! $legacy ) {
			return $form_data;
		}

		remove_action( 'otter_form_after_submit', array( $legacy, 'store_form_record' ) );

		/**
		 * The legacy Form_Pro_Features deletes uploads after delivery when the save
		 * location is 'email'; now that the record is always saved it would delete the
		 * files the record references, so unhook it as well.
		 */
		if ( class_exists( '\ThemeIsle\OtterPro\Plugins\Form_Pro_Features' ) ) {
			$legacy_features = \ThemeIsle\OtterPro\Plugins\Form_Pro_Features::$instance;

			// @phpstan-ignore-next-line the method is missing in older Otter Pro versions.
			if ( $legacy_features && method_exists( $legacy_features, 'clean_files_from_uploads' ) ) {
				remove_action( 'otter_form_after_submit', array( $legacy_features, 'clean_files_from_uploads' ) );
			}
		}

		return $this->store_form_record( $form_data );
	}

	/**
	 * Record the Delivery Status on the Submission Record after all primary delivery
	 * actions have run. Autoresponder failures do not affect the Delivery Status.
	 *
	 * @param Form_Data_Request $form_data The form data object.
	 * @return void
	 */
	public function record_delivery_status( $form_data ) {
		if (
			! ( $form_data instanceof Form_Data_Request ) ||
			! $form_data->has_record_id() ||
			$form_data->is_temporary() // Payment-gated: delivery runs only after payment confirmation.
		) {
			return;
		}

		$delivery_actions = self::get_delivery_failure_actions();

		$errors = array();

		foreach ( $form_data->get_warning_codes() as $warning ) {
			if ( ! isset( $delivery_actions[ $warning['code'] ] ) ) {
				continue;
			}

			$errors[] = array(
				'action'  => $delivery_actions[ $warning['code'] ],
				'code'    => $warning['code'],
				'message' => ! empty( $warning['details'] ) ? $warning['details'] : Form_Data_Response::get_error_code_message( $warning['code'] ),
			);
		}

		// Errors are not always doubled by a warning (e.g. a failed wp_mail in send_default_email).
		if ( $form_data->has_error() && isset( $delivery_actions[ $form_data->get_error_code() ] ) ) {
			$already_recorded = false;
			foreach ( $errors as $error ) {
				if ( $error['code'] === $form_data->get_error_code() ) {
					$already_recorded = true;
					break;
				}
			}

			if ( ! $already_recorded ) {
				$errors[] = array(
					'action'  => $delivery_actions[ $form_data->get_error_code() ],
					'code'    => $form_data->get_error_code(),
					'message' => Form_Data_Response::get_error_code_message( $form_data->get_error_code() ),
				);
			}
		}

		$this->write_delivery_meta(
			$form_data->get_record_id(),
			empty( $errors ) ? self::DELIVERY_STATUS_COMPLETE : self::DELIVERY_STATUS_FAILED,
			$errors
		);
	}

	/**
	 * Write the delivery status meta on a Record.
	 *
	 * @param int                               $record_id The record post ID.
	 * @param string                            $status The delivery status.
	 * @param array<array<string, string|null>> $errors The delivery errors.
	 * @return void
	 */
	private function write_delivery_meta( $record_id, $status, $errors = array() ) {
		update_post_meta( $record_id, self::DELIVERY_STATUS_META_KEY, $status );

		if ( empty( $errors ) ) {
			delete_post_meta( $record_id, self::DELIVERY_ERRORS_META_KEY );
		} else {
			update_post_meta( $record_id, self::DELIVERY_ERRORS_META_KEY, $errors );
		}
	}

	/**
	 * Handle form record bulk actions.
	 *
	 * @param string $redirect The redirect URL.
	 * @param string $doaction The action being taken.
	 * @param array  $object_ids The object IDs.
	 *
	 * @return string
	 */
	public function handle_form_record_bulk_actions( $redirect, $doaction, $object_ids ) {
		$redirect = remove_query_arg( 'post_status', $redirect );

		switch ( $doaction ) {
			case 'read':
				foreach ( $object_ids as $object_id ) {
					if ( ! current_user_can( 'edit_post', $object_id ) ) {
						continue;
					}

					wp_update_post(
						array(
							'ID'          => $object_id,
							'post_status' => 'read',
						)
					);
				}

				$redirect = add_query_arg( 'post_status', 'read', $redirect );
				break;
			case 'unread':
				foreach ( $object_ids as $object_id ) {
					if ( ! current_user_can( 'edit_post', $object_id ) ) {
						continue;
					}

					wp_update_post(
						array(
							'ID'          => $object_id,
							'post_status' => 'unread',
						)
					);
				}

				$redirect = add_query_arg( 'post_status', 'unread', $redirect );
				break;
		}

		return $redirect;
	}

	/**
	 * Restore a form record to its pre-trash status when it is untrashed.
	 *
	 * WP core restores untrashed posts to 'draft', which for form records is the
	 * payment-pending status: a confirmed 'unread'/'read' record would show up as
	 * pending, while a genuinely pending 'draft' record must stay 'draft' so
	 * `confirm_submission()` can still deliver it after payment.
	 *
	 * @param string $new_status The status the post is about to be restored to.
	 * @param int    $post_id The post ID.
	 * @param string $previous_status The status the post had before it was trashed.
	 *
	 * @return string
	 */
	public function restore_status_on_untrash( $new_status, $post_id, $previous_status ) {
		if ( self::FORM_RECORD_TYPE !== get_post_type( $post_id ) || empty( $previous_status ) ) {
			return $new_status;
		}

		return $previous_status;
	}

	/**
	 * Mark form record as read when it is edited.
	 *
	 * @return void
	 */
	public function mark_read_on_edit() {
		if ( ! isset( $_REQUEST['post'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}

		$post = intval( wp_unslash( $_REQUEST['post'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! get_post( $post ) || self::FORM_RECORD_TYPE !== get_post_type( $post ) ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post ) ) {
			return;
		}

		$status = get_post_status( $post );
		if ( 'unread' === $status ) {
			wp_update_post(
				array(
					'ID'          => $post,
					'post_status' => 'read',
				)
			);
		}
	}

	/**
	 * Check request nonce and post ID.
	 *
	 * @param string $action The action name.
	 *
	 * @return string The post ID.
	 */
	public function check_posts( $action ) {
		$id   = ! empty( $_REQUEST[ self::FORM_RECORD_TYPE ] ) ? sanitize_text_field( wp_unslash( $_REQUEST[ self::FORM_RECORD_TYPE ] ) ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$post = get_post( $id );

		if ( empty( $_REQUEST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_REQUEST['_wpnonce'] ) ), $action . '-' . self::FORM_RECORD_TYPE . '_' . $id ) ) {
			wp_die( esc_html__( 'Security check failed', 'otter-blocks' ) );
		}

		if ( ! isset( $_REQUEST[ self::FORM_RECORD_TYPE ] ) ) {
			wp_die( esc_html__( 'Post ID is required', 'otter-blocks' ) );
		}

		if ( ! $post ) {
			wp_die( esc_html__( 'Invalid post ID', 'otter-blocks' ) );
		}

		if ( self::FORM_RECORD_TYPE !== $post->post_type ) {
			wp_die( esc_html__( 'Invalid post type', 'otter-blocks' ) );
		}

		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			wp_die( esc_html__( 'You are not allowed to manage this submission.', 'otter-blocks' ) );
		}

		return $id;
	}

	/**
	 * Read form record.
	 *
	 * @return void
	 */
	public function read_otter_form_record() {
		$id = intval( $this->check_posts( 'read' ) );
		wp_update_post(
			array(
				'ID'          => $id,
				'post_status' => 'read',
			)
		);

		wp_safe_redirect( remove_query_arg( array( 'action', self::FORM_RECORD_TYPE, '_wpnonce' ), admin_url( 'edit.php?post_type=' . self::FORM_RECORD_TYPE ) ) );
		exit;
	}

	/**
	 * Unread form record.
	 *
	 * @return void
	 */
	public function unread_otter_form_record() {
		$id = intval( $this->check_posts( 'unread' ) );
		wp_update_post(
			array(
				'ID'          => $id,
				'post_status' => 'unread',
			)
		);

		wp_safe_redirect( remove_query_arg( array( 'action', self::FORM_RECORD_TYPE, '_wpnonce' ), admin_url( 'edit.php?post_type=' . self::FORM_RECORD_TYPE ) ) );
		exit;
	}

	/**
	 * Confirm submission.
	 *
	 * @param Form_Data_Response $response The response.
	 * @param \WP_REST_Request   $request The request.
	 * @return Form_Data_Response
	 */
	public function confirm_submission( $response, $request ) {

		$session_id = $request->get_param( 'stripe_checkout' );

		$stripe = new Stripe_API();

		$stripe_response = $stripe->create_request( 'get_session', $session_id );

		if ( is_wp_error( $stripe_response ) || ! is_object( $stripe_response ) || ! isset( $stripe_response->payment_status ) ) {
			$response->set_code( Form_Data_Response::ERROR_STRIPE_CHECKOUT_SESSION_NOT_FOUND );
			return $response;
		}

		$is_paid = 'paid' === $stripe_response->payment_status;

		if ( ! $is_paid ) {
			$response->set_code( Form_Data_Response::ERROR_STRIPE_PAYMENT_UNPAID );
			return $response;
		}

		$record_id = isset( $stripe_response->metadata['otter_form_record_id'] ) ? $stripe_response->metadata['otter_form_record_id'] : null;

		if ( empty( $record_id ) ) {
			$response->set_code( Form_Data_Response::ERROR_STRIPE_METADATA_RECORD_NOT_FOUND );
			return $response;
		}

		if ( isset( $stripe_response->metadata['otter_redirect_link'] ) ) {
			$response->add_response_field( 'redirectLink', $stripe_response->metadata['otter_redirect_link'] );
		}

		$post_status = get_post_status( $record_id );

		// If the post status is not 'draft', then the submission has already been confirmed.
		if ( 'draft' !== $post_status ) {
			$response->set_code( Form_Data_Response::SUCCESS_EMAIL_SEND );
			$response->mark_as_success();
			return $response;
		}

		wp_update_post(
			array(
				'ID'          => $record_id,
				'post_status' => 'unread',
			)
		);

		$response->set_code( Form_Data_Response::SUCCESS_EMAIL_SEND );
		$response->mark_as_success();

		return $response;
	}

	/**
	 * Apply the 'after_submit' action when changing the status from 'draft' to 'unread'.
	 *
	 * @param WP_Post $post The post.
	 */
	public function apply_hooks_on_draft_transition( $post ) {
		if ( self::FORM_RECORD_TYPE !== $post->post_type ) {
			return;
		}

		$meta = get_post_meta( $post->ID, self::FORM_RECORD_META_KEY, true );

		if ( ! isset( $meta['dump'] ) || empty( $meta['dump']['value'] ) ) {
			return;
		}

		$form_data = Form_Data_Request::create_from_dump( $meta['dump']['value'] );
		$form_data->mark_as_duplicate();
		$form_data->set_record_id( $post->ID );
		$form_options = Form_Settings_Data::get_form_setting_from_wordpress_options( $form_data->get_data_from_payload( 'formOption' ) );
		$form_data->set_form_options( $form_options );
		$form_data = Form_Server::pull_fields_options_for_form( $form_data );

		do_action( 'otter_form_on_submission_confirmed', $form_data );

		if (
			! isset( $form_data ) ||
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request )
		) {
			return;
		}

		do_action( 'otter_form_after_submit', $form_data );
	}

	/**
	 * Update the submission dump data.
	 *
	 * @param Form_Data_Request $form_data The form data.
	 * @param int               $record_id The record ID.
	 */
	public function update_submission_dump_data( $form_data, $record_id ) {

		if ( ! get_post( $record_id ) ) {
			return;
		}

		$meta = get_post_meta( $record_id, self::FORM_RECORD_META_KEY, true );
		$meta = is_array( $meta ) ? $meta : array();
		$meta = array_merge(
			$meta,
			array(
				'dump' => array(
					'label' => 'Dumped data',
					'value' => $form_data->is_temporary() ? $form_data->dump_data() : array(),
				),
			)
		);
		// Slash the value: update_post_meta() unslashes it, which would otherwise strip backslashes from the stored data.
		update_post_meta( $record_id, self::FORM_RECORD_META_KEY, wp_slash( $meta ) );

		if (
			$form_data->is_temporary() &&
			$form_data->has_metadata( 'otter_form_stripe_checkout_session_id' )
		) {
			$this->schedule_automatic_confirmation();
		}
	}

	/**
	 * Move old drafts to unread.
	 */
	public function move_old_stripe_draft_sessions_to_unread() {
		$now = current_time( 'mysql' );

		// Calculate the time 15 minutes ago.
		$time_15_minutes_ago = gmdate( 'Y-m-d H:i:s', strtotime( '-15 minutes', strtotime( $now ) ) );

		$args = array(
			'post_type'      => self::FORM_RECORD_TYPE,
			'post_status'    => 'draft',
			'posts_per_page' => 10,
			'orderby'        => 'date',
			'order'          => 'DESC',
			'date_query'     => array(
				'before' => $time_15_minutes_ago,
			),
		);

		$query = new WP_Query( $args );
		if ( $query->have_posts() ) {

			try {
				$stripe = new Stripe_API();

				while ( $query->have_posts() ) {
					$query->the_post();

					// Get the meta data.
					$meta = get_post_meta( get_the_ID(), self::FORM_RECORD_META_KEY, true );

					// Check if we have a Stripe session id in the meta dump data.
					if ( ! isset( $meta['dump']['value']['metadata']['otter_form_stripe_checkout_session_id'] ) ) {
						continue;
					}

					$stripe_checkout_session_id = $meta['dump']['value']['metadata']['otter_form_stripe_checkout_session_id'];

					// Check if the session has status of paid.
					$session = $stripe->create_request( 'get_session', $stripe_checkout_session_id );

					if ( is_wp_error( $session ) ) {
						continue;
					}

					$is_paid = isset( $session->payment_status ) && 'paid' === $session->payment_status;

					if ( ! $is_paid ) {
						continue;
					}

					wp_update_post(
						array(
							'ID'          => get_the_ID(),
							'post_status' => 'unread',
						)
					);
				}
			} catch ( \Exception $e ) {
				// Do nothing.
				return;
			}
		}

		if ( ! $this->has_pending_stripe_draft_sessions() ) {
			wp_clear_scheduled_hook( 'otter_form_automatic_confirmation' );
		}
	}

	/**
	 * Schedule the automatic confirmation.
	 *
	 * @return void
	 */
	public function schedule_automatic_confirmation() {
		if ( ! wp_next_scheduled( 'otter_form_automatic_confirmation' ) ) {
			wp_schedule_event( time(), 'hourly', 'otter_form_automatic_confirmation' );
		}
	}

	/**
	 * Check whether there are draft records waiting on a Stripe checkout session.
	 *
	 * @return bool
	 */
	private function has_pending_stripe_draft_sessions() {
		$query = new WP_Query(
			array(
				'post_type'      => self::FORM_RECORD_TYPE,
				'post_status'    => 'draft',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'     => self::FORM_RECORD_META_KEY,
						'value'   => 'otter_form_stripe_checkout_session_id',
						'compare' => 'LIKE',
					),
				),
			)
		);

		return $query->have_posts();
	}

	/**
	 * Export submissions with ajax. Bulk export is a Pro feature.
	 */
	public function export_submissions() {
		if ( ! Pro::is_pro_active() ) {
			wp_die( esc_html( __( 'Exporting submissions requires Otter Pro.', 'otter-blocks' ) ) );
		}

		$nonce = isset( $_POST['_nonce'] ) ? sanitize_text_field( $_POST['_nonce'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! wp_verify_nonce( $nonce, 'otter_form_export_submissions' ) ) {
			wp_die( esc_html( __( 'Invalid nonce.', 'otter-blocks' ) ) );
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html( __( 'You are not allowed to export submissions.', 'otter-blocks' ) ) );
		}

		// Export submissions.
		require_once ABSPATH . 'wp-admin/includes/export.php';
		ob_start();
		export_wp( array( 'content' => self::FORM_RECORD_TYPE ) );
		$export = ob_get_clean();

		echo ent2ncr( $export ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		wp_die();
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @access public
	 * @return Form_Submissions
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
