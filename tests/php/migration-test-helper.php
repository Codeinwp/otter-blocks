<?php
/**
 * Test helper for Otter SDK migrations.
 *
 * @package gutenberg-blocks
 */

/**
 * Run the default Atomic Wind migration using the same rules as the SDK migrator.
 *
 * @return void
 */
function otter_test_run_default_atomic_wind_migration() {
	$name = '20260701120000_default_atomic_wind_blocks';
	$ran  = get_option( 'otter_blocks_ran_migrations', array() );

	if ( in_array( $name, $ran, true ) ) {
		return;
	}

	require_once OTTER_BLOCKS_PATH . '/vendor/codeinwp/themeisle-sdk/src/Modules/Abstract_Migration.php';
	$migration = require OTTER_BLOCKS_PATH . '/inc/migrations/' . $name . '.php';

	if ( ! $migration->should_run() ) {
		return;
	}

	$migration->up();
	$ran[] = $name;
	update_option( 'otter_blocks_ran_migrations', $ran );
}
