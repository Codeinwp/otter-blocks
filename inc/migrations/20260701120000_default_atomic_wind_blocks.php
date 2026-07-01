<?php
/**
 * Enable Atomic Wind blocks by default on fresh Otter installs.
 *
 * @package ThemeIsle\GutenbergBlocks
 */

use ThemeisleSDK\Modules\Abstract_Migration;

return new class() extends Abstract_Migration {
	/**
	 * Only default the setting when Otter was installed recently and never saved.
	 *
	 * @return bool
	 */
	public function should_run() {
		if ( 'NOT_SET' !== get_option( 'themeisle_blocks_settings_atomic_wind_blocks', 'NOT_SET' ) ) {
			return false;
		}

		$installed = (int) get_option( 'otter_blocks_install', 0 );

		return $installed > 0 && $installed > ( time() - DAY_IN_SECONDS );
	}

	/**
	 * Turn on Atomic Wind blocks for eligible fresh installs.
	 *
	 * @return void
	 */
	public function up() {
		add_option( 'themeisle_blocks_settings_atomic_wind_blocks', true );
	}
};
