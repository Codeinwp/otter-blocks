<?php
/**
 * Class for Form Email.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Form Email
 *
 * @since 2.0.3
 */
class Form_Email {

	/**
	 * The main instance var.
	 *
	 * @var Form_Email|null
	 */
	public static $instance = null;

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 2.0.1
	 * @access public
	 * @return Form_Email
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Add email rendering actions.
	 *
	 * @return void
	 * @since 2.0.3
	 */
	public function init() {
		/**
		 * Add filter that render the email's header.
		 */
		add_filter( 'otter_form_email_render_head', array( $this, 'build_head' ) );

		/**
		 * Add filter that render the email's body.
		 */
		add_filter( 'otter_form_email_render_body', array( $this, 'build_body' ) );

		/**
		 * Add filter that render the email's body for errors.
		 */
		add_filter( 'otter_form_email_render_body_error', array( $this, 'build_error_body' ) );
	}

	/**
	 * Create the email content.
	 *
	 * @param Form_Data_Request $form_data The form request data.
	 * @return string
	 * @since 2.0.3
	 */
	public function build_email( $form_data ) {
		return sprintf(
			'
		<!doctype html>
		<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
			<meta http-equiv="Content-Type" content="text/html;" charset="utf-8"/>
			<!-- view port meta tag -->
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
			<title>%s%s</title>
		</head>
		<body>
		%s
		%s
		</body>
		</html>',
			esc_html__( 'Mail From: ', 'otter-blocks' ),
			sanitize_email( get_site_option( 'admin_email' ) ),
			apply_filters( 'otter_form_email_render_head', $form_data ),
			apply_filters( 'otter_form_email_render_body', $form_data )
		);
	}

	/**
	 * Create the content for the email header.
	 *
	 * @since 2.0.3
	 */
	public function build_head() {
		return sprintf(
			'
		<h3>%s <a href=\"%s\">%s</a>
		</h3>
		<hr/>',
			esc_html( __( 'Content Form submission from ', 'otter-blocks' ) ),
			esc_url( get_site_url() ),
			get_bloginfo( 'name', 'display' )
		);
	}

	/**
	 * Create the content for the email body.
	 *
	 * @param Form_Data_Request $form_data The form request data.
	 * @return string
	 * @since 2.0.3
	 */
	public function build_body( $form_data ) {
		$email_form_content = $form_data->get_form_inputs();
		$content            = '';
		$attachment_links   = '';

		$fields = array();

		foreach ( $email_form_content as $index => $input ) {
			// If the current position from 'metadata' is different from the previous one, then we have a new field.
			if (
				0 === $index ||
				(
					isset( $input['metadata']['position'] ) &&
					isset( $email_form_content[ $index - 1 ]['metadata']['position'] ) &&
					$email_form_content[ $index - 1 ]['metadata']['position'] !== $input['metadata']['position']
				)
			) {
				$fields[] = array(
					'label' => $input['label'],
					'value' => $input['value'],
				);
			} else {
				// Otherwise is the same as the previous one, then we have the same field.
				// Add the value to the last field from the $fields array.
				$fields[ count( $fields ) - 1 ]['value'] .= ', ' . $input['value'];
			}
		}

		foreach ( $fields as $input ) {
			$content .= sprintf( '<tr><td><strong>%s:</strong> %s</td></tr>', $input['label'], $input['value'] );
		}

		if ( $form_data->has_files_loaded_to_media_library() ) {
			$attachment_links = '<tr><td><strong>' . esc_html__( 'Files loaded to media library', 'otter-blocks' ) . ':</strong> ';
			foreach ( $form_data->get_files_loaded_to_media_library() as $file ) {
				$attachment_links .= '<a href="' . esc_url( wp_get_attachment_url( $file['file_id'] ) ) . '">' . esc_html( $file['file_name'] ) . '</a>, ';
			}
			$attachment_links .= '</td></tr>';
		}

		return "
		<table>
		<tbody>
		$content
		$attachment_links
		</tbody>
			<tfoot>
			<tr>
				<td>
					<hr/>" .
					esc_html( __( 'You received this email because your email address is set in the content form settings on ', 'otter-blocks' ) ) .
					'<a href="' . esc_url( get_site_url() ) . '">' . get_bloginfo( 'name', 'display' ) . '</a>
				</td>
			</tr>
		</tfoot>
		</table>
		';
	}

