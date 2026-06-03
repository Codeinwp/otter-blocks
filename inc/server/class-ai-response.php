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
	 * Build an OpenAI-shaped error response.
	 *
	 * @param string $code    The error code.
	 * @param string $message The error message.
	 * @param string $type    The backend error type.
	 * @return array<string, mixed>
	 */
	public static function error( $code, $message, $type ) {
		return array(
			'error' => array(
				'code'    => $code,
				'message' => $message,
				'param'   => null,
				'type'    => $type,
			),
		);
	}
}
