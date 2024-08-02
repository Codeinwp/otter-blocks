<?php
/**
 * Form Block Responses Storing.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Integration\Form_Settings_Data;
use ThemeIsle\GutenbergBlocks\Plugins\Stripe_API;
use ThemeIsle\GutenbergBlocks\Server\Form_Server;
use WP_Post;
use WP_Query;

/**
 * Class Form_Block
 */
class Form_Emails_Storing {
	/**
	 * Form record post type.
	 */
	const FORM_RECORD_TYPE = 'otter_form_record';

	/**
	 * Form record meta key.
	 */
	const FORM_RECORD_META_KEY = 'otter_form_record_meta';

	/**
	 * The main instance var.
	 *
	 * @var Form_Emails_Storing|null
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( ! License::has_active_license() ) {
			return;
		}

		add_action( 'init', array( $this, 'create_form_records_type' ) );
		add_action( 'admin_init', array( $this, 'set_form_records_cap' ), 10, 0 );
		add_action( 'otter_form_after_submit', array( $this, 'store_form_record' ) );

		add_action( 'admin_head', array( $this, 'add_style' ) );

		// Customize the wp_list_table.
		add_filter( 'manage_' . self::FORM_RECORD_TYPE . '_posts_columns', array( $this, 'form_record_columns' ) );
		add_filter( 'manage_edit-' . self::FORM_RECORD_TYPE . '_sortable_columns', array( $this, 'form_record_sortable_columns' ) );
		add_filter( 'manage_' . self::FORM_RECORD_TYPE . '_posts_custom_column', array( $this, 'form_record_column_values' ), 10, 2 );
		add_filter( 'bulk_actions-edit-' . self::FORM_RECORD_TYPE, array( $this, 'form_record_bulk_actions' ) );
		add_filter( 'handle_bulk_actions-edit-' . self::FORM_RECORD_TYPE, array( $this, 'handle_form_record_bulk_actions' ), 0, 3 );

		add_filter( 'post_row_actions', array( $this, 'form_record_row_actions' ), 10, 2 );
		add_action( 'restrict_manage_posts', array( $this, 'form_record_add_filters' ) );
		add_filter( 'parse_query', array( $this, 'form_record_filter_query' ) );
		add_action( 'transition_post_status', array( $this, 'transition_draft_to_read' ), 10, 3 );

		// Implement row actions behaviour.
		add_action( 'admin_action_row-read', array( $this, 'read_otter_form_record' ) );
		add_action( 'admin_action_row-unread', array( $this, 'unread_otter_form_record' ) );
		add_action( 'admin_action_edit', array( $this, 'mark_read_on_edit' ) );

		// Manage meta boxes.
		add_action( 'add_meta_boxes', array( $this, 'add_form_record_meta_box' ) );
		add_action( 'admin_menu', array( $this, 'handle_admin_menu' ) );
		add_action( 'save_post', array( $this, 'form_record_save_meta_box' ), 10, 2 );

		add_filter( 'otter_form_record_confirm', array( $this, 'confirm_submission' ), 10, 2 );

		add_action( 'draft_to_unread', array( $this, 'apply_hooks_on_draft_transition' ), 10 );
		add_action( 'otter_form_update_record_meta_dump', array( $this, 'update_submission_dump_data' ), 10, 2 );
		add_action( 'otter_form_automatic_confirmation', array( $this, 'move_old_stripe_draft_sessions_to_unread' ) );
		add_action( 'wp', array( $this, 'schedule_automatic_confirmation' ) );

		add_action( 'wp_ajax_otter_form_submissions', array( $this, 'export_submissions' ) );
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
	 * @param Form_Data_Request $form_data The form data object.
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

		if ( $form_data->is_duplicate() ) {
			return $form_data;
		}

		if ( false === strpos( $form_options->get_submissions_save_location(), 'database' ) && ! $form_data->is_temporary() ) {
			return $form_data;
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => self::FORM_RECORD_TYPE,
				'post_status' => $form_data->is_temporary() ? 'draft' : 'unread',
			)
		);

		wp_update_post(
			array(
				'ID'         => $post_id,
				/* translators: %s the ID of the submission */
				'post_title' => sprintf( __( 'Submission #%s', 'otter-blocks' ), $post_id ),
			)
		);

		if ( ! $post_id ) {
			return $form_data;
		}

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

		add_post_meta( $post_id, self::FORM_RECORD_META_KEY, $meta );

		$form_data->metadata['otter_form_record_id'] = $post_id;

		return $form_data;
	}

	/**
	 * Hide the default headline.
	 *
	 * @return void
	 */
	public function add_style() {
		$screen = get_current_screen();
		if ( 'edit-' . self::FORM_RECORD_TYPE === $screen->id ) {
			?>
			<style>
			.wrap h1.wp-heading-inline {
				display: none;
			}
			</style>
			<?php
		}
	}

	/**
	 * Set the table columns.
	 *
	 * @return array
	 */
	public function form_record_columns() {
		return array(
			'cb'              => '<input type="checkbox" />',
			'title'           => __( 'Title', 'otter-blocks' ),
			'form'            => __( 'Form ID', 'otter-blocks' ),
			'post_url'        => __( 'Post', 'otter-blocks' ),
			'ID'              => __( 'ID', 'otter-blocks' ),
			'submission_date' => __( 'Submission Date', 'otter-blocks' ),
		);
	}

	/**
	 * Set the table sortable columns.
	 *
	 * @return array
	 */
	public function form_record_sortable_columns() {
		return array(
			'title'           => __( 'Title', 'otter-blocks' ),
			'ID'              => __( 'ID', 'otter-blocks' ),
			'submission_date' => __( 'Submission Date', 'otter-blocks' ),
		);
	}

	/**
	 * Set form records bulk actions.
	 *
	 * @return array
	 */
	public function form_record_bulk_actions() {
		$status       = isset( $_GET['post_status'] ) ? sanitize_text_field( wp_unslash( $_GET['post_status'] ) ) : 'all'; // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
		$bulk_actions = array();

		if ( 'trash' !== $status ) {
			$bulk_actions['trash'] = __( 'Move to Trash', 'otter-blocks' );

			if ( 'unread' !== $status ) {
				$bulk_actions['unread'] = __( 'Mark as Unread', 'otter-blocks' );
			}

			if ( 'read' !== $status ) {
				$bulk_actions['read'] = __( 'Mark as Read', 'otter-blocks' );
			}
		} else {
			$bulk_actions['untrash'] = __( 'Restore', 'otter-blocks' );
			$bulk_actions['delete']  = __( 'Delete Permanently', 'otter-blocks' );
		}

		return $bulk_actions;
	}

	/**
	 * Manage form records row actions.
	 *
	 * @param array   $actions The current row actions.
	 * @param WP_Post $post The current post object.
	 *
	 * @return array
	 */
	public function form_record_row_actions( $actions, $post ) {
		if ( 'otter_form_record' !== $post->post_type ) {
			return $actions;
		}

		unset( $actions['inline hide-if-no-js'] );
		unset( $actions['edit'] );

		$status = $post->post_status;
		if ( 'trash' !== $status ) {
			$actions['view'] = sprintf(
				'<a href="%s">%s</a>',
				get_edit_post_link( $post->ID ),
				__( 'View', 'otter-blocks' )
			);
		}

		if ( 'unread' === $status ) {
			$actions['read'] = sprintf(
				'<a href="?action=%s&' . self::FORM_RECORD_TYPE . '=%s&_wpnonce=%s">%s</a>',
				'row-read',
				$post->ID,
				wp_create_nonce( 'read-' . self::FORM_RECORD_TYPE . '_' . $post->ID ),
				__( 'Mark as Read', 'otter-blocks' )
			);
		} elseif ( 'trash' !== $status ) {
			$actions['unread'] = sprintf(
				'<a href="?action=%s&' . self::FORM_RECORD_TYPE . '=%s&_wpnonce=%s">%s</a>',
				'row-unread',
				$post->ID,
				wp_create_nonce( 'unread-' . self::FORM_RECORD_TYPE . '_' . $post->ID ),
				__( 'Mark as Unread', 'otter-blocks' )
			);
		}

		return $actions;
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
	 * Mark form record as read when they're restored from trash.
	 *
	 * @param string  $new_status The new status.
	 * @param string  $old_status The old status.
	 * @param WP_Post $post The post object.
	 */
	public function transition_draft_to_read( $new_status, $old_status, $post ) {
		if ( self::FORM_RECORD_TYPE !== $post->post_type || 'trash' !== $old_status || 'draft' !== $new_status ) {
			return;
		}

		wp_update_post(
			array(
				'ID'          => $post->ID,
				'post_status' => 'read',
			)
		);
	}

	/**
	 * Add form record filters.
	 *
	 * @return void
	 */
	public function form_record_add_filters() {
		if ( ! get_current_screen() || get_current_screen()->id !== 'edit-' . self::FORM_RECORD_TYPE ) {
			return;
		}

		$this->form_dropdown();
		$this->post_dropdown();
	}

	/**
	 * Parse form record filters.
	 *
	 * @param WP_Query $query Query.
	 *
	 * @return WP_Query
	 */
	public function form_record_filter_query( $query ) {
		if ( empty( $_GET['filters_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_GET['filters_nonce'] ), 'filter' ) ) {
			return $query;
		}

		if ( ! is_admin() || ! isset( $_GET['post_type'] ) || self::FORM_RECORD_TYPE !== $_GET['post_type'] ) {
			return $query;
		}

		if ( ! isset( $query->query['post_type'] ) || self::FORM_RECORD_TYPE !== $query->query['post_type'] ) {
			return $query;
		}

		global $pagenow;
		if ( 'edit.php' !== $pagenow || ! isset( $_GET['filter_action'] ) ) {
			return $query;
		}

		$form = ( ! empty( $_REQUEST['form'] ) ) ? sanitize_text_field( wp_unslash( $_REQUEST['form'] ) ) : '';
		$post = ( ! empty( $_REQUEST['post'] ) ) ? esc_url_raw( wp_unslash( $_REQUEST['post'] ) ) : '';

		if ( ! empty( $form ) ) {
			$query->query_vars['meta_query'][] = array(
				'key'     => self::FORM_RECORD_META_KEY,
				'value'   => $form,
				'compare' => 'LIKE',
			);
		}

		if ( ! empty( $post ) ) {
			$query->query_vars['meta_query'][] = array(
				'key'     => self::FORM_RECORD_META_KEY,
				'value'   => $post,
				'compare' => 'LIKE',
			);
		}

		return $query;
	}

	/**
	 * Manage form record columns.
	 *
	 * @param string $column The column name.
	 * @param int    $post_id The post ID.
	 *
	 * @return string The column value.
	 */
	public function form_record_column_values( $column, $post_id ) {
		$meta = get_post_meta( $post_id, self::FORM_RECORD_META_KEY, true );

		switch ( $column ) {
			case 'title':
				if ( get_post_status( $post_id ) !== 'trash' ) {
					$this->format_based_on_status(
						sprintf(
							'<a href="%1$s">%2$s</a>',
							esc_url( get_edit_post_link( $post_id ) ),
							esc_html( get_the_title( $post_id ) )
						),
						get_post_status( $post_id )
					);
					break;
				}

				echo esc_html( get_the_title( $post_id ) );
				break;
			case 'form':
				$this->format_based_on_status(
					sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url( $meta['post_url']['value'] . '#' . $meta['form']['value'] ),
						esc_html( substr( $meta['form']['value'], -8 ) )
					),
					get_post_status( $post_id )
				);
				break;
			case 'post_url':
				// If the post ID is set, use that to get the title and URL for better accuracy.
				if ( ! empty( $meta['post_id'] ) ) {
					$source_post = '0' !== $meta['post_id']['value'] ? $meta['post_id']['value'] : get_option( 'page_for_posts' );
					$title       = get_the_title( $source_post );
					$url         = get_permalink( $source_post );
				} else {
					if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
						$source_post = wpcom_vip_url_to_postid( $meta['post_url']['value'] );
					} else {
						$source_post = url_to_postid( $meta['post_url']['value'] ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
					}

					$source_post = 0 !== $source_post ? $source_post : get_option( 'page_for_posts' );
					$title       = $source_post ? get_the_title( $source_post ) : $meta['post_url']['value'];
					$url         = $meta['post_url']['value'];
				}

				$this->format_based_on_status(
					sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url( $url ),
						esc_html( $title )
					),
					get_post_status( $post_id )
				);
				break;
			case 'ID':
				$this->format_based_on_status( substr( strval( $post_id ), -8 ), get_post_status( $post_id ) );
				break;
			case 'submission_date':
				$this->format_based_on_status(
					esc_html( get_the_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $post_id ) ),
					get_post_status( $post_id )
				);
				break;
		}

		return $column;
	}

	/**
	 * Remove the 'publish' box from the otter_form_record post type.
	 *
	 * @return void
	 */
	public function handle_admin_menu() {
		remove_meta_box( 'submitdiv', self::FORM_RECORD_TYPE, 'side' );

		global $submenu;
		unset( $submenu[ 'edit.php?post_type=' . self::FORM_RECORD_TYPE ] );

		remove_menu_page( 'edit.php?post_type=' . self::FORM_RECORD_TYPE );
		remove_submenu_page( 'otter', 'form-submissions-free' );

		add_submenu_page(
			'otter',
			__( 'Submissions', 'otter-blocks' ),
			__( 'Submissions', 'otter-blocks' ),
			'manage_options',
			'edit.php?post_type=' . self::FORM_RECORD_TYPE
		);
	}

	/**
	 * Add meta box for form record.
	 *
	 * @return void
	 */
	public function add_form_record_meta_box() {
		add_meta_box(
			'field_values_meta_box',
			esc_html__( 'Submission Data', 'otter-blocks' ),
			array( $this, 'fields_meta_box_markup' ),
			self::FORM_RECORD_TYPE
		);

		// this will replace the default publish box, that's why it's using its id.
		add_meta_box(
			'submitpost',
			esc_html__( 'Update', 'otter-blocks' ),
			array( $this, 'update_meta_box_markup' ),
			self::FORM_RECORD_TYPE,
			'side'
		);
	}

	/**
	 * Save data from form record meta box.
	 *
	 * @param int     $post_id The post ID.
	 * @param WP_Post $post The post object.
	 *
	 * @return void
	 */
	public function form_record_save_meta_box( $post_id, $post ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( self::FORM_RECORD_TYPE !== $post->post_type ) {
			return;
		}

		if ( empty( $_POST['action'] ) || 'editpost' !== $_POST['action'] ) { // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
			return;
		}

		if ( empty( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['_wpnonce'] ) ), 'update-post_' . $post->ID ) ) {
			wp_die( esc_html__( 'Nonce not verified.', 'otter-blocks' ) );
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			wp_die( esc_html__( 'User cannot edit this post.', 'otter-blocks' ) );
		}

		$meta = get_post_meta( $post_id, self::FORM_RECORD_META_KEY, true );

		foreach ( $_POST as $key => $value ) {
			if ( 0 !== strpos( $key, 'otter_meta_' ) ) {
				continue;
			}

			$id = substr( $key, -8 );

			if ( isset( $meta['inputs'][ $id ] ) && $meta['inputs'][ $id ]['value'] !== $value ) {
				$meta['inputs'][ $id ]['value'] = $value;
			}
		}

		update_post_meta( $post_id, self::FORM_RECORD_META_KEY, $meta );
	}

	/**
	 * Render form record meta box.
	 *
	 * @param WP_Post $post The post object.
	 * @return void
	 */
	public function fields_meta_box_markup( $post ) {
		$meta                  = get_post_meta( $post->ID, self::FORM_RECORD_META_KEY, true );
		$previous_field_option = '';


		if ( empty( $meta ) ) {
			return;
		}

		$inputs = array();
		foreach ( $meta['inputs'] as $id => $field ) {
			if ( empty( $field ) || 'stripe-field' === $field['type'] ) {
				continue;
			}

			$inputs[ $id ] = $field;
		}

		?>
		<table class="otter_form_record_meta form-table" style="border-spacing: 10px; width: 100%">
			<tbody>
				<?php foreach ( $inputs as $id => $field ) { ?>
					<tr>
						<th scope="row">
							<label for="<?php echo esc_attr( $id ); ?>">
								<?php
								if ( isset( $field['metadata']['fieldOptionName'] ) ) {
									if ( $previous_field_option !== $field['metadata']['fieldOptionName'] ) {
										echo esc_html( $field['label'] );
										$previous_field_option = $field['metadata']['fieldOptionName'];
									}
								} else {
									echo esc_html( $field['label'] );
								}
								?>
							</label>
						</th>
						<td><?php $this->render_field( $field, $id ); ?></td>
					</tr>
					<?php
				}
				?>
			</tbody>
		</table>
		<?php
	}

	/**
	 * Render form record meta box.
	 *
	 * @param array $field The field data.
	 * @param int   $id The field id.
	 * @return void
	 */
	public function render_field( $field, $id ) {
		switch ( $field['type'] ) {
			case 'textarea':
				?>
				<textarea
					style="width: 100%; max-width: 350px;"
					name="<?php echo esc_attr( 'otter_meta_' . $id ); ?>"
					id="<?php echo intval( $id ); ?>"
					class="otter_form_record_meta__value"
					rows="5"
				><?php echo esc_textarea( $field['value'] ); ?></textarea>
				<?php
				break;
			case 'multiple-choice':
				?>
				<input
					style="width: 100%; max-width: 350px;"
					name="<?php echo esc_attr( 'otter_meta_' . $id ); ?>"
					id="<?php echo intval( $id ); ?>"
					type="text"
					class="otter_form_record_meta__value"
					value="<?php echo esc_html( $field['value'] ); ?>"
				/>
				<?php
				break;
			case 'file':
				if ( isset( $field['path'] ) && isset( $field['metadata']['name'] ) ) {
					$url = esc_url( $field['path'] );
					if ( isset( $field['saved_in_media'] ) && $field['saved_in_media'] ) {
						$url = wp_get_attachment_url( $field['attachment_id'] );
					} elseif ( 0 !== strpos( $field['path'], 'http' ) ) {
						// If the file is not saved with a server link (external or media library). We need to get the file path relative to the uploads directory so that it can be displayed by the browser.
						$url = substr( $url, strpos( $url, '/wp-content' ) );
					}
					?>

					<a href="<?php echo esc_url_raw( $url ); ?>" target="_blank">
						<?php
						if ( isset( $field['mime_type'] ) && 0 === strpos( $field['mime_type'], 'image' ) ) {

							?>
								<img alt="" src="<?php echo esc_url_raw( $url ); ?>" style="display: block; height: 100px;" />
								<?php
						} else {
							echo esc_html( $field['metadata']['name'] );
						}
						?>
					</a>
					<?php
				}
				break;
			case 'hidden':
				?>
				<input
					style="width: 100%; max-width: 350px;"
					name="<?php echo esc_attr( 'otter_meta_' . $id ); ?>"
					id="<?php echo intval( $id ); ?>"
					type="text"
					class="otter_form_record_meta__value"
					value="<?php echo esc_html( $field['value'] ); ?>"
				/>
				<?php
				break;
			default:
				?>
				<input
					style="width: 100%; max-width: 350px;"
					name="<?php echo esc_attr( 'otter_meta_' . $id ); ?>"
					id="<?php echo intval( $id ); ?>"
					type="<?php echo isset( $field['type'] ) ? esc_attr( $field['type'] ) : ''; ?>"
					class="otter_form_record_meta__value"
					value="<?php echo esc_html( $field['value'] ); ?>"
				/>
				<?php
		}
	}

	/**
	 * Render update form record meta box.
	 *
	 * @param WP_Post $post The post object.
	 * @return void
	 */
	public function update_meta_box_markup( $post ) {
		$meta = get_post_meta( $post->ID, self::FORM_RECORD_META_KEY, true );
		?>
		<div class="submitbox">
			<div class="metadata">
				<div>
					<span class="dashicons dashicons-feedback"></span>
					<?php echo esc_html( $meta['form']['label'] ); ?>:
					<a href="<?php echo esc_url( $meta['post_url']['value'] . '#' . $meta['form']['value'] ); ?>"><?php echo esc_html( substr( $meta['form']['value'], -8 ) ); ?></a>
				</div>
				<div>
					<span class="dashicons dashicons-admin-page"></span>
					<?php echo esc_html__( 'Post', 'otter-blocks' ); ?>:
					<a href="<?php echo esc_url( $meta['post_url']['value'] ); ?>"><?php echo esc_html__( 'View', 'otter-blocks' ); ?></a>
				</div>
				<div>
					<span class="dashicons dashicons-calendar"></span>
					<?php echo esc_html__( 'Submitted on', 'otter-blocks' ); ?>:
					<span><strong><?php echo esc_html( get_the_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $post ) ); ?></strong></span>
				</div>
			</div>
			<div id="major-publishing-actions">
				<div id="delete-action">
					<?php
					echo sprintf(
						'<a href="?action=%s&post=%s&_wpnonce=%s" class="submitdelete">%s</a>',
						'trash',
						intval( $post->ID ),
						esc_attr( wp_create_nonce( 'trash-post_' . $post->ID ) ),
						esc_html__( 'Move to Trash', 'otter-blocks' )
					);
					?>
				</div>

				<div id="updating-action" style="text-align: right">
					<?php
					echo sprintf(
						'<input type="submit" class="button button-primary button-large" value="%s"/>',
						esc_html__( 'Update', 'otter-blocks' )
					);
					?>
				</div>
				<div class="clear"></div>
			</div>
		</div>
		<style>
			#submitpost .inside {
				padding: 0;
			}
			#submitpost .metadata {
				padding: 10px;
				display: flex;
				flex-direction: column;
				row-gap: 20px;
			}
			#submitpost .dashicons {
				color: #8c8f94;
			}
		</style>
		<?php
	}

	/**
	 * Mark form record as read when it is edited.
	 *
	 * @return void
	 */
	public function mark_read_on_edit() {
		if ( ! isset( $_REQUEST['post'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
			return;
		}

		$post = intval( wp_unslash( $_REQUEST['post'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
		if ( ! get_post( $post ) || self::FORM_RECORD_TYPE !== get_post_type( $post ) ) {
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
		$id   = ! empty( $_REQUEST[ self::FORM_RECORD_TYPE ] ) ? sanitize_text_field( wp_unslash( $_REQUEST[ self::FORM_RECORD_TYPE ] ) ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
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
	 * Get filter options.
	 *
	 * @param string $filter Filter.
	 *
	 * @return array
	 */
	private function get_filter( $filter ) {
		/**
		 * Get all form records. Here we want to avoid using WP_Query to not
		 * trigger the 'form_record_filter_query'. This is why the $wpdb.
		 */
		$cache_key    = 'otter_form_records';
		$form_records = wp_cache_get( $cache_key );

		if ( ! $form_records ) {
			global $wpdb;
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$form_records = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT ID FROM $wpdb->posts WHERE post_type = %s AND post_status IN ('read', 'unread', 'trash', 'publish')",
					self::FORM_RECORD_TYPE
				)
			);

			wp_cache_set( $cache_key, $form_records );
		}

		$options = array();
		foreach ( $form_records as $record ) {
			$meta = get_post_meta( $record->ID, self::FORM_RECORD_META_KEY, true );

			switch ( $filter ) {
				case 'form':
					$options[ $meta['form']['value'] ] = substr( $meta['form']['value'], -8 );
					break;
				case 'post':
					if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
						$post_id = wpcom_vip_url_to_postid( $meta['post_url']['value'] );
					} else {
						$post_id = url_to_postid( $meta['post_url']['value'] ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
					}

					$options[ $meta['post_url']['value'] ] = $post_id ? get_the_title( $post_id ) : $meta['post_url']['value'];
					break;
			}
		}

		return $options;
	}

	/**
	 * Get forms dropdown.
	 *
	 * @return void
	 */
	private function form_dropdown() {
		$forms = $this->get_filter( 'form' );

		if ( empty( $forms ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
		$form = isset( $_GET['form'] ) ? sanitize_text_field( wp_unslash( $_GET['form'] ) ) : '';

		?>
		<label for="filter-by-form"></label>
		<select name="form" id="filter-by-form">
			<option value=""><?php esc_html_e( 'All Forms', 'otter-blocks' ); ?></option>
			<?php foreach ( $forms as $form_id => $form_name ) : ?>
				<option value="<?php echo esc_attr( $form_id ); ?>" <?php selected( $form, $form_id ); ?>><?php echo esc_html( $form_name ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
	}

	/**
	 * Get posts dropdown.
	 *
	 * @return void
	 */
	private function post_dropdown() {
		$posts = $this->get_filter( 'post' );

		if ( empty( $posts ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
		$post = isset( $_GET['post'] ) ? sanitize_text_field( wp_unslash( $_GET['post'] ) ) : '';

		?>
		<label for="filter-by-post"></label>
		<select name="post" id="filter-by-post">
			<option value=""><?php esc_html_e( 'All Posts', 'otter-blocks' ); ?></option>
			<?php foreach ( $posts as $post_id => $post_title ) : ?>
				<option value="<?php echo esc_attr( $post_id ); ?>" <?php selected( $post, $post_id ); ?>><?php echo esc_html( $post_title ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
		wp_nonce_field( 'filter', 'filters_nonce' );
	}

	/**
	 * Make unread rows bold.
	 *
	 * @param string $content Content.
	 * @param string $status The post status.
	 */
	private function format_based_on_status( $content, $status ) {
		if ( 'unread' === $status ) {
			echo '<strong>' . wp_kses_post( $content ) . '</strong>';
			return;
		}

		echo wp_kses_post( $content );
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

		if ( is_wp_error( $stripe_response ) ) {
			$response->set_code( Form_Data_Response::ERROR_STRIPE_CHECKOUT_SESSION_NOT_FOUND );
			return $response;
		}

		$is_paid = 'paid' === $stripe_response->payment_status;

		if ( ! $is_paid ) {
			$response->set_code( Form_Data_Response::ERROR_STRIPE_PAYMENT_UNPAID );
			return $response;
		}

		$record_id = $stripe_response->metadata['otter_form_record_id'];

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
		update_post_meta( $record_id, self::FORM_RECORD_META_KEY, $meta );
	}

	/**
	 * Move old drafts to unread.
	 */
	public function move_old_stripe_draft_sessions_to_unread() {
		$now = current_time( 'mysql' );

		// Calculate the time 15 minutes ago.
		$time_15_minutes_ago = date( 'Y-m-d H:i:s', strtotime( '-15 minutes', strtotime( $now ) ) );

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
	 * Export submissions with ajax.
	 */
	public function export_submissions() {
		$nonce = isset( $_POST['_nonce'] ) ? sanitize_text_field( $_POST['_nonce'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
		if ( ! wp_verify_nonce( $nonce, 'otter_form_export_submissions' ) ) {
			wp_die( esc_html( __( 'Invalid nonce.', 'otter-blocks' ) ) );
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
	 * @return Form_Emails_Storing
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
