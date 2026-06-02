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
		$body    = isset( $args['body'] ) && is_string( $args['body'] ) ? json_decode( $args['body'], true ) : array();
		$is_json = isset( $body['text']['format']['type'] ) && 'json_schema' === $body['text']['format']['type'];

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
								'text' => $is_json ? FORM_RESPONSE : TEXT_RESPONSE,
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

	// Anything else (e.g. the legacy path's /chat/completions key validation)
	// passes through untouched so legacy-backend specs keep their behavior.
	return $preempt;
}

add_filter( 'pre_http_request', __NAMESPACE__ . '\\mock_openai_http', 10, 3 );
