<?php
/**
 * Plugin Name: Otter E2E AI Provider Mock
 * Description: Test-only MU-plugin that intercepts api.openai.com HTTP requests server-side, so the WordPress 7.0 AI Client path (Otter's `wp-ai-client` backend) runs deterministically in E2E without real credentials or network access. Mounted by wp-env in the `tests` env.
 * Author: ThemeIsle (E2E)
 *
 * The `ai-provider-for-openai` plugin (mounted via .wp-env.json) talks to two
 * endpoints, both proxied through the WP HTTP API (so `pre_http_request` applies):
 *  - GET  /v1/models     — model discovery, used by is_supported_for_text_generation().
 *  - POST /v1/responses  — text generation (OpenAI Responses API).
 *
 * Otter's legacy backend (`openai-key`) talks to POST /v1/chat/completions;
 * that endpoint is mocked only for the sentinel LEGACY_MOCK_KEY so the
 * dashboard key-validation spec keeps its real-endpoint behavior.
 *
 * When the generation request asks for structured JSON output
 * (`text.format.type === 'json_schema'`, the translation of Otter's forced
 * function calling), the mock returns a form-fields JSON payload; otherwise it
 * returns deterministic HTML content.
 *
 * @package otter-blocks
 */

namespace ThemeIsle\OtterE2E\AiProviderMock;

// Defence-in-depth: refuse to run in production, even if the file is mismounted.
if ( defined( 'WP_ENVIRONMENT_TYPE' ) && 'production' === constant( 'WP_ENVIRONMENT_TYPE' ) ) {
	return;
}

const TEXT_RESPONSE = '<h2>WP AI Client mock response</h2><p>Deterministic content generated through the WordPress AI Client.</p>';

const FORM_RESPONSE = '{"fields":[{"label":"Full Name","type":"text","required":true},{"label":"Email Address","type":"email","required":true}]}';

const LEGACY_TEXT_RESPONSE = '<h2>Legacy OpenAI mock response</h2><p>Deterministic content generated through the Otter OpenAI backend.</p>';

/**
 * Sentinel API key for the legacy `/chat/completions` mock. Requests bearing
 * any other key (the preseeded dashboard key, the literal 'test' used by the
 * key-validation spec) pass through untouched.
 */
const LEGACY_MOCK_KEY = 'sk-otter-e2e-legacy-mock';

/**
 * Marker a spec can type into the prompt to make the legacy mock return an
 * empty completion (no choices), exercising the empty-response error path.
 */
const LEGACY_EMPTY_MARKER = 'otter-e2e-empty';

/**
 * Whether an outbound request body is one of the content-generator block-
 * generation phases. Both `block-generation.ts` prompts ask for strict JSON;
 * the content-generator parses the model reply with `JSON.parse`, so the mock
 * must answer with JSON (not HTML) or no blocks are produced.
 *
 * @param string $body Raw outbound request body.
 * @return bool
 */
function is_block_generation_request( $body ) {
	return false !== strpos( $body, 'planning a WordPress block layout' )
		|| false !== strpos( $body, 'planning the structure' )
		|| false !== strpos( $body, 'Fill in the attributes' );
}

/**
 * Deterministic `{ rationale, roots }` reply for the block-generation pipeline.
 *
 * Phase 1 (structure) plans a single heading; phase 3 (attributes) fills it
 * with $headline so a spec can assert the rendered text. A lone core/heading
 * survives `validateStructure`/`validateGeneratedBlocks` with no ancestor.
 *
 * @param string $body     Raw outbound request body (used to pick the phase).
 * @param string $headline Heading text returned by the attribute phase.
 * @return string JSON-encoded payload for the assistant message content.
 */
function block_generation_payload( $body, $headline ) {
	if ( false !== strpos( $body, 'Fill in the attributes' ) ) {
		return wp_json_encode(
			array(
				'rationale' => array( 'Deterministic E2E content.' ),
				'roots'     => array(
					array(
						'name'        => 'core/heading',
						'attributes'  => array( 'content' => $headline ),
						'innerBlocks' => array(),
					),
				),
			)
		);
	}

	return wp_json_encode(
		array(
			'rationale' => array( 'Deterministic E2E structure.' ),
			'roots'     => array(
				array(
					'name'        => 'core/heading',
					'innerBlocks' => array(),
				),
			),
		)
	);
}

