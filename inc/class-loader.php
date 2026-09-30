<?php
/**
 * Class Loader.
 *
 * @package Gutenberg Blocks
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Loader.
 *
 * Boots classes listed by the plugin or contributed through a filter. A stale
 * classmap, a partial install or a third-party filter can name a class that is
 * not loadable or not constructible; every helper here degrades to a logged
 * skip rather than fataling the request.
 */
class Loader {

	/**
	 * Skips already reported this request, keyed by class name and reason.
	 *
	 * @var array<string, bool>
	 */
	private static $reported = array();

	/**
	 * Instantiate a class without ever fataling the request.
	 *
	 * @param mixed $classname Class name to instantiate.
	 * @return object|null The instance, or null when it cannot be built.
	 */
	public static function instantiate( $classname ) {
		if ( ! is_string( $classname ) || '' === trim( $classname ) ) {
			self::log_skipped( $classname, 'is not a class name' );

			return null;
		}

		try {
			// An autoloader can throw or fatal on its own; keep it inside the try.
			$skip_reason = self::load_class( $classname );

			if ( null !== $skip_reason ) {
				self::log_skipped( $classname, $skip_reason );

				return null;
			}

			$reflection = new \ReflectionClass( $classname );

			if ( ! $reflection->isInstantiable() ) {
				self::log_skipped( $classname, 'is not instantiable' );

				return null;
			}

			$constructor = $reflection->getConstructor();

			if ( null !== $constructor && $constructor->getNumberOfRequiredParameters() > 0 ) {
				self::log_skipped( $classname, 'requires constructor arguments' );

				return null;
			}

			return $reflection->newInstance();
		} catch ( \Throwable $e ) {
			// Covers Error too: a missing dependency inside the constructor.
			self::log_skipped( $classname, 'threw while being instantiated: ' . $e->getMessage() );

			return null;
		}
	}

	/**
	 * Instantiate a class and run its instance() method when it has one.
	 *
	 * @param mixed $classname Class name to boot.
	 * @return object|null The instance, or null when it could not be built.
	 */
	public static function boot( $classname ) {
		$instance = self::instantiate( $classname );

		if ( null === $instance || ! method_exists( $instance, 'instance' ) ) {
			return $instance;
		}

		try {
			$instance->instance();
		} catch ( \Throwable $e ) {
			// The constructor succeeded, so the failure is in the boot step only.
			self::log_skipped( $classname, 'threw while booting: ' . $e->getMessage() );
		}

		return $instance;
	}

	/**
	 * Run the static instance() accessor of a singleton module, if it is available.
	 *
	 * @param mixed $classname Class name exposing a static instance().
	 * @return bool True when the module was booted.
	 */
	public static function boot_singleton( $classname ) {
		if ( ! is_string( $classname ) || '' === trim( $classname ) ) {
			self::log_skipped( $classname, 'is not a class name' );

			return false;
		}

		try {
			$skip_reason = self::load_class( $classname );

			if ( null !== $skip_reason ) {
				self::log_skipped( $classname, $skip_reason );

				return false;
			}

			if ( ! method_exists( $classname, 'instance' ) ) {
				return false;
			}

			$classname::instance();

			return true;
		} catch ( \Throwable $e ) {
			self::log_skipped( $classname, 'threw while booting: ' . $e->getMessage() );

			return false;
		}
	}

	/**
	 * Autoload a class through the full autoload stack, without Composer's warnings for stale classmap entries.
	 *
	 * @param string $classname Class name.
	 * @return string|null Why the class is unavailable, or null when it is loaded.
	 */
	private static function load_class( $classname ) {
		$had_stale_mapping = self::clear_stale_mappings( $classname );

		if ( class_exists( $classname ) ) {
			return null;
		}

		return $had_stale_mapping ? 'mapped file is missing' : 'could not be loaded';
	}

	/**
	 * Blank out Composer classmap entries whose file is gone.
	 *
	 * Composer trusts its classmap and includes a mapped path unchecked, so a stale
	 * entry warns even when a later autoloader then defines the class. Composer only
	 * includes a non-empty path, so an emptied entry is passed over silently and PHP
	 * still moves on to the next autoloader, with any other error raised as usual.
	 *
	 * @param string $classname Class name, with or without a leading backslash.
	 * @return bool True when any registered Composer loader mapped the class to an unreadable file.
	 */
	private static function clear_stale_mappings( $classname ) {
		if ( class_exists( $classname, false ) || ! class_exists( '\Composer\Autoload\ClassLoader', false ) ) {
			return false;
		}

		try {
			$loaders = \Composer\Autoload\ClassLoader::getRegisteredLoaders();
		} catch ( \Throwable $e ) {
			// Another plugin loaded a pre-2.0 ClassLoader, which cannot list its loaders.
			return false;
		}

		// Classmap keys carry no leading backslash.
		$class = ltrim( $classname, '\\' );
		$stale = false;

		foreach ( $loaders as $loader ) {
			$file = $loader->findFile( $class );

			if ( ! is_string( $file ) || is_readable( $file ) ) {
				continue;
			}

			$stale = true;

			// loadClass() skips an empty path instead of including it.
			$loader->addClassMap( array( $class => '' ) );
		}

		return $stale;
	}

	/**
	 * Log a class the plugin had to skip.
	 *
	 * @param mixed  $classname Class name, or whatever was given in its place.
	 * @param string $reason    Why it was skipped.
	 * @return void
	 */
	public static function log_skipped( $classname, $reason ) {
		$label = is_string( $classname ) ? $classname : gettype( $classname );
		$key   = $label . '|' . $reason;

		if ( isset( self::$reported[ $key ] ) ) {
			return;
		}

		self::$reported[ $key ] = true;

		error_log( '[Otter Blocks] Skipped ' . $label . ': ' . $reason . '.' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
	}

	/**
	 * Forget which skips have been reported, so a later failure is logged again.
	 *
	 * @return void
	 */
	public static function reset_reported() {
		self::$reported = array();
	}
}
