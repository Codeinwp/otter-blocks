<?php
/**
 * Class Test_Form_Server
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Integration\Form_Providers;
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

		$this->form_providers->providers = $this->original_providers;

		delete_option( 'themeisle_blocks_form_emails' );
		delete_option( 'themeisle_blocks_form_fields_option' );
		delete_option( 'themeisle_google_captcha_api_secret_key' );
		delete_transient( 'contact_form_autoresponder_error' );

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
	 * Ensure default email failures are returned with the configured display error.
	 */
	public function test_frontend_submission_returns_email_error_when_default_mail_fails() {
		$this->mock_mail( false );

		$response = $this->form_server->frontend( $this->get_frontend_request() );
		$data     = $response->get_data();

		$this->assertFalse( $data['success'] );
		$this->assertSame( Form_Data_Response::ERROR_EMAIL_NOT_SEND, $data['code'] );
		$this->assertSame( 'Could not submit.', $data['displayError'] );
		$this->assertCount( 1, $this->mail_requests );
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
		$this->assertCount( 0, $this->mail_requests );
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
