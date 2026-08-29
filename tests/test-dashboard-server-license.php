<?php
/**
 * Class Dashboard_Server_License
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\OtterPro\Plugins\License;
use ThemeIsle\OtterPro\Server\Dashboard_Server;

/**
 * Tests for the license error messages returned by otter/v1/toggle_license.
 */
class Test_Dashboard_Server_License extends WP_UnitTestCase {

	/**
	 * The message the SDK returns for a license the store rejected.
	 */
	const SDK_INVALID_MESSAGE = 'ERROR: Invalid license provided.';

	/**
	 * Option the SDK writes the store's answer to, derived from the plugin dir.
	 */
	const LICENSE_DATA_OPTION = 'otter_pro_license_data';

	/**
	 * The message the dashboard should show for a plan mismatch.
	 */
	const PLAN_MISMATCH_MESSAGE = 'Entered license key does not include Otter Pro.';

	/**
	 * Instance under test.
	 *
	 * @var Dashboard_Server
	 */
	private $server;

	/**
	 * Define the Otter Pro basefile the success path needs.
	 *
	 * The suite never boots otter-pro (development.php bails because WPINC is
	 * not defined when Composer loads it), so the constant License reads for the
	 * license option name is missing. Point it at the real plugin file.
	 */
	public static function set_up_before_class() {
		parent::set_up_before_class();

		if ( ! defined( 'OTTER_PRO_BASEFILE' ) ) {
			define( 'OTTER_PRO_BASEFILE', dirname( __DIR__ ) . '/plugins/otter-pro/otter-pro.php' );
		}
	}

	/**
	 * Set up test environment.
	 *
	 * The server is built directly instead of through instance(): init() would
	 * register an otter_dashboard_data filter that reads OTTER_PRO_VERSION,
	 * which is not defined in the test suite.
	 */
	public function set_up() {
		parent::set_up();
		$this->server = new Dashboard_Server();
		delete_option( self::LICENSE_DATA_OPTION );
	}

	/**
	 * Make the SDK license process return the given value.
	 *
	 * @param mixed $result Value the filter should return.
	 */
	private function mock_license_process( $result ) {
		remove_all_filters( 'themeisle_sdk_license_process_otter' );
		add_filter(
			'themeisle_sdk_license_process_otter',
			function () use ( $result ) {
				return $result;
			}
		);
	}

	/**
	 * Make the stored license plan resolve to the given price ID.
	 *
	 * @param int|string $plan Price ID.
	 */
	private function mock_license_plan( $plan ) {
		remove_all_filters( 'product_otter_license_plan' );
		add_filter(
			'product_otter_license_plan',
			function () use ( $plan ) {
				return $plan;
			}
		);
	}

	/**
	 * Mirror what the SDK stores after the store answers an activation.
	 *
	 * do_license_process() writes the response to the license data option before
	 * it returns the WP_Error, and the plan filter reports price_id from that
	 * same option, falling back to -1 when the response carried none.
	 *
	 * @param string   $status   License status returned by the store.
	 * @param int|null $price_id Price ID returned by the store, null if absent.
	 */
	private function mock_store_response( $status, $price_id = null ) {
		$data = array(
			'license' => $status,
			'key'     => 'a-license-key',
		);

		if ( null !== $price_id ) {
			$data['price_id'] = $price_id;
		}

		update_option( self::LICENSE_DATA_OPTION, (object) $data );
		$this->mock_license_plan( null === $price_id ? -1 : $price_id );
	}

	/**
	 * Run toggle_license and return the response payload.
	 *
	 * @param array $body JSON body.
	 *
	 * @return array
	 */
	private function toggle( $body ) {
		$request = new WP_REST_Request( 'POST', '/otter/v1/toggle_license' );
		$request->set_header( 'content-type', 'application/json' );
		$request->set_body( wp_json_encode( $body ) );

		$response = $this->server->toggle_license( $request );

		$this->assertInstanceOf( 'WP_REST_Response', $response );

		return $response->get_data();
	}

	/**
	 * Activate with the given key and return the response payload.
	 *
	 * @param string $key License key.
	 *
	 * @return array
	 */
	private function activate( $key = 'neve-personal-license-key' ) {
		return $this->toggle(
			array(
				'action' => 'activate',
				'key'    => $key,
			)
		);
	}

	/**
	 * A key the store answered for with a plan outside the allow list does not
	 * include Otter Pro, so the generic SDK error is replaced by the reason.
	 *
	 * 1 and 2 are Neve Personal; 7, 12 and 30 are higher Neve tiers that still
	 * exclude Otter Pro.
	 */
	public function test_activation_with_an_unsupported_plan_reports_the_plan_mismatch() {
		$this->mock_license_process( new WP_Error( 'themeisle-license-invalid', self::SDK_INVALID_MESSAGE ) );

		foreach ( array( 1, 2, 7, 12, 30 ) as $plan ) {
			$this->assertNotContains( $plan, Dashboard_Server::VALID_NEVE_PLANS, "Plan {$plan} is a fixture for an unsupported plan" );

			$this->mock_store_response( 'invalid', $plan );

			$data = $this->activate();

			$this->assertFalse( $data['success'], "Activation should fail for plan {$plan}" );
			$this->assertSame( self::PLAN_MISMATCH_MESSAGE, $data['message'], "Plan {$plan} should report the plan mismatch, not the generic SDK error" );
		}
	}

