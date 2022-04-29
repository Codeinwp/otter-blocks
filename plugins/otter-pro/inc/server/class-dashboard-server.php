<?php
/**
 * Filter license logic.
 *
 * @package ThemeIsle\OtterPro\Server
 */

namespace ThemeIsle\OtterPro\Server;

use ThemeIsle\OtterPro\Plugins\License;

/**
 * Class Dashboard_Server
 */
class Dashboard_Server {

	/**
	 * The main instance var.
	 *
	 * @var Dashboard_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Dashboard_Server
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Dashboard_Server
	 */
	public $version = 'v1';

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		add_filter( 'otter_dashboard_data', array( $this, 'apply_dashboard_data' ) );
	}

	/**
	 * Apply Dashboard Data
	 *
	 * Apply additional data to localized filter.
	 *
	 * @param array $data Localized Data.
	 * @since 2.0.1
	 * @return array
	 */
	public function apply_dashboard_data( $data ) {
		return array_merge(
			$data,
			array(
				'license'            => array(
					'key'        => apply_filters( 'product_otter_license_key', 'free' ),
					'valid'      => apply_filters( 'product_otter_license_status', false ),
					'expiration' => License::get_license_expiration_date(),
				),
				'hasNevePro'         => defined( 'NEVE_PRO_VERSION' ),
				'storeURL'           => 'https://store.themeisle.com/',
				'purchaseHistoryURL' => 'https://store.themeisle.com/purchase-history',
			)
		);
	}

	/**
	 * Register REST API route
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/toggle_license',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'toggle_license' ),
					'args'                => array(
						'key'    => array(
							'type'              => 'string',
							'sanitize_callback' => function ( $key ) {
								return (string) esc_attr( $key );
							},
							'validate_callback' => function ( $key ) {
								return is_string( $key );
							},
						),
						'action' => array(
							'type'              => 'string',
							'sanitize_callback' => function ( $key ) {
								return (string) esc_attr( $key );
							},
							'validate_callback' => function ( $key ) {
								return in_array( $key, [ 'activate', 'deactivate' ], true );
							},
						),
					),
					'permission_callback' => function () {
						return current_user_can( 'manage_options' );
					},
				),
			)
		);
	}

	/**
	 * Toggle License
	 *
	 * Toggle license based on the license key.
	 *
	 * @param mixed $request REST request.
	 * @since 2.0.1
	 * @return mixed|\WP_REST_Response
	 */
	public function toggle_license( $request ) {
		$fields = $request->get_json_params();

		if ( ! isset( $fields['key'] ) || ! isset( $fields['action'] ) ) {
			return new \WP_REST_Response(
				array(
					'message' => __( 'Invalid Action. Please refresh the page and try again.', 'otter-blocks' ),
					'success' => false,
				)
			);
		}

		$response = apply_filters( 'themeisle_sdk_license_process_otter', $fields['key'], $fields['action'] );

		if ( is_wp_error( $response ) ) {
			return new \WP_REST_Response(
				array(
					'message' => $response->get_error_message(),
					'success' => false,
				)
			);
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => 'activate' === $fields['action'] ? __( 'Activated.', 'otter-blocks' ) : __( 'Deactivated', 'otter-blocks' ),
				'license' => array(
					'key'        => apply_filters( 'product_otter_license_key', 'free' ),
					'valid'      => apply_filters( 'product_otter_license_status', false ),
					'expiration' => License::get_license_expiration_date(),
				),
			)
		);
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.0
	 * @access public
	 * @return Dashboard_Server
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
	 * @since 1.7.0
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
	 * @since 1.7.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
