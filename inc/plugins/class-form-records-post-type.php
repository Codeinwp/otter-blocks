<?php
/**
 * Form Submission Record post type.
 *
 * Registers the `otter_form_record` post type, its read/unread post statuses and the
 * custom capabilities granted to administrators.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

/**
 * Class Form_Records_Post_Type
 */
class Form_Records_Post_Type {
	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'init', array( $this, 'create_form_records_type' ) );
		add_action( 'admin_init', array( $this, 'set_form_records_cap' ), 10, 0 );
	}

	/**
	 * Create custom post type for form records.
	 *
	 * @return void
	 */
	public function create_form_records_type() {
		register_post_type(
			Form_Submissions::FORM_RECORD_TYPE,
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
				'capability_type' => Form_Submissions::FORM_RECORD_TYPE,
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

		$role->add_cap( 'edit_' . Form_Submissions::FORM_RECORD_TYPE );
		$role->add_cap( 'read_' . Form_Submissions::FORM_RECORD_TYPE );
		$role->add_cap( 'delete_' . Form_Submissions::FORM_RECORD_TYPE );
		$role->add_cap( 'edit_' . Form_Submissions::FORM_RECORD_TYPE . 's' );
		$role->add_cap( 'read_' . Form_Submissions::FORM_RECORD_TYPE . 's' );
		$role->add_cap( 'delete_' . Form_Submissions::FORM_RECORD_TYPE . 's' );
		$role->remove_cap( 'create_' . Form_Submissions::FORM_RECORD_TYPE );
		$role->remove_cap( 'create_' . Form_Submissions::FORM_RECORD_TYPE . 's' );
	}
}
