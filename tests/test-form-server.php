<?php
/**
 * Class Test_Form_Server
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Integration\Form_Providers;
use ThemeIsle\GutenbergBlocks\Integration\Form_Settings_Data;
use ThemeIsle\GutenbergBlocks\Plugins\Form_Submissions;
use ThemeIsle\GutenbergBlocks\Server\Form_Server;

/**
 * Form server tests.
 */
class Test_Form_Server extends WP_UnitTestCase {
	/**
	 * @var Form_Server
	 */
	private $form_server;

	/**
	 * @var Form_Providers
	 */
	private $form_providers;

	/**
	 * @var array
	 */
	private $original_providers = array();

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
	 * @var callable|null
	 */
	private $record_confirm_filter = null;

	/**
	 * @var callable|null
	 */
	private $data_preparation_filter = null;

	/**
	 * @var callable|null
	 */
	private $after_submit_action = null;

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();

		$this->form_server    = Form_Server::instance();
		$this->form_providers = Form_Providers::instance();
		$this->ensure_default_provider();

		$this->original_providers = $this->form_providers->providers;
		$this->mail_requests      = array();

		update_option( 'themeisle_blocks_form_emails', array( $this->get_form_option() ) );
		update_option( 'themeisle_blocks_form_fields_option', array() );
	}

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		if ( null !== $this->mail_filter ) {
			remove_filter( 'pre_wp_mail', $this->mail_filter );
		}

		if ( null !== $this->http_filter ) {
			remove_filter( 'pre_http_request', $this->http_filter, 10 );
		}

		if ( null !== $this->record_confirm_filter ) {
			remove_filter( 'otter_form_record_confirm', $this->record_confirm_filter, 10 );
		}

		if ( null !== $this->data_preparation_filter ) {
			remove_filter( 'otter_form_data_preparation', $this->data_preparation_filter, 10 );
		}

		if ( null !== $this->after_submit_action ) {
			remove_action( 'otter_form_after_submit', $this->after_submit_action, 5 );
			$this->after_submit_action = null;
		}

		$this->form_providers->providers = $this->original_providers;

		$this->cleanup_upload_fixtures();

		delete_option( 'themeisle_blocks_form_emails' );
		delete_option( 'themeisle_blocks_form_fields_option' );
		delete_option( 'themeisle_google_captcha_api_secret_key' );
		delete_transient( 'contact_form_autoresponder_error' );
		delete_transient( 'contact_form_alert_delivery' );
		delete_transient( 'contact_form_alert_captcha_provider' );

		parent::tear_down();
	}

	/**
	 * Ensure a valid frontend submission sends the default email.
	 */
	public function test_frontend_submission_sends_default_email() {
		$this->mock_mail();

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( Form_Data_Response::SUCCESS_EMAIL_SEND, $data['code'] );
		$this->assertSame( 'Thanks for writing.', $data['submitMessage'] );
		$this->assertSame( 'https://example.com/thanks', $data['redirectLink'] );
		$this->assertCount( 1, $this->mail_requests );
		$this->assertSame( 'forms@example.com', $this->mail_requests[0]['to'] );
		$this->assertSame( 'Contact request', $this->mail_requests[0]['subject'] );
	}

	/**
	 * Ensure frontend submissions can be sent through the form_data request parameter.
	 */
	public function test_frontend_submission_accepts_form_data_request_parameter() {
		$this->mock_mail();

		$request = new WP_REST_Request( 'POST', '/otter/v1/form/frontend' );
		$request->set_param( 'form_data', wp_json_encode( $this->get_base_form_data() ) );

		$response = $this->form_server->frontend( $request );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( Form_Data_Response::SUCCESS_EMAIL_SEND, $data['code'] );
		$this->assertCount( 1, $this->mail_requests );
	}

	/**
	 * Ensure repeated fields with the same visual position are grouped in the owner email.
	 */
	public function test_frontend_submission_groups_repeated_position_fields_in_email_body() {
		$this->mock_mail();

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'formInputsData' => array(
							array(
								'id'       => 'choice-tea',
								'type'     => 'checkbox',
								'label'    => 'Interests',
								'value'    => 'Tea',
								'metadata' => array(
									'position' => 0,
								),
							),
							array(
								'id'       => 'choice-coffee',
								'type'     => 'checkbox',
								'label'    => 'Interests',
								'value'    => 'Coffee',
								'metadata' => array(
									'position' => 0,
								),
							),
							array(
								'id'       => 'email-field',
								'type'     => 'email',
								'label'    => 'Email',
								'value'    => 'ada@example.com',
								'metadata' => array(
									'position' => 1,
								),
							),
						),
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertStringContainsString( '<strong>Interests:</strong> Tea, Coffee', $this->mail_requests[0]['message'] );
		$this->assertSame( 1, substr_count( $this->mail_requests[0]['message'], '<strong>Interests:</strong>' ) );
	}

	/**
	 * Ensure configured sender and copy headers are passed to wp_mail.
	 */
	public function test_frontend_submission_uses_configured_email_headers() {
		$this->mock_mail();
		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'fromName'  => 'Support Desk',
						'fromEmail' => 'support@example.com',
						'cc'        => 'manager@example.com, qa@example.com',
						'bcc'       => 'archive@example.com',
					)
				),
			)
		);

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertContains( 'From: Support Desk <support@example.com>', $this->mail_requests[0]['headers'] );
		$this->assertContains( 'Cc: manager@example.com', $this->mail_requests[0]['headers'] );
		$this->assertContains( 'Cc: qa@example.com', $this->mail_requests[0]['headers'] );
		$this->assertContains( 'Bcc: archive@example.com', $this->mail_requests[0]['headers'] );
	}

	/**
	 * Ensure transient uploaded files are attached to the owner email.
	 */
	public function test_frontend_submission_attaches_transient_uploads_to_owner_email() {
		$this->mock_mail();
		$this->data_preparation_filter = function ( $form_data ) {
			$form_data->set_uploaded_files_path(
				array(
					array(
						'file_path' => '/tmp/otter-resume.pdf',
					),
				)
			);

			return $form_data;
		};
		add_filter( 'otter_form_data_preparation', $this->data_preparation_filter );

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( array( '/tmp/otter-resume.pdf' ), $this->mail_requests[0]['attachments'] );
	}

	/**
	 * Ensure retained uploaded files are not attached again to the owner email.
	 */
	public function test_frontend_submission_skips_retained_uploads_as_email_attachments() {
		$this->mock_mail();
		$this->data_preparation_filter = function ( $form_data ) {
			$form_data->set_keep_uploaded_files( true );
			$form_data->set_uploaded_files_path(
				array(
					array(
						'file_path' => '/tmp/otter-resume.pdf',
					),
				)
			);

			return $form_data;
		};
		add_filter( 'otter_form_data_preparation', $this->data_preparation_filter );

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( array(), $this->mail_requests[0]['attachments'] );
	}

	/**
	 * Ensure default email failures are returned with the configured display error,
	 * while the submission is still saved as a Record with a failed Delivery Status
	 * and a throttled Admin Alert is sent.
	 */
	public function test_frontend_submission_returns_email_error_when_default_mail_fails() {
		$this->mock_mail( false );

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_EMAIL_NOT_SEND, $data['code'] );
		$this->assertSame( 'Could not submit.', $data['displayError'] );

		// The failed owner email and the throttled admin alert.
		$this->assertCount( 2, $this->mail_requests );

		// The submission survives the delivery failure as a Record marked failed.
		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_FAILED, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );

		$errors = get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true );
		$this->assertSame( 'email', $errors[0]['action'] );
	}

	/**
	 * Ensure a successful submission is saved as a Record with a complete Delivery Status.
	 */
	public function test_frontend_submission_saves_record_with_complete_delivery() {
		$this->mock_mail();

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );

		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( 'unread', $records[0]->post_status );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_COMPLETE, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );
		$this->assertEmpty( get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true ) );
	}

	/**
	 * Ensure a captcha provider outage saves the Record, skips delivery and alerts the admin.
	 */
	public function test_frontend_submission_captcha_provider_failure_saves_record_and_skips_delivery() {
		$this->mock_mail();
		update_option( 'themeisle_blocks_form_emails', array( $this->get_form_option( array( 'hasCaptcha' => true ) ) ) );

		update_option( 'themeisle_google_captcha_api_secret_key', 'secret-key' );
		$this->http_filter = function () {
			return new WP_Error( 'http_request_failed', 'Connection timed out.' );
		};
		add_filter( 'pre_http_request', $this->http_filter, 10, 3 );

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'token' => 'captcha-token',
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_CAPTCHA_PROVIDER_UNREACHABLE, $data['code'] );
		$this->assertSame( 'Could not submit.', $data['displayError'] );

		// Primary delivery is skipped: the only email is the throttled admin alert.
		$this->assertCount( 1, $this->mail_requests );
		$this->assertSame( get_site_option( 'admin_email' ), $this->mail_requests[0]['to'] );

		// The submission is not lost: a Record is saved and marked failed.
		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( 'unread', $records[0]->post_status );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_FAILED, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );

		$errors = get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true );
		$this->assertSame( 'captcha', $errors[0]['action'] );
	}

	/**
	 * Ensure repeated captcha provider outages do not re-alert through the delivery throttle.
	 */
	public function test_captcha_provider_outage_admin_alert_is_throttled_per_form() {
		$this->mock_mail();
		update_option( 'themeisle_blocks_form_emails', array( $this->get_form_option( array( 'hasCaptcha' => true ) ) ) );

		update_option( 'themeisle_google_captcha_api_secret_key', 'secret-key' );
		$this->http_filter = function () {
			return new WP_Error( 'http_request_failed', 'Connection timed out.' );
		};
		add_filter( 'pre_http_request', $this->http_filter, 10, 3 );

		$request = $this->get_frontend_request(
			array(
				'payload' => array(
					'token' => 'captcha-token',
				),
			)
		);

		$this->form_server->frontend( $request );
		$this->assertCount( 1, $this->mail_requests );

		$this->form_server->frontend( $request );
		$this->assertCount( 1, $this->mail_requests );
		$this->assertCount( 2, $this->get_form_records() );
	}

	/**
	 * Ensure a captcha provider HTTP error (5xx) is treated as an infrastructure failure,
	 * not a verification failure: the Record is saved and marked failed.
	 */
	public function test_captcha_provider_http_error_is_infrastructure_failure() {
		$this->mock_mail();
		update_option( 'themeisle_blocks_form_emails', array( $this->get_form_option( array( 'hasCaptcha' => true ) ) ) );

		update_option( 'themeisle_google_captcha_api_secret_key', 'secret-key' );
		$this->http_filter = function () {
			return array(
				'response' => array(
					'code'    => 500,
					'message' => 'Internal Server Error',
				),
				'headers'  => array(),
				'body'     => 'Server Error',
			);
		};
		add_filter( 'pre_http_request', $this->http_filter, 10, 3 );

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'token' => 'captcha-token',
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_CAPTCHA_PROVIDER_UNREACHABLE, $data['code'] );

		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_FAILED, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );

		$errors = get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true );
		$this->assertSame( 'captcha', $errors[0]['action'] );
		$this->assertStringContainsString( 'HTTP 500', $errors[0]['message'] );
	}

	/**
	 * Ensure a captcha provider outage on a payment-gated submission saves a regular
	 * (visible) Record instead of a draft — it never reaches payment.
	 */
	public function test_infrastructure_failure_on_temporary_submission_saves_visible_record() {
		$this->mock_mail();
		update_option( 'themeisle_blocks_form_emails', array( $this->get_form_option( array( 'hasCaptcha' => true ) ) ) );

		update_option( 'themeisle_google_captcha_api_secret_key', 'secret-key' );
		$this->http_filter = function () {
			return new WP_Error( 'http_request_failed', 'Connection timed out.' );
		};
		add_filter( 'pre_http_request', $this->http_filter, 10, 3 );

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'token' => 'captcha-token',
					),
				),
				'temporary'
			)
		);
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_CAPTCHA_PROVIDER_UNREACHABLE, $data['code'] );

		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( 'unread', $records[0]->post_status );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_FAILED, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );
	}

	/**
	 * Ensure a marketing-provider subscribe failure marks the Record's Delivery Status
	 * and sends a throttled delivery alert.
	 */
	public function test_subscribe_failure_marks_record_delivery_errors() {
		$this->mock_mail();

		$this->form_providers->providers['failing-provider'] = array(
			'frontend' => array(
				'submit' => function ( $form_data ) {
					$form_data->set_error( Form_Data_Response::ERROR_PROVIDER_SUBSCRIBE_ERROR );
				},
			),
			'editor'   => array(),
		);

		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'integration' => array(
							'provider' => 'failing-provider',
							'apiKey'   => 'api-key',
							'listId'   => 'list-id',
						),
					)
				),
			)
		);

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_PROVIDER_SUBSCRIBE_ERROR, $data['code'] );

		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_FAILED, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );

		$errors = get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true );
		$this->assertSame( 'subscribe', $errors[0]['action'] );

		// The throttled delivery alert went to the site admin.
		$this->assertCount( 1, $this->mail_requests );
		$this->assertSame( get_site_option( 'admin_email' ), $this->mail_requests[0]['to'] );
	}

	/**
	 * Data provider for every delivery-failure code in the shared action map.
	 *
	 * @return array<string, array{0: int|string, 1: string}>
	 */
	public function delivery_failure_actions_provider() {
		$cases = array();

		foreach ( Form_Submissions::get_delivery_failure_actions() as $code => $action ) {
			$cases[ 'code_' . $code ] = array( $code, $action );
		}

		return $cases;
	}

	/**
	 * Ensure every delivery-failure code maps to the expected action on the stored Record
	 * after a frontend submission runs through the delivery pipeline.
	 *
	 * @dataProvider delivery_failure_actions_provider
	 *
	 * @param int|string $code The response error code.
	 * @param string     $expected_action The delivery action label.
	 */
	public function test_delivery_failure_action_maps_to_record_meta( $code, $expected_action ) {
		$overrides = $this->configure_delivery_failure_case( $code );

		$this->form_server->frontend( $this->get_frontend_request( $overrides ) );

		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame(
			Form_Submissions::DELIVERY_STATUS_FAILED,
			get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true )
		);

		$errors = get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true );
		$this->assertSame( $expected_action, $errors[0]['action'] );
		$this->assertSame( (string) $code, $errors[0]['code'] );
	}

	/**
	 * Ensure a retained upload stored through the frontend pipeline is removed when the
	 * Submission Record is permanently deleted.
	 */
	public function test_frontend_submission_with_retained_upload_deletes_file_on_record_delete() {
		$this->mock_mail();

		$path     = $this->create_upload_fixture( 'integration-upload.txt' );
		$file_key = 'file-1';

		$this->data_preparation_filter = function ( $form_data ) use ( $path, $file_key ) {
			$form_data->set_keep_uploaded_files( true );
			$form_data->set_uploaded_files_path(
				array(
					$file_key => array(
						'file_path' => $path,
						'file_type' => 'text/plain',
					),
				)
			);

			return $form_data;
		};
		add_filter( 'otter_form_data_preparation', $this->data_preparation_filter, 10 );

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'formInputsData' => array(
							array(
								'id'       => 'wp-block-themeisle-blocks-form-input-upload01',
								'type'     => 'file',
								'label'    => 'Upload',
								'value'    => basename( $path ),
								'metadata' => array(
									'name'            => basename( $path ),
									'size'            => (string) filesize( $path ),
									'data'            => $file_key,
									'fieldOptionName' => 'upload-field',
								),
							),
						),
					),
				)
			)
		);

		$this->assertTrue( $response->get_data()['success'] );
		$this->assertFileExists( $path );

		$records = $this->get_form_records();
		$this->assertCount( 1, $records );

		$meta     = get_post_meta( $records[0]->ID, Form_Submissions::FORM_RECORD_META_KEY, true );
		$has_path = false;

		foreach ( $meta['inputs'] as $input ) {
			if ( ! empty( $input['path'] ) && $input['path'] === $path ) {
				$has_path = true;
				break;
			}
		}

		$this->assertTrue( $has_path );

		wp_delete_post( $records[0]->ID, true );

		$this->assertFileDoesNotExist( $path );
	}

	/**
	 * Ensure the delivery Admin Alert is throttled per form: a second failing submission
	 * within the cooldown stores another Record but does not re-alert.
	 */
	public function test_delivery_admin_alert_is_throttled_per_form() {
		$this->mock_mail( false );

		$this->form_server->frontend( $this->get_frontend_request() );

		// First failure: the failed owner email and the admin alert attempt.
		$this->assertCount( 2, $this->mail_requests );

		$this->form_server->frontend( $this->get_frontend_request() );

		// Second failure: only the owner email attempt — the alert is on cooldown.
		$this->assertCount( 3, $this->mail_requests );
		$this->assertCount( 2, $this->get_form_records() );
	}

	/**
	 * Ensure the Admin Alert cooldowns are independent per failure type: a captcha-provider
	 * alert does not suppress a delivery alert for the same form within the same hour.
	 */
	public function test_admin_alert_throttle_is_per_failure_type() {
		// First submission: captcha provider outage → one captcha alert.
		$this->mock_mail();
		update_option( 'themeisle_blocks_form_emails', array( $this->get_form_option( array( 'hasCaptcha' => true ) ) ) );

		update_option( 'themeisle_google_captcha_api_secret_key', 'secret-key' );
		$this->http_filter = function () {
			return new WP_Error( 'http_request_failed', 'Connection timed out.' );
		};
		add_filter( 'pre_http_request', $this->http_filter, 10, 3 );

		$this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'token' => 'captcha-token',
					),
				)
			)
		);

		$this->assertCount( 1, $this->mail_requests );

		// Second submission on the same form: email delivery failure → its own alert still fires.
		remove_filter( 'pre_http_request', $this->http_filter, 10 );
		$this->http_filter = null;
		update_option( 'themeisle_blocks_form_emails', array( $this->get_form_option() ) );

		remove_filter( 'pre_wp_mail', $this->mail_filter, 10 );
		$this->mock_mail( false );

		$this->form_server->frontend( $this->get_frontend_request() );

		// The failed owner email and the delivery alert, despite the active captcha cooldown.
		$this->assertCount( 3, $this->mail_requests );
	}

	/**
	 * Ensure a delivery handler that throws cannot lose the submission: the Record is
	 * already saved and its Delivery Status is backfilled from the issues handler.
	 */
	public function test_delivery_handler_exception_marks_record_failed() {
		$this->mock_mail();

		$this->form_providers->providers['default']['frontend']['submit'] = function () {
			throw new Exception( 'Provider exploded.' );
		};

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_RUNTIME_ERROR, $data['code'] );

		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_FAILED, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );

		$errors = get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_ERRORS_META_KEY, true );
		$this->assertSame( 'provider', $errors[0]['action'] );
	}

	/**
	 * Ensure the payment-gated flow keeps a single Record: a draft on submit, flipped to
	 * unread on payment confirmation, with delivery running only after the confirmation.
	 */
	public function test_payment_gated_submission_creates_draft_and_confirms_without_duplicate() {
		$this->mock_mail();

		$response = $this->form_server->frontend( $this->get_frontend_request( array(), 'temporary' ) );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );

		// A draft Record exists, nothing has been delivered yet.
		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( 'draft', $records[0]->post_status );
		$this->assertCount( 0, $this->mail_requests );
		$this->assertEmpty( get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );

		// Payment confirmation flips the draft and re-fires the submit hooks.
		wp_update_post(
			array(
				'ID'          => $records[0]->ID,
				'post_status' => 'unread',
			)
		);

		// Delivery ran exactly once and no second Record was created.
		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( 'unread', $records[0]->post_status );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_COMPLETE, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );
		$this->assertCount( 1, $this->mail_requests );
		$this->assertSame( 'forms@example.com', $this->mail_requests[0]['to'] );
	}

	/**
	 * Ensure an invalid captcha token still rejects the submission with no Record.
	 */
	public function test_frontend_submission_invalid_captcha_token_rejects_without_record() {
		$this->mock_mail();
		update_option( 'themeisle_blocks_form_emails', array( $this->get_form_option( array( 'hasCaptcha' => true ) ) ) );
		$this->mock_captcha( false );

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'token' => 'captcha-token',
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_INVALID_CAPTCHA_TOKEN, $data['code'] );
		$this->assertCount( 0, $this->get_form_records() );
	}

	/**
	 * Ensure the email notification toggle suppresses the owner email but keeps the Record.
	 */
	public function test_frontend_submission_with_notification_off_saves_record_without_email() {
		$this->mock_mail();
		update_option( 'themeisle_blocks_form_emails', array( $this->get_form_option( array( 'emailNotification' => false ) ) ) );

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertCount( 0, $this->mail_requests );

		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertSame( Form_Submissions::DELIVERY_STATUS_COMPLETE, get_post_meta( $records[0]->ID, Form_Submissions::DELIVERY_STATUS_META_KEY, true ) );
	}

	/**
	 * Ensure the legacy save-location values map to the Email Notification toggle at read time.
	 */
	public function test_legacy_save_location_maps_to_email_notification() {
		$cases = array(
			array( array( 'submissionsSaveLocation' => 'email' ), true ),
			array( array( 'submissionsSaveLocation' => 'database-email' ), true ),
			array( array( 'submissionsSaveLocation' => 'database' ), false ),
			array( array( 'submissionsSaveLocation' => '' ), true ),
			array( array(), true ),
			array( array( 'emailNotification' => false ), false ),
			array( array( 'emailNotification' => true ), true ),
			// The new toggle wins over the legacy value once both are present.
			array(
				array(
					'submissionsSaveLocation' => 'database',
					'emailNotification'       => true,
				),
				true,
			),
		);

		foreach ( $cases as $index => $case ) {
			$option = $this->get_form_option( $case[0] );

			if ( array_key_exists( 'submissionsSaveLocation', $case[0] ) && '' === $case[0]['submissionsSaveLocation'] ) {
				$option['submissionsSaveLocation'] = '';
			} elseif ( ! array_key_exists( 'submissionsSaveLocation', $case[0] ) ) {
				unset( $option['submissionsSaveLocation'] );
			}

			update_option( 'themeisle_blocks_form_emails', array( $option ) );

			$settings = Form_Settings_Data::get_form_setting_from_wordpress_options( 'contact_form' );
			$this->assertSame( $case[1], $settings->has_email_notification(), 'Case #' . $index . ' failed.' );
		}
	}

	/**
	 * Ensure malformed JSON is surfaced as a form response error.
	 */
	public function test_frontend_submission_rejects_malformed_request() {
		$request = new WP_REST_Request( 'POST', '/otter/v1/form/frontend' );
		$request->set_body( '{"handler":' );

		$response = $this->form_server->frontend( $request );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_MALFORMED_REQUEST, $data['code'] );
	}

	/**
	 * Ensure missing required payload data fails before submission.
	 */
	public function test_frontend_submission_rejects_missing_required_payload() {
		$request = $this->get_frontend_request(
			array(
				'payload' => array(
					'nonceValue' => '',
				),
			)
		);

		$response = $this->form_server->frontend( $request );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_MISSING_DATA, $data['code'] );
	}

	/**
	 * Ensure anti-spam timing and honeypot data are enforced.
	 */
	public function test_frontend_submission_rejects_bot_like_payload() {
		$request = $this->get_frontend_request(
			array(
				'payload' => array(
					'antiSpamTime'     => 100,
					'antiSpamHoneyPot' => 'filled',
				),
			)
		);

		$response = $this->form_server->frontend( $request );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_BOT_DETECTED, $data['code'] );
	}

	/**
	 * Ensure anti-spam validation passes when timeout and honeypot rules are satisfied.
	 */
	public function test_anti_spam_validation_passes_for_valid_human_data() {
		$form_data = $this->create_anti_spam_form_data_request( 6000, '' );
		$result    = $this->form_server->anti_spam_validation( $form_data );

		$this->assertFalse( $result->has_error() );
	}

	/**
	 * Ensure anti-spam validation blocks quick or honeypot-filled requests.
	 */
	public function test_anti_spam_validation_sets_bot_detected_error_for_invalid_data() {
		$form_data_with_low_time = $this->create_anti_spam_form_data_request( 1000, '' );
		$result                  = $this->form_server->anti_spam_validation( $form_data_with_low_time );

		$this->assertTrue( $result->has_error() );
		$this->assertSame( Form_Data_Response::ERROR_BOT_DETECTED, $result->get_error_code() );

		$form_data_with_honeypot = $this->create_anti_spam_form_data_request( 6000, 'bot-value' );
		$result                  = $this->form_server->anti_spam_validation( $form_data_with_honeypot );

		$this->assertTrue( $result->has_error() );
		$this->assertSame( Form_Data_Response::ERROR_BOT_DETECTED, $result->get_error_code() );
	}

	/**
	 * Ensure file fields must carry the metadata needed by upload handlers.
	 */
	public function test_frontend_submission_rejects_invalid_file_metadata() {
		$request = $this->get_frontend_request(
			array(
				'payload' => array(
					'formInputsData' => array(
						array(
							'id'       => 'file-field',
							'type'     => 'file',
							'label'    => 'Upload',
							'value'    => 'resume.pdf',
							'metadata' => array(
								'name' => 'resume.pdf',
							),
						),
					),
				),
			)
		);

		$response = $this->form_server->frontend( $request );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_FILES_METADATA_FORMAT, $data['code'] );
	}

	/**
	 * Ensure captcha-enabled forms require a token.
	 */
	public function test_frontend_submission_rejects_missing_captcha_token() {
		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'hasCaptcha' => true,
					)
				),
			)
		);

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_MISSING_CAPTCHA, $data['code'] );
	}

	/**
	 * Ensure failed reCAPTCHA verification blocks submission.
	 */
	public function test_frontend_submission_rejects_invalid_captcha_token() {
		$this->mock_captcha( false );
		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'hasCaptcha' => true,
					)
				),
			)
		);

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'token' => 'invalid-token',
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_INVALID_CAPTCHA_TOKEN, $data['code'] );
	}

	/**
	 * Ensure successful reCAPTCHA verification allows the normal submit path.
	 */
	public function test_frontend_submission_accepts_valid_captcha_token() {
		$this->mock_mail();
		$this->mock_captcha( true );
		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'hasCaptcha' => true,
					)
				),
			)
		);

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'token' => 'valid-token',
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( Form_Data_Response::SUCCESS_EMAIL_SEND, $data['code'] );
	}

	/**
	 * Ensure temporary submissions validate but skip provider side effects.
	 */
	public function test_frontend_temporary_submission_skips_default_email() {
		$this->mock_mail();

		$response = $this->form_server->frontend( $this->get_frontend_request( array(), 'temporary' ) );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertCount( 0, $this->mail_requests );
	}

	/**
	 * Ensure missing marketing consent falls back to default submission only.
	 */
	public function test_frontend_submit_subscribe_without_consent_uses_default_provider() {
		$this->mock_mail();

		$provider_calls = 0;
		$this->form_providers->providers['test-provider'] = array(
			'frontend' => array(
				'submit' => function () use ( &$provider_calls ) {
					$provider_calls++;
				},
			),
			'editor'   => array(),
		);

		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'integration' => array(
							'provider' => 'test-provider',
							'apiKey'   => 'api-key',
							'listId'   => 'list-id',
							'action'   => 'submit-subscribe',
						),
					)
				),
			)
		);

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'action'  => 'submit-subscribe',
						'consent' => false,
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( 0, $provider_calls );
		$this->assertCount( 1, $this->mail_requests );
	}

	/**
	 * Ensure granted marketing consent uses the configured provider and sends the owner copy.
	 */
	public function test_frontend_submit_subscribe_with_consent_uses_configured_provider_and_sends_email() {
		$this->mock_mail();

		$provider_calls = 0;
		$this->form_providers->providers['test-provider'] = array(
			'frontend' => array(
				'submit' => function () use ( &$provider_calls ) {
					$provider_calls++;
				},
			),
			'editor'   => array(),
		);

		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'integration' => array(
							'provider' => 'test-provider',
							'apiKey'   => 'api-key',
							'listId'   => 'list-id',
							'action'   => 'submit-subscribe',
						),
					)
				),
			)
		);

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'action'  => 'submit-subscribe',
						'consent' => true,
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( 1, $provider_calls );
		$this->assertCount( 1, $this->mail_requests );
	}

	/**
	 * Ensure provider submission errors stop success handling and expose the configured error.
	 */
	public function test_frontend_provider_error_returns_display_error_without_owner_email() {
		$this->mock_mail();

		$this->form_providers->providers['failing-provider'] = array(
			'frontend' => array(
				'submit' => function ( $form_data ) {
					$form_data->set_error( Form_Data_Response::ERROR_PROVIDER_SUBSCRIBE_ERROR );
				},
			),
			'editor'   => array(),
		);

		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'integration' => array(
							'provider' => 'failing-provider',
							'apiKey'   => 'api-key',
							'listId'   => 'list-id',
						),
					)
				),
			)
		);

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_PROVIDER_SUBSCRIBE_ERROR, $data['code'] );
		$this->assertSame( 'Could not submit.', $data['displayError'] );

		// No owner email — the only attempt is the throttled delivery Admin Alert.
		$this->assertCount( 1, $this->mail_requests );
		$this->assertSame( get_site_option( 'admin_email' ), $this->mail_requests[0]['to'] );
	}

	/**
	 * Ensure credential errors trigger the admin error email path.
	 */
	public function test_frontend_provider_credential_error_sends_admin_error_email() {
		$this->mock_mail();

		$this->form_providers->providers['credential-error-provider'] = array(
			'frontend' => array(
				'submit' => function ( $form_data ) {
					$form_data->set_error( Form_Data_Response::ERROR_PROVIDER_CREDENTIAL_ERROR );
				},
			),
			'editor'   => array(),
		);

		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'integration' => array(
							'provider' => 'credential-error-provider',
							'apiKey'   => 'api-key',
							'listId'   => 'list-id',
						),
					)
				),
			)
		);

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_PROVIDER_CREDENTIAL_ERROR, $data['code'] );
		$this->assertCount( 1, $this->mail_requests );
		$this->assertStringContainsString( 'An error with the Form blocks has occurred', $this->mail_requests[0]['subject'] );
	}

	/**
	 * Ensure autoresponder warning emails are throttled by transient.
	 */
	public function test_autoresponder_warning_email_is_throttled() {
		$this->mock_mail();
		delete_transient( 'contact_form_autoresponder_error' );

		$form_data = new Form_Data_Request( $this->get_frontend_request() );
		$form_data->add_warning( Form_Data_Response::ERROR_AUTORESPONDER_COULD_NOT_SEND );

		$this->form_server->send_error_email_to_admin( $form_data );
		$this->form_server->send_error_email_to_admin( $form_data );

		$this->assertCount( 1, $this->mail_requests );
		$this->assertStringContainsString( 'An error with the Form blocks has occurred', $this->mail_requests[0]['subject'] );
	}

	/**
	 * Ensure provider metadata intended for the frontend is copied into the response.
	 */
	public function test_frontend_submission_includes_provider_frontend_metadata() {
		$this->mock_mail();

		$this->form_providers->providers['metadata-provider'] = array(
			'frontend' => array(
				'submit' => function ( $form_data ) {
					$form_data->metadata['frontend_external_confirmation_url'] = 'https://checkout.example.com/session';
				},
			),
			'editor'   => array(),
		);

		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'integration' => array(
							'provider' => 'metadata-provider',
							'apiKey'   => 'api-key',
							'listId'   => 'list-id',
						),
					)
				),
			)
		);

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( 'https://checkout.example.com/session', $data['frontend_external_confirmation_url'] );
	}

	/**
	 * Ensure field options from WordPress settings are available to provider handlers.
	 */
	public function test_frontend_submission_pulls_global_field_options_before_provider_runs() {
		$this->mock_mail();

		$provider_saw_declared_field = false;
		$provider_saw_required_field = false;

		$this->form_providers->providers['field-aware-provider'] = array(
			'frontend' => array(
				'submit' => function ( $form_data ) use ( &$provider_saw_declared_field, &$provider_saw_required_field ) {
					$provider_saw_declared_field = $form_data->has_field_option( 'upload-field' );
					$provider_saw_required_field = $form_data->has_field_option( 'required-upload-field' );
				},
			),
			'editor'   => array(),
		);

		update_option(
			'themeisle_blocks_form_fields_option',
			array(
				array(
					'fieldOptionName' => 'upload-field',
					'fieldOptionType' => 'file',
					'options'         => array(
						'allowedFileTypes' => array( 'pdf' ),
					),
				),
				array(
					'fieldOptionName' => 'required-upload-field',
					'fieldOptionType' => 'file',
					'options'         => array(
						'maxFileSize' => '2',
					),
				),
			)
		);

		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'requiredFields' => array( 'required-upload-field' ),
						'integration'    => array(
							'provider' => 'field-aware-provider',
							'apiKey'   => 'api-key',
							'listId'   => 'list-id',
						),
					)
				),
			)
		);

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'formInputsData' => array(
							array(
								'id'       => 'upload-field',
								'type'     => 'file',
								'label'    => 'Upload',
								'value'    => 'resume.pdf',
								'metadata' => array(
									'name'            => 'resume.pdf',
									'size'            => '100',
									'data'            => 'file-1',
									'fieldOptionName' => 'upload-field',
								),
							),
						),
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertTrue( $provider_saw_declared_field );
		$this->assertTrue( $provider_saw_required_field );
	}

	/**
	 * Ensure subscription submissions fail before external calls when no email field exists.
	 */
	public function test_frontend_subscription_requires_email_field_before_provider_call() {
		$this->mock_mail();

		$this->form_providers->providers['mailchimp'] = array(
			'frontend' => array(
				'submit' => array( $this->form_server, 'subscribe_to_service' ),
			),
			'editor'   => array(),
		);

		update_option(
			'themeisle_blocks_form_emails',
			array(
				$this->get_form_option(
					array(
						'integration' => array(
							'provider' => 'mailchimp',
							'apiKey'   => 'api-key',
							'listId'   => 'list-id',
							'action'   => 'submit-subscribe',
						),
					)
				),
			)
		);

		$response = $this->form_server->frontend(
			$this->get_frontend_request(
				array(
					'payload' => array(
						'action'         => 'submit-subscribe',
						'consent'        => true,
						'formInputsData' => array(
							array(
								'id'       => 'name-field',
								'type'     => 'text',
								'label'    => 'Name',
								'value'    => 'Ada Lovelace',
								'metadata' => array(
									'position' => 0,
								),
							),
							array(
								'id'       => 'company-field',
								'type'     => 'text',
								'label'    => 'Company',
								'value'    => 'Analytical Engines Ltd',
								'metadata' => array(
									'position' => 1,
								),
							),
						),
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_MISSING_EMAIL, $data['code'] );
		$this->assertSame( 'Could not submit.', $data['displayError'] );
		$this->assertCount( 1, $this->mail_requests );
	}

	/**
	 * Ensure editor test email uses the registered default provider handler.
	 */
	public function test_editor_test_email_sends_message() {
		$this->mock_mail();

		$response = $this->form_server->editor(
			$this->get_editor_request(
				array(
					'handler' => 'testEmail',
					'payload' => array(
						'provider'   => 'default',
						'formOption' => 'contact_form',
						'to'         => 'owner@example.com',
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( 'owner@example.com', $this->mail_requests[0]['to'] );
	}

	/**
	 * Ensure editor requests fail when the provider handler is missing.
	 */
	public function test_editor_request_rejects_unregistered_provider_handler() {
		$response = $this->form_server->editor(
			$this->get_editor_request(
				array(
					'handler' => 'missingHandler',
					'payload' => array(
						'provider'   => 'default',
						'formOption' => 'contact_form',
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( 'The email service provider was not registered!', $data['error'] );
	}

	/**
	 * Ensure confirmation session validation accepts only non-empty strings.
	 */
	public function test_verify_confirmation_session_requires_non_empty_string() {
		$this->assertFalse( $this->form_server->verify_confirmation_session( '' ) );
		$this->assertFalse( $this->form_server->verify_confirmation_session( null ) );
		$this->assertFalse( $this->form_server->verify_confirmation_session( 123 ) );
		$this->assertTrue( $this->form_server->verify_confirmation_session( 'cs_test_123' ) );
	}

	/**
	 * Ensure successful confirmation filters can return a success response.
	 */
	public function test_confirm_form_submission_returns_filtered_success_response() {
		$this->record_confirm_filter = function ( $response ) {
			return $response->mark_as_success()->set_success_message( 'Confirmed.' );
		};
		add_filter( 'otter_form_record_confirm', $this->record_confirm_filter );

		$request  = new WP_REST_Request( 'GET', '/otter/v1/form/confirm' );
		$response = $this->form_server->confirm_form_submission( $request );
		$data     = $response->get_data();

		$this->assertTrue( $data['success'] );
		$this->assertSame( 'Confirmed.', $data['submitMessage'] );
	}

	/**
	 * Ensure confirmation exceptions map to the Stripe session validation code.
	 */
	public function test_confirm_form_submission_maps_exceptions_to_stripe_error() {
		$this->record_confirm_filter = function () {
			throw new Exception( 'Invalid session.' );
		};
		add_filter( 'otter_form_record_confirm', $this->record_confirm_filter );

		$request  = new WP_REST_Request( 'GET', '/otter/v1/form/confirm' );
		$response = $this->form_server->confirm_form_submission( $request );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_RUNTIME_STRIPE_SESSION_VALIDATION, $data['code'] );
		$this->assertSame( array( 'Invalid session.' ), $data['reasons'] );
	}

	/**
	 * Ensure the frontend REST route requires a REST nonce before submitting.
	 */
	public function test_frontend_rest_route_requires_valid_rest_nonce() {
		$this->mock_mail();
		$this->register_form_routes();

		$response = rest_do_request( $this->get_frontend_request() );

		$this->assertSame( 401, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
		$this->assertCount( 0, $this->mail_requests );
	}

	/**
	 * Ensure the frontend REST route accepts a valid REST nonce and submits.
	 */
	public function test_frontend_rest_route_accepts_valid_rest_nonce() {
		$this->mock_mail();
		$this->register_form_routes();

		$request = $this->get_frontend_request();
		$request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$response = rest_do_request( $request );
		$data     = $response->get_data();

		$this->assertSame( 200, $response->get_status() );
		$this->assertTrue( $data['success'] );
		$this->assertSame( Form_Data_Response::SUCCESS_EMAIL_SEND, $data['code'] );
		$this->assertCount( 1, $this->mail_requests );
	}

	/**
	 * Ensure the editor REST route requires edit_posts.
	 */
	public function test_editor_rest_route_requires_edit_posts_capability() {
		$this->mock_mail();
		$this->register_form_routes();
		wp_set_current_user( 0 );

		$response = rest_do_request(
			$this->get_editor_request(
				array(
					'handler' => 'testEmail',
					'payload' => array(
						'provider'   => 'default',
						'formOption' => 'contact_form',
						'to'         => 'owner@example.com',
					),
				)
			)
		);

		$this->assertSame( 401, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
		$this->assertCount( 0, $this->mail_requests );
	}

	/**
	 * Ensure editors can use the editor REST route.
	 */
	public function test_editor_rest_route_allows_editor_user() {
		$this->mock_mail();
		$this->register_form_routes();

		$user_id = self::factory()->user->create(
			array(
				'role' => 'editor',
			)
		);
		wp_set_current_user( $user_id );

		$response = rest_do_request(
			$this->get_editor_request(
				array(
					'handler' => 'testEmail',
					'payload' => array(
						'provider'   => 'default',
						'formOption' => 'contact_form',
						'to'         => 'owner@example.com',
					),
				)
			)
		);
		$data     = $response->get_data();

		$this->assertSame( 200, $response->get_status() );
		$this->assertTrue( $data['success'] );
		$this->assertSame( 'owner@example.com', $this->mail_requests[0]['to'] );
	}

	/**
	 * Ensure the confirmation REST route requires a valid checkout session.
	 */
	public function test_confirm_rest_route_requires_checkout_session() {
		$this->register_form_routes();

		$response = rest_do_request( new WP_REST_Request( 'GET', '/otter/v1/form/confirm' ) );

		$this->assertSame( 401, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
	}

	/**
	 * Ensure the confirmation REST route dispatches when checkout session is present.
	 */
	public function test_confirm_rest_route_accepts_checkout_session() {
		$this->register_form_routes();
		$this->record_confirm_filter = function ( $response ) {
			return $response->mark_as_success()->set_success_message( 'Confirmed through REST.' );
		};
		add_filter( 'otter_form_record_confirm', $this->record_confirm_filter );

		$request = new WP_REST_Request( 'GET', '/otter/v1/form/confirm' );
		$request->set_param( 'stripe_checkout', 'cs_test_123' );

		$response = rest_do_request( $request );
		$data     = $response->get_data();

		$this->assertSame( 200, $response->get_status() );
		$this->assertTrue( $data['success'] );
		$this->assertSame( 'Confirmed through REST.', $data['submitMessage'] );
	}

	/**
	 * Configure mocks, options and request overrides for a delivery failure code.
	 *
	 * @param int|string $code The response error code.
	 * @return array Request overrides for get_frontend_request().
	 */
	private function configure_delivery_failure_case( $code ) {
		$code = (string) $code;

		$subscribe_codes = array(
			Form_Data_Response::ERROR_PROVIDER_SUBSCRIBE_ERROR,
			Form_Data_Response::ERROR_PROVIDER_CREDENTIAL_ERROR,
			Form_Data_Response::ERROR_PROVIDER_INVALID_KEY,
			Form_Data_Response::ERROR_PROVIDER_INVALID_API_KEY_FORMAT,
			Form_Data_Response::ERROR_PROVIDER_INVALID_EMAIL,
			Form_Data_Response::ERROR_MISSING_EMAIL,
		);

		switch ( $code ) {
			case Form_Data_Response::ERROR_EMAIL_NOT_SEND:
				$this->mock_mail( false );
				return array();

			case Form_Data_Response::ERROR_CAPTCHA_PROVIDER_UNREACHABLE:
				$this->mock_mail();
				update_option( 'themeisle_blocks_form_emails', array( $this->get_form_option( array( 'hasCaptcha' => true ) ) ) );
				update_option( 'themeisle_google_captcha_api_secret_key', 'secret-key' );
				$this->http_filter = function () {
					return new WP_Error( 'http_request_failed', 'Connection timed out.' );
				};
				add_filter( 'pre_http_request', $this->http_filter, 10, 3 );

				return array(
					'payload' => array(
						'token' => 'captcha-token',
					),
				);

			case Form_Data_Response::ERROR_WEBHOOK_COULD_NOT_TRIGGER:
				$this->mock_mail();
				$this->after_submit_action = function ( $form_data ) {
					$form_data->add_warning( Form_Data_Response::ERROR_WEBHOOK_COULD_NOT_TRIGGER, 'Webhook endpoint unreachable.' );

					return $form_data;
				};
				add_action( 'otter_form_after_submit', $this->after_submit_action, 5 );

				return array();

			case Form_Data_Response::ERROR_PROVIDER_NOT_REGISTERED:
				$this->mock_mail();
				update_option(
					'themeisle_blocks_form_emails',
					array(
						$this->get_form_option(
							array(
								'integration' => array(
									'provider' => 'missing-provider',
									'apiKey'   => 'api-key',
									'listId'   => 'list-id',
								),
							)
						),
					)
				);

				return array();

			case Form_Data_Response::ERROR_RUNTIME_ERROR:
				$this->mock_mail();
				$this->form_providers->providers['default']['frontend']['submit'] = function () {
					throw new Exception( 'Provider exploded.' );
				};

				return array();
		}

		if ( in_array( $code, $subscribe_codes, true ) ) {
			$this->mock_mail();
			$error_code = $code;

			$this->form_providers->providers['failing-provider'] = array(
				'frontend' => array(
					'submit' => function ( $form_data ) use ( $error_code ) {
						$form_data->set_error( $error_code );
					},
				),
				'editor'   => array(),
			);

			update_option(
				'themeisle_blocks_form_emails',
				array(
					$this->get_form_option(
						array(
							'integration' => array(
								'provider' => 'failing-provider',
								'apiKey'   => 'api-key',
								'listId'   => 'list-id',
							),
						)
					),
				)
			);

			return array();
		}

		$this->fail( 'Unhandled delivery failure code: ' . $code );
	}

	/**
	 * Create an upload fixture under uploads/otter-tests.
	 *
	 * @param string $name The file name.
	 * @return string The absolute file path.
	 */
	private function create_upload_fixture( $name ) {
		$uploads = wp_upload_dir();
		wp_mkdir_p( $uploads['basedir'] . '/otter-tests' );

		$path = $uploads['basedir'] . '/otter-tests/' . $name;
		file_put_contents( $path, 'integration test file' );

		return $path;
	}

	/**
	 * Remove upload fixtures created during tests.
	 *
	 * @return void
	 */
	private function cleanup_upload_fixtures() {
		$uploads = wp_upload_dir();
		$dir     = $uploads['basedir'] . '/otter-tests';

		if ( ! is_dir( $dir ) ) {
			return;
		}

		foreach ( glob( $dir . '/*' ) as $file ) {
			if ( is_file( $file ) ) {
				wp_delete_file( $file );
			}
		}

		@rmdir( $dir );
	}

	/**
	 * Ensure the default provider is available when running this class directly.
	 */
	private function ensure_default_provider() {
		if ( isset( $this->form_providers->providers['default'] ) ) {
			return;
		}

		$this->form_providers->providers['default'] = array(
			'frontend' => array(
				'submit' => array( $this->form_server, 'send_default_email' ),
			),
			'editor'   => array(
				'testEmail' => array( $this->form_server, 'send_test_email' ),
			),
		);
	}

	/**
	 * Get all the stored Submission Records.
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
	 * Mock wp_mail and capture calls.
	 *
	 * @param bool $result Mail result.
	 * @return void
	 */
	private function mock_mail( $result = true ) {
		$this->mail_filter = function ( $preempt, $atts ) use ( $result ) {
			$this->mail_requests[] = $atts;
			return $result;
		};
		add_filter( 'pre_wp_mail', $this->mail_filter, 10, 2 );
	}

	/**
	 * Mock reCAPTCHA HTTP verification.
	 *
	 * @param bool $success Captcha success state.
	 * @return void
	 */
	private function mock_captcha( $success ) {
		update_option( 'themeisle_google_captcha_api_secret_key', 'secret-key' );
		$this->http_filter = function () use ( $success ) {
			return array(
				'response' => array(
					'code' => 200,
				),
				'body'     => wp_json_encode(
					array(
						'success' => $success,
					)
				),
			);
		};
		add_filter( 'pre_http_request', $this->http_filter, 10, 3 );
	}

	/**
	 * Get a frontend request.
	 *
	 * @param array       $overrides Request overrides.
	 * @param string|null $save_mode Save mode header.
	 * @return WP_REST_Request
	 */
	private function get_frontend_request( $overrides = array(), $save_mode = null ) {
		$request = new WP_REST_Request( 'POST', '/otter/v1/form/frontend' );
		$request->set_body( wp_json_encode( $this->merge_request_data( $this->get_base_form_data(), $overrides ) ) );

		if ( null !== $save_mode ) {
			$request->set_header( 'O-Form-Save-Mode', $save_mode );
		}

		return $request;
	}

	/**
	 * Get an editor request.
	 *
	 * @param array $data Request data.
	 * @return WP_REST_Request
	 */
	private function get_editor_request( $data ) {
		$request = new WP_REST_Request( 'POST', '/otter/v1/form/editor' );
		$request->set_body( wp_json_encode( $data ) );

		return $request;
	}

	/**
	 * Create a form data request object with anti-spam payload.
	 *
	 * @param int|string $anti_spam_time Anti-spam timer value.
	 * @param string     $anti_spam_honey_pot Honeypot value.
	 * @return Form_Data_Request
	 */
	private function create_anti_spam_form_data_request( $anti_spam_time, $anti_spam_honey_pot ) {
		$request = new WP_REST_Request( 'POST', '/otter/v1/form/frontend' );
		$request->set_body(
			wp_json_encode(
				array(
					'handler' => 'submit',
					'payload' => array(
						'antiSpamTime'     => $anti_spam_time,
						'antiSpamHoneyPot' => $anti_spam_honey_pot,
					),
				)
			)
		);

		return new Form_Data_Request( $request );
	}

	/**
	 * Register form REST routes on a fresh test REST server.
	 *
	 * @return void
	 */
	private function register_form_routes() {
		global $wp_rest_server;

		$wp_rest_server = new Spy_REST_Server();
		do_action( 'rest_api_init', $wp_rest_server );
	}

	/**
	 * Get default form request data.
	 *
	 * @return array
	 */
	private function get_base_form_data() {
		return array(
			'handler' => 'submit',
			'payload' => array(
				'nonceValue'       => wp_create_nonce( 'form-verification' ),
				'postUrl'          => 'https://example.com/contact',
				'formId'           => 'contact-form',
				'formOption'       => 'contact_form',
				'antiSpamTime'     => Form_Server::ANTI_SPAM_TIMEOUT,
				'antiSpamHoneyPot' => '',
				'formInputsData'   => array(
					array(
						'id'       => 'name-field',
						'type'     => 'text',
						'label'    => 'Name',
						'value'    => 'Ada Lovelace',
						'metadata' => array(
							'position' => 0,
						),
					),
					array(
						'id'       => 'email-field',
						'type'     => 'email',
						'label'    => 'Email',
						'value'    => 'ada@example.com',
						'metadata' => array(
							'position' => 1,
						),
					),
				),
			),
		);
	}

	/**
	 * Get default form option data.
	 *
	 * @param array $overrides Option overrides.
	 * @return array
	 */
	private function get_form_option( $overrides = array() ) {
		return array_merge(
			array(
				'form'                    => 'contact_form',
				'email'                   => 'forms@example.com',
				'redirectLink'            => 'https://example.com/thanks',
				'emailSubject'            => 'Contact request',
				'submitMessage'           => 'Thanks for writing.',
				'errorMessage'            => 'Could not submit.',
				'fromName'                => 'Otter Forms',
				'fromEmail'               => 'noreply@example.com',
				'submissionsSaveLocation' => 'email',
			),
			$overrides
		);
	}

	/**
	 * Recursively merge request overrides.
	 *
	 * @param array $data Request data.
	 * @param array $overrides Overrides.
	 * @return array
	 */
	private function merge_request_data( $data, $overrides ) {
		foreach ( $overrides as $key => $value ) {
			if ( is_array( $value ) && isset( $data[ $key ] ) && is_array( $data[ $key ] ) ) {
				$data[ $key ] = $this->merge_request_data( $data[ $key ], $value );
			} else {
				$data[ $key ] = $value;
			}
		}

		return $data;
	}
}
