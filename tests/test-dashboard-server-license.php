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
	 * The message the dashboard should show for a plan mismatch, before the
	 * offending price ID is substituted in.
	 */
	const PLAN_MISMATCH_FORMAT = 'Entered license key does not include Otter Pro.';

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
	 * A key whose plan is outside the allow list does not include Otter Pro, so
	 * the generic SDK error is replaced by the actual reason, naming the plan.
	 *
	 * 1 and 2 are Neve Personal; 0 is the plan filter's default, used when the
	 * store's response carried no price ID.
	 */
	public function test_activation_with_an_unsupported_plan_reports_the_plan_mismatch() {
		$this->mock_license_process( new WP_Error( 'themeisle-license-invalid', self::SDK_INVALID_MESSAGE ) );

		foreach ( array( 0, 1, 2, 7, 12, 30 ) as $plan ) {
			$this->assertNotContains( $plan, Dashboard_Server::VALID_NEVE_PLANS, "Plan {$plan} is a fixture for an unsupported plan" );

			$this->mock_license_plan( $plan );

			$data = $this->activate();

			$this->assertFalse( $data['success'], "Activation should fail for plan {$plan}" );
			$this->assertSame( self::PLAN_MISMATCH_FORMAT, $data['message'], "Plan {$plan} should report the plan mismatch, not the generic SDK error" );
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
			$this->mock_license_plan( $plan );

			$data = $this->activate( 'some-agency-license-key' );

			$this->assertFalse( $data['success'] );
			$this->assertSame( self::SDK_INVALID_MESSAGE, $data['message'], "Plan {$plan} bundles Otter Pro, so the SDK message should be kept" );
		}
	}

	/**
	 * With no plan filter registered the default 0 is used, which is not in the
	 * allow list.
	 */
	public function test_activation_without_a_plan_filter_reports_the_plan_mismatch() {
		$this->mock_license_process( new WP_Error( 'themeisle-license-invalid', self::SDK_INVALID_MESSAGE ) );
		remove_all_filters( 'product_otter_license_plan' );

		$data = $this->activate( 'unknown-license-key' );

		$this->assertFalse( $data['success'] );
		$this->assertSame( self::PLAN_MISMATCH_FORMAT, $data['message'] );
	}

	/**
	 * Only the store's "invalid license" rejection can be caused by a plan
	 * mismatch. Every other failure is reported as the SDK worded it, even while
	 * an unsupported plan is stored from an earlier key.
	 */
	public function test_only_the_invalid_license_error_is_rewritten() {
		$this->mock_license_plan( 1 );

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
	 * Otter's standalone plans are considered valid even if they are not in the Neve allow list.
	 */
	public function test_otter_standalone_plans_are_reported_as_a_valid_plan() {
		$this->mock_license_process( true );

		foreach ( array( 1, 2, 3, 4 ) as $plan ) {
			$this->assertArrayHasKey( $plan, License::$plans_map, "Price ID {$plan} is a valid Otter plan" );

			$this->mock_license_plan( $plan );

			$data = $this->activate( 'an-otter-standalone-key' );

			$this->assertSame( 'Activated.', $data['message'] );
		}
	}

	/**
	 * The rewrite is gated on the activate action, so deactivation failures are
	 * never reported as a plan mismatch.
	 */
	public function test_deactivation_keeps_the_sdk_message() {
		$this->mock_license_plan( 1 );

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
		$this->mock_license_plan( 1 );

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
		$this->mock_license_plan( 1 );

		foreach ( array( array(), array( 'action' => 'activate' ) ) as $body ) {
			$data = $this->toggle( $body );

			$this->assertFalse( $data['success'] );
			$this->assertSame( 'Invalid Action. Please refresh the page and try again.', $data['message'] );
		}
	}
}
