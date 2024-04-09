<?php
/**
 * PHPUnit bootstrap file
 *
 * @package Test_Travis
 */

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( class_exists( '\Yoast\PHPUnitPolyfills\Autoload' ) === false ) {
	require_once dirname( dirname( __FILE__ ) ) . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';
}

if ( ! $_tests_dir ) {
	$_tests_dir = '/tmp/wordpress-tests-lib';
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

function _manually_load_plugin() {
	require dirname( dirname( __FILE__ ) ) . '/otter-blocks.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

require_once dirname( dirname( __FILE__ ) ) . '/vendor/autoload.php';

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';

if ( ! defined( 'OTTER_BLOCKS_VERSION' ) ) {
	define('OTTER_BLOCKS_VERSION', '1.0.0');
}

require dirname( dirname( __FILE__ ) ) . '/tests/stripe-http-client-mock.php';
//require dirname( dirname( __FILE__ ) ) . '/inc/css/class-css-utility.php';
//require dirname( dirname( __FILE__ ) ) . '/inc/plugins/class-block-conditions.php';
//require dirname( dirname( __FILE__ ) ) . '/inc/plugins/class-dynamic-content.php';
//require dirname( dirname( __FILE__ ) ) . '/plugins/otter-pro/inc/plugins/class-block-conditions.php';
//require dirname( dirname( __FILE__ ) ) . '/plugins/otter-pro/inc/plugins/class-dynamic-content.php';

activate_plugin( 'otter-blocks/otter-blocks.php' );
global $current_user;
$current_user = new WP_User( 1 );
$current_user->set_role( 'administrator' );

wp_update_user(
	array(
		'ID'         => 1,
		'first_name' => 'Admin',
		'last_name'  => 'User',
	)
);
