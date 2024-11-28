<?php
/**
 * Template Cloud.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

/**
 * Class Template Cloud
 */
class Template_Cloud {
	const SOURCES_SETTING_KEY = 'themeisle_template_cloud_sources';

	const API_ENDPOINT_SUFFIX = 'ti-template-cloud/v1/patterns';

	/**
	 * Initialize the module.
	 *
	 * @return void
	 */
	public function instance() {
		add_action( 'init', array( $this, 'register_cloud_resources' ) );
	}

	/**
	 * Register categories and patterns.
	 *
	 * @return void
	 */
	public function register_cloud_resources() {
		$this->register_pattern_categories();
		$this->register_patterns();
	}

	/**
	 * Register the pattern categories.
	 *
	 * @return void
	 */
	private function register_pattern_categories() {
		$sources = $this->get_pattern_sources();

		if ( empty( $sources ) ) {
			return;
		}

		foreach ( $sources as $source ) {
			$slug = $this->slug_from_name( $source['name'] );

			if ( ! \WP_Block_Pattern_Categories_Registry::get_instance()->is_registered( $slug ) ) {
				register_block_pattern_category( $slug, [ 'label' => $source['name'] ] );
			}
		}
	}

	/**
	 * Register the patterns.
	 *
	 * @return void
	 */
	private function register_patterns() {
		$cloud_data = $this->get_cloud_data();

		if ( empty( $cloud_data ) ) {
			return;
		}

		$all_patterns = [];

		foreach ( $cloud_data as $source_data ) {
			$patterns_for_source = [];

			if ( ! is_array( $source_data ) || ! isset( $source_data['patterns'], $source_data['category'] ) ) {
				continue;
			}

			$patterns = $source_data['patterns'];
			$category = $source_data['category'];

			// Make sure we don't have duplicates.
			foreach ( $patterns as $pattern ) {
				if ( isset( $patterns_for_source[ $pattern['id'] ] ) ) {
					continue;
				}

				$pattern['categories'] = [ 'otter-blocks', 'otter-blocks-tc', $category ];

				$patterns_for_source[ $pattern['id'] ] = $pattern;
			}

			$all_patterns = array_merge( $all_patterns, $patterns_for_source );
		}

		foreach ( $all_patterns as $pattern ) {
			if ( ! isset( $pattern['slug'] ) ) {
				continue;
			}


			register_block_pattern(
				'otter-blocks/' . $pattern['slug'],
				$pattern
			);
		}
	}

	/**
	 * Get all the cloud data for each source.
	 *
	 * @return array|array[]
	 */
	private function get_cloud_data() {
		$sources = self::get_pattern_sources();

		if ( empty( $sources ) ) {
			return [];
		}

		return array_map(
			function ( $source ) {
				return [
					'category' => $this->slug_from_name( $source['name'] ),
					'patterns' => $this->get_patterns_for_key( $source['key'] ),
				];
			},
			$sources
		);
	}

	/**
	 * Get patterns for a certain access key.
	 *
	 * @param string $access_key The access key.
	 *
	 * @return array
	 */
	private function get_patterns_for_key( $access_key ) {
		$patterns = get_transient( self::get_cache_key( $access_key ) );

		if ( ! $patterns ) {
			self::sync_sources();
		}

		$patterns = get_transient( self::get_cache_key( $access_key ) );

		if ( ! $patterns ) {
			return [];
		}

		$patterns = json_decode( $patterns, true );

		return is_array( $patterns ) ? $patterns : array();
	}

	/**
	 * Get the slug from a name.
	 *
	 * @param string $name The name to slugify.
	 *
	 * @return string
	 */
	private function slug_from_name( $name ) {
		return 'ti-tc-' . sanitize_key( str_replace( ' ', '-', $name ) );
	}

	/**
	 * Get the pattern sources.
	 *
	 * @return array
	 */
	public static function get_pattern_sources() {
		return get_option( self::SOURCES_SETTING_KEY, [] );
	}

