<?php
/**
 * Test helper for Atomic Wind fresh-install defaulting.
 *
 * @package gutenberg-blocks
 */

/**
 * Run the fresh-install Atomic Wind default logic.
 *
 * @return void
 */
function otter_test_maybe_default_atomic_wind_blocks() {
	\ThemeIsle\GutenbergBlocks\Plugins\Options_Settings::instance()->maybe_default_atomic_wind_blocks();
}
