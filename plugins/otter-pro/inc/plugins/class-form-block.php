<?php
/**
 * Form Block Pro Functionalities.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Server\Form_Server;

use WP_Error;
use WP_HTTP_Response;
use WP_REST_Response;

/**
 * Class Form_Block
 */
class Form_Block {
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
		add_action( 'otter_form_after_submit', array( $this, 'send_autoresponder' ) );
	}

	/**
	 * Send autoresponder email to the subscriber.
	 *
	 * @param Form_Data_Request $form_data Data from request body.
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response|void
	 * @since 2.0.3
	 */
	public function send_autoresponder( $form_data ) {
		if ( ! $form_data->get_form_options()->has_autoresponder() ) {
			return;
		}

		$res = new Form_Data_Response();

		$to = Form_Server::instance()->get_email_from_form_input( $form_data );
		if ( empty( $to ) ) {
			$res->set_code( Form_Data_Response::ERROR_EMAIL_NOT_SEND );
			return $res->build_response();
		}

		$headers[] = 'Content-Type: text/html';
		$headers[] = 'From: ' . ( $form_data->get_form_options()->has_from_name() ? sanitize_text_field( $form_data->get_form_options()->get_from_name() ) : get_bloginfo( 'name', 'display' ) );

		$autoresponder = $form_data->get_form_options()->get_autoresponder();
		$body          = $this->replace_magic_tags( $autoresponder['body'], $form_data->get_form_inputs() );

		// phpcs:ignore
		$res->set_success( wp_mail( $to, $autoresponder['subject'], $body, $headers ) );
		if ( $res->is_success() ) {
			$res->set_code( Form_Data_Response::SUCCESS_EMAIL_SEND );
		} else {
			$res->set_code( Form_Data_Response::ERROR_EMAIL_NOT_SEND );
		}

		$form_options = $form_data->get_form_options();
		$res->add_values( $form_options->get_submit_data() );
		return $res->build_response();
	}

	/**
	 * Replace magic tags with the values from the form inputs.
	 *
	 * @param string $content The content to replace the magic tags.
	 * @param array  $form_inputs The form inputs.
	 *
	 * @return string
	 */
	public function replace_magic_tags( $content, $form_inputs ) {
		$magic_tags = array_map(
			function( $field ) {
				return array(
					$field['id'] => $field['value'],
				);
			},
			array_filter(
				$form_inputs,
				function( $field ) {
					return isset( $field['id'] );
				}
			)
		);

		foreach ( $magic_tags as $key => $value ) {
			$content = str_replace( '%' . $key . '%', $value, $content );
		}

		return $content;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.1
	 * @access public
	 * @return Form_Block
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
	 * @since 1.7.1
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
	 * @since 1.7.1
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
