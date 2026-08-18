<?php
/**
 * Standalone sandbox for CSS_Handler::is_writable() regression testing.
 *
 * Simulates the production condition from
 * https://github.com/Codeinwp/otter-blocks/issues/2937: the request includes
 * wp-admin/includes/file.php, but WP_Filesystem() is still undefined
 * afterwards. is_writable() must return false instead of raising an uncaught
 * "Call to undefined function WP_Filesystem()" error.
 *
 * Run in a separate PHP process (no WordPress loaded):
 *   php is-writable-sandbox.php
 *
 * @package gutenberg-blocks
 */

error_reporting( E_ALL ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.prevent_path_disclosure_error_reporting, WordPress.PHP.DiscouragedPHPFunctions.runtime_configuration_error_reporting

$plugin_dir = dirname( dirname( __DIR__ ) );

// Fake ABSPATH whose wp-admin/includes/file.php does NOT define WP_Filesystem().
$fake_abspath = rtrim( sys_get_temp_dir(), '/\\' ) . '/otter-2937-fake-wp-' . getmypid() . '/';

if ( ! is_dir( $fake_abspath . 'wp-admin/includes' ) ) {
	mkdir( $fake_abspath . 'wp-admin/includes', 0777, true );
}

file_put_contents( // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_read_file_put_contents
	$fake_abspath . 'wp-admin/includes/file.php',
	"<?php // Intentionally empty: simulates WP_Filesystem() remaining unavailable after the include.\n"
);

define( 'ABSPATH', $fake_abspath );

/**
 * Minimal stub of wp_upload_dir() used by CSS_Handler::is_writable().
 *
 * @param string|null $time Ignored.
 * @param bool        $create_dir Ignored.
 * @return array Upload dir data.
 */
function wp_upload_dir( $time = null, $create_dir = true ) {
	return array(
		'basedir' => sys_get_temp_dir(),
		'baseurl' => 'http://example.org/wp-content/uploads',
	);
}

/**
 * No-op stub so class files can be loaded outside WordPress.
 */
function add_action() {}

/**
 * No-op stub so class files can be loaded outside WordPress.
 */
function add_filter() {}

require $plugin_dir . '/inc/class-base-css.php';
require $plugin_dir . '/inc/css/class-css-handler.php';

$result = \ThemeIsle\GutenbergBlocks\CSS\CSS_Handler::is_writable();

echo 'RESULT:' . var_export( $result, true ) . "\n"; // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_var_export
echo "REQUEST COMPLETED WITHOUT FATAL\n";
