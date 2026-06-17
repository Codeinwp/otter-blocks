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
 * autoresponder).
 */
class AI_Usage {

	/**
	 * The option name where usage is stored.
	 *
	 * @var string
	 */
	const OPTION_NAME = 'themeisle_otter_ai_usage';

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
		if ( ! is_string( $action ) || ! is_string( $user_content ) ) {
			return;
		}

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
