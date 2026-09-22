<?php
/**
 * Abilities API integration.
 *
 * Registers the Otter form abilities with the WordPress Abilities API (WP 6.9+).
 * Every ability is a thin wrapper over the existing form options and form records.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use ThemeIsle\GutenbergBlocks\Pro;
use WP_Error;
use WP_Query;

/**
 * Class Abilities
 */
class Abilities {
	/**
	 * Ability category slug.
	 */
	const CATEGORY = 'otter';

	/**
	 * Option that stores the per-form settings.
	 */
	const FORM_OPTION = 'themeisle_blocks_form_emails';

	/**
	 * Form block name.
	 */
	const FORM_BLOCK = 'themeisle-blocks/form';

	/**
	 * Maximum number of items per page.
	 */
	const MAX_PER_PAGE = 50;

	/**
	 * The main instance var.
	 *
	 * @var Abilities|null
	 */
	public static $instance = null;

	/**
	 * Map of `delivery` input keys to the keys stored in the form option.
	 *
	 * @var array<string, string>
	 */
	private static $delivery_map = array(
		'email_to'           => 'email',
		'subject'            => 'emailSubject',
		'from_name'          => 'fromName',
		'from_email'         => 'fromEmail',
		'cc'                 => 'cc',
		'bcc'                => 'bcc',
		'reply_to'           => 'replyTo',
		'redirect_link'      => 'redirectLink',
		'submit_message'     => 'submitMessage',
		'error_message'      => 'errorMessage',
		'email_notification' => 'emailNotification',
		'webhook_id'         => 'webhookId',
	);

	/**
	 * Initialize the class
	 *
	 * @return void
	 */
	public function init() {
		if ( ! function_exists( 'wp_register_ability' ) ) {
			return;
		}

		add_action( 'wp_abilities_api_categories_init', array( $this, 'register_category' ) );
		add_action( 'wp_abilities_api_init', array( $this, 'register_abilities' ) );
	}

	/**
	 * Register the ability category.
	 *
	 * @return void
	 */
	public function register_category() {
		if ( ! function_exists( 'wp_register_ability_category' ) ) {
			return;
		}

		wp_register_ability_category(
			self::CATEGORY,
			array(
				'label'       => __( 'Otter Blocks', 'otter-blocks' ),
				'description' => __( 'Abilities provided by Otter Blocks.', 'otter-blocks' ),
			)
		);
	}

