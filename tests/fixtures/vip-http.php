<?php
/**
 * WordPress VIP HTTP helper stubs for template cloud tests.
 *
 * @package ThemeIsle\GutenbergBlocks\Tests
 */

namespace ThemeIsle\GutenbergBlocks\Tests {
	/**
	 * Capture a VIP HTTP request and return a template cloud response.
	 */
	class VIP_HTTP_Stub {
		/**
		 * Capture a request.
		 *
		 * @param string $url            Request URL.
		 * @param string $fallback_value Fallback response.
		 * @param int    $threshold      Failure threshold.
		 * @param int    $timeout        Request timeout.
		 * @param int    $retry          Retry interval.
		 * @param array  $args           WordPress HTTP arguments.
		 *
		 * @return array<string, mixed>
		 */
		public static function request( $url, $fallback_value, $threshold, $timeout, $retry, $args ) {
			$GLOBALS['otter_vip_requests'][] = array(
				'url'            => $url,
				'fallback_value' => $fallback_value,
				'threshold'      => $threshold,
				'timeout'        => $timeout,
				'retry'          => $retry,
				'args'           => $args,
			);

			return array(
				'response' => array( 'code' => 200 ),
				'body'     => \wp_json_encode(
					array(
						'success'  => true,
						'data'     => array(),
						'key_name' => 'Test Source',
					)
				),
			);
		}
	}
}

namespace ThemeIsle\GutenbergBlocks\Server {
	use ThemeIsle\GutenbergBlocks\Tests\VIP_HTTP_Stub;

	function function_exists( $function ) {
		if ( 'vip_safe_wp_remote_get' === $function && ! empty( $GLOBALS['otter_vip_stub_enabled'] ) ) {
			return true;
		}

		return \function_exists( $function );
	}

	function vip_safe_wp_remote_get( $url, $fallback_value = '', $threshold = 3, $timeout = 1, $retry = 20, $args = array() ) {
		return VIP_HTTP_Stub::request( $url, $fallback_value, $threshold, $timeout, $retry, $args );
	}
}

namespace ThemeIsle\GutenbergBlocks\Plugins {
	use ThemeIsle\GutenbergBlocks\Tests\VIP_HTTP_Stub;

	function function_exists( $function ) {
		if ( 'vip_safe_wp_remote_get' === $function && ! empty( $GLOBALS['otter_vip_stub_enabled'] ) ) {
			return true;
		}

		return \function_exists( $function );
	}

	function vip_safe_wp_remote_get( $url, $fallback_value = '', $threshold = 3, $timeout = 1, $retry = 20, $args = array() ) {
		return VIP_HTTP_Stub::request( $url, $fallback_value, $threshold, $timeout, $retry, $args );
	}
}
