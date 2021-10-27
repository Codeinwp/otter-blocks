<?php
/**
 * Blocks CSS
 *
 * @package     ThemeIsle\GutenbergBlocks\Blocks_Export_Import
 * @copyright   Copyright (c) 2019, Hardeep Asrani
 * @license     http://opensource.org/licenses/gpl-3.0.php GNU Public License
 * @since       1.0.0
 *
 * Plugin Name:       Blocks Export Import
 * Plugin URI:        https://github.com/Codeinwp/otter-blocks
 * Description:       Blocks Export Import allows to Export and Import blocks as JSON in Gutenberg Block Editor.
 * Version:           1.2.0
 * Author:            ThemeIsle
 * Author URI:        https://themeisle.com
 * License:           GPL-3.0+
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.txt
 * Text Domain:       blocks-export-import
 * Domain Path:       /languages
 * WordPress Available:  yes
 * Requires License:    no
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'BLOCKS_EXPORT_IMPORT_URL', plugins_url( '/', __FILE__ ) );
define( 'BLOCKS_EXPORT_IMPORT_PATH', dirname( __FILE__ ) );

add_action(
	'plugins_loaded',
	function () {
		// call this only if Gutenberg is active.
		if ( function_exists( 'register_block_type' ) ) {
			require_once dirname( __FILE__ ) . '/class-blocks-export-import.php';

			if ( class_exists( '\ThemeIsle\GutenbergBlocks\Blocks_Export_Import' ) ) {
				\ThemeIsle\GutenbergBlocks\Blocks_Export_Import::instance();
			}
		}
	}
);
