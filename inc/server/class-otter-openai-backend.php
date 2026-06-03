<?php
/**
 * Otter OpenAI backend strategy.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class Otter_OpenAI_Backend
 */
class Otter_OpenAI_Backend implements AI_Backend {

	/**
	 * OpenAI chat-completions endpoint.
	 *
	 * @var string
	 */
	const BASE_URL = 'https://api.openai.com/v1/chat/completions';

	/**
	 * Whether an Otter OpenAI API key is configured.
	 *
	 * @return bool
	 */
	public function is_available() {
		return ! empty( get_option( 'themeisle_open_ai_api_key' ) );
	}

	/**
	 * Forward the prompt to OpenAI API.
	 *
	 * @param array<string, mixed> $payload The OpenAI-format payload.
	 * @return array<string, mixed>
	 */
	public function generate( array $payload ) {
		/**
		 * Filters the OpenAI-shaped payload before Otter sends it to OpenAI.
		 *
		 * This is the main extension point for adapting request shape as the
		 * OpenAI API evolves while preserving Otter's internal wire contract.
		 *
		 * @param array<string, mixed> $payload The OpenAI-format payload.
		 */
		$payload = apply_filters( 'otter_ai_otter_openai_payload', $payload );

		if ( ! is_array( $payload ) ) {
			return $this->error_response( 'invalid_payload', __( 'The OpenAI request payload is invalid.', 'otter-blocks' ) );
		}

		$request_args = array(
			'method'  => 'POST',
			'headers' => array(
				'Authorization' => 'Bearer ' . get_option( 'themeisle_open_ai_api_key' ),
				'Content-Type'  => 'application/json',
			),
			'body'    => wp_json_encode( $payload ),
			'timeout' => 2 * MINUTE_IN_SECONDS,
		);

		/**
		 * Filters the HTTP arguments used for Otter's OpenAI request.
		 *
		 * Use this for transport-level changes such as timeout, endpoint
		 * proxying via HTTP API filters, or additional headers.
		 *
		 * @param array<string, mixed> $request_args The wp_remote_post() arguments.
		 * @param array<string, mixed> $payload      The filtered OpenAI-format payload.
		 */
		$request_args = apply_filters( 'otter_ai_otter_openai_request_args', $request_args, $payload );

		if ( ! is_array( $request_args ) ) {
			return $this->error_response( 'invalid_request_args', __( 'The OpenAI request arguments are invalid.', 'otter-blocks' ) );
		}

		$headers = array();
		if ( ! isset( $request_args['headers'] ) || ! is_array( $request_args['headers'] ) ) {
			$request_args['headers'] = array();
		}

		foreach ( $request_args['headers'] as $name => $value ) {
			if ( is_scalar( $value ) ) {
				$headers[ (string) $name ] = (string) $value;
			}
		}

		$request_args = array(
			'method'  => isset( $request_args['method'] ) && is_string( $request_args['method'] ) ? $request_args['method'] : 'POST',
			'headers' => $headers,
			'body'    => isset( $request_args['body'] ) && is_string( $request_args['body'] ) ? $request_args['body'] : wp_json_encode( $payload ),
			'timeout' => isset( $request_args['timeout'] ) && is_numeric( $request_args['timeout'] ) ? (float) $request_args['timeout'] : 2 * MINUTE_IN_SECONDS,
		);

		$response = wp_remote_post(
			self::BASE_URL,
			$request_args
		);

		if ( is_wp_error( $response ) ) {
			return $this->error_response( (string) $response->get_error_code(), $response->get_error_message() );
		}

		$body = wp_remote_retrieve_body( $response );
		$body = json_decode( $body, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return $this->error_response( 'rest_invalid_json', __( 'Could not parse the response from OpenAI. Try again.', 'otter-blocks' ) );
		}

		$body = is_array( $body ) ? $body : array();

		/**
		 * Filters the decoded OpenAI response before returning it to Otter callers.
		 *
		 * The returned value must remain OpenAI-shaped so editor consumers can
		 * continue to handle all AI backends consistently.
		 *
		 * @param array<string, mixed> $body    The decoded OpenAI response body.
		 * @param array<string, mixed> $payload The filtered OpenAI-format payload.
		 */
		$body = apply_filters( 'otter_ai_otter_openai_response', $body, $payload );

		return is_array( $body ) ? $body : array();
	}

	/**
	 * Create an OpenAI-shaped error response.
	 *
	 * @param string $code    The error code.
	 * @param string $message The error message.
	 * @return array<string, mixed>
	 */
	private function error_response( $code, $message ) {
		return AI_Response::error( $code, $message, 'openai' );
	}
}
