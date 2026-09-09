<?php
/**
 * Isolated frontend asset-loading checks for Blocks Animation with older Otter.
 *
 * Run: php animation-compatibility-sandbox.php [legacy|owned|foreign|standalone|disabled]
 *
 * @package gutenberg-blocks
 */

// phpcs:ignoreFile -- WordPress stubs and incompatible class shapes need an isolated process.

namespace ThemeIsle\GutenbergBlocks {
	if ( 'legacy' === $argv[1] ) {
		// Otter <= 3.2.2 has Base_CSS but no has_own_css_parser() method.
		class Base_CSS {}
	} else {
		class Base_CSS {
			public static function has_own_css_parser() {
				if ( in_array( $GLOBALS['argv'][1], array( 'standalone', 'disabled' ), true ) ) {
					throw new \RuntimeException( 'Parser check must be skipped.' );
				}
				return 'owned' === $GLOBALS['argv'][1];
			}
		}
	}
}

namespace {
	$root = dirname( __DIR__, 2 );
	$temp = sys_get_temp_dir() . '/otter-animation-' . uniqid();
	mkdir( $temp . '/build/animation', 0777, true );
	file_put_contents( $temp . '/build/animation/frontend.asset.php', '<?php return array("version" => "test", "dependencies" => array());' );
	register_shutdown_function( function () use ( $temp ) {
		unlink( $temp . '/build/animation/frontend.asset.php' );
		rmdir( $temp . '/build/animation' );
		rmdir( $temp . '/build' );
		rmdir( $temp );
	} );
	define( 'BLOCKS_ANIMATION_PATH', $temp );
	define( 'BLOCKS_ANIMATION_URL', 'https://example.org/animation/' );
	if ( 'standalone' !== $argv[1] ) {
		define( 'OTTER_BLOCKS_VERSION', 'legacy' === $argv[1] ? '3.2.2' : '3.2.3' );
	}
	$styles = array();
	$scripts = array();
	function get_option( $name, $default = false ) { return 'disabled' !== $GLOBALS['argv'][1]; }
	function wp_register_style() {}
	function wp_enqueue_style( $handle ) { $GLOBALS['styles'][] = $handle; }
	function wp_enqueue_script( $handle ) { $GLOBALS['scripts'][] = $handle; }
	function wp_script_add_data() {}
	function add_action() {}

	require $root . '/inc/class-blocks-animation.php';
	$animation = new \ThemeIsle\GutenbergBlocks\Blocks_Animation();
	$content = '<p class="animated fadeIn">Example</p>';
	$result = $animation->frontend_load( $content, array( 'blockName' => 'core/paragraph' ) );
	$expected_styles = 'owned' === $argv[1] ? array() : array( 'otter-animation' );
	if ( $content !== $result || $styles !== $expected_styles || array( 'otter-animation-frontend' ) !== $scripts ) {
		throw new \RuntimeException( 'Animated content or asset loading is incorrect.' );
	}
	// A second animated block must not enqueue duplicate assets.
	$animation->frontend_load( $content, array( 'blockName' => 'core/paragraph' ) );
	if ( $styles !== $expected_styles || array( 'otter-animation-frontend' ) !== $scripts ) {
		throw new \RuntimeException( 'Animation assets were enqueued twice.' );
	}
	echo "REQUEST COMPLETED WITHOUT FATAL\n";
}
