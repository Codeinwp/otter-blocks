<?php
/**
 * Main file.
 *
 * @package OtterBlocks
 *
 * Plugin Name:          Otter Pro
 * Plugin URI:           https://themeisle.com/plugins/otter-blocks
 * Description:          Create beautiful and attracting posts, pages, and landing pages with Otter – Page Builder Blocks & Extensions for Gutenberg. Otter comes with dozens of Gutenberg blocks that are all you need to build beautiful pages.
 * Version:              2.0.9
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
define( 'OTTER_PRO_BUILD_URL', plugins_url( '/', __FILE__ ) . 'build/pro/' );
define( 'OTTER_PRO_BUILD_PATH', dirname( __FILE__ ) . '/build/pro/' );
define( 'OTTER_PRO_VERSION', '2.0.9' );

require_once dirname( __FILE__ ) . '/autoloader.php';
$autoloader = new \ThemeIsle\OtterPro\Autoloader();
$autoloader->add_namespace( '\ThemeIsle\OtterPro', dirname( __FILE__ ) . '/inc/' );
$autoloader->register();

add_filter(
	'themeisle_sdk_products',
	function ( $products ) {
		$products[] = __FILE__;

		return $products;
	}
);

add_filter(
	'themesle_sdk_namespace_' . md5( __FILE__ ),
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

if ( ! defined( 'OTTER_BLOCKS_VERSION' ) ) {
	add_action(
		'admin_notices',
		function() {
			$message = __( 'You need to install Otter – Page Builder Blocks & Extensions for Gutenberg plugin to use Otter Pro.', 'otter-blocks' );
			$link    = wp_nonce_url(
				add_query_arg(
					array(
						'action' => 'install-plugin',
						'plugin' => 'otter-blocks',
					),
					admin_url( 'update.php' )
				),
				'install-plugin_otter-blocks'
			);

			printf(
				'<div class="error"><p>%1$s <a href="%2$s">%3$s</a></p></div>',
				esc_html( $message ),
				esc_url( $link ),
				esc_html__( 'Install', 'otter-blocks' )
			);
		} 
	);
}

if ( defined( 'OTTER_BLOCKS_VERSION' ) && ! defined( 'OTTER_BLOCKS_PRO_SUPPORT' ) ) {
	add_action(
		'admin_notices',
		function() {
			$message = __( 'You need to update Otter – Page Builder Blocks & Extensions for Gutenberg to the latest version to use Otter Pro.', 'otter-blocks' );

			printf(
				'<div class="error"><p>%1$s</p></div>',
				esc_html( $message )
			);
		} 
	);
}

add_action(
	'plugins_loaded',
	function () {
		// call this only if Gutenberg is active.
		if ( function_exists( 'register_block_type' ) && defined( 'OTTER_BLOCKS_VERSION' ) && defined( 'OTTER_BLOCKS_PRO_SUPPORT' ) ) {
			require_once dirname( __FILE__ ) . '/inc/class-main.php';

			if ( class_exists( '\ThemeIsle\OtterPro\Main' ) ) {
				\ThemeIsle\OtterPro\Main::instance();
			}
		}
	}
);
