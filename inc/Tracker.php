<?php
/**
 * Class for telemetry.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Tracker
 */
class Tracker {

	/**
	 * Tracking URL.
	 *
	 * @var string
	 */
	public static $track_url = 'https://api.themeisle.com/tracking/events';

	/**
	 * Send data to the server if the user has opted in.
	 *
	 * @param array<array> $events Data to track.
	 * @param array        $options Options.
	 * @return void
	 */
	public static function track( $events, $options = array() ) {

		if ( ! self::has_consent() && ( ! isset( $options['hasConsent'] ) || ! $options['hasConsent'] ) ) {
			return;
		}

		try {
			$payload = array();

			$license = apply_filters( 'product_otter_license_key', 'free' );

			if ( 'free' !== $license ) {
				$license = wp_hash( $license );
			}

			foreach ( $events as $event ) {
				$payload[] = array(
					'slug'    => 'otter',
					'site'    => get_site_url(),
					'license' => $license,
					'data'    => $event,
				);
			}

			$args = array(
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'body'    => wp_json_encode( $payload ),
			);

			wp_remote_post( self::$track_url, $args );
		} finally {
			return;
		}
	}

	/**
	 * Check if the user has consented to tracking.
	 *
	 * @return bool
	 */
	public static function has_consent() {
		return (bool) get_option( 'otter_blocks_logger_flag', false );
	}
}
