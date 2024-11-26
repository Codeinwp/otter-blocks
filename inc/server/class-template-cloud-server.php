<?php
/**
 * Template Cloud Server.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

use ThemeIsle\GutenbergBlocks\Plugins\Template_Cloud;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Class Template_Cloud_Server
 */
class Template_Cloud_Server {
	const API_ENDPOINT_SUFFIX = 'ti-template-cloud/v1/patterns';
	const API_NAMESPACE       = 'otter/v1';

	/**
	 * Initialize the module.
	 *
	 * @return void
	 */
	public function instance() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register the REST API routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			self::API_NAMESPACE,
			'template-cloud/add-source',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'add_source' ),
					'permission_callback' => function () {
						return current_user_can( 'manage_options' );
					},
					'args'                => array(
						'key' => array(
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'url' => array(
							'required'          => true,
							'sanitize_callback' => 'esc_url_raw',
						),
					),
				),
			)
		);

		register_rest_route(
			self::API_NAMESPACE,
			'template-cloud/delete-source/(?P<key>[a-zA-Z0-9-_]+)',
			[
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => [ $this, 'remove_source' ],
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'args'                => [
					'key' => [
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					],
				],
			]
		);

		register_rest_route(
			self::API_NAMESPACE,
			'template-cloud/sync',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'sync_sources' ],
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			]
		);
	}

	/**
	 * Validate the source and get the name.
	 *
	 * @param string $url The URL to validate.
	 * @param string $key The key to use for connection.
	 *
	 * @return string|false
	 */
	private function validate_source_and_get_name( $url, $key ) {
		$url  = trailingslashit( $url ) . self::API_ENDPOINT_SUFFIX;
		$args = [
			'sslverify' => false,
			'headers'   => [
				'X-API-KEY' => $key,
			],
		];

		if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
			$response = vip_safe_wp_remote_get( $url, '', 3, 1, 20, $args );
		} else {
			$response = wp_remote_get( $url, $args ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get
		}

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return false;
		}

		$body = wp_remote_retrieve_body( $response );

		if ( empty( $body ) ) {
			return false;
		}

		$data = json_decode( $body, true );


		if ( ! is_array( $data ) ) {
			return false;
		}

		if ( ! isset( $data['success'], $data['key_name'] ) || ! $data['success'] ) {
			return false;
		}

		return $data['key_name'];
	}

	/**
	 * Add a source.
	 *
	 * @param WP_REST_Request $request The request object.
	 *
	 * @return WP_REST_Response
	 */
	public function add_source( WP_REST_Request $request ) {
		$params = $request->get_params();

		if ( ! isset( $params['key'], $params['url'] ) ) {
			return new WP_REST_Response(
				array(
					'message' => __( 'Invalid request. Please provide a key and url.', 'otter-blocks' ),
				),
				400
			);
		}

		$name = $this->validate_source_and_get_name( $params['url'], $params['key'] );

		if ( ! $name || ! is_string( $name ) ) {
			return new WP_REST_Response(
				array(
					'message' => __( 'Invalid source. Please make sure you have the correct key and url.', 'otter-blocks' ),
				),
				400
			);
		}

		$sources = Template_Cloud::get_pattern_sources();
		$keys    = wp_list_pluck( $sources, 'key' );

		if ( in_array( $params['key'], $keys ) ) {
			return new WP_REST_Response(
				array(
					'message' => __( 'Source already exists', 'otter-blocks' ),
				),
				400
			);
		}

		$sources[] = array(
			'key'  => $params['key'],
			'url'  => esc_url_raw( $params['url'] ),
			'name' => sanitize_text_field( $name ),
		);

		$update = Template_Cloud::save_pattern_sources( $sources );

		if ( ! $update ) {
			return new WP_REST_Response(
				array(
					'message' => __( 'Failed to save the source', 'otter-blocks' ),
				),
				500
			);
		}

		$this->sync_sources();

		return new WP_REST_Response(
			array(
				'sources' => Template_Cloud::get_pattern_sources(),
			)
		);
	}

	/**
	 * Remove a source.
	 *
	 * @param WP_REST_Request $request The request object.
	 *
	 * @return WP_REST_Response
	 */
	public function remove_source( WP_REST_Request $request ) {
		$params = $request->get_params();

		if ( ! isset( $params['key'] ) ) {
			return new WP_REST_Response(
				array(
					'message' => __( 'Key is missing', 'otter-blocks' ),
				),
				400
			);
		}

		$sources = Template_Cloud::get_pattern_sources();

		$filtered_sources = array_filter(
			$sources,
			function ( $source ) use ( $params ) {
				return $params['key'] !== $source['key'];
			}
		);

		$update = Template_Cloud::save_pattern_sources( $filtered_sources );

		if ( ! $update ) {
			return new WP_REST_Response(
				array(
					'message' => __( 'Failed to remove the source', 'otter-blocks' ),
				),
				500
			);
		}

		Template_Cloud::delete_patterns_by_key( $params['key'] );

		$this->sync_sources();

		return new WP_REST_Response(
			array(
				'success' => true,
				'sources' => Template_Cloud::get_pattern_sources(),
			)
		);
	}

	/**
	 * Sync sources.
	 *
	 * @return WP_REST_Response
	 */
	public function sync_sources() {
		$sources = Template_Cloud::get_pattern_sources();

		if ( empty( $sources ) ) {
			return new WP_REST_Response(
				array(
					'message' => __( 'No sources to sync', 'otter-blocks' ),
				),
				400
			);
		}

		$sync = Template_Cloud::sync_sources();

		if ( ! is_array( $sync ) || ! isset( $sync['success'] ) || ! $sync['success'] ) {
			return new WP_REST_Response(
				array(
					'message' => __( 'Failed to sync sources', 'otter-blocks' ),
				),
				500
			);
		}

		return new WP_REST_Response(
			array(
				'success' => $sync['success'],
				'errors'  => $sync['errors'],
				'sources' => Template_Cloud::get_pattern_sources(),
			)
		);
	}

	/**
	 * Sanitize the template cloud sources array when saving the setting.
	 *
	 * @param array $value The value to sanitize.
	 *
	 * @return array[]
	 */
	public static function sanitize_template_cloud_sources( $value ) {
		if ( ! is_array( $value ) ) {
			return array();
		}

		foreach ( $value as $idx => $source_data ) {
			$allowed_keys = [ 'key', 'url', 'name' ];

			foreach ( $source_data as $key => $val ) {
				if ( ! in_array( $key, $allowed_keys, true ) ) {
					unset( $value[ $idx ][ $key ] );

					continue;
				}

				if ( 'url' !== $key ) {
					$source_data[ $key ] = esc_url_raw( $val );

					continue;
				}

				$source_data[ $key ] = sanitize_text_field( $val );
			}
		}

		return $value;
	}
}
