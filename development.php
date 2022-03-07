<?php
/**
 * Development Helpers.
 *
 * @package ThemeIsle
 */

// phpcs:ignoreFile

if ( ! defined( 'ENABLE_OTTER_PRO_DEV' ) ) {
	define( 'ENABLE_OTTER_PRO_DEV', true );
}

if ( ENABLE_OTTER_PRO_DEV && defined( 'WPINC' ) && class_exists( '\ThemeIsle\OtterPro\Main' ) ) {
	\ThemeIsle\OtterPro\Main::instance();
}
