<?php
/**
 * WordPress AI Client backend strategy.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class WP_AI_Client_Backend
 */
class WP_AI_Client_Backend implements AI_Backend {

	/**
	 * The adaptor that translates OpenAI-shaped payloads to the WP AI Client.
	 *
	 * @var AI_Client_Adaptor
	 */
	private $adaptor;

	/**
	 * Constructor.
	 *
	 * @param AI_Client_Adaptor|null $adaptor The adaptor instance.
	 */
	public function __construct( $adaptor = null ) {
		$this->adaptor = null !== $adaptor ? $adaptor : new AI_Client_Adaptor();
	}

	/**
	 * Whether the WordPress AI Client has a usable provider.
	 *
	 * @return bool
	 */
	public function is_available() {
		return AI_Client_Adaptor::is_available();
	}

	/**
	 * Generate through the WordPress AI Client.
	 *
	 * @param array<string, mixed> $payload The OpenAI-format payload.
	 * @return array<string, mixed>|\WP_Error
	 */
	public function generate( array $payload ) {
		return $this->adaptor->generate( $payload );
	}
}
