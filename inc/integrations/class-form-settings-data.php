<?php
/**
 * Class for Form Settings.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

use ThemeIsle\GutenbergBlocks\Pro;

/**
 * Form settings
 *
 * @since 2.0.3
 */
class Form_Settings_Data {

	/**
	 * The name of the provider.
	 *
	 * @var string|null
	 */
	private $provider;

	/**
	 * The API Key.
	 *
	 * @var string|null
	 */
	private $api_key;

	/**
	 * The contact list ID.
	 *
	 * @var string|null
	 */
	private $list_id;

	/**
	 * The name of the action.
	 *
	 * @var string|null
	 */
	private $action;

	/**
	 * The form has reCaptcha.
	 *
	 * @var bool
	 */
	private $has_captcha = false;

	/**
	 * The metadata.
	 *
	 * @var array
	 */
	private $meta = array();

	/**
	 * The redirect link.
	 *
	 * @var string
	 */
	private $redirect_link = '';

	/**
	 * The subject of the email.
	 *
	 * @var string|null
	 */
	private $email_subject;

	/**
	 * The message when submit is successful.
	 *
	 * @var string|null
	 */
	private $submit_message;

	/**
	 * The message when the email can not be send.
	 *
	 * @var string
	 */
	private $error_message = '';

	/**
	 * The name of the sender.
	 *
	 * @var string|null
	 */
	private $from_name;

	/**
	 * The email of the sender.
	 *
	 * @var string|null
	 */
	private $from_email;

	/**
	 * The CC recipients.
	 *
	 * @var string
	 */
	private $cc = '';

	/**
	 * The BCC recipients.
	 *
	 * @var string
	 */
	private $bcc = '';

	/**
	 * The autoresponder data.
	 *
	 * @var array
	 */
	private $autoresponder = array();

	/**
	 * The location where the submissions are saved.
	 *
	 * @var string
	 */
	private $submissions_save_location = '';

	/**
	 * The webhook ID.
	 *
	 * @var string
	 */
	private $webhook_id = '';

	/**
	 * The required fields.
	 *
	 * @var array
	 */
	private $required_fields = array();

	/**
	 * The default constructor.
	 *
	 * @param array $integration_data The integration data.
	 */
	public function __construct( $integration_data ) {

		$this->extract_integration_data( $integration_data );
		if ( isset( $integration_data['hasCaptcha'] ) ) {
			$this->set_captcha( $integration_data['hasCaptcha'] );
		}

		$this->set_meta( $integration_data );
	}

	/**
	 * Extract the settings from 3rd party integration.
	 *
	 * @param array $integration_data The integration data.
	 * @return void
	 * @since 2.0.3
	 */
	public function extract_integration_data( $integration_data ) {
		if ( isset( $integration_data['apiKey'] ) ) {
			$this->set_api_key( $integration_data['apiKey'] );
		}

		if ( isset( $integration_data['listId'] ) ) {
			$this->set_list_id( $integration_data['listId'] );
		}

		if ( isset( $integration_data['provider'] ) ) {
			$this->set_provider( $integration_data['provider'] );
		}

		if ( isset( $integration_data['action'] ) ) {
			$this->set_action( $integration_data['action'] );
		}

		if ( isset( $integration_data['listId'] ) ) {
			$this->set_list_id( $integration_data['listId'] );
		}
	}

	/**
	 * Check if it has the necessary data set.
	 *
	 * @return string The issues about the missing settings.
	 * @since 2.0.3
	 */
	public function check_data() {
		if ( ! $this->has_provider() ) {
			return Form_Data_Response::ERROR_MISSING_PROVIDER;
		}

		if ( ! $this->has_api_key() ) {
			return Form_Data_Response::ERROR_MISSING_API_KEY;
		}

		if ( ! $this->has_list_id() ) {
			return Form_Data_Response::ERROR_MISSING_MAIL_LIST_ID;
		}

		return '';
	}