	/**
	 * Plans that do bundle Otter Pro keep the SDK message: a rejected key on an
	 * agency plan is not a plan problem.
	 */
	public function test_activation_with_a_supported_plan_keeps_the_sdk_message() {
		$this->mock_license_process( new WP_Error( 'themeisle-license-invalid', self::SDK_INVALID_MESSAGE ) );

		$this->assertNotEmpty( Dashboard_Server::VALID_NEVE_PLANS, 'The supported plan list should not be empty' );

		foreach ( Dashboard_Server::VALID_NEVE_PLANS as $plan ) {
			$this->mock_store_response( 'invalid', $plan );

			$data = $this->activate( 'some-agency-license-key' );

			$this->assertFalse( $data['success'] );
			$this->assertSame( self::SDK_INVALID_MESSAGE, $data['message'], "Plan {$plan} bundles Otter Pro, so the SDK message should be kept" );
		}
	}

	/**
	 * A key that does cover Otter Pro but is expired, revoked or out of
	 * activations is rejected with the same themeisle-license-invalid code. Its
	 * plan is not the problem, so the SDK message must survive.
	 *
	 * Price ID 1 is deliberate: it is a standalone Otter plan per
	 * License::$plans_map and is absent from VALID_NEVE_PLANS, so the plan check
	 * alone would misreport every one of these as a plan mismatch.
	 */
	public function test_unusable_but_eligible_key_keeps_the_sdk_message() {
		$this->mock_license_process( new WP_Error( 'themeisle-license-invalid', self::SDK_INVALID_MESSAGE ) );

		foreach ( Dashboard_Server::NON_PLAN_LICENSE_STATUSES as $status ) {
			foreach ( array_keys( License::$plans_map ) as $plan ) {
				$this->mock_store_response( $status, $plan );

				$data = $this->activate( 'an-otter-standalone-key' );

				$this->assertFalse( $data['success'] );
				$this->assertSame( self::SDK_INVALID_MESSAGE, $data['message'], "A {$status} key on Otter plan {$plan} is not a plan mismatch" );
			}
		}
	}

	/**
	 * A key the store did not recognise comes back without a price ID, so the
	 * plan filter reports -1. That is not evidence of anything and must not be
	 * rewritten.
	 */
	public function test_unrecognised_key_without_a_price_id_keeps_the_sdk_message() {
		$this->mock_license_process( new WP_Error( 'themeisle-license-invalid', self::SDK_INVALID_MESSAGE ) );

		foreach ( array( 'invalid', 'missing', 'item_name_mismatch' ) as $status ) {
			$this->mock_store_response( $status );

			$data = $this->activate( 'a-made-up-key' );

			$this->assertFalse( $data['success'] );
			$this->assertSame( self::SDK_INVALID_MESSAGE, $data['message'], "A {$status} key with no price ID should keep the SDK message" );
		}
	}

	/**
	 * Only the store's rejection can be caused by a plan mismatch. Every other
	 * failure is reported as the SDK worded it, even while an unsupported plan
	 * is stored from an earlier key.
	 */
	public function test_only_the_invalid_license_error_is_rewritten() {
		$this->mock_store_response( 'invalid', 1 );

		$codes = array(
			'themeisle-license-500'            => 'ERROR: Failed to connect to the license service.',
			'themeisle-license-404'            => 'ERROR: Failed to validate license. Please try again in one minute.',
			'themeisle-license-invalid-format' => 'Invalid license.',
			'themeisle-license-already-active' => 'License is already active.',
		);

		foreach ( $codes as $code => $message ) {
			$this->mock_license_process( new WP_Error( $code, $message ) );

			$data = $this->activate();

			$this->assertFalse( $data['success'] );
			$this->assertSame( $message, $data['message'], "Error {$code} is not a plan mismatch and should be reported as-is" );
		}
	}

	/**
	 * The rewrite is gated on the activate action, so deactivation failures are
	 * never reported as a plan mismatch.
	 */
	public function test_deactivation_keeps_the_sdk_message() {
		$this->mock_store_response( 'invalid', 1 );

		$errors = array(
			'themeisle-license-already-deactivate' => 'License not active.',
			'themeisle-license-invalid'            => self::SDK_INVALID_MESSAGE,
		);

		foreach ( $errors as $code => $message ) {
			$this->mock_license_process( new WP_Error( $code, $message ) );

			$data = $this->toggle( array( 'action' => 'deactivate' ) );

			$this->assertFalse( $data['success'] );
			$this->assertSame( $message, $data['message'], "Deactivation error {$code} should be reported as-is" );
		}
	}

	/**
	 * A successful toggle is unaffected by the stored plan: the rewrite is gated
	 * on the SDK returning a WP_Error.
	 */
	public function test_successful_toggle_is_not_rewritten() {
		$this->mock_license_process( true );
		$this->mock_store_response( 'invalid', 1 );

		$data = $this->activate( 'a-valid-license-key' );

		$this->assertTrue( $data['success'] );
		$this->assertSame( 'Activated.', $data['message'] );
		$this->assertArrayHasKey( 'license', $data );
	}

	/**
	 * A malformed payload is rejected before the SDK is called.
	 */
	public function test_invalid_action_payload_is_rejected() {
		$this->mock_license_process( new WP_Error( 'themeisle-license-invalid', self::SDK_INVALID_MESSAGE ) );
		$this->mock_store_response( 'invalid', 1 );

		foreach ( array( array(), array( 'action' => 'activate' ) ) as $body ) {
			$data = $this->toggle( $body );

			$this->assertFalse( $data['success'] );
			$this->assertSame( 'Invalid Action. Please refresh the page and try again.', $data['message'] );
		}
	}
}
