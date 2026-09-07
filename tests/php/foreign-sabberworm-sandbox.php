<?php
/**
 * Standalone sandbox for the Sabberworm dependency-collision regression (issue #2942).
 *
 * Simulates another plugin having already loaded classes from a different
 * php-css-parser release, which makes mixing in Otter's bundled copy fatal at
 * class-link or call time. Base_CSS::get_animation_css() must detect the
 * foreign copy and skip the optimization instead of parsing.
 *
 * Run in a separate PHP process (no WordPress loaded):
 *   php foreign-sabberworm-sandbox.php [commentable|outputformat]
 *
 * - `commentable` (default): the typed 9.x `Commentable` interface is preloaded —
 *   loading the bundled untyped `CSSList` then fatals at class-link time on
 *   PHP 8.1+ with "Declaration of ... must be compatible ...".
 * - `outputformat`: a foreign copy of the non-sentinel `OutputFormat` class is
 *   preloaded — proving the guard rejects any foreign `Sabberworm\CSS` symbol,
 *   not only its sentinels.
 *
 * @package gutenberg-blocks
 */

// phpcs:ignoreFile -- multi-namespace sandbox executed outside WordPress.

namespace {
	$GLOBALS['otter_sandbox_scenario'] = isset( $argv[1] ) ? $argv[1] : 'commentable';
}

namespace Sabberworm\CSS\Comment {
	if ( 'commentable' === $GLOBALS['otter_sandbox_scenario'] ) {
		// The typed interface shape shipped by php-css-parser 9.x.
		interface Commentable {
			public function addComments( array $comments ): void;
			public function getComments(): array;
			public function setComments( array $comments ): void;
		}
	}
}

namespace Sabberworm\CSS {
	if ( 'outputformat' === $GLOBALS['otter_sandbox_scenario'] ) {
		// A foreign copy of a class the parser uses but the guard's sentinels
		// do not cover, as another plugin's autoloader would leave behind.
		class OutputFormat {}
	}
}

namespace {
	error_reporting( E_ALL );

	define( 'OTTER_BLOCKS_PATH', dirname( dirname( __DIR__ ) ) );
	define( 'MONTH_IN_SECONDS', 30 * 24 * 60 * 60 );

	function get_transient( $key ) { return false; }
	function set_transient( $key, $value, $expiration ) { return true; }
	function get_option( $key, $default_value = false ) { return $default_value; }
	function add_action() {}
	function add_filter() {}
	function apply_filters( $tag, $value ) { return $value; }
	function wp_normalize_path( $path ) { return str_replace( '\\', '/', $path ); }
	function wp_enqueue_style( $handle ) {}

	// Minimal autoloader for Otter's bundled parser only — mirrors the situation
	// where Otter's Composer autoloader serves the remaining Sabberworm classes.
	spl_autoload_register(
		function ( $class ) {
			$prefix = 'Sabberworm\\CSS\\';
			if ( 0 !== strpos( $class, $prefix ) ) {
				return;
			}
			$file = OTTER_BLOCKS_PATH . '/vendor/sabberworm/php-css-parser/src/' . str_replace( '\\', '/', substr( $class, strlen( $prefix ) ) ) . '.php';
			if ( is_file( $file ) ) {
				require $file;
			}
		}
	);

	// Base_CSS reads block class names through Registration::get_class_name().
	require OTTER_BLOCKS_PATH . '/inc/class-registration.php';
	require OTTER_BLOCKS_PATH . '/inc/class-base-css.php';

	$base   = new \ThemeIsle\GutenbergBlocks\Base_CSS();
	$blocks = array(
		array(
			'blockName' => 'core/paragraph',
			'attrs'     => array( 'className' => 'animated fadeIn' ),
		),
	);

	$css = $base->get_animation_css( $blocks );

	echo 'CSS_LENGTH:' . strlen( (string) $css ) . "\n";
	echo "REQUEST COMPLETED WITHOUT FATAL\n";
}
