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

add_filter(
	'themeisle_sdk_products',
	function ( $products ) {
		$products[] = dirname( __FILE__ ) . '/plugins/otter-pro/otter-pro.php';

		return $products;
	}
);

if ( ENABLE_OTTER_PRO_DEV && defined( 'WPINC' ) && class_exists( '\ThemeIsle\OtterPro\Main' ) ) {
	\ThemeIsle\OtterPro\Main::instance();
}
