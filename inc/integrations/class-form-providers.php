<?php

namespace ThemeIsle\GutenbergBlocks\Integration;

class Form_Providers
{
	/**
	 * The main instance var.
	 *
	 * @var Form_Providers
	 */
	public static $instance = null;
	public $providers = array();

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 2.0.1
	 * @access public
	 * @return Form_Providers
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

    /**
     * Add action and filters.
     * @return void
     */
	public function init() {
		add_action('otter_register_form_provider', array($this, 'register_provider'));
		add_filter('otter_select_form_provider', array($this, 'select_provider'));
	}

    /**
     * Register an email provider.
     * @param array $provider
     * @return void
     */
	public function register_provider( $provider ) {
		$this->providers += $provider;
	}

    /**
     * Select the provider based on the form integration settings.
     * @param $form_integration
     * @return mixed
     */
	public function select_provider( $form_integration ) {
		if( !isset($form_integration['action']) || !isset($form_integration['provider']) || !isset( $this->providers[$form_integration['provider']] ) ) {
			return $this->providers['default'];
		}

		return $this->providers[$form_integration['provider']];
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
