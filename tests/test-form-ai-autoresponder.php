<?php
/**
 * Class Test_Form_AI_Autoresponder
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Form_Submissions;
use ThemeIsle\GutenbergBlocks\Server\AI_Client_Adaptor;
use ThemeIsle\GutenbergBlocks\Server\AI_Response;
use ThemeIsle\GutenbergBlocks\Server\Form_Server;
use ThemeIsle\OtterPro\Plugins\Form_Pro_Features;

require_once __DIR__ . '/ai-client-mock.php';

/**
 * Backend test double that returns a queued sequence of generate() results.
 *
 * The AI autoresponder makes two backend calls per submission: call 1 is the
 * generation, call 2 is the validation. This fake lets each test drive both
 * calls independently (each queued entry may be an Otter AI success envelope or
 * a WP_Error) and records every payload it received.
 */
class Queued_AI_Backend implements \ThemeIsle\GutenbergBlocks\Server\AI_Backend {

	/**
	 * Queued generate() return values, consumed in order.
	 *
	 * @var array<int, mixed>
	 */
	private $responses;

	/**
	 * Every payload passed to generate().
	 *
	 * @var array<int, array<string, mixed>>
	 */
	public $payloads = array();

	/**
	 * Constructor.
	 *
	 * @param array<int, mixed> $responses Queued generate() results.
	 */
	public function __construct( array $responses = array() ) {
		$this->responses = $responses;
	}

	/**
	 * Whether this backend can currently serve generation requests.
	 *
	 * @return bool
	 */
	public function is_available() {
		return true;
	}

	/**
	 * Return the next queued response.
	 *
	 * @param array<string, mixed> $payload The OpenAI-format payload.
	 * @return mixed
	 */
	public function generate( array $payload ) {
		$this->payloads[] = $payload;

		if ( empty( $this->responses ) ) {
			return AI_Response::error( 'no_more_responses', 'Queue exhausted.', 'test', 500 );
		}

		return array_shift( $this->responses );
	}
}

/**
 * AI Autoresponder generate -> validate -> fallback decision tests.
 *
 * Mirrors the construction/capture style of Test_Form_Pro_Delivery: it drives a
 * real frontend submission through Form_Server, wires the Pro send_autoresponder
 * hook explicitly, captures the email via the pre_wp_mail filter, and inspects
 * the audit persisted on the Submission Record.
 *
 * The AI backend is injected with a queued fake through the otter_ai_backends /
 * otter_ai_backend filters; the lite Form_Submissions hooks (record save and
 * record_delivery_status) are already wired at plugin bootstrap, so the audit
 * meta is persisted to the Record automatically.
 */
class Test_Form_AI_Autoresponder extends WP_UnitTestCase {

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
	 * @var Queued_AI_Backend|null
	 */
	private $backend = null;

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

		foreach ( $this->added_hooks as $hook ) {
			remove_filter( $hook[0], $hook[1], $hook[2] );
		}

		remove_all_filters( 'otter_ai_backends' );
		remove_all_filters( 'otter_ai_backend' );
		remove_all_filters( 'otter_form_ai_autoresponder_body' );

		// Clear the cached registry so the next test rebuilds it cleanly.
		\ThemeIsle\GutenbergBlocks\Server\AI_Backend_Resolver::reset_cache();

		delete_option( 'themeisle_blocks_form_emails' );
		delete_option( 'themeisle_blocks_form_fields_option' );
		delete_option( 'themeisle_otter_ai_usage' );

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
	 * Inject a queued AI backend through the registry filters and select it.
	 *
	 * @param array<int, mixed> $responses Queued generate() results (call 1 = generation, call 2 = validation).
	 * @return Queued_AI_Backend
	 */
	private function inject_backend( array $responses ) {
		$this->backend = new Queued_AI_Backend( $responses );

		add_filter(
			'otter_ai_backends',
			function ( $backends ) {
				$backends['queued_test'] = $this->backend;
				return $backends;
			}
		);

		add_filter(
			'otter_ai_backend',
			function () {
				return 'queued_test';
			}
		);

		// The resolver caches its backend registry statically for the whole
		// PHPUnit process; reset it so the injected filters take effect.
		\ThemeIsle\GutenbergBlocks\Server\AI_Backend_Resolver::reset_cache();

		return $this->backend;
	}

