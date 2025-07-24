<?php
/**
 * Blocks Animation
 *
 * @package     ThemeIsle\GutenbergBlocks\Blocks_Animation
 * @copyright   Copyright (c) 2019, Hardeep Asrani
 * @license     http://opensource.org/licenses/gpl-3.0.php GNU Public License
 * @since       1.0.0
 *
 * Plugin Name:       Blocks Animation: CSS Animations for Gutenberg Blocks
 * Plugin URI:        https://github.com/Codeinwp/otter-blocks
 * Description:       Blocks Animation allows you to add CSS Animations to all of your Gutenberg blocks in the most elegent way.
 * Version:           3.1.0
 * Author:            ThemeIsle
 * Author URI:        https://themeisle.com
 * License:           GPL-3.0+
 * License URI:       http://www.gnu.org/licenses/gpl-3.0.txt
 * Text Domain:       blocks-animation
 * Domain Path:       /languages
 * WordPress Available:  yes
 * Requires License:    no
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( defined( 'OTTER_BLOCKS_PATH' ) ) {
	return;
}

define( 'BLOCKS_ANIMATION_URL', plugins_url( '/', __FILE__ ) );
define( 'BLOCKS_ANIMATION_PATH', dirname( __FILE__ ) );
define( 'BLOCKS_ANIMATION_PRODUCT_SLUG', basename( BLOCKS_ANIMATION_PATH ) );

$vendor_file = BLOCKS_ANIMATION_PATH . '/vendor/autoload.php';

if ( is_readable( $vendor_file ) ) {
	require_once $vendor_file;
}

add_filter(
	'themeisle_sdk_products',
	function ( $products ) {
		$products[] = __FILE__;

		return $products;
	}
);

add_action(
	'plugins_loaded',
	function () {
		// call this only if Gutenberg is active.
		if ( function_exists( 'register_block_type' ) ) {
			require_once dirname( __FILE__ ) . '/class-blocks-animation.php';

			if ( class_exists( '\ThemeIsle\GutenbergBlocks\Blocks_Animation' ) ) {
				\ThemeIsle\GutenbergBlocks\Blocks_Animation::instance();
			}
		}
	}
);

add_filter(
	'themeisle_sdk_blackfriday_data',
	function ( $configs ) {
		if ( defined( 'OTTER_BLOCKS_PATH' ) ) {
			return $configs;
		}

		$config = $configs['default'];

		// translators: %1$s - plugin name, %2$s - plugin name, %3$s - discount.
		$message_template = __( 'Extend %1$s with %2$s – up to %3$s OFF in our biggest sale of the year. Limited time only.', 'blocks-animation' );
	
		$config['message']  = sprintf( $message_template, 'Block Animation', 'Otter Pro Blocks', '70%' );
		$config['sale_url'] = add_query_arg(
			array(
				'utm_term' => 'free',
			),
			tsdk_translate_link( tsdk_utmify( 'https://themeisle.link/otter-bf', 'bfcm', 'blocks-animation' ) )
		);

		$configs[ BLOCKS_ANIMATION_PRODUCT_SLUG ] = $config;

		return $configs;
	} 
);
