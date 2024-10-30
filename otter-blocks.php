<?php
/**
 * Main file.
 *
 * @package OtterBlocks
 *
 * Plugin Name:       Otter – Page Builder Blocks & Extensions for Gutenberg
 * Plugin URI:        https://themeisle.com/plugins/otter-blocks
 * Description:       Create beautiful and attracting posts, pages, and landing pages with Otter – Page Builder Blocks & Extensions for Gutenberg. Otter comes with dozens of Gutenberg blocks that are all you need to build beautiful pages.
 * Version:           3.0.5
 * Author:            ThemeIsle
 * Author URI:        https://themeisle.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       otter-blocks
 * Domain Path:       /languages
 * WordPress Available:  yes
 * Requires License:    no
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'OTTER_BLOCKS_BASEFILE', __FILE__ );
define( 'OTTER_BLOCKS_URL', plugins_url( '/', __FILE__ ) );
define( 'OTTER_BLOCKS_PATH', dirname( __FILE__ ) );
define( 'OTTER_BLOCKS_VERSION', '3.0.5' );
define( 'OTTER_BLOCKS_PRO_SUPPORT', true );
define( 'OTTER_BLOCKS_SHOW_NOTICES', false );

$vendor_file = OTTER_BLOCKS_PATH . '/vendor/autoload.php';

if ( is_readable( $vendor_file ) ) {
	require_once $vendor_file;
}

if ( class_exists( '\ThemeIsle\GutenbergBlocks\Main' ) ) {
	\ThemeIsle\GutenbergBlocks\Main::instance();
}

add_filter(
	'themeisle_sdk_products',
	function ( $products ) {
		$products[] = __FILE__;

		return $products;
	}
);

add_filter(
	'otter_blocks_welcome_metadata',
	function() {
		return [
			'is_enabled' => ! defined( 'OTTER_PRO_VERSION' ),
			'pro_name'   => __( 'Otter Blocks Pro', 'otter-blocks' ),
			'logo'       => OTTER_BLOCKS_URL . '/assets/images/logo-alt.png',
			'cta_link'   => tsdk_utmify( 'https://themeisle.com/plugins/otter-blocks/upgrade/?discount=LOYALUSER583&dvalue=60#pricing', 'otter-welcome', 'notice' ),
		];
	}
);

add_filter(
	'themeisle_sdk_compatibilities/' . basename( OTTER_BLOCKS_PATH ),
	function ( $compatibilities ) {
		$compatibilities['OtterBlocksPRO'] = array(
			'basefile'  => defined( 'OTTER_PRO_BASEFILE' ) ? OTTER_PRO_BASEFILE : '',
			'required'  => '2.0',
			'tested_up' => OTTER_BLOCKS_VERSION,
		);
		return $compatibilities;
	}
);

add_action(
	'plugin_action_links_' . plugin_basename( __FILE__ ),
	function( $links ) {
		array_unshift(
			$links,
			sprintf( '<a href="%s">%s</a>', admin_url( 'admin.php?page=otter' ), __( 'Settings', 'otter-blocks' ) )
		);
		return $links;
	}
);

add_filter( 'themeisle_sdk_enable_telemetry', '__return_true' );

add_filter(
	'themeisle_sdk_telemetry_products',
	function( $products ) {
		$already_registered = false;

		$license    = apply_filters( 'product_otter_license_key', 'free' );
		$track_hash = 'free' === $license ? 'free' : wp_hash( $license );

		foreach ( $products as &$product ) {
			if ( strstr( $product['slug'], 'otter' ) !== false ) {
				$already_registered   = true;
				$product['trackHash'] = $track_hash;
			}
		}

		if ( $already_registered ) {
			return $products;
		}
	
		// Add Otter Blocks to the list of products to track the usage of AI Block.
		$products[] = array(
			'slug'      => 'otter',
			'consent'   => false,
			'trackHash' => $track_hash,
		);
		return $products;
	} 
);