	/**
	 * Capture wp_mail calls; every send succeeds.
	 */
	private function mock_mail() {
		$this->mail_filter = function ( $preempt, $atts ) {
			$this->mail_requests[] = $atts;
			return true;
		};
		add_filter( 'pre_wp_mail', $this->mail_filter, 10, 2 );
	}

	/**
	 * Find the autoresponder email (the one addressed to the submitter).
	 *
	 * @return array|null
	 */
	private function get_autoresponder_mail() {
		foreach ( $this->mail_requests as $atts ) {
			if ( isset( $atts['to'] ) && 'ada@example.com' === $atts['to'] ) {
				return $atts;
			}
		}
		return null;
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
	 * Read the persisted AI autoresponder audit from the single Record.
	 *
	 * @return mixed
	 */
	private function get_audit() {
		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		return get_post_meta( $records[0]->ID, Form_Submissions::AI_AUTORESPONDER_META_KEY, true );
	}

	/**
	 * Build a frontend submission request with a Name and an Email field.
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
						'postUrl'          => 'https://example.com/ai-autoresponder',
						'formId'           => 'ai-autoresponder-form',
						'formOption'       => 'ai_autoresponder_form',
						'antiSpamTime'     => Form_Server::ANTI_SPAM_TIMEOUT,
						'antiSpamHoneyPot' => '',
						'formInputsData'   => array(
							array(
								'id'       => 'wp-block-themeisle-blocks-form-input-ai00001',
								'type'     => 'text',
								'label'    => 'Name',
								'value'    => 'Ada Lovelace',
								'metadata' => array( 'position' => 0 ),
							),
							array(
								'id'       => 'wp-block-themeisle-blocks-form-input-ai00002',
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
	 * Store the form option entry, layering autoresponder/aiAutoresponder overrides.
	 *
	 * @param array $overrides Entry overrides.
	 */
	private function set_form_option( $overrides = array() ) {
		update_option(
			'themeisle_blocks_form_emails',
			array(
				array_merge(
					array(
						'form'          => 'ai_autoresponder_form',
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
	 * Wire the Pro autoresponder so it runs before the lite delivery-status
	 * recorder (registered at PHP_INT_MAX) which persists the audit meta.
	 */
	private function wire_autoresponder() {
		$this->add_test_hook( 'otter_form_after_submit', array( $this->pro_features, 'send_autoresponder' ), 99 );
	}

	/**
	 * Run a submission and return the response data.
	 *
	 * @return array
	 */
	private function submit() {
		$response = $this->form_server->frontend( $this->get_frontend_request() );
		return $response->get_data();
	}

	/**
	 * Happy path: generation returns a good body and validation approves it. The
	 * AI body is emailed (run through wpautop), the audit outcome is `ai`, the
	 * verdict is valid, and the two calls' tokens are summed.
	 */
	public function test_ai_body_is_sent_when_validation_passes() {
		$this->mock_mail();
		$this->inject_backend(
			array(
				AI_Response::success( 'Hi Ada, thanks for reaching out. We received your message.', 30, 'text' ),
				AI_Response::success( wp_json_encode( array( 'valid' => true, 'reason' => 'on-topic and safe' ) ), 12, 'json' ),
			)
		);

		$this->set_form_option(
			array(
				'autoresponder'   => array(
					'subject' => 'Thanks for your message',
					'body'    => '<p>Static fallback body.</p>',
				),
				'aiAutoresponder' => array(
					'enabled' => true,
					'prompt'  => 'Reply to %wp-block-themeisle-blocks-form-input-ai00001%.',
				),
			)
		);

		$this->wire_autoresponder();

		$data = $this->submit();
		$this->assertTrue( $data['success'] );

		// Two backend calls were made: generation then validation.
		$this->assertCount( 2, $this->backend->payloads );

		// The AI body was emailed (wpautop wraps it in a paragraph), not the static body.
		$mail = $this->get_autoresponder_mail();
		$this->assertNotNull( $mail );
		$this->assertStringContainsString( 'Hi Ada, thanks for reaching out.', $mail['message'] );
		$this->assertStringNotContainsString( 'Static fallback body.', $mail['message'] );
		$this->assertSame( 'Thanks for your message', $mail['subject'] );

		// The audit records the `ai` outcome with the summed tokens.
		$audit = $this->get_audit();
		$this->assertSame( 'ai', $audit['outcome'] );
		$this->assertTrue( (bool) $audit['valid'] );
		$this->assertSame( 42, (int) $audit['used_tokens'] );
		$this->assertStringContainsString( 'Hi Ada', $audit['generated_body'] );
	}

	/**
	 * Validation rejects the candidate: the static fallback body is emailed (not
	 * the AI body), the audit outcome is `fallback`, and the reason is recorded.
	 */
	public function test_fallback_body_is_sent_when_validation_rejects() {
		$this->mock_mail();
		$this->inject_backend(
			array(
				AI_Response::success( 'A reply that quotes something hostile.', 30, 'text' ),
				AI_Response::success( wp_json_encode( array( 'valid' => false, 'reason' => 'echoes hostile language' ) ), 9, 'json' ),
			)
		);

		$this->set_form_option(
			array(
				'autoresponder'   => array(
					'subject' => 'Thanks for your message',
					'body'    => '<p>We will reply soon.</p>',
				),
				'aiAutoresponder' => array(
					'enabled' => true,
					'prompt'  => 'Reply nicely.',
				),
			)
		);

		$this->wire_autoresponder();

		$data = $this->submit();
		$this->assertTrue( $data['success'] );

		$mail = $this->get_autoresponder_mail();
		$this->assertNotNull( $mail );
		$this->assertStringContainsString( 'We will reply soon.', $mail['message'] );
		$this->assertStringNotContainsString( 'quotes something hostile', $mail['message'] );

		$audit = $this->get_audit();
		$this->assertSame( 'fallback', $audit['outcome'] );
		$this->assertFalse( (bool) $audit['valid'] );
		$this->assertSame( 'echoes hostile language', $audit['reason'] );
		// The rejected candidate is still recorded for the audit log.
		$this->assertStringContainsString( 'quotes something hostile', $audit['generated_body'] );

		$records = $this->get_form_records();
		$record_id = $records[0]->ID;

		// The AI failure is recorded as an issue (Errors metabox)...
		$issues = get_post_meta( $record_id, Form_Submissions::ISSUES_META_KEY, true );
		$codes  = is_array( $issues ) ? wp_list_pluck( $issues, 'code' ) : array();
		$this->assertContains(
			\ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_AI_VALIDATION_FAILED,
			$codes
		);

		// ...but delivery is still COMPLETE, because the fallback email was sent.
		$this->assertSame(
			Form_Submissions::DELIVERY_STATUS_COMPLETE,
			get_post_meta( $record_id, Form_Submissions::DELIVERY_STATUS_META_KEY, true )
		);
	}

	/**
	 * Generation fails (WP_Error on the first call): the static fallback body is
	 * emailed, the audit outcome is `fallback`, the generation warning is added,
	 * and no validation call is made.
	 */
	public function test_fallback_when_generation_errors() {
		$this->mock_mail();
		$this->inject_backend(
			array(
				new WP_Error( 'prompt_client_error', 'Provider unavailable.' ),
			)
		);

		$this->set_form_option(
			array(
				'autoresponder'   => array(
					'subject' => 'Thanks for your message',
					'body'    => '<p>Fallback from generation error.</p>',
				),
				'aiAutoresponder' => array(
					'enabled' => true,
					'prompt'  => 'Reply nicely.',
				),
			)
		);

		$captured_warnings = array();
		$this->add_test_hook(
			'otter_form_after_submit',
			function ( $form_data ) use ( &$captured_warnings ) {
				$captured_warnings = $form_data->get_warning_codes();
				return $form_data;
			},
			100
		);

		$this->wire_autoresponder();

		$data = $this->submit();
		$this->assertTrue( $data['success'] );

		// Only the generation call ran; validation was skipped after the error.
		$this->assertCount( 1, $this->backend->payloads );

		$mail = $this->get_autoresponder_mail();
		$this->assertNotNull( $mail );
		$this->assertStringContainsString( 'Fallback from generation error.', $mail['message'] );

		$audit = $this->get_audit();
		$this->assertSame( 'fallback', $audit['outcome'] );
		$this->assertFalse( (bool) $audit['valid'] );

		// The generation-failure warning code is recorded on the submission.
		$codes = wp_list_pluck( $captured_warnings, 'code' );
		$this->assertContains(
			\ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_AI_GENERATION_FAILED,
			$codes
		);
	}

	/**
	 * AI fails and the fallback body is empty: nothing is emailed and the audit
	 * outcome is `none`.
	 */
	public function test_no_email_when_ai_fails_and_fallback_empty() {
		$this->mock_mail();
		$this->inject_backend(
			array(
				new WP_Error( 'prompt_client_error', 'Provider unavailable.' ),
			)
		);

		$this->set_form_option(
			array(
				'autoresponder'   => array(
					'subject' => 'Thanks for your message',
					'body'    => '   ', // Whitespace-only fallback is treated as empty.
				),
				'aiAutoresponder' => array(
					'enabled' => true,
					'prompt'  => 'Reply nicely.',
				),
			)
		);

		$this->wire_autoresponder();

		$data = $this->submit();
		$this->assertTrue( $data['success'] );

		// No autoresponder email was sent to the submitter.
		$this->assertNull( $this->get_autoresponder_mail() );

		$audit = $this->get_audit();
		$this->assertSame( 'none', $audit['outcome'] );
		$this->assertFalse( (bool) $audit['valid'] );
	}

	/**
	 * Regression: an autoresponder configured with a subject but no `body` key
	 * (AI on, fallback never set) must not raise an "Undefined array key" warning
	 * when generation fails and the fallback path runs. PHPUnit turns the notice
	 * into a failure, so reaching the assertions proves the access is guarded.
	 */
	public function test_missing_fallback_body_key_does_not_warn() {
		$this->mock_mail();
		$this->inject_backend(
			array(
				new WP_Error( 'prompt_client_error', 'Provider unavailable.' ),
			)
		);

		// Note: no 'body' key at all (the reported scenario).
		$this->set_form_option(
			array(
				'autoresponder'   => array(
					'subject' => 'Thanks for your message',
				),
				'aiAutoresponder' => array(
					'enabled' => true,
					'prompt'  => 'Reply nicely.',
				),
			)
		);

		$this->wire_autoresponder();

		$data = $this->submit();
		$this->assertTrue( $data['success'] );

		// Empty (missing) fallback body → nothing sent, outcome `none`, no warning.
		$this->assertNull( $this->get_autoresponder_mail() );
		$this->assertSame( 'none', $this->get_audit()['outcome'] );
	}

	/**
	 * AI disabled: behaves like the static autoresponder. No backend call is
	 * made and no AI audit meta is written.
	 */
	public function test_ai_disabled_uses_static_path_without_audit() {
		$this->mock_mail();
		$this->inject_backend(
			array(
				AI_Response::success( 'Should never be used.', 10, 'text' ),
			)
		);

		$this->set_form_option(
			array(
				'autoresponder'   => array(
					'subject' => 'Thanks for your message',
					'body'    => '<p>Static autoresponder body.</p>',
				),
				'aiAutoresponder' => array(
					'enabled' => false,
					'prompt'  => 'Reply nicely.',
				),
			)
		);

		$this->wire_autoresponder();

		$data = $this->submit();
		$this->assertTrue( $data['success'] );

		// The AI code path was never taken.
		$this->assertCount( 0, $this->backend->payloads );

		// The static body is emailed.
		$mail = $this->get_autoresponder_mail();
		$this->assertNotNull( $mail );
		$this->assertStringContainsString( 'Static autoresponder body.', $mail['message'] );

		// No AI audit meta is written.
		$records = $this->get_form_records();
		$this->assertCount( 1, $records );
		$this->assertEmpty( get_post_meta( $records[0]->ID, Form_Submissions::AI_AUTORESPONDER_META_KEY, true ) );
	}

	/**
	 * The otter_form_ai_autoresponder_body filter overrides the final emailed body.
	 */
	public function test_body_filter_overrides_final_body() {
		$this->mock_mail();
		$this->inject_backend(
			array(
				AI_Response::success( 'Original AI body.', 20, 'text' ),
				AI_Response::success( wp_json_encode( array( 'valid' => true, 'reason' => 'ok' ) ), 5, 'json' ),
			)
		);

		$this->set_form_option(
			array(
				'autoresponder'   => array(
					'subject' => 'Thanks for your message',
					'body'    => '<p>Static fallback body.</p>',
				),
				'aiAutoresponder' => array(
					'enabled' => true,
					'prompt'  => 'Reply nicely.',
				),
			)
		);

		$this->add_test_hook(
			'otter_form_ai_autoresponder_body',
			function () {
				return '<p>Filtered final body.</p>';
			},
			10
		);

		$this->wire_autoresponder();

		$data = $this->submit();
		$this->assertTrue( $data['success'] );

		$mail = $this->get_autoresponder_mail();
		$this->assertNotNull( $mail );
		$this->assertStringContainsString( 'Filtered final body.', $mail['message'] );
		$this->assertStringNotContainsString( 'Original AI body.', $mail['message'] );
	}
}
