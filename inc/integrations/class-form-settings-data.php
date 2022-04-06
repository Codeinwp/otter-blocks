<?php

namespace ThemeIsle\GutenbergBlocks\Integration;

class Form_Settings_Data
{
	private $provider = '';
	private $api_key = '';
	private $list_id = '';
	private $action = '';
	private $has_captcha = false;
	private $meta = array();
    private $redirect_link = '';
	private $email_subject = '';
	private $submit_message = '';
	private $from_name = '';

	public function __construct($integration_data)
	{

		$this->extract_integration_data($integration_data);
		if(isset($integration_data['hasCaptcha'])) {
			$this->set_captcha($integration_data['hasCaptcha']);
		}

		$this->set_meta($integration_data);
	}

    /**
     * Extract the settings from 3rd party integration.
     * @param array $integration_data
     * @return void
     */
	public function extract_integration_data($integration_data) {
		if( isset( $integration_data['apiKey'] ) ) {
			$this->set_api_key( $integration_data['apiKey'] );
		}

		if(isset($integration_data['listId'])) {
			$this->set_list_id($integration_data['listId']);
		}

		if(isset($integration_data['provider'])) {
			$this->set_provider($integration_data['provider']);
		}

		if(isset($integration_data['action'])) {
			$this->set_action($integration_data['action']);
		}

		if(isset($integration_data['listId'])) {
			$this->set_list_id($integration_data['listId']);
		}
	}

    /**
     * Check if it has the necessary data set.
     * @return string[] The issues about the missing settings.
     */
	public function check_data()
	{
		$issues = array( );

		if( !$this->has_provider() ) {
			$issues[] = __( 'Provider settings are missing!', 'otter-blocks' );
		}

		if( !$this->has_api_key() ) {
			$issues[] = __( 'API Key is missing!', 'otter-blocks' );
		}

		if( !$this->has_list_id() ) {
			$issues[] = __( 'Mail list is missing!', 'otter-blocks' );
		}

		return $issues;
	}

    /**
     * Get the 3rd party integration settings from WP options given the form option ID.
     * @param string $form_option The ID of the form.
     * @return Form_Settings_Data
     */
	public static function get_form_setting_from_wordpress_options($form_option ) {
		$option_name = sanitize_text_field( $form_option );
		$form_emails = get_option( 'themeisle_blocks_form_emails' );
		$integration = new Form_Settings_Data(array());
		foreach ( $form_emails as $form ) {
			if ( $form['form'] === $option_name ) {

				if( isset( $form['hasCaptcha'] ) ) {
					$integration->set_captcha($form['hasCaptcha']);
				}
                if( isset( $form['redirectLink'] ) ) {
                    $integration->set_redirect_link($form['redirectLink']);
                }
				if( isset( $form['emailSubject'] ) ) {
                    $integration->set_email_subject($form['emailSubject']);
                }
				if( isset( $form['submitMessage'] ) ) {
                    $integration->set_submit_message($form['submitMessage']);
                }
				if( isset( $form['fromName'] ) ) {
					$integration->set_from_name($form['fromName']);
				}
				if ( isset( $form['integration'] ) ) {
					$integration->extract_integration_data($form['integration'] );
				}
				$integration->set_meta($form);
			}
		}
		return $integration;
	}

    /**
     * Set the provider.
     * @param string $provider
     * @return $this
     */
    public function set_provider($provider) {
        $this->provider = $provider;
        return $this;
    }

    /**
     * Set the API Key.
     * @param $api_key
     * @return $this
     */
    public function set_api_key($api_key) {
        $this->api_key = $api_key;
        return $this;
    }

    /**
     * Set the list id.
     * @param string $list_id
     * @return $this
     */
    public function set_list_id($list_id) {
        $this->list_id = $list_id;
        return $this;
    }

    /**
     * Set the action.
     * @param string $action
     * @return $this
     */
    public function set_action($action) {
        $this->action = $action;
        return $this;
    }