	/**
	 * Register the abilities.
	 *
	 * @return void
	 */
	public function register_abilities() {
		wp_register_ability(
			'otter/list-forms',
			array(
				'label'               => __( 'List Otter forms', 'otter-blocks' ),
				'description'         => __( 'Find Otter Form blocks in one post or site-wide and return each form\'s fields, delivery and integration settings. API keys are never returned.', 'otter-blocks' ),
				'category'            => self::CATEGORY,
				'input_schema'        => array(
					'type'                 => 'object',
					'properties'           => array(
						'post_id'  => array(
							'type'        => 'integer',
							'description' => __( 'Limit the search to this post. Searches all content when omitted.', 'otter-blocks' ),
							'minimum'     => 1,
						),
						'page'     => array(
							'type'        => 'integer',
							'description' => __( 'Page of posts to scan in a site-wide search.', 'otter-blocks' ),
							'minimum'     => 1,
							'default'     => 1,
						),
						'per_page' => array(
							'type'        => 'integer',
							'description' => __( 'Number of posts to scan per page in a site-wide search.', 'otter-blocks' ),
							'minimum'     => 1,
							'maximum'     => self::MAX_PER_PAGE,
							'default'     => 20,
						),
					),
					'additionalProperties' => false,
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'forms'       => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'form_id'        => array( 'type' => 'string' ),
									'block_id'       => array( 'type' => 'string' ),
									'block_selector' => array( 'type' => 'string' ),
									'post_id'        => array( 'type' => 'integer' ),
									'post_title'     => array( 'type' => 'string' ),
									'fields'         => array(
										'type'  => 'array',
										'items' => array( 'type' => 'object' ),
									),
									'delivery'       => array( 'type' => 'object' ),
									'integrations'   => array(
										'type'  => 'array',
										'items' => array( 'type' => 'object' ),
									),
								),
							),
						),
						'page'        => array( 'type' => 'integer' ),
						'total_pages' => array( 'type' => 'integer' ),
						'total_posts' => array( 'type' => 'integer' ),
					),
				),
				'execute_callback'    => array( $this, 'list_forms' ),
				'permission_callback' => array( $this, 'can_manage_forms' ),
				'meta'                => array(
					'annotations'  => array(
						'readonly'    => true,
						'destructive' => false,
						'idempotent'  => true,
					),
					'show_in_rest' => true,
				),
			)
		);

		wp_register_ability(
			'otter/update-form',
			array(
				'label'               => __( 'Update Otter form settings', 'otter-blocks' ),
				'description'         => __( 'Update the delivery settings of an Otter form (recipients, subject, messages, redirect, notification, and with Otter Pro the autoresponder and webhook). Does not resend or replay submissions. Pass an empty string to reset a value.', 'otter-blocks' ),
				'category'            => self::CATEGORY,
				'input_schema'        => array(
					'type'                 => 'object',
					'properties'           => array(
						'form_id'     => array(
							'type'        => 'string',
							'description' => __( 'The form_id returned by otter/list-forms.', 'otter-blocks' ),
							'minLength'   => 1,
						),
						'post_id'     => array(
							'type'        => 'integer',
							'description' => __( 'Post that contains the form. Required when the form has no saved settings yet.', 'otter-blocks' ),
							'minimum'     => 1,
						),
						'delivery'    => array(
							'type'                 => 'object',
							'properties'           => array(
								'email_to'                 => array(
									'type'        => 'string',
									'description' => __( 'Recipient email address. The site admin email is used when empty.', 'otter-blocks' ),
								),
								'subject'                  => array( 'type' => 'string' ),
								'from_name'                => array( 'type' => 'string' ),
								'from_email'               => array( 'type' => 'string' ),
								'cc'                       => array( 'type' => 'string' ),
								'bcc'                      => array( 'type' => 'string' ),
								'reply_to'                 => array( 'type' => 'string' ),
								'redirect_link'            => array( 'type' => 'string' ),
								'submit_message'           => array( 'type' => 'string' ),
								'error_message'            => array( 'type' => 'string' ),
								'email_notification'       => array( 'type' => 'boolean' ),
								'autoresponder_subject'    => array(
									'type'        => 'string',
									'description' => __( 'Otter Pro only.', 'otter-blocks' ),
								),
								'autoresponder_body'       => array(
									'type'        => 'string',
									'description' => __( 'Otter Pro only. Limited HTML.', 'otter-blocks' ),
								),
								'ai_autoresponder_enabled' => array(
									'type'        => 'boolean',
									'description' => __( 'Otter Pro only.', 'otter-blocks' ),
								),
								'ai_autoresponder_prompt'  => array(
									'type'        => 'string',
									'description' => __( 'Otter Pro only.', 'otter-blocks' ),
								),
								'webhook_id'               => array(
									'type'        => 'string',
									'description' => __( 'Otter Pro only. ID of an existing webhook.', 'otter-blocks' ),
								),
							),
							'additionalProperties' => false,
						),
						'integration' => array(
							'type'                 => 'object',
							'description'          => __( 'Changes to an already connected marketing integration. The provider and API key cannot be changed here.', 'otter-blocks' ),
							'properties'           => array(
								'list_id' => array( 'type' => 'string' ),
								'action'  => array(
									'type' => 'string',
									'enum' => array( 'subscribe', 'submit-subscribe' ),
								),
							),
							'additionalProperties' => false,
						),
						'dry_run'     => array(
							'type'        => 'boolean',
							'description' => __( 'Validate and report the changes without saving.', 'otter-blocks' ),
							'default'     => false,
						),
					),
					'required'             => array( 'form_id' ),
					'additionalProperties' => false,
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'form_id'      => array( 'type' => 'string' ),
						'updated'      => array( 'type' => 'boolean' ),
						'dry_run'      => array( 'type' => 'boolean' ),
						'changed'      => array(
							'type'  => 'array',
							'items' => array( 'type' => 'string' ),
						),
						'delivery'     => array( 'type' => 'object' ),
						'integrations' => array(
							'type'  => 'array',
							'items' => array( 'type' => 'object' ),
						),
					),
				),
				'execute_callback'    => array( $this, 'update_form' ),
				'permission_callback' => array( $this, 'can_manage_forms' ),
				'meta'                => array(
					'annotations'  => array(
						'readonly'    => false,
						'destructive' => false,
						'idempotent'  => true,
					),
					'show_in_rest' => true,
				),
			)
		);

		wp_register_ability(
			'otter/list-form-submissions',
			array(
				'label'               => __( 'List Otter form submissions', 'otter-blocks' ),
				'description'         => __( 'List stored form submissions with their delivery status, or return a single submission in full by id. Returns personal data. Filtering by form requires Otter Pro.', 'otter-blocks' ),
				'category'            => self::CATEGORY,
				'input_schema'        => array(
					'type'                 => 'object',
					'properties'           => array(
						'id'       => array(
							'type'        => 'integer',
							'description' => __( 'Return only this submission, in full.', 'otter-blocks' ),
							'minimum'     => 1,
						),
						'form_id'  => array(
							'type'        => 'string',
							'description' => __( 'The form_id or block_id returned by otter/list-forms. Requires Otter Pro.', 'otter-blocks' ),
						),
						'status'   => array(
							'type'    => 'string',
							'enum'    => array( 'any', 'read', 'unread', 'trash' ),
							'default' => 'any',
						),
						'page'     => array(
							'type'    => 'integer',
							'minimum' => 1,
							'default' => 1,
						),
						'per_page' => array(
							'type'    => 'integer',
							'minimum' => 1,
							'maximum' => self::MAX_PER_PAGE,
							'default' => 20,
						),
					),
					'additionalProperties' => false,
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'submissions' => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'id'              => array( 'type' => 'integer' ),
									'status'          => array( 'type' => 'string' ),
									'submitted_at'    => array( 'type' => 'string' ),
									'form_id'         => array( 'type' => 'string' ),
									'post_id'         => array( 'type' => 'integer' ),
									'post_url'        => array( 'type' => 'string' ),
									'delivery_status' => array( 'type' => 'string' ),
									'fields'          => array(
										'type'  => 'array',
										'items' => array( 'type' => 'object' ),
									),
								),
							),
						),
						'page'        => array( 'type' => 'integer' ),
						'total_pages' => array( 'type' => 'integer' ),
						'total'       => array( 'type' => 'integer' ),
					),
				),
				'execute_callback'    => array( $this, 'list_form_submissions' ),
				'permission_callback' => array( $this, 'can_view_submissions' ),
				'meta'                => array(
					'annotations'  => array(
						'readonly'    => true,
						'destructive' => false,
						'idempotent'  => true,
					),
					'show_in_rest' => true,
				),
			)
		);
	}

	/**
	 * Permission check for the form settings.
	 *
	 * The form settings live in the `themeisle_blocks_form_emails` option, which the
	 * editor reads and writes through the core settings endpoint (`manage_options`).
	 *
	 * @return bool
	 */
	public function can_manage_forms() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Permission check for the form submissions.
	 *
	 * Mirrors the Submissions screen: the `manage_options` menu entry plus the
	 * `otter_form_record` post type capability that guards its list table.
	 *
	 * @return bool
	 */
	public function can_view_submissions() {
		return current_user_can( 'manage_options' ) && current_user_can( 'edit_' . Form_Submissions::FORM_RECORD_TYPE . 's' );
	}

	/**
	 * Execute `otter/list-forms`.
	 *
	 * @param mixed $input The ability input.
	 * @return array<string, mixed>|WP_Error
	 */
	public function list_forms( $input = array() ) {
		$input    = is_array( $input ) ? $input : array();
		$post_id  = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;
		$page     = isset( $input['page'] ) ? max( 1, absint( $input['page'] ) ) : 1;
		$per_page = isset( $input['per_page'] ) ? min( self::MAX_PER_PAGE, max( 1, absint( $input['per_page'] ) ) ) : 20;
		$settings = $this->get_forms_settings();

		if ( $post_id ) {
			$post = get_post( $post_id );

			if ( ! $post ) {
				return new WP_Error( 'otter_post_not_found', __( 'The post does not exist.', 'otter-blocks' ) );
			}

			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				return new WP_Error( 'otter_forbidden', __( 'You are not allowed to edit this post.', 'otter-blocks' ) );
			}

			return array(
				'forms'       => $this->get_post_forms( $post, $settings ),
				'page'        => 1,
				'total_pages' => 1,
				'total_posts' => 1,
			);
		}

		$post_types = array_values( array_diff( get_post_types( array( 'show_in_rest' => true ) ), array( 'attachment' ) ) );

		$query = new WP_Query(
			array(
				'post_type'           => $post_types,
				'post_status'         => array( 'publish', 'future', 'draft', 'pending', 'private' ),
				's'                   => '<!-- wp:' . self::FORM_BLOCK . ' ',
				'sentence'            => true,
				'search_columns'      => array( 'post_content' ),
				'posts_per_page'      => $per_page,
				'paged'               => $page,
				'orderby'             => 'ID',
				'order'               => 'ASC',
				'ignore_sticky_posts' => true,
			)
		);

		$forms = array();

		foreach ( $query->posts as $post ) {
			if ( ! ( $post instanceof \WP_Post ) || ! current_user_can( 'edit_post', $post->ID ) ) {
				continue;
			}

			$forms = array_merge( $forms, $this->get_post_forms( $post, $settings ) );
		}

		return array(
			'forms'       => $forms,
			'page'        => $page,
			'total_pages' => (int) $query->max_num_pages,
			'total_posts' => (int) $query->found_posts,
		);
	}

	/**
	 * The post that contains a form block with the given form id.
	 *
	 * Same search `otter/list-forms` runs, narrowed to the id; the block
	 * comment carries the id as a JSON attribute, so a content search finds
	 * it, and the match is confirmed by parsing the post's form blocks.
	 *
	 * @param string $form_id The form id.
	 * @return int The post ID, 0 when no post contains the form.
	 */
	private function find_form_post( $form_id ) {
		$post_types = array_values( array_diff( get_post_types( array( 'show_in_rest' => true ) ), array( 'attachment' ) ) );

		$query = new WP_Query(
			array(
				'post_type'           => $post_types,
				'post_status'         => array( 'publish', 'future', 'draft', 'pending', 'private' ),
				's'                   => $form_id,
				'sentence'            => true,
				'search_columns'      => array( 'post_content' ),
				'posts_per_page'      => 20,
				'orderby'             => 'ID',
				'order'               => 'ASC',
				'ignore_sticky_posts' => true,
				'no_found_rows'       => true,
			)
		);

		foreach ( $query->posts as $post ) {
			if ( ! ( $post instanceof \WP_Post ) ) {
				continue;
			}

			foreach ( $this->get_post_forms( $post, array() ) as $post_form ) {
				if ( $post_form['form_id'] === $form_id ) {
					return (int) $post->ID;
				}
			}
		}

		return 0;
	}

	/**
	 * Execute `otter/update-form`.
	 *
	 * @param mixed $input The ability input.
	 * @return array<string, mixed>|WP_Error
	 */
	public function update_form( $input = array() ) {
		$input   = is_array( $input ) ? $input : array();
		$form_id = isset( $input['form_id'] ) && is_string( $input['form_id'] ) ? sanitize_text_field( $input['form_id'] ) : '';
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;
		$dry_run = ! empty( $input['dry_run'] );

		if ( '' === $form_id ) {
			return new WP_Error( 'otter_invalid_form_id', __( 'A form_id is required.', 'otter-blocks' ) );
		}

		$forms = get_option( self::FORM_OPTION, array() );
		$forms = is_array( $forms ) ? array_values( $forms ) : array();
		$index = null;

		foreach ( $forms as $key => $form ) {
			if ( is_array( $form ) && isset( $form['form'] ) && $form['form'] === $form_id ) {
				$index = $key;
			}
		}

		// The form's settings are changed from the editor of the post that
		// contains it, so that post's `edit_post` is the check that applies —
		// whether the caller named the post or not. A form found in no post
		// has no page to authorise against and is not editable here.
		if ( ! $post_id ) {
			$post_id = $this->find_form_post( $form_id );

			if ( ! $post_id ) {
				return new WP_Error( 'otter_form_not_found', __( 'The form was not found in any post. Pass the post_id that contains the form.', 'otter-blocks' ) );
			}
		}

		$post = get_post( $post_id );

		if ( ! $post ) {
			return new WP_Error( 'otter_post_not_found', __( 'The post does not exist.', 'otter-blocks' ) );
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new WP_Error( 'otter_forbidden', __( 'You are not allowed to edit this post.', 'otter-blocks' ) );
		}

		$in_post = false;

		foreach ( $this->get_post_forms( $post, array() ) as $post_form ) {
			if ( $post_form['form_id'] === $form_id ) {
				$in_post = true;
			}
		}

		if ( ! $in_post ) {
			return new WP_Error( 'otter_form_not_found', __( 'The form was not found in this post.', 'otter-blocks' ) );
		}

		$entry   = null !== $index ? $forms[ $index ] : array( 'form' => $form_id );
		$updated = $this->apply_delivery( $entry, isset( $input['delivery'] ) && is_array( $input['delivery'] ) ? $input['delivery'] : array() );

		if ( is_wp_error( $updated ) ) {
			return $updated;
		}

		$updated = $this->apply_integration( $updated, isset( $input['integration'] ) && is_array( $input['integration'] ) ? $input['integration'] : array() );

		if ( is_wp_error( $updated ) ) {
			return $updated;
		}

		// Run the same sanitization the settings endpoint applies on save.
		$sanitized = sanitize_option( self::FORM_OPTION, array( $updated ) );
		$updated   = is_array( $sanitized ) && isset( $sanitized[0] ) && is_array( $sanitized[0] ) ? $sanitized[0] : $updated;
		$changed   = $this->get_changed_keys( $entry, $updated );

		if ( ! empty( $changed ) && ! $dry_run ) {
			if ( null !== $index ) {
				$forms[ $index ] = $updated;
			} else {
				$forms[] = $updated;
			}

			update_option( self::FORM_OPTION, $forms );
		}

		return array(
			'form_id'      => $form_id,
			'updated'      => ! empty( $changed ) && ! $dry_run,
			'dry_run'      => $dry_run,
			'changed'      => $changed,
			'delivery'     => $this->format_delivery( $updated ),
			'integrations' => $this->format_integrations( $updated ),
		);
	}

	/**
	 * Execute `otter/list-form-submissions`.
	 *
	 * @param mixed $input The ability input.
	 * @return array<string, mixed>|WP_Error
	 */
	public function list_form_submissions( $input = array() ) {
		$input    = is_array( $input ) ? $input : array();
		$id       = isset( $input['id'] ) ? absint( $input['id'] ) : 0;
		$form_id  = isset( $input['form_id'] ) && is_string( $input['form_id'] ) ? sanitize_text_field( $input['form_id'] ) : '';
		$status   = isset( $input['status'] ) && is_string( $input['status'] ) ? sanitize_key( $input['status'] ) : 'any';
		$page     = isset( $input['page'] ) ? max( 1, absint( $input['page'] ) ) : 1;
		$per_page = isset( $input['per_page'] ) ? min( self::MAX_PER_PAGE, max( 1, absint( $input['per_page'] ) ) ) : 20;

		if ( ! post_type_exists( Form_Submissions::FORM_RECORD_TYPE ) ) {
			return new WP_Error( 'otter_submissions_unavailable', __( 'Form submissions are not available on this site.', 'otter-blocks' ) );
		}

		if ( $id ) {
			$post = get_post( $id );

			if ( ! $post || Form_Submissions::FORM_RECORD_TYPE !== $post->post_type || 'draft' === $post->post_status ) {
				return new WP_Error( 'otter_submission_not_found', __( 'The submission does not exist.', 'otter-blocks' ) );
			}

			if ( ! current_user_can( 'edit_post', $id ) ) {
				return new WP_Error( 'otter_forbidden', __( 'You are not allowed to view this submission.', 'otter-blocks' ) );
			}

			return array(
				'submissions' => array( $this->format_submission( $post, true ) ),
				'page'        => 1,
				'total_pages' => 1,
				'total'       => 1,
			);
		}

		if ( ! in_array( $status, array( 'any', 'read', 'unread', 'trash' ), true ) ) {
			return new WP_Error( 'otter_invalid_status', __( 'Invalid status. Use any, read, unread or trash.', 'otter-blocks' ) );
		}

		$args = array(
			'post_type'      => Form_Submissions::FORM_RECORD_TYPE,
			'post_status'    => 'any' === $status ? array( 'read', 'unread' ) : $status,
			'posts_per_page' => $per_page,
			'paged'          => $page,
			'orderby'        => 'date',
			'order'          => 'DESC',
		);

		if ( '' !== $form_id ) {
			// Filtering the records by form is an Otter Pro feature.
			if ( ! Pro::is_pro_active() ) {
				return $this->pro_required_error( __( 'Filtering submissions by form requires an active Otter Pro license.', 'otter-blocks' ), 'form-submissions-filter' );
			}

			// Records reference the form by its block ID, which shares its suffix with the form option name.
			if ( 0 !== strpos( $form_id, 'wp-block-' ) ) {
				$form_id = 'wp-block-themeisle-blocks-form-' . substr( $form_id, -8 );
			}

			$args['meta_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				array(
					'key'     => Form_Submissions::FORM_RECORD_META_KEY,
					'value'   => $form_id,
					'compare' => 'LIKE',
				),
			);
		}

		$query       = new WP_Query( $args );
		$submissions = array();

		foreach ( $query->posts as $post ) {
			if ( ! ( $post instanceof \WP_Post ) || ! current_user_can( 'edit_post', $post->ID ) ) {
				continue;
			}

			$submissions[] = $this->format_submission( $post, false );
		}

		return array(
			'submissions' => $submissions,
			'page'        => $page,
			'total_pages' => (int) $query->max_num_pages,
			'total'       => (int) $query->found_posts,
		);
	}

	/**
	 * Get the saved form settings keyed by form option name.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private function get_forms_settings() {
		$forms    = get_option( self::FORM_OPTION, array() );
		$settings = array();

		if ( ! is_array( $forms ) ) {
			return $settings;
		}

		foreach ( $forms as $form ) {
			if ( is_array( $form ) && isset( $form['form'] ) && is_string( $form['form'] ) ) {
				$settings[ $form['form'] ] = $form;
			}
		}

		return $settings;
	}

	/**
	 * Get the forms found in a post.
	 *
	 * @param \WP_Post                            $post     The post.
	 * @param array<string, array<string, mixed>> $settings The saved form settings.
	 * @return array<int, array<string, mixed>>
	 */
	private function get_post_forms( $post, $settings ) {
		$forms = array();

		if ( ! has_block( self::FORM_BLOCK, $post ) ) {
			return $forms;
		}

		foreach ( $this->find_blocks( parse_blocks( $post->post_content ), array( self::FORM_BLOCK ) ) as $block ) {
			$attrs    = isset( $block['attrs'] ) && is_array( $block['attrs'] ) ? $block['attrs'] : array();
			$form_id  = isset( $attrs['optionName'] ) && is_string( $attrs['optionName'] ) ? $attrs['optionName'] : '';
			$block_id = isset( $attrs['id'] ) && is_string( $attrs['id'] ) ? $attrs['id'] : '';
			$saved    = isset( $settings[ $form_id ] ) ? $settings[ $form_id ] : array();

			$forms[] = array(
				'form_id'        => $form_id,
				'block_id'       => $block_id,
				'block_selector' => '' !== $block_id ? '#' . $block_id : '',
				'post_id'        => (int) $post->ID,
				'post_title'     => get_the_title( $post ),
				'fields'         => $this->get_form_fields( $block ),
				'delivery'       => $this->format_delivery( $saved ),
				'integrations'   => $this->format_integrations( $saved ),
			);
		}

		return $forms;
	}

	/**
	 * Recursively find blocks by name.
	 *
	 * @param array<int, array<string, mixed>> $blocks The parsed blocks.
	 * @param array<int, string>               $names  The block names to look for.
	 * @param bool                             $nested Whether to look inside a matched block.
	 * @return array<int, array<string, mixed>>
	 */
	private function find_blocks( $blocks, $names, $nested = false ) {
		$found = array();

		foreach ( $blocks as $block ) {
			$is_match = isset( $block['blockName'] ) && in_array( $block['blockName'], $names, true );

			if ( $is_match ) {
				$found[] = $block;
			}

			if ( ( ! $is_match || $nested ) && ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$found = array_merge( $found, $this->find_blocks( $block['innerBlocks'], $names, $nested ) );
			}
		}

		return $found;
	}

	/**
	 * Get the fields of a form block.
	 *
	 * @param array<string, mixed> $form_block The parsed form block.
	 * @return array<int, array<string, mixed>>
	 */
	private function get_form_fields( $form_block ) {
		$defaults = array(
			'themeisle-blocks/form-input'           => 'text',
			'themeisle-blocks/form-textarea'        => 'textarea',
			'themeisle-blocks/form-multiple-choice' => 'checkbox',
			'themeisle-blocks/form-file'            => 'file',
			'themeisle-blocks/form-hidden-field'    => 'hidden',
			'themeisle-blocks/form-stripe-field'    => 'stripe',
		);

		$fields = array();
		$inner  = isset( $form_block['innerBlocks'] ) && is_array( $form_block['innerBlocks'] ) ? $form_block['innerBlocks'] : array();

		foreach ( $this->find_blocks( $inner, array_keys( $defaults ) ) as $block ) {
			$attrs = isset( $block['attrs'] ) && is_array( $block['attrs'] ) ? $block['attrs'] : array();
			$field = array(
				'id'       => isset( $attrs['id'] ) ? (string) $attrs['id'] : '',
				'block'    => $block['blockName'],
				'type'     => isset( $attrs['type'] ) && is_string( $attrs['type'] ) ? $attrs['type'] : $defaults[ $block['blockName'] ],
				'label'    => isset( $attrs['label'] ) ? wp_strip_all_tags( (string) $attrs['label'] ) : '',
				'required' => ! empty( $attrs['isRequired'] ),
			);

			foreach ( array( 'placeholder', 'helpText', 'mappedName', 'paramName', 'options' ) as $key ) {
				if ( isset( $attrs[ $key ] ) && is_string( $attrs[ $key ] ) && '' !== $attrs[ $key ] ) {
					$field[ $key ] = wp_strip_all_tags( $attrs[ $key ] );
				}
			}

			$fields[] = $field;
		}

		return $fields;
	}

	/**
	 * Format the delivery settings of a saved form entry.
	 *
	 * @param array<string, mixed> $entry The saved form entry.
	 * @return array<string, mixed>
	 */
	private function format_delivery( $entry ) {
		$delivery = array();

		foreach ( self::$delivery_map as $key => $option_key ) {
			if ( ! isset( $entry[ $option_key ] ) ) {
				continue;
			}

			$delivery[ $key ] = 'email_notification' === $key ? filter_var( $entry[ $option_key ], FILTER_VALIDATE_BOOLEAN ) : (string) $entry[ $option_key ];
		}

		if ( isset( $entry['hasCaptcha'] ) ) {
			$delivery['has_captcha'] = filter_var( $entry['hasCaptcha'], FILTER_VALIDATE_BOOLEAN );
		}

		if ( isset( $entry['captchaProvider'] ) ) {
			$delivery['captcha_provider'] = (string) $entry['captchaProvider'];
		}

		if ( isset( $entry['autoresponder'] ) && is_array( $entry['autoresponder'] ) ) {
			$delivery['autoresponder_subject'] = isset( $entry['autoresponder']['subject'] ) ? (string) $entry['autoresponder']['subject'] : '';
			$delivery['autoresponder_body']    = isset( $entry['autoresponder']['body'] ) ? (string) $entry['autoresponder']['body'] : '';
		}

		if ( isset( $entry['aiAutoresponder'] ) && is_array( $entry['aiAutoresponder'] ) ) {
			$delivery['ai_autoresponder_enabled'] = ! empty( $entry['aiAutoresponder']['enabled'] );
			$delivery['ai_autoresponder_prompt']  = isset( $entry['aiAutoresponder']['prompt'] ) ? (string) $entry['aiAutoresponder']['prompt'] : '';
		}

		return $delivery;
	}

	/**
	 * Format the integrations of a saved form entry. The API key is never returned.
	 *
	 * @param array<string, mixed> $entry The saved form entry.
	 * @return array<int, array<string, mixed>>
	 */
	private function format_integrations( $entry ) {
		if ( empty( $entry['integration'] ) || ! is_array( $entry['integration'] ) || empty( $entry['integration']['provider'] ) ) {
			return array();
		}

		return array(
			array(
				'provider'    => (string) $entry['integration']['provider'],
				'list_id'     => isset( $entry['integration']['listId'] ) ? (string) $entry['integration']['listId'] : '',
				'action'      => isset( $entry['integration']['action'] ) ? (string) $entry['integration']['action'] : '',
				'has_api_key' => ! empty( $entry['integration']['apiKey'] ),
			),
		);
	}

	/**
	 * Build the error returned when a request needs Otter Pro, with the upgrade link.
	 *
	 * @param string $message The reason, already translated.
	 * @param string $area    The gated feature, used as the campaign of the upgrade link.
	 * @return WP_Error
	 */
	private function pro_required_error( $message, $area ) {
		$upgrade_url = tsdk_translate_link( tsdk_utmify( Pro::get_url(), $area, 'mcp' ) );

		return new WP_Error(
			'otter_pro_required',
			/* translators: 1: the reason the request was refused, 2: the upgrade URL */
			sprintf( __( '%1$s Upgrade: %2$s', 'otter-blocks' ), $message, $upgrade_url ),
			array( 'upgrade_url' => $upgrade_url )
		);
	}

	/**
	 * Apply the `delivery` input to a form entry.
	 *
	 * @param array<string, mixed> $entry    The saved form entry.
	 * @param array<string, mixed> $delivery The delivery input.
	 * @return array<string, mixed>|WP_Error
	 */
	private function apply_delivery( $entry, $delivery ) {
		$pro_keys = array( 'autoresponder_subject', 'autoresponder_body', 'ai_autoresponder_enabled', 'ai_autoresponder_prompt', 'webhook_id' );
		$known    = array_merge( array_keys( self::$delivery_map ), $pro_keys );

		foreach ( $delivery as $key => $value ) {
			if ( ! in_array( $key, $known, true ) ) {
				/* translators: %s the name of the setting */
				return new WP_Error( 'otter_invalid_setting', sprintf( __( 'Unknown delivery setting: %s.', 'otter-blocks' ), sanitize_key( (string) $key ) ) );
			}

			if ( in_array( $key, $pro_keys, true ) && ! Pro::is_pro_active() ) {
				/* translators: %s the name of the setting */
				return $this->pro_required_error( sprintf( __( 'The %s setting requires an active Otter Pro license.', 'otter-blocks' ), $key ), 'form-' . str_replace( '_', '-', $key ) );
			}

			if ( in_array( $key, array( 'email_notification', 'ai_autoresponder_enabled' ), true ) ) {
				$value = filter_var( $value, FILTER_VALIDATE_BOOLEAN );
			} elseif ( ! is_scalar( $value ) ) {
				/* translators: %s the name of the setting */
				return new WP_Error( 'otter_invalid_value', sprintf( __( 'Invalid value for %s.', 'otter-blocks' ), $key ) );
			} else {
				$value = trim( (string) $value );
			}

			if ( '' !== $value && in_array( $key, array( 'email_to', 'cc', 'bcc', 'from_email', 'reply_to' ), true ) ) {
				$emails = in_array( $key, array( 'email_to', 'from_email', 'reply_to' ), true ) ? array( $value ) : array_map( 'trim', explode( ',', $value ) );

				foreach ( $emails as $email ) {
					if ( ! is_email( $email ) ) {
						/* translators: %s the name of the setting */
						return new WP_Error( 'otter_invalid_email', sprintf( __( 'Invalid email address in %s.', 'otter-blocks' ), $key ) );
					}
				}
			}

			if ( '' !== $value && 'redirect_link' === $key ) {
				$value = esc_url_raw( $value );

				if ( '' === $value ) {
					return new WP_Error( 'otter_invalid_url', __( 'Invalid redirect link.', 'otter-blocks' ) );
				}
			}

			if ( '' !== $value && 'webhook_id' === $key ) {
				$webhooks = get_option( 'themeisle_webhooks_options', array() );
				$exists   = false;

				foreach ( is_array( $webhooks ) ? $webhooks : array() as $webhook ) {
					if ( is_array( $webhook ) && isset( $webhook['id'] ) && $webhook['id'] === $value ) {
						$exists = true;
					}
				}

				if ( ! $exists ) {
					return new WP_Error( 'otter_webhook_not_found', __( 'The webhook does not exist.', 'otter-blocks' ) );
				}
			}

			switch ( $key ) {
				case 'autoresponder_subject':
				case 'autoresponder_body':
					$sub_key = 'autoresponder_subject' === $key ? 'subject' : 'body';

					if ( ! isset( $entry['autoresponder'] ) || ! is_array( $entry['autoresponder'] ) ) {
						$entry['autoresponder'] = array();
					}

					$entry['autoresponder'][ $sub_key ] = $value;

					// An autoresponder with no content is a reset, as when it is deselected in the editor.
					if ( '' === implode( '', array_map( 'strval', $entry['autoresponder'] ) ) ) {
						unset( $entry['autoresponder'] );
					}
					break;
				case 'ai_autoresponder_enabled':
				case 'ai_autoresponder_prompt':
					$sub_key = 'ai_autoresponder_enabled' === $key ? 'enabled' : 'prompt';

					if ( ! isset( $entry['aiAutoresponder'] ) || ! is_array( $entry['aiAutoresponder'] ) ) {
						$entry['aiAutoresponder'] = array();
					}

					$entry['aiAutoresponder'][ $sub_key ] = $value;
					break;
				default:
					$option_key = self::$delivery_map[ $key ];

					if ( '' === $value ) {
						// An empty value is a reset, as when the control is deselected in the editor.
						unset( $entry[ $option_key ] );
					} else {
						$entry[ $option_key ] = $value;
					}
					break;
			}
		}

		return $entry;
	}

	/**
	 * Apply the `integration` input to a form entry.
	 *
	 * @param array<string, mixed> $entry       The saved form entry.
	 * @param array<string, mixed> $integration The integration input.
	 * @return array<string, mixed>|WP_Error
	 */
	private function apply_integration( $entry, $integration ) {
		if ( empty( $integration ) ) {
			return $entry;
		}

		if ( empty( $entry['integration'] ) || ! is_array( $entry['integration'] ) || empty( $entry['integration']['provider'] ) ) {
			return new WP_Error( 'otter_integration_not_connected', __( 'This form has no connected integration. Connect the provider in the editor first.', 'otter-blocks' ) );
		}

		foreach ( $integration as $key => $value ) {
			if ( ! is_string( $value ) ) {
				return new WP_Error( 'otter_invalid_value', __( 'Invalid integration value.', 'otter-blocks' ) );
			}

			if ( 'list_id' === $key ) {
				$entry['integration']['listId'] = sanitize_text_field( $value );
			} elseif ( 'action' === $key ) {
				if ( ! in_array( $value, array( 'subscribe', 'submit-subscribe' ), true ) ) {
					return new WP_Error( 'otter_invalid_value', __( 'Invalid integration action. Use subscribe or submit-subscribe.', 'otter-blocks' ) );
				}

				$entry['integration']['action'] = $value;
			} else {
				return new WP_Error( 'otter_invalid_setting', __( 'Only list_id and action can be changed for an integration.', 'otter-blocks' ) );
			}
		}

		return $entry;
	}

	/**
	 * Get the top-level keys that differ between two form entries.
	 *
	 * @param array<string, mixed> $before The entry before the change.
	 * @param array<string, mixed> $after  The entry after the change.
	 * @return array<int, string>
	 */
	private function get_changed_keys( $before, $after ) {
		$changed = array();

		foreach ( array_unique( array_merge( array_keys( $before ), array_keys( $after ) ) ) as $key ) {
			$old = isset( $before[ $key ] ) ? $before[ $key ] : null;
			$new = isset( $after[ $key ] ) ? $after[ $key ] : null;

			if ( $old !== $new ) {
				$changed[] = (string) $key;
			}
		}

		return $changed;
	}

	/**
	 * Format a form record.
	 *
	 * @param \WP_Post $post The record post.
	 * @param bool     $full Whether to include the delivery errors and issues.
	 * @return array<string, mixed>
	 */
	private function format_submission( $post, $full ) {
		$meta   = get_post_meta( $post->ID, Form_Submissions::FORM_RECORD_META_KEY, true );
		$meta   = is_array( $meta ) ? $meta : array();
		$fields = array();

		if ( isset( $meta['inputs'] ) && is_array( $meta['inputs'] ) ) {
			foreach ( $meta['inputs'] as $field_id => $field ) {
				if ( ! is_array( $field ) ) {
					continue;
				}

				$fields[] = array(
					'id'    => (string) $field_id,
					'label' => isset( $field['label'] ) ? wp_strip_all_tags( (string) $field['label'] ) : '',
					'type'  => isset( $field['type'] ) ? (string) $field['type'] : '',
					'value' => isset( $field['value'] ) && is_scalar( $field['value'] ) ? (string) $field['value'] : '',
				);
			}
		}

		$delivery_status = get_post_meta( $post->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true );

		$submission = array(
			'id'              => (int) $post->ID,
			'status'          => (string) $post->post_status,
			'submitted_at'    => (string) get_post_time( DATE_RFC3339, true, $post ),
			'form_id'         => isset( $meta['form']['value'] ) ? (string) $meta['form']['value'] : '',
			'post_id'         => isset( $meta['post_id']['value'] ) ? absint( $meta['post_id']['value'] ) : 0,
			'post_url'        => isset( $meta['post_url']['value'] ) ? (string) $meta['post_url']['value'] : '',
			'delivery_status' => is_string( $delivery_status ) ? $delivery_status : '',
			'fields'          => $fields,
		);

		if ( $full ) {
			$errors = get_post_meta( $post->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true );
			$issues = get_post_meta( $post->ID, Form_Submissions::ISSUES_META_KEY, true );

			$submission['delivery_errors'] = is_array( $errors ) ? array_values( $errors ) : array();
			$submission['issues']          = is_array( $issues ) ? array_values( $issues ) : array();
		}

		return $submission;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @access public
	 * @return Abilities
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
