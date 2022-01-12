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

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';

require dirname( dirname( __FILE__ ) ) . '/inc/css/class-css-utility.php';

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
