<?php
/**
 * Otter Constants.
 * 
 * Adds Otter constants for PHPStan to use.
 */

define( 'OTTER_BLOCKS_BASEFILE', __FILE__ );
define( 'OTTER_BLOCKS_URL', plugins_url( '/', __FILE__ ) );
define( 'OTTER_BLOCKS_PATH', dirname( __FILE__ ) );
define( 'OTTER_BLOCKS_VERSION', '2.2.7' );
define( 'OTTER_BLOCKS_PRO_SUPPORT', true );
define( 'OTTER_BLOCKS_SHOW_NOTICES', false );

define( 'OTTER_PRO_VERSION', OTTER_BLOCKS_VERSION );
define( 'OTTER_PRO_URL', OTTER_BLOCKS_URL . 'plugins/otter-pro/' );
define( 'OTTER_PRO_PATH', OTTER_BLOCKS_PATH . '/plugins/otter-pro' );
define( 'OTTER_PRO_BASEFILE', OTTER_PRO_PATH . '/otter-pro.php' );
define( 'OTTER_PRO_BUILD_URL', OTTER_BLOCKS_URL . 'build/pro/' );
define( 'OTTER_PRO_BUILD_PATH', OTTER_BLOCKS_PATH . '/build/pro/' );

define( 'BLOCKS_ANIMATION_PATH', OTTER_BLOCKS_PATH );
define( 'BLOCKS_ANIMATION_URL', OTTER_BLOCKS_URL );

define( 'BLOCKS_CSS_PATH', OTTER_BLOCKS_PATH );
define( 'BLOCKS_CSS_URL', OTTER_BLOCKS_URL );

define( 'BLOCKS_EXPORT_IMPORT_PATH', OTTER_BLOCKS_PATH );
define( 'BLOCKS_EXPORT_IMPORT_URL', OTTER_BLOCKS_URL );