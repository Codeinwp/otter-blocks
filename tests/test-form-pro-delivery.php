<?php
/**
 * Class Test_Form_Pro_Delivery
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Plugins\Form_Submissions;
use ThemeIsle\GutenbergBlocks\Server\Form_Server;
use ThemeIsle\OtterPro\Plugins\Form_Pro_Features;
use ThemeIsle\GutenbergBlocks\Tests\StripeHttpClientMock;

/**
 * Failure scenarios for the Pro delivery actions (webhook, autoresponder, Stripe) against
 * the save-before-deliver retention pipeline.
 *
 * The bundled Pro build is available through composer's autoload-dev classmap; its hooks
 * are license-gated at init, so each test wires the method under test explicitly.
 */
class Test_Form_Pro_Delivery extends WP_UnitTestCase {

	/**
	 * @var Form_Server
	 */
	private $form_server;

	/**
	 * @var Form_Pro_Features
	 */
	private $pro_features;

	/**
	 * @var array
	 */
	private $mail_requests = array();

	/**
	 * @var callable|null
	 */
	private $mail_filter = null;

	/**
	 * @var callable|null
	 */
	private $http_filter = null;

	/**
	 * @var array<int, array{0: string, 1: callable, 2: int}>
	 */
	private $added_hooks = array();

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();

		$this->form_server   = Form_Server::instance();
		$this->pro_features  = new Form_Pro_Features();
		$this->mail_requests = array();

