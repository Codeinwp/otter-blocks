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

add_filter(
	'themesle_sdk_namespace_' . md5( dirname( __FILE__ ) . '/plugins/otter-pro/otter-pro.php' ),
	function () {
		return 'otter';
	}
);

add_filter(
	'otter_pro_lc_no_valid_string',
	function ( $message ) {
		return str_replace( '<a href="%s">', '<a href="' . admin_url( 'options-general.php?page=otter' ) . '">', $message );
	}
);

add_filter( 'otter_pro_hide_license_field', '__return_true' );

if ( ENABLE_OTTER_PRO_DEV && defined( 'WPINC' ) && class_exists( '\ThemeIsle\OtterPro\Main' ) ) {
	\ThemeIsle\OtterPro\Main::instance();
}
