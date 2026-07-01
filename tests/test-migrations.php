<?php
/**
 * Atomic Wind fresh-install default tests.
 *
 * @package gutenberg-blocks
 */

require_once dirname( __FILE__ ) . '/php/migration-test-helper.php';

/**
 * Atomic Wind default-on-fresh-install tests.
 */
class Test_Migrations extends WP_UnitTestCase {
	/**
	 * Reset defaulting-related options.
	 *
	 * @return void
	 */
	private function reset_atomic_wind_default_state() {
		delete_option( 'themeisle_blocks_settings_atomic_wind_blocks' );
		delete_option( 'themeisle_blocks_settings_atomic_wind_defaulted' );
		delete_option( 'otter_blocks_install' );
	}

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		parent::set_up();
		$this->reset_atomic_wind_default_state();
	}

	/**
	 * Fresh installs (< 1 day) with no saved preference get Atomic Wind enabled.
	 */
	public function test_default_atomic_wind_enables_for_fresh_install() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );

		otter_test_maybe_default_atomic_wind_blocks();

		$this->assertTrue( get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );
	}

	/**
	 * Installs older than one day without a saved preference stay off.
	 */
	public function test_default_atomic_wind_skips_old_installs() {
		update_option( 'otter_blocks_install', time() - ( 2 * DAY_IN_SECONDS ) );

		otter_test_maybe_default_atomic_wind_blocks();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * Fresh installs can reach this code before the SDK stores the install timestamp.
	 */
	public function test_default_atomic_wind_enables_when_install_timestamp_missing() {
		otter_test_maybe_default_atomic_wind_blocks();

		$this->assertTrue( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * A stored off value must not be overwritten on a fresh install.
	 */
	public function test_default_atomic_wind_respects_stored_disable() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );
		add_option( 'themeisle_blocks_settings_atomic_wind_blocks', '' );

		otter_test_maybe_default_atomic_wind_blocks();

		$this->assertFalse( (bool) get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );
	}

	/**
	 * Disabling after the default ran must stick.
	 */
	public function test_default_atomic_wind_does_not_reenable_after_user_disables() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );

		otter_test_maybe_default_atomic_wind_blocks();
		$this->assertTrue( get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );

		delete_option( 'themeisle_blocks_settings_atomic_wind_blocks' );

		otter_test_maybe_default_atomic_wind_blocks();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * An explicit enable on an old install must not be cleared.
	 */
	public function test_default_atomic_wind_respects_explicit_enable() {
		update_option( 'otter_blocks_install', time() - ( 2 * DAY_IN_SECONDS ) );
		update_option( 'themeisle_blocks_settings_atomic_wind_blocks', true );

		otter_test_maybe_default_atomic_wind_blocks();

		$this->assertTrue( get_option( 'themeisle_blocks_settings_atomic_wind_blocks' ) );
	}

	/**
	 * The migration runs once per site; a later disable must not be overwritten.
	 */
	public function test_default_atomic_wind_runs_once() {
		update_option( 'otter_blocks_install', time() - HOUR_IN_SECONDS );

		otter_test_maybe_default_atomic_wind_blocks();
		delete_option( 'themeisle_blocks_settings_atomic_wind_blocks' );

		otter_test_maybe_default_atomic_wind_blocks();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}

	/**
	 * Install exactly at the one-day boundary should stay off.
	 */
	public function test_default_atomic_wind_skips_install_at_one_day_boundary() {
		update_option( 'otter_blocks_install', time() - DAY_IN_SECONDS );

		otter_test_maybe_default_atomic_wind_blocks();

		$this->assertFalse( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) );
	}
}
