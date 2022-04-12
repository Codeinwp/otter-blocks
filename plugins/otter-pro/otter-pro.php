<?php
/**
 * Main file.
 *
 * @package OtterBlocks
 *
 * Plugin Name:          Otter Pro
 * Plugin URI:           https://themeisle.com/plugins/otter-blocks
 * Description:          Create beautiful and attracting posts, pages, and landing pages with Gutenberg Blocks and Template Library by Otter. Otter comes with dozens of Gutenberg blocks that are all you need to build beautiful pages.
 * Version:              1.7.5
 * Author:               ThemeIsle
 * Author URI:           https://themeisle.com
 * License:              GPL-2.0+
 * License URI:          http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:          otter-pro
 * Domain Path:          /languages
 * WordPress Available:  no
 * Requires License:     yes
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'OTTER_PRO_BASEFILE', __FILE__ );
define( 'OTTER_PRO_URL', plugins_url( '/', __FILE__ ) );
define( 'OTTER_PRO_PATH', dirname( __FILE__ ) );
define( 'OTTER_PRO_BUILD_URL', plugins_url( '/', __FILE__ ) . 'build/' );
define( 'OTTER_PRO_BUILD_PATH', dirname( __FILE__ ) . '/build/' );
define( 'OTTER_PRO_VERSION', '1.7.5' );

add_filter(
	'themeisle_sdk_products',
	function ( $products ) {
		$products[] = __FILE__;

		return $products;
	}
);

add_filter(
	'themesle_sdk_namespace_' . __FILE__,
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

add_action(
	'plugins_loaded',
	function () {
		// call this only if Gutenberg is active.
		if ( function_exists( 'register_block_type' ) ) {
			require_once dirname( __FILE__ ) . '/inc/class-main.php';

			if ( class_exists( '\ThemeIsle\OtterPro\Main' ) ) {
				\ThemeIsle\OtterPro\Main::instance();
			}
		}
	}
);
