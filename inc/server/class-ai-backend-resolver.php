<?php
/**
 * AI backend resolver.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class AI_Backend_Resolver
 */
class AI_Backend_Resolver {

	/**
	 * `themeisle_otter_ai_backend` value: pick the backend automatically.
	 *
	 * @var string
	 */
	const SETTING_AUTO = 'auto';

	/**
	 * `themeisle_otter_ai_backend` value: force the WP AI Client backend.
	 *
	 * @var string
	 */
	const SETTING_WP_AI_CLIENT = 'wp-ai-client';

	/**
	 * `themeisle_otter_ai_backend` value: force the Otter OpenAI key backend.
	 *
	 * @var string
	 */
	const SETTING_OPENAI_KEY = 'openai-key';

	/**
	 * Cached backend registry for the current request.
	 *
	 * @var array<string, AI_Backend>|null
	 */
	private static $backends_cache = null;

	/**
	 * The valid `themeisle_otter_ai_backend` setting values.
	 *
	 * @return list<string>
	 */
	public static function get_setting_values() {
		return array( self::SETTING_AUTO, self::SETTING_WP_AI_CLIENT, self::SETTING_OPENAI_KEY );
	}

	/**
	 * Resolve the effective backend instance.
	 *
	 * @return AI_Backend
	 */
	public static function resolve() {
		$backends = self::get_backends();
		$backend  = self::resolve_backend_id( $backends );

		if ( isset( $backends[ $backend ] ) ) {
			return $backends[ $backend ];
		}

		if ( isset( $backends[ AI_Client_Adaptor::BACKEND_OTTER_OPENAI ] ) ) {
			return $backends[ AI_Client_Adaptor::BACKEND_OTTER_OPENAI ];
		}

		if ( isset( $backends[ AI_Client_Adaptor::BACKEND_WP ] ) ) {
			return $backends[ AI_Client_Adaptor::BACKEND_WP ];
		}

		return reset( $backends );
	}

	/**
	 * Resolve the effective backend ID.
	 *
	 * @param array<string, AI_Backend>|null $backends Optional backend registry.
	 * @return string
	 */
	public static function resolve_backend_id( $backends = null ) {
		$backends = null === $backends ? self::get_backends() : $backends;
		$backend  = get_option( 'themeisle_otter_ai_backend', self::SETTING_AUTO );

		if ( self::SETTING_OPENAI_KEY === $backend ) {
			$resolved = AI_Client_Adaptor::BACKEND_OTTER_OPENAI;
		} elseif ( self::SETTING_WP_AI_CLIENT === $backend ) {
			if ( self::is_backend_available( $backends, AI_Client_Adaptor::BACKEND_WP ) ) {
				$resolved = AI_Client_Adaptor::BACKEND_WP;
			} elseif ( self::is_backend_available( $backends, AI_Client_Adaptor::BACKEND_OTTER_OPENAI ) ) {
				$resolved = AI_Client_Adaptor::BACKEND_OTTER_OPENAI;
			} else {
				// Fail loudly at generation time with an actionable error.
				$resolved = AI_Client_Adaptor::BACKEND_WP;
			}
		} else {
			$resolved = self::is_backend_available( $backends, AI_Client_Adaptor::BACKEND_WP ) ? AI_Client_Adaptor::BACKEND_WP : AI_Client_Adaptor::BACKEND_OTTER_OPENAI;
		}

		/**
		 * Filters the effective AI backend used by Otter AI features.
		 *
		 * @param string $resolved The effective backend: 'wp' or 'legacy' (the Otter OpenAI value).
		 * @param string $backend  The raw `themeisle_otter_ai_backend` setting value.
		 */
		return (string) apply_filters( 'otter_ai_backend', $resolved, $backend );
	}

	/**
	 * Whether the forced WP AI Client backend fell back to legacy.
	 *
	 * @return bool
	 */
	public static function is_fallback_active() {
		$backends = self::get_backends();

		return self::SETTING_WP_AI_CLIENT === get_option( 'themeisle_otter_ai_backend', self::SETTING_AUTO )
			&& AI_Client_Adaptor::BACKEND_OTTER_OPENAI === self::resolve_backend_id( $backends )
			&& ! self::is_backend_available( $backends, AI_Client_Adaptor::BACKEND_WP );
	}

	/**
	 * Build the backend registry.
	 *
	 * @return array<string, AI_Backend>
	 */
	public static function get_backends() {
		if ( null !== self::$backends_cache ) {
			return self::$backends_cache;
		}

		$backends = array(
			AI_Client_Adaptor::BACKEND_WP           => new WP_AI_Client_Backend(),
			AI_Client_Adaptor::BACKEND_OTTER_OPENAI => new Otter_OpenAI_Backend(),
		);

		/**
		 * Filters the available Otter AI backend strategies.
		 *
		 * @param array<string, AI_Backend> $backends The backend registry.
		 */
		$filtered = apply_filters( 'otter_ai_backends', $backends );

		if ( ! is_array( $filtered ) ) {
			self::$backends_cache = $backends;
			return self::$backends_cache;
		}

		$valid_backends = array();
		foreach ( $filtered as $id => $backend ) {
			if ( $backend instanceof AI_Backend ) {
				$valid_backends[ (string) $id ] = $backend;
			}
		}

		self::$backends_cache = ! empty( $valid_backends ) ? $valid_backends : $backends;

		return self::$backends_cache;
	}

	/**
	 * Reset the request-level backend registry cache.
	 *
	 * @return void
	 */
	public static function reset_cache() {
		self::$backends_cache = null;
	}

	/**
	 * Check if a backend exists and is available.
	 *
	 * @param array<string, AI_Backend> $backends The backend registry.
	 * @param string                    $backend  The backend ID.
	 * @return bool
	 */
	private static function is_backend_available( $backends, $backend ) {
		return isset( $backends[ $backend ] )
			&& $backends[ $backend ]->is_available();
	}
}
