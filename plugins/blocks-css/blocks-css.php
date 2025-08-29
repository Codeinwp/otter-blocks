<?php
/**
 * Blocks CSS
 *
 * @package     ThemeIsle\GutenbergBlocks\Blocks_CSS
 * @copyright   Copyright (c) 2019, Hardeep Asrani
 * @license     http://opensource.org/licenses/gpl-3.0.php GNU Public License
 * @since       1.0.0
 *
 * Plugin Name:       Blocks CSS: CSS Editor for Gutenberg Blocks
 * Plugin URI:        https://github.com/Codeinwp/otter-blocks
 * Description:       Blocks CSS allows you add custom CSS to your Blocks straight from the Block Editor (Gutenberg).
 * Version:           3.1.1
 * Author:            ThemeIsle
 * Author URI:        https://themeisle.com
 * License:           GPL-3.0+
 * License URI:       http://www.gnu.org/licenses/gpl-3.0.txt
 * Text Domain:       blocks-css
 * Domain Path:       /languages
 * WordPress Available:  yes
 * Requires License:    no
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'BLOCKS_CSS_URL', plugins_url( '/', __FILE__ ) );
define( 'BLOCKS_CSS_PATH', dirname( __FILE__ ) );
define( 'BLOCKS_CSS_PRODUCT_SLUG', basename( BLOCKS_CSS_PATH ) );

add_action(
	'plugins_loaded',
	function () {
		// call this only if Gutenberg is active.
		if ( function_exists( 'register_block_type' ) ) {
			require_once dirname( __FILE__ ) . '/class-blocks-css.php';

			if ( class_exists( '\ThemeIsle\GutenbergBlocks\Blocks_CSS' ) ) {
				\ThemeIsle\GutenbergBlocks\Blocks_CSS::instance();
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
		$message_template = __( 'Extend %1$s with %2$s – up to %3$s OFF in our biggest sale of the year. Limited time only.', 'blocks-css' );
	
		$config['message']  = sprintf( $message_template, 'Blocks CSS', 'Otter Pro Blocks', '70%' );
		$config['sale_url'] = add_query_arg(
			array(
				'utm_term' => 'free',
			),
			tsdk_translate_link( tsdk_utmify( 'https://themeisle.link/otter-bf', 'bfcm', 'blocks-css' ) )
		);

		$configs[ BLOCKS_CSS_PRODUCT_SLUG ] = $config;

		return $configs;
	} 
);