/**
 * Build a WP HTTP API response array with a JSON body.
 *
 * @param array<string, mixed> $data The response data.
 * @return array<string, mixed>
 */
function respond( $data ) {
	return array(
		'headers'  => array( 'Content-Type' => 'application/json' ),
		'body'     => wp_json_encode( $data ),
		'response' => array(
			'code'    => 200,
			'message' => 'OK',
		),
		'cookies'  => array(),
		'filename' => null,
	);
}

/**
 * Intercept api.openai.com requests with canned responses.
 *
 * @param false|array|\WP_Error $preempt The preemptive response.
 * @param array<string, mixed>  $args    The request arguments.
 * @param string                $url     The request URL.
 * @return false|array<string, mixed>|\WP_Error
 */
function mock_openai_http( $preempt, $args, $url ) {
	if ( false === strpos( $url, 'api.openai.com' ) ) {
		return $preempt;
	}

	// Model discovery: GET /v1/models.
	if ( false !== strpos( $url, '/models' ) ) {
		return respond(
			array(
				'data' => array(
					array( 'id' => 'gpt-4o' ),
					array( 'id' => 'gpt-4o-mini' ),
				),
			)
		);
	}

	// Text generation: POST /v1/responses.
	if ( false !== strpos( $url, '/responses' ) ) {
		$raw_body = isset( $args['body'] ) && is_string( $args['body'] ) ? $args['body'] : '';
		$body     = '' !== $raw_body ? json_decode( $raw_body, true ) : array();
		$is_json  = isset( $body['text']['format']['type'] ) && 'json_schema' === $body['text']['format']['type'];

		if ( $is_json ) {
			$text = FORM_RESPONSE;
		} elseif ( is_block_generation_request( $raw_body ) ) {
			$headline = false !== stripos( $raw_body, 'space nation' )
				? 'Discover the Next Frontier: Space Nation on the Rise'
				: 'WP AI Client mock response';
			$text     = block_generation_payload( $raw_body, $headline );
		} else {
			$text = TEXT_RESPONSE;
		}

		return respond(
			array(
				'id'     => 'resp_otter_e2e_mock',
				'status' => 'completed',
				'output' => array(
					array(
						'type'    => 'message',
						'role'    => 'assistant',
						'content' => array(
							array(
								'type' => 'output_text',
								'text' => $text,
							),
						),
					),
				),
				'usage'  => array(
					'input_tokens'  => 31,
					'output_tokens' => 38,
					'total_tokens'  => 69,
				),
			)
		);
	}

	// Legacy backend: POST /v1/chat/completions, only for the sentinel key so
	// the dashboard key-validation spec keeps hitting the real endpoint.
	if ( false !== strpos( $url, '/chat/completions' ) ) {
		$auth = isset( $args['headers']['Authorization'] ) && is_string( $args['headers']['Authorization'] ) ? $args['headers']['Authorization'] : '';

		if ( 'Bearer ' . LEGACY_MOCK_KEY !== $auth ) {
			return $preempt;
		}

		$body = isset( $args['body'] ) && is_string( $args['body'] ) ? $args['body'] : '';

		if ( false !== strpos( $body, LEGACY_EMPTY_MARKER ) ) {
			return respond( array( 'choices' => array() ) );
		}

		$content = is_block_generation_request( $body )
			? block_generation_payload( $body, 'Legacy OpenAI mock response' )
			: LEGACY_TEXT_RESPONSE;

		return respond(
			array(
				'choices' => array(
					array(
						'message' => array(
							'role'    => 'assistant',
							'content' => $content,
						),
					),
				),
				'usage'   => array( 'total_tokens' => 42 ),
			)
		);
	}

	// Anything else passes through untouched.
	return $preempt;
}

add_filter( 'pre_http_request', __NAMESPACE__ . '\\mock_openai_http', 10, 3 );
