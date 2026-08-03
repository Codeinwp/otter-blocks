<?php
/**
 * Fallback autoloader for the plugin's own classes.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Autoloader
 *
 * Composer resolves `ThemeIsle\GutenbergBlocks\*` through the classmap it generates
 * into `vendor/`. When that map does not match the files on disk — an interrupted
 * plugin update, an OPcache entry compiled from the previous version — a class that
 * is present becomes unloadable. This loader resolves such a class from its file
 * name instead. It is registered after Composer, so it only runs when Composer has
 * no answer for the class.
 */
class Autoloader {

	/**
	 * Namespace this loader answers for.
	 */
	const PREFIX = 'ThemeIsle\\GutenbergBlocks\\';

	/**
	 * Append the loader to the SPL autoload stack.
	 *
	 * @return void
	 */
	public static function register() {
		spl_autoload_register( array( __CLASS__, 'load' ) );
	}

	/**
	 * Load a class from the file its name maps to.
	 *
	 * @param string $class_name Fully-qualified class name.
	 * @return void
	 */
	public static function load( $class_name ) {
		$file = self::path_for( $class_name );

		if ( false !== $file ) {
			require_once $file;
		}
	}

	/**
	 * Existing file for a class name, following the WordPress file naming convention.
	 *
	 * `ThemeIsle\GutenbergBlocks\Plugins\Atomic_Wind_Blocks` maps to
	 * `inc/plugins/class-atomic-wind-blocks.php`.
	 *
	 * @param string $class_name Fully-qualified class name.
	 * @return string|false Readable file path, or false when the class is not ours or has no file.
	 */
	public static function path_for( $class_name ) {
		if ( 0 !== strpos( $class_name, self::PREFIX ) ) {
			return false;
		}

		$relative = strtolower(
			str_replace(
				array( '\\', '_' ),
				array( '/', '-' ),
				substr( $class_name, strlen( self::PREFIX ) )
			)
		);

		$separator = strrpos( $relative, '/' );
		$relative  = false === $separator
			? 'class-' . $relative
			: substr( $relative, 0, $separator + 1 ) . 'class-' . substr( $relative, $separator + 1 );

		foreach ( self::candidates( $relative ) as $file ) {
			if ( is_readable( $file ) ) {
				return $file;
			}
		}

		return false;
	}

	/**
	 * Files a relative class path can live in.
	 *
	 * @param string $relative Class path relative to `inc/`, without extension.
	 * @return array<int, string>
	 */
	private static function candidates( $relative ) {
		$files = array( OTTER_BLOCKS_PATH . '/inc/' . $relative . '.php' );

		// The Integration namespace lives in inc/integrations/.
		if ( 0 === strpos( $relative, 'integration/' ) ) {
			$files[] = OTTER_BLOCKS_PATH . '/inc/integrations/' . substr( $relative, strlen( 'integration/' ) ) . '.php';
		}

		return $files;
	}
}