	/**
	 * Build the error email.
	 *
	 * @param Form_Data_Request $form_data The form request data.
	 * @return string
	 * @since 2.0.3
	 */
	public function build_error_email( $form_data ) {
		return '
		<!doctype html>
		<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
			<meta http-equiv="Content-Type" content="text/html;" charset="utf-8"/>
			<!-- view port meta tag -->
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
			<title>'
			. esc_html__( 'Mail From: ', 'otter-blocks' ) . sanitize_email( get_site_option( 'admin_email' ) ) .
			'</title>
		</head>
		<body>'
			. apply_filters( 'otter_form_email_render_body_error', $form_data ) .
		"<div>
			<h3> <?php esc_html_e( 'Submitted form content', 'otter-blocks' ); ?> </h3>
			<div style=\"padding: 10px; border: 1px dashed black;\">"
			. apply_filters( 'otter_form_email_render_body', $form_data ) .
			'</div>
		</div>
		</body>
		</html>';
	}

	/**
	 * Build the body for error messages.
	 *
	 * @param Form_Data_Request $form_data The error message.
	 * @since 2.0.3
	 */
	public function build_error_body( $form_data ) {
		$error_message = __( 'No error found.', 'otter-blocks' );

		$title = __( 'Status Report ', 'otter-blocks' );

		if ( $form_data->has_error() ) {
			$error_message = '(' . $form_data->get_error_code() . ')' . Form_Data_Response::get_error_code_message( $form_data->get_error_code() );
		}

		$warnings = '<p>' . __( 'No warning found.', 'otter-blocks' ) . '</p>';

		if ( $form_data->has_warning() ) {
			$warnings = '<ul>';
			foreach ( $form_data->get_warning_codes() as $warning ) {
				$warnings .= '<li>';
				$warnings .= '(' . esc_html( $warning['code'] ) . ') ';
				$warnings .= esc_html( Form_Data_Response::get_error_code_message( $warning['code'] ) . ( ! empty( $warning['details'] ) ? '(' . $warning['details'] . ')' : '' ) );
				$warnings .= '</li>';
			}
			$warnings .= '</ul>';
		}

		return sprintf(
			'
		<h3>%s</h3>
		<div style="padding: 10px;">
			<span style="color: red;font-weight: bold">%s</span>%s<br/>
			<span style="font-weight: bold">%s</span>%s<br/>
			<p>%s</p>
		</div>',
			esc_html( $title ),
			esc_html( __( 'Error: ', 'otter-blocks' ) ),
			esc_html( $error_message ),
			esc_html( __( 'Warnings: ', 'otter-blocks' ) ),
			$warnings,
			esc_html( __( 'Please check your Form credential from the email provider.', 'otter-blocks' ) )
		);
	}

	/**
	 * Build the body for the test email.
	 *
	 * @param Form_Data_Request $form_data The form request data.
	 * @return string
	 * @since 2.0.3
	 */
	public function build_test_email( $form_data ) {
		return sprintf(
			"
		<!doctype html>
		<html xmlns=\"http://www.w3.org/1999/xhtml\">
		<head>
			<meta http-equiv=\"Content-Type\" content=\"text/html;\" charset=\"utf-8\"/>
			<!-- view port meta tag -->
			<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
			<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"/>
			<title>%s%s</title>
		</head>
		<body>
		%s
		<br><br>
		Location: <a href='%s'>link</a>.
		</body>
		</html>
		",
			esc_html__( 'Mail From: ', 'otter-blocks' ),
			sanitize_email( get_site_option( 'admin_email' ) ),
			esc_html( __( 'This a test email. If you receive this email, your SMTP set-up is working for sending emails via Form Block.', 'otter-blocks' ) ),
			$form_data->get_payload_field( 'site' )
		);
	}


	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 2.0.1
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
	 * @since 2.0.1
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
