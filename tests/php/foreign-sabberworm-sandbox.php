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
 *   php foreign-sabberworm-sandbox.php [commentable|outputformat|ruleset]
 *
 * - `commentable` (default): the typed 9.x `Commentable` interface is preloaded —
 *   loading the bundled untyped `CSSList` then fatals at class-link time on
 *   PHP 8.1+ with "Declaration of ... must be compatible ...".
 * - `outputformat`: a foreign copy of the non-sentinel `OutputFormat` class is
 *   preloaded — proving the guard rejects any foreign `Sabberworm\CSS` symbol,
 *   not only its sentinels.
 * - `ruleset`: the typed interface is preloaded, Otter's Composer autoloader is
 *   registered as on boot, and another plugin requests `RuleSet` directly — the
 *   bundled copy must not be served to it.
 *
 * @package gutenberg-blocks
 */

// phpcs:ignoreFile -- multi-namespace sandbox executed outside WordPress.

namespace {
	$GLOBALS['otter_sandbox_scenario'] = isset( $argv[1] ) ? $argv[1] : 'commentable';
}

namespace Sabberworm\CSS\Comment {
	if ( in_array( $GLOBALS['otter_sandbox_scenario'], array( 'commentable', 'ruleset' ), true ) ) {
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

	// Base_CSS reads block class names through Registration::get_class_name().
	require OTTER_BLOCKS_PATH . '/inc/class-registration.php';
	require OTTER_BLOCKS_PATH . '/inc/class-base-css.php';

	if ( 'ruleset' === $GLOBALS['otter_sandbox_scenario'] ) {
		// The other plugin's own autoloader, registered before Otter's.
		spl_autoload_register(
			function ( $class ) {
				if ( 'Sabberworm\\CSS\\RuleSet\\RuleSet' === $class ) {
					echo "RULESET_LEFT_TO_FOREIGN_AUTOLOADER\n";
				}
			}
		);

		require OTTER_BLOCKS_PATH . '/vendor/autoload.php';
		\ThemeIsle\GutenbergBlocks\Base_CSS::isolate_bundled_parser();

		class_exists( 'Sabberworm\\CSS\\RuleSet\\RuleSet' );
	}

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
