<?php
/**
 * Form Submission Record edit screen.
 *
 * Renders and persists the single-record admin screen: the submission-data meta box,
 * the replacement "Update" box (with delivery status), the admin menu placement and the
 * field-value save handler.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use WP_Post;

/**
 * Class Form_Records_Meta_Box
 */
class Form_Records_Meta_Box {
	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'add_meta_boxes', array( $this, 'add_form_record_meta_box' ) );
		add_action( 'admin_menu', array( $this, 'handle_admin_menu' ) );
		add_action( 'save_post', array( $this, 'form_record_save_meta_box' ), 10, 2 );
	}

	/**
	 * Remove the 'publish' box from the otter_form_record post type.
	 *
	 * @return void
	 */
	public function handle_admin_menu() {
		remove_meta_box( 'submitdiv', Form_Submissions::FORM_RECORD_TYPE, 'side' );

		global $submenu;
		unset( $submenu[ 'edit.php?post_type=' . Form_Submissions::FORM_RECORD_TYPE ] );

		remove_menu_page( 'edit.php?post_type=' . Form_Submissions::FORM_RECORD_TYPE );

		add_submenu_page(
			'otter',
			__( 'Submissions', 'otter-blocks' ),
			__( 'Submissions', 'otter-blocks' ),
			'manage_options',
			'edit.php?post_type=' . Form_Submissions::FORM_RECORD_TYPE
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
			Form_Submissions::FORM_RECORD_TYPE
		);

		// this will replace the default publish box, that's why it's using its id.
		add_meta_box(
			'submitpost',
			esc_html__( 'Update', 'otter-blocks' ),
			array( $this, 'update_meta_box_markup' ),
			Form_Submissions::FORM_RECORD_TYPE,
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

		if ( Form_Submissions::FORM_RECORD_TYPE !== $post->post_type ) {
			return;
		}

		if ( empty( $_POST['action'] ) || 'editpost' !== $_POST['action'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}

		if ( empty( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['_wpnonce'] ) ), 'update-post_' . $post->ID ) ) {
			wp_die( esc_html__( 'Nonce not verified.', 'otter-blocks' ) );
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			wp_die( esc_html__( 'User cannot edit this post.', 'otter-blocks' ) );
		}

		$meta = get_post_meta( $post_id, Form_Submissions::FORM_RECORD_META_KEY, true );

		foreach ( $_POST as $key => $value ) {
			if ( 0 !== strpos( $key, 'otter_meta_' ) || ! is_string( $value ) ) {
				continue;
			}

			$id    = substr( $key, -8 );
			$value = sanitize_textarea_field( wp_unslash( $value ) );

			if ( isset( $meta['inputs'][ $id ] ) && $meta['inputs'][ $id ]['value'] !== $value ) {
				$meta['inputs'][ $id ]['value'] = $value;
			}
		}

		// Slash the value: update_post_meta() unslashes it, which would otherwise strip backslashes from the stored data.
		update_post_meta( $post_id, Form_Submissions::FORM_RECORD_META_KEY, wp_slash( $meta ) );
	}

	/**
	 * Render form record meta box.
	 *
	 * @param WP_Post $post The post object.
	 * @return void
	 */
	public function fields_meta_box_markup( $post ) {
		$meta                  = get_post_meta( $post->ID, Form_Submissions::FORM_RECORD_META_KEY, true );
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
					value="<?php echo esc_attr( $field['value'] ); ?>"
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
					value="<?php echo esc_attr( $field['value'] ); ?>"
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
					value="<?php echo esc_attr( $field['value'] ); ?>"
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
		$meta            = get_post_meta( $post->ID, Form_Submissions::FORM_RECORD_META_KEY, true );
		$delivery_status = get_post_meta( $post->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true );
		$delivery_errors = get_post_meta( $post->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true );

		if ( empty( $meta ) || ! is_array( $meta ) ) {
			return;
		}

		$form_label = isset( $meta['form']['label'] ) ? $meta['form']['label'] : __( 'Form', 'otter-blocks' );
		$form_value = isset( $meta['form']['value'] ) ? $meta['form']['value'] : '';
		$post_url   = isset( $meta['post_url']['value'] ) ? $meta['post_url']['value'] : '';
		?>
		<div class="submitbox">
			<div class="metadata">
				<div>
					<span class="dashicons dashicons-feedback"></span>
					<?php echo esc_html( $form_label ); ?>:
					<a href="<?php echo esc_url( $post_url . '#' . $form_value ); ?>"><?php echo esc_html( substr( $form_value, -8 ) ); ?></a>
				</div>
				<div>
					<span class="dashicons dashicons-admin-page"></span>
					<?php echo esc_html__( 'Post', 'otter-blocks' ); ?>:
					<a href="<?php echo esc_url( $post_url ); ?>"><?php echo esc_html__( 'View', 'otter-blocks' ); ?></a>
				</div>
				<div>
					<span class="dashicons dashicons-calendar"></span>
					<?php echo esc_html__( 'Submitted on', 'otter-blocks' ); ?>:
					<span><strong><?php echo esc_html( get_the_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $post ) ); ?></strong></span>
				</div>
				<?php if ( ! empty( $delivery_status ) ) : ?>
				<div>
					<span class="dashicons <?php echo Form_Submissions::DELIVERY_STATUS_FAILED === $delivery_status ? 'dashicons-warning' : 'dashicons-yes-alt'; ?>"></span>
					<?php echo esc_html__( 'Delivery', 'otter-blocks' ); ?>:
					<strong><?php echo Form_Submissions::DELIVERY_STATUS_FAILED === $delivery_status ? esc_html__( 'Failed', 'otter-blocks' ) : esc_html__( 'Complete', 'otter-blocks' ); ?></strong>
					<?php if ( is_array( $delivery_errors ) && ! empty( $delivery_errors ) ) : ?>
						<ul style="margin: 6px 0 0 26px; list-style: disc;">
							<?php foreach ( $delivery_errors as $error ) : ?>
								<li>
									<?php if ( ! empty( $error['action'] ) ) : ?>
										<strong><?php echo esc_html( $error['action'] ); ?></strong>:
									<?php endif; ?>
									<?php echo esc_html( ! empty( $error['message'] ) ? $error['message'] : '' ); ?>
								</li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				</div>
				<?php endif; ?>
			</div>
			<div id="major-publishing-actions">
				<div id="delete-action">
					<?php
					printf(
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
					printf(
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
}
