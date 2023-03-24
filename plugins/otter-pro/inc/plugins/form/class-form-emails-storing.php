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
		add_action( 'admin_menu', array( $this, 'register_submenu_emails' ) );
		add_action( 'otter_form_after_submit', array( $this, 'store_form_record' ) );
	}

	/**
	 * Register submenu page for emails storage.
	 *
	 * @return void
	 */
	public function register_submenu_emails() {
		add_submenu_page(
			'otter',
			__( 'Settings', 'otter-blocks' ),
			__( 'Settings', 'otter-blocks' ),
			'manage_options',
			'otter',
			'',
			0
		);

		add_submenu_page(
			'otter',
			__( 'Form Submissions', 'otter-blocks' ),
			__( 'Form Submissions', 'otter-blocks' ),
			'manage_options',
			'otter-form-submissions',
			array( $this, 'render_form_submissions_page' )
		);
	}

	/**
	 * Create custom post type for form records.
	 *
	 * @return void
	 */
	public function create_form_records_type() {
		register_post_type(
			'otter_form_records',
			array(
				'labels'       => array(
					'name'          => esc_html_x( 'Form Submissions', '', 'otter-blocks' ),
					'singular_name' => esc_html_x( 'Form Submission', '', 'otter-blocks' ),
					'search_items'  => esc_html__( 'Search Form Submissions', 'otter-blocks' ),
					'all_items'     => esc_html__( 'Form Submissions', 'otter-blocks' ),
					'view_item'     => esc_html__( 'View Submission', 'otter-blocks' ),
					'update_item'   => esc_html__( 'Update Submission', 'otter-blocks' ),
				),
				'description'  => __( 'Holds the data from the form submissions', 'otter-blocks' ),
				'show_ui'      => false,
				'show_in_menu' => 'otter',
				'show_in_rest' => true,
				'supports'     => array( 'title' ),
			)
		);
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
				'post_type' => 'otter_form_record',
				'post_title' => $email,
				'post_status' => 'publish',
			)
		);

		if ( ! $post_id ) {
			return;
		}

		$meta = array(
			'email'   => $email,
			'form'    => substr( $form_data->get_payload_field( 'formId' ), -8 ),
			'postUrl' => $form_data->get_payload_field( 'postUrl' ),
			'read'    => false,
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

		$meta['date'] = get_the_date( 'Y-m-d H:i:s', $post_id );

		add_post_meta( $post_id, 'otter_form_record_meta', $meta );
	}

	/**
	 * Render form submissions page.
	 */
	public function render_form_submissions_page() {
		?>
		<div class="wrap">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'Form Submissions', 'otter-blocks' ); ?></h1>
			<hr class="wp-header-end">
			<?php
			$records = new Form_Submissions_List_Table();
			$records->prepare_items();
			?>
			<form method="post">
				<input type="hidden" name="page" value="otter-form-submissions" />
				<?php
				$records->search_box( '', 'otter-form-record' );
				?>
			</form>
			<?php
			$records->views();
			$records->display();
			?>
		</div>
		<?php
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