	/**
	 * Save the pattern sources.
	 *
	 * @param array $new_sources The new sources.
	 *
	 * @return bool
	 */
	public static function save_pattern_sources( $new_sources ) {
		return update_option( self::SOURCES_SETTING_KEY, array_values( $new_sources ) );
	}

	/**
	 * Get the cache key for the patterns.
	 *
	 * @param string $key The key to use for connection.
	 *
	 * @return string
	 */
	public static function get_cache_key( $key ) {
		return 'ti_tc_patterns_' . $key;
	}

	/**
	 * Save patterns for a certain access key.
	 *
	 * @param string $access_key The access key.
	 * @param array  $patterns The patterns to save.
	 *
	 * @return bool
	 */
	public static function save_patterns_for_key( $access_key, $patterns ) {
		return set_transient( self::get_cache_key( $access_key ), wp_json_encode( $patterns ), DAY_IN_SECONDS );
	}

	/**
	 * Delete patterns for a certain access key.
	 *
	 * @param string $access_key The access key.
	 *
	 * @return bool
	 */
	public static function delete_patterns_by_key( $access_key ) {
		return delete_transient( self::get_cache_key( $access_key ) );
	}

	/**
	 * Sync sources.
	 */
	public static function sync_sources() {
		$sources = self::get_pattern_sources();

		if ( empty( $sources ) ) {
			return [ 'success' => true ];
		}

		$errors = array();



		foreach ( $sources as $source ) {
			$url  = trailingslashit( $source['url'] ) . self::API_ENDPOINT_SUFFIX;
			$args = array(
				'sslverify' => false,
				'headers'   => array(
					'X-API-KEY' => $source['key'],
				),
			);

			if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
				$response = vip_safe_wp_remote_get( $url, '', 3, 1, 20, $args );
			} else {
				$response = wp_remote_get( $url, $args ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get
			}

			if ( is_wp_error( $response ) ) {
				$errors[] = sprintf(
					/* translators: 1: source name, 2: error message */
					__( 'Error with %1$s: %2$s', 'otter-blocks' ),
					$source['name'],
					$response->get_error_message()
				);

				continue;
			}

			$code = wp_remote_retrieve_response_code( $response );

			if ( 200 !== $code ) {
				$errors[] = sprintf(
					/* translators: 1: source name, 2: response code */
					__( 'Error with %1$s: Invalid response code %2$s', 'otter-blocks' ),
					$source['name'],
					$code
				);

				continue;
			}

			$body = wp_remote_retrieve_body( $response );

			if ( empty( $body ) ) {
				$errors[] = sprintf(
					/* translators: %s: source name */
					__( 'Error with %s: Empty response', 'otter-blocks' ),
					$source['name']
				);

				continue;
			}

			$decoded_body = json_decode( $body, true );

			if ( ! is_array( $decoded_body ) ) {
				$errors[] = sprintf(
					/* translators: %s: source name */
					__( 'Error with %s: Invalid response', 'otter-blocks' ),
					$source['name']
				);

				continue;
			}

			if ( ! isset( $decoded_body['success'], $decoded_body['data'], $decoded_body['key_name'] ) || ! $decoded_body['success'] ) {
				$errors[] = sprintf(
				/* translators: %s: source name */
					__( 'Error with %s: No patterns found', 'otter-blocks' ),
					$source['name']
				);

				continue;
			}

			// Update key name if that has changed.
			if ( $decoded_body['key_name'] !== $source['name'] ) {
				self::update_source_name( $source['key'], $decoded_body['key_name'] );
			}

			self::save_patterns_for_key( $source['key'], $decoded_body['data'] );
		}

		return [
			'success' => true,
			'errors'  => $errors,
		];
	}

	/**
	 * Update Source Name on sync.
	 *
	 * @param string $key The key to use for connection.
	 * @param string $new_name The new name to use.
	 *
	 * @return void
	 */
	public static function update_source_name( $key, $new_name ) {
		$sources = self::get_pattern_sources();

		foreach ( $sources as $idx => $source ) {
			if ( $source['key'] === $key ) {
				$sources[ $idx ]['name'] = $new_name;
			}
		}

		self::save_pattern_sources( $sources );
	}
}
