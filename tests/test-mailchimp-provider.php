<?php
/**
 * Test Mailchimp provider API key validation.
 *
 * @package otter-blocks
 * @license     http://opensource.org/licenses/gpl-2.0.php GNU Public License
 */

use ThemeIsle\GutenbergBlocks\Integration\Mailchimp_Integration;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;

/**
 * Class Test_Mailchimp_Provider.
 */
class Test_Mailchimp_Provider extends WP_UnitTestCase {

	/**
	 * The data center is taken from the key and becomes the request host, so an injected host,
	 * port or path must be rejected before any request is built (SSRF, otter-internals#318).
	 */
	public function test_rejects_a_data_center_that_is_not_bare_alphanumeric() {
		$payloads = array(
			'x-attacker:8443/r#',          // the reported SSRF payload.
			'key-attacker.example.com',
			'key-127.0.0.1',
			'key-us1/../x',
			'key-US1',                     // real data centers are lowercase.
			'key-us 1',
		);

		foreach ( $payloads as $api_key ) {
			$result = Mailchimp_Integration::validate_api_key( $api_key );

			$this->assertFalse( $result['valid'], "Expected '$api_key' to be rejected." );
			$this->assertSame( Form_Data_Response::ERROR_PROVIDER_INVALID_API_KEY_FORMAT, $result['code'], "Expected '$api_key' to fail the format check." );
		}
	}

	/**
	 * A real key (secret dash data center) still validates, so the guard does not break normal use.
	 */
	public function test_accepts_a_real_mailchimp_key() {
		foreach ( array( 'abc123def456-us1', 'abc123def456-us21', '0a1b2c3d4e5f6-gb7' ) as $api_key ) {
			$this->assertTrue( Mailchimp_Integration::validate_api_key( $api_key )['valid'], "Expected '$api_key' to validate." );
		}
	}

	/**
	 * A key without exactly one dash keeps failing the format check, as before.
	 */
	public function test_rejects_a_key_without_a_single_data_center_segment() {
		foreach ( array( 'nodash', 'two-dashes-here' ) as $api_key ) {
			$result = Mailchimp_Integration::validate_api_key( $api_key );

			$this->assertFalse( $result['valid'], "Expected '$api_key' to be rejected." );
			$this->assertSame( Form_Data_Response::ERROR_PROVIDER_INVALID_API_KEY_FORMAT, $result['code'] );
		}
	}

	/**
	 * An empty key reports the missing-key reason, not the format one.
	 */
	public function test_rejects_an_empty_key_as_missing() {
		$result = Mailchimp_Integration::validate_api_key( '' );

		$this->assertFalse( $result['valid'] );
		$this->assertSame( Form_Data_Response::ERROR_PROVIDER_INVALID_KEY, $result['code'] );
	}

	/**
	 * Mailchimp requests go only to the validated data center host and do not follow
	 * redirects, so a response cannot pivot the request to another address (otter-internals#318).
	 */
	public function test_request_pins_host_and_disables_redirects() {
		$integration = new Mailchimp_Integration();
		$integration->set_api_key( 'abc123def456-us1' );

		$captured = array();
		$filter   = static function ( $pre, $args, $url ) use ( &$captured ) {
			$captured[] = array( 'url' => $url, 'args' => $args );
			return array(
				'headers'  => array(),
				'body'     => wp_json_encode( array( 'lists' => array() ) ),
				'response' => array( 'code' => 200, 'message' => 'OK' ),
				'cookies'  => array(),
			);
		};

		add_filter( 'pre_http_request', $filter, 10, 3 );
		$integration->get_lists();
		remove_filter( 'pre_http_request', $filter, 10 );

		$this->assertNotEmpty( $captured, 'Expected get_lists() to send a request.' );
		foreach ( $captured as $request ) {
			$this->assertStringStartsWith( 'https://us1.api.mailchimp.com/', $request['url'] );
			$this->assertSame( 0, $request['args']['redirection'] );
		}
	}
}
