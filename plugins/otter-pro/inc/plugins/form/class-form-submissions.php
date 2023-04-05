<?php
/**
 * Form Block Responses Storing.
 *
 * @package ThemeIsle\OtterPro\Plugins\Form
 */

namespace ThemeIsle\OtterPro\Plugins\Form;

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Server\Form_Server;

/**
 * Class Form_Block
 */
class Form_Block_Emails_Storing {
	/**
	 * The main instance var.
	 *
	 * @var Form_Block
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'init', array( $this, 'create_form_records_type' ) );
		add_action( 'otter_form_after_submit', array( $this, 'store_form_record' ) );
		add_action( 'load-edit.php', array( $this, 'add_form_records_list_table' ), 100 );

		// Form record actions.
		add_action( 'admin_action_trash', array( $this, 'trash_otter_form_record' ) );
		add_action( 'admin_action_delete', array( $this, 'delete_otter_form_record' ) );
		add_action( 'admin_action_untrash', array( $this, 'untrash_otter_form_record' ) );
		add_action( 'admin_action_read', array( $this, 'read_otter_form_record' ) );
		add_action( 'admin_action_unread', array( $this, 'unread_otter_form_record' ) );

	}

	/**
	 * Add our custom list table to the otter_form_record page.
	 *
	 * @return void
	 */
	public function add_form_records_list_table() {
		$screen = get_current_screen();
		if ( 'edit-otter_form_record' === $screen->id ) {
			add_action( 'admin_notices', array( $this, 'render_form_submissions_page' ), 100 );
		}
	}

	/**
	 * Create custom post type for form records.
	 *
	 * @return void
	 */
	public function create_form_records_type() {
		register_post_type(
			'otter_form_record',
			array(
				'labels'          => array(
					'name'          => esc_html_x( 'Form Submissions', '', 'otter-blocks' ),
					'singular_name' => esc_html_x( 'Form Submission', '', 'otter-blocks' ),
					'search_items'  => esc_html__( 'Search Form Submissions', 'otter-blocks' ),
					'all_items'     => esc_html__( 'Form Submissions', 'otter-blocks' ),
					'view_item'     => esc_html__( 'View Submission', 'otter-blocks' ),
					'update_item'   => esc_html__( 'Update Submission', 'otter-blocks' ),
				),
				'description'     => __( 'Holds the data from the form submissions', 'otter-blocks' ),
				'public'          => false,
				'show_ui'         => true,
				'show_in_rest'    => true,
				'capability_type'     => 'otter_form_record',
				'capabilities'        => array(
					'edit_post'          => 'edit_otter_form_record',
					'edit_posts'         => 'edit_otter_form_records',
					'edit_others_posts'  => 'edit_others_otter_form_records',
					'read_post'          => 'read_otter_form_record',
					'read_private_posts' => 'read_private_otter_form_records',
					'delete_post'        => 'delete_otter_form_record',
					'publish_posts'      => 'do_not_allow',
				),
				'supports'        => array( 'title' ),
			)
		);

		register_post_status( 'read', array(
			'label'                     => _x( 'Read', 'post', 'otter-blocks' ),
			'public'                    => true,
			'exclude_from_search'       => false,
			'show_in_admin_all_list'    => true,
			'show_in_admin_status_list' => true,
			'label_count'               => _n_noop( 'Read (%s)', 'Read (%s)', 'otter-blocks' ),
		) );

		register_post_status( 'unread', array(
			'label'                     => _x( 'Unread', 'post', 'otter-blocks' ),
			'public'                    => true,
			'exclude_from_search'       => false,
			'show_in_admin_all_list'    => true,
			'show_in_admin_status_list' => true,
			'label_count'               => _n_noop( 'Unread (%s)', 'Unread (%s)', 'otter-blocks' ),
		) );
	}

	/**
	 * Store form record in custom post type.
	 *
	 * @param Form_Data_Request $form_data The form data object.
	 * @return void
	 */
	public function store_form_record( $form_data ) {
		$email = Form_Server::instance()->get_email_from_form_input( $form_data );

		if ( ! $email ) {
			return;
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => 'otter_form_record',
				'post_title'  => $email,
				'post_status' => 'unread',
			)
		);

		if ( ! $post_id ) {
			return;
		}

		$meta = array(
			'email'    => $email,
			'form'     => $form_data->get_payload_field( 'formId' ),
			'post_url' => $form_data->get_payload_field( 'postUrl' ),
		);

		$form_inputs = $form_data->get_form_inputs();
		foreach ( $form_inputs as $input ) {
			if ( ! isset( $input['id'] ) ) {
				continue;
			}

			$id = substr( $input['id'], -8 );
			$meta['inputs'][] = array(
				$id => array(
					'value' => $input['value'],
					'label' => $input['label'],
				)
			);
		}

