<?php
/**
 * SDK migration tests.
 *
 * @package gutenberg-blocks
 */

require_once dirname( __FILE__ ) . '/php/migration-test-helper.php';

/**
 * Otter SDK migration tests.
 */
class Test_Migrations extends WP_UnitTestCase {
	/**
	 * Migration basename without extension.
	 */
	const DEFAULT_ATOMIC_WIND_MIGRATION = '20260701120000_default_atomic_wind_blocks';

	/**
	 * Reset migration-related options.
	 *
	 * @return void
	 */
	private function reset_atomic_wind_migration_state() {
		delete_option( 'themeisle_blocks_settings_atomic_wind_blocks' );
		delete_option( 'otter_blocks_ran_migrations' );
		delete_option( 'otter_blocks_install' );
	}

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();
		$this->reset_atomic_wind_migration_state();
	}

	/**
	 * Fresh installs (< 1 day) with no saved preference get Atomic Wind enabled.
	 */
	public function test_default_atomic_wind_migration_enables_for_fresh_install() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );

		otter_test_run_default_atomic_wind_migration();

		$this->assertTrue( get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );
		$this->assertContains( self::DEFAULT_ATOMIC_WIND_MIGRATION, get_option( 'otter_blocks_ran_migrations', array() ) );
	}

	/**
	 * Installs older than one day without a saved preference stay off.
	 */
	public function test_default_atomic_wind_migration_skips_old_installs() {
		update_option( 'otter_blocks_install', time() - ( 2 * DAY_IN_SECONDS ) );

		otter_test_run_default_atomic_wind_migration();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
		$this->assertNotContains( self::DEFAULT_ATOMIC_WIND_MIGRATION, get_option( 'otter_blocks_ran_migrations', array() ) );
	}

	/**
	 * Missing install timestamp should not opt fresh sites in blindly.
	 */
	public function test_default_atomic_wind_migration_skips_when_install_timestamp_missing() {
		otter_test_run_default_atomic_wind_migration();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * A stored off value must not be overwritten on a fresh install.
	 */
	public function test_default_atomic_wind_migration_respects_stored_disable() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );
		add_option( 'themeisle_blocks_settings_atomic_wind_blocks', '' );

		otter_test_run_default_atomic_wind_migration();

		$this->assertFalse( (bool) get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );
	}

	/**
	 * Disabling after the default ran must stick (REST stores false by deleting the option).
	 */
	public function test_default_atomic_wind_migration_does_not_reenable_after_user_disables() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );

		otter_test_run_default_atomic_wind_migration();
		$this->assertTrue( get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );

		delete_option( 'themeisle_blocks_settings_atomic_wind_blocks' );

		otter_test_run_default_atomic_wind_migration();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * An explicit enable on an old install must not be cleared.
	 */
	public function test_default_atomic_wind_migration_respects_explicit_enable() {
		update_option( 'otter_blocks_install', time() - ( 2 * DAY_IN_SECONDS ) );
		update_option( 'themeisle_blocks_settings_atomic_wind_blocks', true );

		otter_test_run_default_atomic_wind_migration();

		$this->assertTrue( get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );
	}

	/**
	 * The migration runs once per site; a later disable must not be overwritten.
	 */
	public function test_default_atomic_wind_migration_runs_once() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );

		otter_test_run_default_atomic_wind_migration();
		delete_option( 'themeisle_blocks_settings_atomic_wind_blocks' );

		otter_test_run_default_atomic_wind_migration();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * Install exactly at the one-day boundary should stay off.
	 */
	public function test_default_atomic_wind_migration_skips_install_at_one_day_boundary() {
		update_option( 'otter_blocks_install', time() - DAY_IN_SECONDS );

		otter_test_run_default_atomic_wind_migration();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}
}
