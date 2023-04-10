<?php
/**
 * Form Block Responses Storing.
 *
 * @package ThemeIsle\OtterPro\Plugins\Form
 */

namespace ThemeIsle\OtterPro\Plugins\Form;

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Server\Form_Server;
use WP_Post;

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

	private $form_record_type = 'otter_form_record';

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'init', array( $this, 'create_form_records_type' ) );
		add_action( 'admin_init', array( $this, 'control_form_records_cap' ), 10, 0 );
		add_action( 'otter_form_after_submit', array( $this, 'store_form_record' ) );
		add_action( 'load-edit.php', array( $this, 'add_form_records_list_table' ), 100 );
		add_action( 'add_meta_boxes', array( $this, 'add_form_record_meta_box' ) );
		add_action( 'admin_menu', array( $this, 'remove_publish_box' ) );
		add_action( 'save_post', array( $this, 'form_record_save_meta_box' ), 10, 2 );

		// Form record actions.
		add_action( 'admin_action_trash', array( $this, 'trash_otter_form_record' ) );
		add_action( 'admin_action_delete', array( $this, 'delete_otter_form_record' ) );
		add_action( 'admin_action_untrash', array( $this, 'untrash_otter_form_record' ) );
		add_action( 'admin_action_read', array( $this, 'read_otter_form_record' ) );
		add_action( 'admin_action_unread', array( $this, 'unread_otter_form_record' ) );
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
			'email'    => array(
				'label' => 'Email',
				'value' => $email,
			),
			'form'     => array(
				'label' => 'Form',
				'value' => $form_data->get_payload_field( 'formId' ),
			),
			'post_url' => array(
				'label' => 'Post URL',
				'value' => $form_data->get_payload_field( 'postUrl' ),
			),
		);

		$form_inputs = $form_data->get_form_inputs();
		foreach ( $form_inputs as $input ) {
			if ( ! isset( $input['id'] ) ) {
				continue;
			}

			$id = substr( $input['id'], -8 );
			$meta['inputs'][ $id ] = array(
				'label' => $input['label'],
				'value' => $input['value'],
				'type'  => $input['type'],
			);
		}

		add_post_meta( $post_id, 'otter_form_record_meta', $meta );
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
				'capability_type' => 'otter_form_record',
				'description'     => __( 'Holds the data from the form submissions', 'otter-blocks' ),
				'public'          => false,
				'show_ui'         => true,
				'show_in_rest'    => true,
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
	 * Add custom capabilities for otter_form_record.
	 *
	 * @return void
	 */
	public function control_form_records_cap() {
		global $wp_roles;
		foreach ( $wp_roles->roles as $key => $current_role ) {
			$role = get_role( $key );
			if ( $role === null ) {
				continue;
			}

			if ( ! method_exists( $role, 'add_cap' ) ) {
				continue;
			}

			$role->add_cap( 'edit_otter_form_records' );
			$role->add_cap( 'publish_otter_form_records' );
			$role->add_cap( 'read_otter_form_records' );
		}
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
	 * Remove the 'publish' box from the otter_form_record post type.
	 *
	 * @return void
	 */
	public function remove_publish_box() {
		remove_meta_box( 'submitdiv', 'otter_form_record', 'side' );
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
			array( $this, 'meta_box_markup' ),
			'otter_form_record'
		);

		add_meta_box(
			'update_form_record_meta_box',
			esc_html__( 'Update', 'otter-blocks' ),
			array( $this, 'update_meta_box_markup' ),
			'otter_form_record',
			'side'
		);
	}

	/**
	 * Save data from form record meta box.
	 *
	 * @param $post_id
	 * @param $post
	 *
	 * @return void
	 */
	public function form_record_save_meta_box( $post_id, $post ) {
		if ( 'otter_form_record' !== $post->post_type ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( ! isset( $_POST['_wpnonce'] ) ) {
			wp_die( esc_html__( 'Nonce not set.', 'otter-blocks' ) );
		}

		if ( ! wp_verify_nonce( $_POST['_wpnonce'], 'update-post_' . $post->ID ) ) {
			wp_die( esc_html__( 'Nonce not verified.', 'otter-blocks' ) );
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			wp_die( esc_html__( 'User cannot edit post.', 'otter-blocks' ) );
		}

		$meta = get_post_meta( $post_id, 'otter_form_record_meta', true );

		foreach( $_POST as $key => $value ) {
			if ( ! str_starts_with( $key, 'otter_meta_' ) ) {
				continue;
			}

			$id = substr( $key, -8 );

			if ( isset( $meta['inputs'][ $id ] ) &&  $meta['inputs'][ $id ]['value'] !== $value ) {
				$meta['inputs'][ $id ]['value'] = $value;
			}
		}

		update_post_meta( $post_id, 'otter_form_record_meta', $meta );
	}

	/**
	 * Render form record meta box.
	 *
	 * @param WP_Post $post The post object.
	 * @return void
	 */
	public function meta_box_markup( $post ) {
		$meta = get_post_meta( $post->ID, 'otter_form_record_meta', true );
		?>
		<table class="otter_form_record_meta" style="border-spacing: 10px; width: 100%">
			<tbody style="display: table; width: 100%">
				<?php
				foreach ( $meta['inputs'] as $key => $field ) {
					?>
					<tr>
						<td><label for="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $field['label'] ); ?></label></td>
						<?php
						if ( $field['type'] === 'textarea' ) {
							?>
							<td><textarea id="<?php echo esc_attr( $key ); ?>" class="otter_form_record_meta__value" rows="5" cols="40"><?php echo esc_html( $field['value'] ); ?></textarea></td>
							<?php
							continue;
						}
						?>
						<td><input name="<?php echo esc_attr( 'otter_meta_' . $key ); ?>" id="<?php echo esc_attr( $key ); ?>" type="<?php echo isset( $field['type'] ) ? esc_attr( $field['type'] ) : ''; ?>" class="otter_form_record_meta__value" value="<?php echo esc_html( $field['value'] ); ?>" size="40"/></td>
					</tr>
					<?php
				}
				?>
			</tbody>
		</table>
		<?php
	}

	/**
	 * Render update form record meta box.
	 *
	 * @param WP_Post $post The post object.
	 * @return void
	 */
	public function update_meta_box_markup( $post ) {
		$meta = get_post_meta( $post->ID, 'otter_form_record_meta', true );
		?>
		<div class="submitbox">
			<div class="metadata">
				<div>
					<span class="dashicons dashicons-feedback"></span>
					<?php echo esc_html( $meta['form']['label'] ); ?>:
					<a href="<?php echo esc_url( $meta['post_url']['value'] . "#" . $meta['form']['value'] ); ?>"><?php echo esc_html( substr( $meta['form']['value'], -8 ) ); ?></a>
				</div>
				<div>
					<span class="dashicons dashicons-admin-page"></span>
					<?php echo esc_html__( 'Post', 'otter-blocks' ); ?>:
					<a href="<?php echo esc_url( $meta['post_url']['value'] ); ?>"><?php echo esc_html__('View', 'otter-blocks' ); ?></a>
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
						'<a href="?action=%s&otter_form_record=%s&_wpnonce=%s" class="submitdelete">%s</a>',
						'trash',
						$post->ID,
						wp_create_nonce( 'trash-otter_form_record_' . $post->ID ),
						__( 'Move to Trash', 'otter-blocks' )
					);
					?>
				</div>

				<div id="updating-action" style="text-align: right">
					<?php
					echo sprintf(
						'<input type="submit" class="button button-primary button-large" value="%s"/>',
						__( 'Update', 'otter-blocks' )
					);
					?>
				</div>
				<div class="clear"></div>
			</div>
		</div>
		<style>
			#update_form_record_meta_box .inside {
				padding: 0;
			}
			#update_form_record_meta_box .metadata {
				padding: 10px;
				display: flex;
				flex-direction: column;
				row-gap: 20px;
			}
			#update_form_record_meta_box .dashicons {
				color: #8c8f94;
			}
		</style>
		<?php
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

		wp_safe_redirect( remove_query_arg( array( 'action', $this->form_record_type, '_wpnonce' ), admin_url( "edit.php?post_type=$this->form_record_type" ) ) );
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

		wp_safe_redirect( remove_query_arg( array( 'action', $this->form_record_type, '_wpnonce' ), admin_url( "edit.php?post_type=$this->form_record_type" ) ) );
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

		wp_safe_redirect( remove_query_arg( array( 'action', $this->form_record_type, '_wpnonce' ), admin_url( "edit.php?post_type=$this->form_record_type" ) ) );
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

		wp_safe_redirect( remove_query_arg( array( 'action', $this->form_record_type, '_wpnonce' ), admin_url( "edit.php?post_type=$this->form_record_type" ) ) );
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

		wp_safe_redirect( remove_query_arg( array( 'action', $this->form_record_type, '_wpnonce' ), admin_url( "edit.php?post_type=$this->form_record_type" ) ) );
		exit;
	}

	/**
	 * Update form record.
	 *
	 * @return void
	 */
	public function update_otter_form_record() {
		wp_safe_redirect( remove_query_arg( array( 'action', $this->form_record_type, '_wpnonce' ), wp_get_referer() ) );
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