		add_post_meta( $post_id, 'otter_form_record_meta', $meta );
	}

	/**
	 * Check request nonce and post ID.
	 * Returns an array of post IDs that are passed in a request.
	 *
	 * @return array $post_id The post IDs.
	 */
	public function check_posts( $action ) {
		$nonce = isset( $_REQUEST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ) : '';

		$request_record    = wp_unslash( $_REQUEST['otter_form_record'] );
		$is_bulk_action    = is_array( $request_record );
		$otter_form_record = $is_bulk_action ? $request_record : array( $request_record );

		$ids = isset( $_REQUEST['otter_form_record'] ) ? array_map( 'sanitize_text_field', $otter_form_record ) : array();

		if ( empty( $ids ) ) {
			wp_die( __( 'Post ID is required', 'otter-blocks' ) );
		}

		if ( ! $is_bulk_action ) {
			if ( ! wp_verify_nonce( $nonce, $action . '-otter_form_record_' . $ids[0] ) ) {
				wp_die( __( 'Security check failed', 'otter-blocks' ) );
			}
		} elseif ( ! wp_verify_nonce( $nonce, 'bulk-otter_form_records' ) ) {
			wp_die( __( 'Security check failed', 'otter-blocks' ) );
		}

		foreach( $ids as $id ) {
			$post = get_post( $id );
			if ( ! $post ) {
				wp_die( __( 'Invalid post ID', 'otter-blocks' ) );
			}

			if ( 'otter_form_record' !== $post->post_type ) {
				wp_die( __( 'Invalid post type', 'otter-blocks' ) );
			}
		}

		return $ids;
	}

	/**
	 * Trash form record.
	 *
	 * @return void
	 */
	public function trash_otter_form_record() {
		$ids = $this->check_posts( 'trash' );

		foreach ( $ids as $id ) {
			$removed = wp_trash_post( $id );

			if ( ! $removed ) {
				wp_die( __( 'Failed to move post to trash', 'otter-blocks' ) );
			}
		}

		wp_safe_redirect( remove_query_arg( array( 'action', 'otter_form_record', '_wpnonce' ), wp_get_referer() ) );
		exit;
	}

	/**
	 * Delete form record.
	 *
	 * @return void
	 */
	public function delete_otter_form_record() {
		$ids = $this->check_posts( 'delete' );

		foreach ( $ids as $id ) {
			$removed = wp_delete_post( $id );

			if ( ! $removed ) {
				wp_die( __( 'Failed to delete post', 'otter-blocks' ) );
			}
		}

		wp_safe_redirect( remove_query_arg( array( 'action', 'otter_form_record', '_wpnonce' ), wp_get_referer() ) );
		exit;
	}

	/**
	 * Read form record.
	 *
	 * @return void
	 */
	public function read_otter_form_record() {
		$ids = $this->check_posts( 'read' );

		foreach ( $ids as $id ) {
			wp_update_post(
				array(
					'ID'          => $id,
					'post_status' => 'read',
				)
			);
		}

		wp_safe_redirect( remove_query_arg( array( 'action', 'otter_form_record', '_wpnonce' ), wp_get_referer() ) );
		exit;
	}

	/**
	 * Unread form record.
	 *
	 * @return void
	 */
	public function unread_otter_form_record() {
		$ids = $this->check_posts( 'unread' );

		foreach ( $ids as $id ) {
			wp_update_post(
				array(
					'ID'          => $id,
					'post_status' => 'unread',
				)
			);
		}

		wp_safe_redirect( remove_query_arg( array( 'action', 'otter_form_record', '_wpnonce' ), wp_get_referer() ) );
		exit;
	}

	/**
	 * Untrash form record.
	 *
	 * @return void
	 */
	public function untrash_otter_form_record() {
		$ids = $this->check_posts( 'untrash' );

		foreach ( $ids as $id ) {
			wp_update_post(
				array(
					'ID'          => $id,
					'post_status' => 'read',
				)
			);
		}

		wp_safe_redirect( remove_query_arg( array( 'action', 'otter_form_record', '_wpnonce' ), wp_get_referer() ) );
		exit;
	}

	/**
	 * Render form submissions page.
	 */
	public function render_form_submissions_page() {
		$records = new Form_Submissions_List_Table();
		?>
		<div class="wrap">
			<?php
			$records->prepare_items();
			?>
			<form id="posts-filter" method="get">
				<?php
				$records->search_box( '', 'otter-form-record' );
				$records->views();
				$records->display();
				?>
			</form>
		</div>
		<?php
		exit;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @access public
	 * @return Form_Block_Emails_Storing
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