	/**
	 * Get the 3rd party integration settings from WP options given the form option ID.
	 *
	 * @param string $form_option The ID of the form.
	 * @return Form_Settings_Data
	 * @since 2.0.3
	 */
	public static function get_form_setting_from_wordpress_options( $form_option ) {
		$option_name = sanitize_text_field( $form_option );
		$form_emails = get_option( 'themeisle_blocks_form_emails' );
		$integration = new Form_Settings_Data( array() );
		foreach ( $form_emails as $form ) {
			if ( isset( $form['form'] ) && $form['form'] === $option_name ) {

				if ( isset( $form['hasCaptcha'] ) ) {
					$integration->set_captcha( $form['hasCaptcha'] );
				}
				if ( isset( $form['redirectLink'] ) ) {
					$integration->set_redirect_link( $form['redirectLink'] );
				}
				if ( isset( $form['emailSubject'] ) ) {
					$integration->set_email_subject( $form['emailSubject'] );
				}
				if ( isset( $form['submitMessage'] ) ) {
					$integration->set_submit_message( $form['submitMessage'] );
				}
				if ( isset( $form['errorMessage'] ) ) {
					$integration->set_error_message( $form['errorMessage'] );
				}
				if ( isset( $form['fromName'] ) ) {
					$integration->set_from_name( $form['fromName'] );
				}
				if ( isset( $form['fromEmail'] ) ) {
					$integration->set_from_email( $form['fromEmail'] );
				}
				if ( isset( $form['cc'] ) ) {
					$integration->set_cc( $form['cc'] );
				}
				if ( isset( $form['bcc'] ) ) {
					$integration->set_bcc( $form['bcc'] );
				}
				if ( isset( $form['autoresponder'] ) && count( $form['autoresponder'] ) > 0 ) {
					$integration->set_autoresponder( $form['autoresponder'] );
				}
				if ( isset( $form['integration'] ) ) {
					$integration->extract_integration_data( $form['integration'] );
				}
				if ( isset( $form['submissionsSaveLocation'] ) ) {
					if ( '' === $form['submissionsSaveLocation'] && Pro::is_pro_active() ) {
						$integration->set_submissions_save_location( 'database-email' );
					} else {
						$integration->set_submissions_save_location( $form['submissionsSaveLocation'] );
					}
				} elseif ( Pro::is_pro_active() ) {
					$integration->set_submissions_save_location( 'database-email' );
				}
				$integration->set_meta( $form );
				if ( isset( $form['webhookId'] ) ) {
					$integration->set_webhook_id( $form['webhookId'] );
				}
				if ( isset( $form['requiredFields'] ) && is_array( $form['requiredFields'] ) ) {
					$integration->set_required_fields( $form['requiredFields'] );
				}
			}
		}
		return $integration;
	}

	/**
	 * Set the provider.
	 *
	 * @param string $provider The name of the provider.
	 * @return $this
	 * @since 2.0.3
	 */
	public function set_provider( $provider ) {
		$this->provider = $provider;
		return $this;
	}

	/**
	 * Set the API Key.
	 *
	 * @param string $api_key The API Key.
	 * @return $this
	 * @since 2.0.3
	 */
	public function set_api_key( $api_key ) {
		$this->api_key = $api_key;
		return $this;
	}

	/**
	 * Set the list id.
	 *
	 * @param string $list_id The contact list ID.
	 * @return $this
	 * @since 2.0.3
	 */
	public function set_list_id( $list_id ) {
		$this->list_id = $list_id;
		return $this;
	}

	/**
	 * Set the action.
	 *
	 * @param string $action The name of the action.
	 * @return $this
	 * @since 2.0.3
	 */
	public function set_action( $action ) {
		$this->action = $action;
		return $this;
	}

	/**
	 * Set the meta.
	 *
	 * @param array $meta The metadata.
	 *
	 * @return $this
	 * @since 2.0.3
	 */
	public function set_meta( $meta ) {
		$this->meta = $meta;
		return $this;
	}

