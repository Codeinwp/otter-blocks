<?php
/**
 * Shared CSS.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

/**
 * Class Shared_CSS
 */
class Shared_CSS {

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'init', array( $this, 'testing' ) );
	}

	/**
	 * Testing the class
	 */
	public function testing() {
		die( 'hello' );
	}
}
