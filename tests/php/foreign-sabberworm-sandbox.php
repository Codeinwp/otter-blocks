<?php
/**
 * Standalone sandbox for the Sabberworm dependency-collision regression (issue #2942).
 *
 * Simulates another plugin having already loaded a newer php-css-parser release:
 * its `Commentable` interface declares typed signatures, so loading Otter's
 * bundled untyped `CSSList` fatals at class-link time on PHP 8.1+ with
 * "Declaration of ... addComments(array $aComments) must be compatible ...".
 * Base_CSS::get_animation_css() must detect the foreign copy and fall back to
 * enqueueing the full stock stylesheet instead of parsing.
 *
 * Run in a separate PHP process (no WordPress loaded):
 *   php foreign-sabberworm-sandbox.php
 *
 * @package gutenberg-blocks
 */

// phpcs:ignoreFile -- multi-namespace sandbox executed outside WordPress.

namespace Sabberworm\CSS\Comment {
	// The typed interface shape shipped by php-css-parser 9.x.
	interface Commentable {
		public function addComments( array $comments ): void;
		public function getComments(): array;
		public function setComments( array $comments ): void;
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
	function wp_enqueue_style( $handle ) { echo 'ENQUEUED:' . $handle . "\n"; }

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
