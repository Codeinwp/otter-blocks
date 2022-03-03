<?php
/**
 * Main file.
 *
 * @package OtterBlocks
 *
 * Plugin Name:       Pro Extension for Otter
 * Plugin URI:        https://themeisle.com/plugins/otter-blocks
 * Description:       Create beautiful and attracting posts, pages, and landing pages with Gutenberg Blocks and Template Library by Otter. Otter comes with dozens of Gutenberg blocks that are all you need to build beautiful pages.
 * Version:           1.7.5
 * Author:            ThemeIsle
 * Author URI:        https://themeisle.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       otter-pro
 * Domain Path:       /languages
 * WordPress Available:  yes
 * Requires License:    no
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'OTTER_PRO_BASEFILE', __FILE__ );
define( 'OTTER_PRO_URL', plugins_url( '/', __FILE__ ) );
define( 'OTTER_PRO_PATH', dirname( __FILE__ ) );
define( 'OTTER_PRO_VERSION', '1.7.5' );