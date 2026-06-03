<?php
/**
 * AI backend interface.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Interface AI_Backend
 */
interface AI_Backend {

	/**
	 * Whether this backend can currently serve generation requests.
	 *
	 * @return bool
	 */
	public function is_available();

	/**
	 * Generate an OpenAI-shaped response from an OpenAI-shaped payload.
	 *
	 * Failures should be returned as body-level `error` objects in the same
	 * shape as AI_Response::error().
	 *
	 * @param array<string, mixed> $payload The OpenAI-format payload.
	 * @return array<string, mixed>
	 */
	public function generate( array $payload );
}