    /**
     * Set the mate.
     * @param string $meta
     * @return $this
     */
    public function set_meta($meta) {
        $this->meta = $meta;
        return $this;
    }

    /**
     * Set if the form has captcha.
     * @param bool $has_captcha
     * @return Form_Settings_Data
     */
    public function set_captcha( $has_captcha )
    {
        $this->has_captcha = $has_captcha;
        return $this;
    }

    /**
     * Check if it has the API Key and the list id set.
     * @return bool.
     */
    public function has_credentials()
    {
        return $this->has_api_key() && $this->has_list_id();
    }

    /**
     * Check if it has the provider set.
     * @return bool
     */
    public function has_provider()
    {
        return isset($this->provider) && '' !== $this->provider;
    }

    /**
     * Check if it has the API Key set.
     * @return bool
     */
    public function has_api_key()
    {
        return isset($this->api_key) && '' !== $this->api_key;
    }

    /**
     * Check if it has the list id set.
     * @return bool
     */
    public function has_list_id()
    {
        return isset($this->list_id) && '' !== $this->list_id;
    }

    /**
     * Check if it has the action set.
     * @return bool
     */
    public function has_action()
    {
        return isset($this->action) && '' !== $this->action;
    }

	/**
     * Check if it has the email_subject set.
     * @return bool
     */
    public function has_email_subject()
    {
        return isset($this->email_subject) && '' !== $this->email_subject;
    }

	/**
     * Check if it has the submit_message set.
     * @return bool
     */
    public function has_submit_message()
    {
        return isset($this->submit_message) && '' !== $this->submit_message;
    }

	/**
	 * Check if it has the submit_message set.
	 * @return bool
	 */
	public function has_from_name()
	{
		return isset($this->from_name) && '' !== $this->from_name;
	}

    /**
     * Set the redirect link.
     * @param string $redirect_link
     * @return Form_Settings_Data
     */
    public function set_redirect_link($redirect_link)
    {
        $this->redirect_link = $redirect_link;
        return $this;
    }

	 /**
     * Set the email subject.
     * @param string $email_subject
     * @return Form_Settings_Data
     */
    public function set_email_subject($email_subject)
    {
        $this->email_subject = $email_subject;
        return $this;
    }

	 /**
     * Set the submit message.
     * @param string $submit_message
     * @return Form_Settings_Data
     */
    public function set_submit_message($submit_message)
    {
        $this->submit_message = $submit_message;
        return $this;
    }

    /**
     * Get the provider.
     * @return string
     */
	public function get_provider()
	{
		return $this->provider;
	}

    /**
     * Get the API Key.
     * @return string
     */
	public function get_api_key()
	{
		return $this->api_key;
	}

    /**
     * Get the list ID.
     * @return string
     */
	public function get_list_id()
	{
		return $this->list_id;
	}

    /**
     * Get the action.
     * @return string
     */
	public function get_action()
	{
		return $this->action;
	}

    /**
     * Get the meta.
     * @return array
     */
	public function get_meta()
	{
		return $this->meta;
	}

	/**
     * Get the captcha.
	 * @return bool
	 */
	public function form_has_captcha()
	{
		return $this->has_captcha;
	}

    /**
     * Get the redirect link.
     * @return string
     */
    public function get_redirect_link()
    {
        return $this->redirect_link;
    }

	/**
     * Get the email subject.
     * @return string
     */
    public function get_email_subject()
    {
        return $this->email_subject;
    }

	/**
     * Get the submit message.
     * @return string
     */
    public function get_submit_message()
    {
        return $this->submit_message;
    }

    public function get_submit_data() {
        return array(
            'redirectLink' => $this->get_api_key(),
            'submitMessage'=> $this->get_submit_message()
        );
    }

	/**
	 * @return string
	 */
	public function get_from_name() {
		return $this->from_name;
	}

	/**
	 * @param string $from_name
	 *
	 * @return Form_Settings_Data
	 */
	public function set_from_name( $from_name ) {
		$this->from_name = $from_name;

		return $this;
	}


}