	/**
	 * Set if the form has captcha.
	 *
	 * @param bool $has_captcha The value of the flag.
	 * @return Form_Settings_Data
	 * @since 2.0.3
	 */
	public function set_captcha( $has_captcha ) {
		$this->has_captcha = $has_captcha;
		return $this;
	}

	/**
	 * Check if it has the API Key and the list id set.
	 *
	 * @return bool.
	 * @since 2.0.3
	 */
	public function has_credentials() {
		return $this->has_api_key() && $this->has_list_id();
	}

	/**
	 * Check if it has the provider set.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function has_provider() {
		return isset( $this->provider ) && '' !== $this->provider;
	}

	/**
	 * Check if it has the API Key set.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function has_api_key() {
		return isset( $this->api_key ) && '' !== $this->api_key;
	}

	/**
	 * Check if it has the list id set.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function has_list_id() {
		return isset( $this->list_id ) && '' !== $this->list_id;
	}

	/**
	 * Check if it has the action set.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function has_action() {
		return isset( $this->action ) && '' !== $this->action;
	}

	/**
	 * Check if it has the email_subject set.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function has_email_subject() {
		return isset( $this->email_subject ) && '' !== $this->email_subject;
	}

	/**
	 * Check if it has the submit_message set.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function has_submit_message() {
		return isset( $this->submit_message ) && '' !== $this->submit_message;
	}

	/**
	 * Check if it has the submit_message set.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function has_from_name() {
		return isset( $this->from_name ) && '' !== $this->from_name;
	}

	/**
	 * Check if it has the from_email set.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function has_from_email() {
		return isset( $this->from_email ) && '' !== $this->from_email && filter_var( $this->from_email, FILTER_VALIDATE_EMAIL ) !== false;
	}

	/**
	 * Check if it has an autoresponder.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function has_autoresponder() {
		return count( $this->autoresponder ) > 0;
	}

	/**
	 * Set the redirect link.
	 *
	 * @param string $redirect_link The redirect link.
	 * @return Form_Settings_Data
	 * @since 2.0.3
	 */
	public function set_redirect_link( $redirect_link ) {
		$this->redirect_link = $redirect_link;
		return $this;
	}

	/**
	 * Set the email subject.
	 *
	 * @param string $email_subject The email subject.
	 * @return Form_Settings_Data
	 * @since 2.0.3
	 */
	public function set_email_subject( $email_subject ) {
		$this->email_subject = $email_subject;
		return $this;
	}

	/**
	 * Set the message on submit.
	 *
	 * @param string $submit_message The message.
	 * @return Form_Settings_Data
	 * @since 2.0.3
	 */
	public function set_submit_message( $submit_message ) {
		$this->submit_message = $submit_message;
		return $this;
	}

	/**
	 * Set the message when the email can not be send.
	 *
	 * @param string $error_message The message.
	 * @return Form_Settings_Data
	 * @since 2.1.7
	 */
	public function set_error_message( $error_message ) {
		$this->error_message = $error_message;
		return $this;
	}

	/**
	 * Get the provider.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public function get_provider() {
		return $this->provider;
	}

	/**
	 * Get the API Key.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public function get_api_key() {
		return $this->api_key;
	}

	/**
	 * Get the list ID.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public function get_list_id() {
		return $this->list_id;
	}

	/**
	 * Get the action.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public function get_action() {
		return $this->action;
	}

	/**
	 * Get the meta.
	 *
	 * @return array
	 * @since 2.0.3
	 */
	public function get_meta() {
		return $this->meta;
	}

	/**
	 * Get the captcha.
	 *
	 * @return bool
	 * @since 2.0.3
	 */
	public function form_has_captcha() {
		return $this->has_captcha;
	}

	/**
	 * Get the redirect link.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public function get_redirect_link() {
		return $this->redirect_link;
	}

	/**
	 * Get the email subject.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public function get_email_subject() {
		return $this->email_subject;
	}

	/**
	 * Get the message for submit.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public function get_submit_message() {
		return $this->submit_message;
	}

	/**
	 * Get the message for submit.
	 *
	 * @return string
	 * @since 2.1.7
	 */
	public function get_error_message() {
		return $this->error_message;
	}

