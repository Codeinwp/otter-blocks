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
	 * @return array<string, mixed>|\WP_Error
	 */
	public function generate( array $payload ) {
		if ( ! $this->is_available() ) {
			return $this->error_response( 'no_api_key', __( 'No OpenAI API key is configured. Add your API key in the Otter dashboard under Integrations.', 'otter-blocks' ), 400 );
		}

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
			return $this->error_response( 'invalid_payload', __( 'The OpenAI request payload is invalid.', 'otter-blocks' ), 400 );
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
			return $this->error_response( 'invalid_request_args', __( 'The OpenAI request arguments are invalid.', 'otter-blocks' ), 400 );
		}

		// Re-establish the required keys without discarding any other
		// wp_remote_post() argument the filter may have set (sslverify,
		// redirection, httpversion, ...).
		if ( ! isset( $request_args['method'] ) || ! is_string( $request_args['method'] ) ) {
			$request_args['method'] = 'POST';
		}

		if ( ! isset( $request_args['body'] ) || ! is_string( $request_args['body'] ) ) {
			$request_args['body'] = wp_json_encode( $payload );
		}

		if ( ! isset( $request_args['timeout'] ) || ! is_numeric( $request_args['timeout'] ) ) {
			$request_args['timeout'] = 2 * MINUTE_IN_SECONDS;
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

		$request_args['headers'] = $headers;

		$response = wp_remote_post(
			self::BASE_URL,
			// The stubs seal the args shape, but wp_remote_post() accepts any
			// WP_Http::request() argument, including filter-supplied extras.
			// phpcs:ignore Squiz.PHP.CommentedOutCode.Found
			// @phpstan-ignore argument.type (sealed array shape in stubs)
			$request_args
		);

		if ( is_wp_error( $response ) ) {
			return $this->error_response( (string) $response->get_error_code(), $response->get_error_message(), 502 );
		}

		$body = wp_remote_retrieve_body( $response );
		$body = json_decode( $body, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return $this->error_response( 'rest_invalid_json', __( 'Could not parse the response from OpenAI. Try again.', 'otter-blocks' ), 502 );
		}

		$body = is_array( $body ) ? $body : array();

		/**
		 * Filters the decoded OpenAI response before returning it to Otter callers.
		 *
		 * Use this to adapt provider response changes before Otter normalizes
		 * the result into its AI response contract.
		 *
		 * @param array<string, mixed> $body    The decoded OpenAI response body.
		 * @param array<string, mixed> $payload The filtered OpenAI-format payload.
		 */
		$body = apply_filters( 'otter_ai_otter_openai_response', $body, $payload );

		if ( ! is_array( $body ) ) {
			return $this->error_response( 'invalid_response', __( 'The OpenAI response body is invalid.', 'otter-blocks' ), 502 );
		}

		if ( isset( $body['error'] ) && is_array( $body['error'] ) ) {
			$code    = isset( $body['error']['code'] ) ? (string) $body['error']['code'] : 'openai_error';
			$message = isset( $body['error']['message'] ) ? (string) $body['error']['message'] : __( 'An error occurred while processing the request.', 'otter-blocks' );
			$status  = wp_remote_retrieve_response_code( $response );
			$status  = 400 <= $status ? $status : 502;

			return $this->error_response( $code, $message, $status );
		}

		$message = isset( $body['choices'][0]['message'] ) && is_array( $body['choices'][0]['message'] ) ? $body['choices'][0]['message'] : array();
		$content = '';
		$format  = 'text';

		if ( isset( $message['function_call'] ) && is_array( $message['function_call'] ) && isset( $message['function_call']['arguments'] ) ) {
			$content = (string) $message['function_call']['arguments'];
			$format  = 'json';
		} elseif ( isset( $message['content'] ) ) {
			$content = (string) $message['content'];
		}

		if ( '' === $content ) {
			return $this->error_response( 'empty_response', __( 'OpenAI returned an empty response. Please try again.', 'otter-blocks' ), 502 );
		}

		$used_tokens = isset( $body['usage']['total_tokens'] ) && is_numeric( $body['usage']['total_tokens'] ) ? (int) $body['usage']['total_tokens'] : 0;

		return AI_Response::success( $content, $used_tokens, $format );
	}

	/**
	 * Create an AI generation error response.
	 *
	 * @param string $code    The error code.
	 * @param string $message The error message.
	 * @param int    $status  The HTTP status code.
	 * @return \WP_Error
	 */
	private function error_response( $code, $message, $status = 502 ) {
		return AI_Response::error( $code, $message, 'openai', $status );
	}
}
