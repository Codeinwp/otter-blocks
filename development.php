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

add_filter( 'themesle_sdk_namespace_' . md5( dirname( __FILE__ ) . '/plugins/otter-pro/otter-pro.php' ), 'otter_dev_load_namespace' );

/**
 * Define cli namespace for sdk.
 *
 * @return string CLI namespace.
 */
function otter_dev_load_namespace() {
	return 'otter';
}

if ( ENABLE_OTTER_PRO_DEV && defined( 'WPINC' ) && class_exists( '\ThemeIsle\OtterPro\Main' ) ) {
	\ThemeIsle\OtterPro\Main::instance();
}
