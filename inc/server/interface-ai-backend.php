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
	 * Generate an Otter AI response from an OpenAI-shaped payload.
	 *
	 * Backends accept the current prompt-template payload format and return a
	 * successful response array or a WordPress REST error.
	 *
	 * @param array<string, mixed> $payload The OpenAI-format payload.
	 * @return array<string, mixed>|\WP_Error
	 */
	public function generate( array $payload );
}
