<?php
/**
 * AI usage tracking.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class AI_Usage
 *
 * Records Otter AI usage into the autoloaded `themeisle_otter_ai_usage` option,
 * shared by editor AI features and server-side AI features (e.g. the Form
 * autoresponder). Also holds the request limits those features share.
 */
class AI_Usage {

	/**
	 * The option name where usage is stored.
	 *
	 * @var string
	 */
	const OPTION_NAME = 'themeisle_otter_ai_usage';

	/**
	 * Length of a request quota window, in seconds.
	 *
	 * @var int
	 */
	const QUOTA_WINDOW = 600;

	/**
	 * Cap the output tokens and the encoded size of a generation payload.
	 *
	 * Shared by every server-side caller of AI_Backend::generate().
	 *
	 * @param array<string, mixed> $payload The OpenAI-format payload.
	 * @return array<string, mixed>|\WP_Error The capped payload, or a 413 error when it is too large.
	 */
	public static function limit_payload( array $payload ) {
		/**
		 * Filters the maximum number of output tokens a generation request may use.
		 *
		 * @param int $max_tokens Token cap.
		 */
		$max_tokens = max( 1, (int) apply_filters( 'otter_ai_generate_max_tokens', 16384 ) );

		$requested             = isset( $payload['max_tokens'] ) && is_numeric( $payload['max_tokens'] ) ? (int) $payload['max_tokens'] : $max_tokens;
		$payload['max_tokens'] = min( max( 1, $requested ), $max_tokens );

		/**
		 * Filters the maximum JSON-encoded size, in bytes, of a generation payload. Return 0 to disable.
		 *
		 * @param int $max_bytes Size cap.
		 */
		$max_bytes = (int) apply_filters( 'otter_ai_generate_max_payload_bytes', 256 * 1024 );

		if ( $max_bytes > 0 && strlen( (string) wp_json_encode( $payload ) ) > $max_bytes ) {
			return new \WP_Error(
				'otter_ai_payload_too_large',
				__( 'The AI request is too large. Shorten the content and try again.', 'otter-blocks' ),
				array( 'status' => 413 )
			);
		}

		return $payload;
	}

	/**
	 * Count one generation request against a bucket and reject it above the limit.
	 *
	 * The counter is one option row per bucket and window. The insert and the
	 * guarded increment are single SQL statements, so parallel requests cannot
	 * pass the limit together.
	 *
	 * @param string $bucket The quota bucket (for example a user or a form).
	 * @param int    $limit  Requests allowed per window. 0 or less disables the limit.
	 * @return true|\WP_Error True when the request may continue, or a 429 error.
	 */
	public static function consume_quota( $bucket, $limit ) {
		global $wpdb;

		if ( $limit <= 0 ) {
			return true;
		}

		$window = '_' . (int) floor( time() / self::QUOTA_WINDOW );
		$option = 'otter_ai_quota_' . md5( $bucket ) . $window;

		// phpcs:disable WordPress.DB.DirectDatabaseQuery
		$created = $wpdb->query( $wpdb->prepare( "INSERT IGNORE INTO {$wpdb->options} (option_name, option_value, autoload) VALUES (%s, '0', 'no')", $option ) );

		if ( $created ) {
			// A new window started: remove the counters of earlier windows, for all buckets.
			$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s AND option_name NOT LIKE %s", $wpdb->esc_like( 'otter_ai_quota_' ) . '%', '%' . $wpdb->esc_like( $window ) ) );
		}

		$reserved = $wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->options} SET option_value = option_value + 1 WHERE option_name = %s AND option_value < %d", $option, $limit ) );
		// phpcs:enable WordPress.DB.DirectDatabaseQuery

		if ( ! $reserved ) {
			return new \WP_Error(
				'otter_ai_rate_limited',
				__( 'Too many AI requests. Please wait a few minutes and try again.', 'otter-blocks' ),
				array( 'status' => 429 )
			);
		}

		return true;
	}

	/**
	 * Record a single AI usage entry.
	 *
	 * Increments the per-action usage count and stores the last prompts used for
	 * the given action. The stored option shape is intentionally preserved so the
	 * editor usage display keeps working unchanged.
	 *
	 * @param string $action       The action label (e.g. `formAutoresponder::generate`).
	 * @param string $user_content The user content sent to the AI.
	 * @return void
	 */
	public static function record( $action, $user_content ) {
		$action       = substr( sanitize_text_field( $action ), 0, 100 );
		$user_content = substr( sanitize_textarea_field( $user_content ), 0, 1000 );

		if ( '' === $action ) {
			return;
		}

		$usage = get_option( self::OPTION_NAME );

		if ( ! is_array( $usage ) ) {
			$usage = array(
				'usage_count' => array(),
				'prompts'     => array(),
			);
		}

		if ( ! isset( $usage['usage_count'] ) || ! is_array( $usage['usage_count'] ) ) {
			$usage['usage_count'] = array();
		}

		if ( ! isset( $usage['prompts'] ) || ! is_array( $usage['prompts'] ) ) {
			$usage['prompts'] = array();
		}

		$is_missing = true;

		foreach ( $usage['usage_count'] as &$u ) {
			if ( isset( $u['key'] ) && $u['key'] === $action ) {
				// Stored data may predate the option's sanitize callback.
				$u['value'] = ( isset( $u['value'] ) && is_numeric( $u['value'] ) ? (int) $u['value'] : 0 ) + 1;
				$is_missing = false;
			}
		}

		unset( $u );

		// The option is autoloaded: cap the number of distinct actions so
		// client-supplied keys cannot grow it without bound.
		if ( $is_missing && count( $usage['usage_count'] ) >= 50 ) {
			return;
		}

		if ( $is_missing ) {
			$usage['usage_count'][] = array(
				'key'   => $action,
				'value' => 1,
			);
		}

		$is_missing = true;

		foreach ( $usage['prompts'] as &$u ) {
			if ( isset( $u['key'] ) && $u['key'] === $action ) {
				$u['values'][] = $user_content;
				$is_missing    = false;

				// Keep only the last 10 prompts.
				if ( count( $u['values'] ) > 10 ) {
					array_shift( $u['values'] );
				}
			}
		}

		unset( $u );

		if ( $is_missing ) {
			$usage['prompts'][] = array(
				'key'    => $action,
				'values' => array( $user_content ),
			);
		}

		update_option( self::OPTION_NAME, $usage );
	}
}
