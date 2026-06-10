<?php
/**
 * AI response helpers.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class AI_Response
 */
class AI_Response {

	/**
	 * Build a successful AI generation response.
	 *
	 * @param string $content     The generated content.
	 * @param int    $used_tokens The total token count.
	 * @param string $format      The generated content format.
	 * @return array<string, mixed>
	 */
	public static function success( $content, $used_tokens = 0, $format = 'text' ) {
		return array(
			'content'    => $content,
			'usedTokens' => $used_tokens,
			'format'     => $format,
		);
	}

	/**
	 * Check that a generation result matches the success envelope.
	 *
	 * Guards the REST boundary against malformed results from filtered
	 * response bodies or third-party backends.
	 *
	 * @param mixed $result The backend generate() result.
	 * @return bool
	 */
	public static function is_valid( $result ) {
		return is_array( $result )
			&& isset( $result['content'] ) && is_string( $result['content'] )
			&& isset( $result['usedTokens'] ) && is_int( $result['usedTokens'] )
			&& isset( $result['format'] ) && is_string( $result['format'] );
	}

	/**
	 * Build an AI generation error response.
	 *
	 * @param string $code    The error code.
	 * @param string $message The error message.
	 * @param string $type    The backend error type.
	 * @param int    $status  The HTTP status code.
	 * @return \WP_Error
	 */
	public static function error( $code, $message, $type, $status = 500 ) {
		return new \WP_Error(
			$code,
			$message,
			array(
				'status' => $status,
				'param'  => null,
				'type'   => $type,
			)
		);
	}
}