	/**
	 * Get the OnSuccess submit data: redirectLink, submitMessage.
	 *
	 * @return array
	 * @since 2.0.3
	 */
	public function get_submit_data() {
		return array(
			'redirectLink'  => $this->get_redirect_link(),
			'submitMessage' => $this->get_submit_message(),
			'displayError'  => $this->get_error_message(),
		);
	}

	/**
	 * Get the name of the sender.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public function get_from_name() {
		return $this->from_name;
	}

	/**
	 * Set the name of the sender.
	 *
	 * @param string $from_name The name of the sender.
	 *
	 * @return Form_Settings_Data
	 * @since 2.0.3
	 */
	public function set_from_name( $from_name ) {
		$this->from_name = $from_name;

		return $this;
	}

	/**
	 * Get the email of the sender.
	 *
	 * @return string
	 */
	public function get_from_email() {
		return $this->from_email;
	}

	/**
	 * Set the email of the sender.
	 *
	 * @param string $from_email The email of the sender.
	 * @return Form_Settings_Data
	 */
	public function set_from_email( $from_email ) {
		if ( filter_var( $from_email, FILTER_VALIDATE_EMAIL ) !== false ) {
			$this->from_email = $from_email;
		} else {
			$this->from_email = '';
		}
		return $this;
	}

	/**
	 * Get the email cc.
	 *
	 * @return string
	 */
	public function get_cc() {
		return $this->cc;
	}

	/**
	 * Set the email cc.
	 *
	 * @param string $cc The email cc.
	 * @return Form_Settings_Data
	 */
	public function set_cc( $cc ) {
		$this->cc = $cc;
		return $this;
	}

	/**
	 * Get the email bcc.
	 *
	 * @return string
	 */
	public function get_bcc() {
		return $this->bcc;
	}

	/**
	 * Set the email bcc.
	 *
	 * @param string $bcc The email bcc.
	 * @return Form_Settings_Data
	 */
	public function set_bcc( $bcc ) {
		$this->bcc = $bcc;
		return $this;
	}

	/**
	 * Get the autoresponder.
	 *
	 * @return array
	 */
	public function get_autoresponder() {
		return $this->autoresponder;
	}

	/**
	 * Get the webhook id.
	 *
	 * @return string
	 */
	public function get_webhook_id() {
		return $this->webhook_id;
	}

	/**
	 * Set the autoresponder.
	 *
	 * @param array $autoresponder The email bcc.
	 * @return Form_Settings_Data
	 */
	public function set_autoresponder( $autoresponder ) {
		$this->autoresponder = $autoresponder;
		return $this;
	}

	/**
	 *
	 * Get the submissions save location.
	 *
	 * @return string
	 */
	public function get_submissions_save_location() {
		return $this->submissions_save_location;
	}

	/**
	 * Set the submissions save location.
	 *
	 * @param string $submissions_save_location The submissions save location.
	 * @return $this
	 */
	public function set_submissions_save_location( $submissions_save_location ) {
		$this->submissions_save_location = $submissions_save_location;
		return $this;
	}

	/**
	 * Set the webhook ID.
	 *
	 * @param string $webhook_id The webhook ID.
	 * @return $this
	 */
	private function set_webhook_id( $webhook_id ) {
		if ( ! empty( $webhook_id ) ) {
			$this->webhook_id = $webhook_id;
		}
		return $this;
	}

	/**
	 * Set the required fields.
	 *
	 * @param array $required_fields The required fields.
	 * @return $this
	 */
	public function set_required_fields( $required_fields ) {

		$this->required_fields = $required_fields;
		return $this;
	}

	/**
	 * Get the required fields.
	 *
	 * @return array
	 */
	public function get_required_fields() {
		return $this->required_fields;
	}

	/**
	 * Check if the form has required fields.
	 *
	 * @return bool
	 */
	public function has_required_fields() {
		return ! empty( $this->required_fields );
	}
}