		update_option( 'themeisle_blocks_form_fields_option', array() );
	}

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		if ( null !== $this->mail_filter ) {
			remove_filter( 'pre_wp_mail', $this->mail_filter, 10 );
		}

		if ( null !== $this->http_filter ) {
			remove_filter( 'pre_http_request', $this->http_filter, 10 );
		}

		foreach ( $this->added_hooks as $hook ) {
			remove_filter( $hook[0], $hook[1], $hook[2] );
		}

		delete_option( 'themeisle_blocks_form_emails' );
		delete_option( 'themeisle_blocks_form_fields_option' );
		delete_option( 'themeisle_webhooks_options' );
		delete_option( 'themeisle_stripe_api_key' );

		delete_transient( 'pro_delivery_form_alert_delivery' );
		delete_transient( 'pro_delivery_form_autoresponder_error' );

		parent::tear_down();
	}

	/**
	 * Register a hook for the duration of the test.
	 *
	 * @param string   $hook The hook name.
	 * @param callable $callback The callback.
	 * @param int      $priority The priority.
	 */
	private function add_test_hook( $hook, $callback, $priority = 10 ) {
		add_filter( $hook, $callback, $priority );
		$this->added_hooks[] = array( $hook, $callback, $priority );
	}

	/**
	 * Capture wp_mail calls; $handler decides the send result per call.
	 *
	 * @param callable|bool $handler The result, or a callable receiving the mail atts.
	 */
	private function mock_mail( $handler = true ) {
		$this->mail_filter = function ( $preempt, $atts ) use ( $handler ) {
			$this->mail_requests[] = $atts;
			return is_callable( $handler ) ? $handler( $atts ) : $handler;
		};
		add_filter( 'pre_wp_mail', $this->mail_filter, 10, 2 );
	}

	/**
	 * Get all stored records.
	 *
	 * @return WP_Post[]
	 */
	private function get_form_records() {
		return get_posts(
			array(
				'post_type'   => Form_Submissions::FORM_RECORD_TYPE,
				'post_status' => array( 'draft', 'unread', 'read' ),
				'numberposts' => -1,
				'orderby'     => 'ID',
				'order'       => 'ASC',
			)
		);
	}

	/**
	 * Build a frontend submission request.
	 *
	 * @return WP_REST_Request
	 */
	private function get_frontend_request() {
		$request = new WP_REST_Request( 'POST', '/otter/v1/form/frontend' );
		$request->set_body(
			wp_json_encode(
				array(
					'handler' => 'submit',
					'payload' => array(
						'nonceValue'       => wp_create_nonce( 'form-verification' ),
						'postUrl'          => 'https://example.com/pro-delivery',
						'formId'           => 'pro-delivery-form',
						'formOption'       => 'pro_delivery_form',
						'antiSpamTime'     => Form_Server::ANTI_SPAM_TIMEOUT,
						'antiSpamHoneyPot' => '',
						'formInputsData'   => array(
							array(
								'id'       => 'wp-block-themeisle-blocks-form-input-pro00001',
								'type'     => 'text',
								'label'    => 'Name',
								'value'    => 'Ada Lovelace',
								'metadata' => array( 'position' => 0 ),
							),
							array(
								'id'       => 'wp-block-themeisle-blocks-form-input-pro00002',
								'type'     => 'email',
								'label'    => 'Email',
								'value'    => 'ada@example.com',
								'metadata' => array( 'position' => 1 ),
							),
						),
					),
				)
			)
		);

		return $request;
	}

	/**
	 * Store the form option entry.
	 *
	 * @param array $overrides Entry overrides.
	 */
	private function set_form_option( $overrides = array() ) {
		update_option(
			'themeisle_blocks_form_emails',
			array(
				array_merge(
					array(
						'form'          => 'pro_delivery_form',
						'email'         => 'owner@example.com',
						'submitMessage' => 'Thanks.',
						'errorMessage'  => 'Could not submit.',
					),
					$overrides
				),
			)
		);
	}

	/**
	 * Ensure a webhook delivery failure is a warning, not an error: the visitor still sees
	 * success, while the Record is marked failed for the webhook action and the admin gets
	 * the throttled delivery alert.
	 */
	public function test_webhook_failure_marks_record_and_alerts_admin() {
		$this->mock_mail();
		$this->set_form_option( array( 'webhookId' => 'hook-1' ) );

		update_option(
			'themeisle_webhooks_options',
			array(
				array(
					'id'     => 'hook-1',
					'url'    => 'https://webhooks.example.com/endpoint',
					'method' => 'POST',
				),
			)
		);

		$this->http_filter = function ( $preempt, $args, $url ) {
			if ( false !== strpos( $url, 'webhooks.example.com' ) ) {
				return new WP_Error( 'http_request_failed', 'Webhook endpoint unreachable.' );
			}
			return $preempt;
		};
		add_filter( 'pre_http_request', $this->http_filter, 10, 3 );

		$this->add_test_hook( 'otter_form_after_submit', array( $this->pro_features, 'trigger_webhook' ) );

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		// The webhook failure does not break the visitor flow.
		$this->assertTrue( $data['success'] );

		// ...but the Record carries the failed webhook delivery.
		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_FAILED, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );

		$errors = get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true );
		$this->assertSame( 'webhook', $errors[0]['action'] );
		$this->assertStringContainsString( 'unreachable', $errors[0]['message'] );

		// The owner email and the throttled delivery alert.
		$this->assertCount( 2, $this->mail_requests );
		$this->assertSame( get_site_option( 'admin_email' ), $this->mail_requests[1]['to'] );
	}

	/**
	 * Ensure a real autoresponder failure does not affect the Record's Delivery Status.
	 */
	public function test_autoresponder_failure_does_not_affect_delivery_status() {
		// The owner email succeeds; the autoresponder (sent to the submitter) fails.
		$this->mock_mail(
			function ( $atts ) {
				return 'ada@example.com' !== $atts['to'];
			}
		);

		$this->set_form_option(
			array(
				'autoresponder' => array(
					'subject' => 'Thanks for your message',
					'body'    => '<p>We will reply soon.</p>',
				),
			)
		);

		$this->add_test_hook( 'otter_form_after_submit', array( $this->pro_features, 'send_autoresponder' ), 99 );

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );

		// Owner email, autoresponder attempt, and the weekly autoresponder admin notice.
		$this->assertCount( 3, $this->mail_requests );
		$this->assertSame( 'owner@example.com', $this->mail_requests[0]['to'] );
		$this->assertSame( 'ada@example.com', $this->mail_requests[1]['to'] );

		// The autoresponder failure is excluded from the Delivery Status.
		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_COMPLETE, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );
		$this->assertEmpty( get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true ) );
	}

	/**
	 * Ensure the payment-gated pipeline works with the real Pro hooks: the submission is
	 * marked temporary, stored as a draft Record before any delivery, and the Stripe
	 * checkout session is created against it.
	 */
	public function test_stripe_payment_pipeline_creates_draft_with_checkout_session() {
		$this->mock_mail();

		update_option( 'themeisle_stripe_api_key', 'sk_test_e2e' );
		\Stripe\ApiRequestor::setHttpClient( new StripeHttpClientMock() );

		$this->set_form_option( array( 'requiredFields' => array( 'stripe-field-1' ) ) );

		update_option(
			'themeisle_blocks_form_fields_option',
			array(
				array(
					'fieldOptionName' => 'stripe-field-1',
					'fieldOptionType' => 'stripe',
					'stripe'          => array(
						'product' => 'prod_1',
						'price'   => 'price_1',
					),
				),
			)
		);

		$this->add_test_hook( 'otter_form_data_preparation', array( $this->pro_features, 'mark_request_with_stripe_as_temp' ), 0 );
		$this->add_test_hook( 'otter_form_after_submit', array( $this->pro_features, 'create_stripe_session' ), 50 );

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );

		// The visitor is sent to the Stripe checkout.
		$this->assertSame( 'https://checkout.stripe.com/c/pay/sess_create_1', $data['frontend_external_confirmation_url'] );

		// The submission is parked as a draft Record with the session in its dump, undelivered.
		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( 'draft', $records[0]->post_status );
		$this->assertCount( 0, $this->mail_requests );

		$meta = get_post_meta( $records[0]->ID, Form_Submissions::FORM_RECORD_META_KEY, true );
		$this->assertSame( 'sess_create_1', $meta['dump']['value']['metadata']['otter_form_stripe_checkout_session_id'] );

		// Payment confirmation flips the draft and delivers — still a single Record.
		wp_update_post(
			array(
				'ID'          => $records[0]->ID,
				'post_status' => 'unread',
			)
		);

		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( 'unread', $records[0]->post_status );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_COMPLETE, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );
		$this->assertCount( 1, $this->mail_requests );
		$this->assertSame( 'owner@example.com', $this->mail_requests[0]['to'] );
	}

	/**
	 * Ensure the bundled Pro build is the thin extension and core storage is owned by lite.
	 */
	public function test_pro_build_defers_storage_to_lite() {
		$this->assertTrue( method_exists( '\ThemeIsle\OtterPro\Plugins\Form_Emails_Storing', 'is_thin_extension' ) );

		$lite = Form_Submissions::instance();

		$this->assertNotFalse( has_action( 'otter_form_record_save', array( $lite, 'store_form_record' ) ) );
		$this->assertNotFalse( has_action( 'otter_form_after_submit', array( $lite, 'record_delivery_status' ) ) );
		$this->assertNotFalse( has_action( 'otter_form_issues_handler', array( $lite, 'record_delivery_status' ) ) );
	}
}
