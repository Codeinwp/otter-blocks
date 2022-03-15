<?php

namespace ThemeIsle\GutenbergBlocks\Integration;

class Integration_Data
{
	private string $provider = '';
	private string $api_key = '';
	private string $list_id = '';
	private string $action = '';
	private bool $has_captcha = false;
	private array $meta = array();

	public function __construct($integration_data)
	{

		$this->extract_integration_data($integration_data);
		if(isset($integration_data['hasCaptcha'])) {
			$this->set_captcha($integration_data['hasCaptcha']);
		}

		$this->set_meta($integration_data);
	}

	public function extract_integration_data($integration_data) {
		if( isset( $integration_data['apiKei'] ) ) {
			$this->set_api_key( $integration_data['apiKei'] );
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

	public function set_provider($provider) {
		$this->provider = $provider;
		return $this;
	}

	public function set_api_key($api_key) {
		$this->api_key = $api_key;
		return $this;
	}

	public function set_list_id($list_id) {
		$this->list_id = $list_id;
		return $this;
	}

	public function set_action($action) {
		$this->action = $action;
		return $this;
	}

	public function set_meta($meta) {
		$this->meta = $meta;
		return $this;
	}

	public function has_credentials(): bool
	{
		return $this->has_api_key() && $this->has_list_id();
	}

	public function has_provider(): bool
	{
		return isset($this->provider) && '' !== $this->provider;
	}

	public function has_api_key(): bool
	{
		return isset($this->api_key) && '' !== $this->api_key;
	}

	public function has_list_id(): bool
	{
		return isset($this->list_id) && '' !== $this->list_id;
	}

	public function has_action(): bool
	{
		return isset($this->action) && '' !== $this->action;
	}

	/**
	 * @param bool $has_captcha
	 * @return Integration_Data
	 */
	public function set_captcha(bool $has_captcha): Integration_Data
	{
		$this->has_captcha = $has_captcha;
		return $this;
	}


	public function check_data(): array
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

	public static function get_integration_data_from_form_settings( $form_option ) {
		$option_name = sanitize_text_field( $form_option );
		$form_emails = get_option( 'themeisle_blocks_form_emails' );
		$integration = new Integration_Data(array());
		foreach ( $form_emails as $form ) {
			if ( $form['form'] === $option_name ) {

				if( isset( $form['hasCaptcha'] ) ) {
					$integration->set_captcha($form['hasCaptcha']);
				}
				if ( isset( $form['integration'] ) ) {
					$integration->extract_integration_data($form['integration'] );
				}
			}
		}
		return $integration;
	}


	public function get_provider()
	{
		return $this->provider;
	}


	public function get_api_key()
	{
		return $this->api_key;
	}


	public function get_list_id()
	{
		return $this->list_id;
	}


	public function get_action()
	{
		return $this->action;
	}


	public function get_meta(): array
	{
		return $this->meta;
	}

	/**
	 * @return bool
	 */
	public function form_has_captcha(): bool
	{
		return $this->has_captcha;
	}

}
