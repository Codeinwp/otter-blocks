<?php
/**
 * Main file.
 *
 * @package OtterBlocks
 *
 * Plugin Name:       Otter – Page Builder Blocks & Extensions for Gutenberg
 * Plugin URI:        https://themeisle.com/plugins/otter-blocks
 * Description:       Create beautiful and attracting posts, pages, and landing pages with Otter – Page Builder Blocks & Extensions for Gutenberg. Otter comes with dozens of Gutenberg blocks that are all you need to build beautiful pages.
 * Version:           2.2.0
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
define( 'OTTER_BLOCKS_VERSION', '2.2.0' );
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

add_action(
	'plugin_action_links_' . plugin_basename( __FILE__ ),
	function( $links ) {
		array_unshift(
			$links,
			sprintf( '<a href="%s">%s</a>', admin_url( 'options-general.php?page=otter' ), __( 'Settings', 'otter-blocks' ) )
		);
		return $links;
	}
);
