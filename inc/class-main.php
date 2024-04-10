<?php
/**
 * Loader.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

use enshrined\svgSanitize\Sanitizer;
use ThemeIsle\GutenbergBlocks\Plugins\LimitedOffers;
use ThemeIsle\GutenbergBlocks\Server\Dashboard_Server;

/**
 * Class Main
 */
class Main {
	/**
	 * Singleton.
	 *
	 * @var Main|null Class object.
	 */
	protected static $instance = null;

	/**
	 * Method to define hooks needed.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function init() {
		if ( ! defined( 'THEMEISLE_BLOCKS_VERSION' ) ) {
			define( 'THEMEISLE_BLOCKS_VERSION', '1.7.0' );
		}

		add_action( 'init', array( $this, 'autoload_classes' ), 9 );
		add_filter( 'script_loader_tag', array( $this, 'filter_script_loader_tag' ), 10, 2 );
		add_filter( 'safe_style_css', array( $this, 'used_css_properties' ), 99 );
		add_filter( 'wp_kses_allowed_html', array( $this, 'used_html_properties' ), 10, 2 );
		add_action( 'init', array( $this, 'after_update_migration' ) );

		if ( ! function_exists( 'is_wpcom_vip' ) ) {
			add_filter( 'upload_mimes', array( $this, 'allow_meme_types' ), PHP_INT_MAX ); // phpcs:ignore WordPressVIPMinimum.Hooks.RestrictedHooks.upload_mimes
			add_filter( 'wp_handle_upload_prefilter', array( $this, 'check_svg_and_sanitize' ) );
			add_filter( 'wp_check_filetype_and_ext', array( $this, 'fix_mime_type_json_svg' ), 75, 3 );
			add_filter( 'wp_generate_attachment_metadata', array( $this, 'generate_svg_attachment_metadata' ), PHP_INT_MAX, 2 );
		}

		add_filter( 'otter_blocks_about_us_metadata', array( $this, 'about_page' ) );

	}

	/**
	 * Autoload classes for each block.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function autoload_classes() {
		load_plugin_textdomain( 'otter-blocks', false, basename( OTTER_BLOCKS_PATH ) . '/languages' );

		$classnames = array(
			'\ThemeIsle\GutenbergBlocks\Registration',
			'\ThemeIsle\GutenbergBlocks\Patterns',
			'\ThemeIsle\GutenbergBlocks\Pro',
			'\ThemeIsle\GutenbergBlocks\Blocks_Export_Import',
			'\ThemeIsle\GutenbergBlocks\CSS\Block_Frontend',
			'\ThemeIsle\GutenbergBlocks\CSS\CSS_Handler',
			'\ThemeIsle\GutenbergBlocks\Plugins\Block_Conditions',
			'\ThemeIsle\GutenbergBlocks\Plugins\Dashboard',
			'\ThemeIsle\GutenbergBlocks\Plugins\Dynamic_Content',
			'\ThemeIsle\GutenbergBlocks\Plugins\FSE_Onboarding',
			'\ThemeIsle\GutenbergBlocks\Plugins\Options_Settings',
			'\ThemeIsle\GutenbergBlocks\Plugins\Stripe_API',
			'\ThemeIsle\GutenbergBlocks\Render\Masonry_Variant',
			'\ThemeIsle\GutenbergBlocks\Server\Dashboard_Server',
			'\ThemeIsle\GutenbergBlocks\Server\Dynamic_Content_Server',
			'\ThemeIsle\GutenbergBlocks\Server\Stripe_Server',
			'\ThemeIsle\GutenbergBlocks\Server\FSE_Onboarding_Server',
			'\ThemeIsle\GutenbergBlocks\Integration\Form_Providers',
			'\ThemeIsle\GutenbergBlocks\Integration\Form_Email',
			'\ThemeIsle\GutenbergBlocks\Server\Form_Server',
			'\ThemeIsle\GutenbergBlocks\Server\Prompt_Server',
		);

		$classnames = apply_filters( 'otter_blocks_autoloader', $classnames );

		foreach ( $classnames as $classname ) {
			$classname = new $classname();

			if ( method_exists( $classname, 'instance' ) ) {
				$classname->instance();
			}
		}

		if ( class_exists( '\ThemeIsle\GutenbergBlocks\Blocks_CSS' ) && get_option( 'themeisle_blocks_settings_css_module', true ) ) {
			\ThemeIsle\GutenbergBlocks\Blocks_CSS::instance();
		}

		if ( class_exists( '\ThemeIsle\GutenbergBlocks\Blocks_Animation' ) && get_option( 'themeisle_blocks_settings_blocks_animation', true ) ) {
			\ThemeIsle\GutenbergBlocks\Blocks_Animation::instance();
		}
	}

	/**
	 * Get global defaults.
	 *
	 * @since   1.4.0
	 * @access  public
	 */
	public static function get_global_defaults() {
		$defaults = get_theme_support( 'otter_global_defaults' );
		if ( ! is_array( $defaults ) ) {
			return false;
		}

		return current( $defaults );
	}

	/**
	 * Adds async/defer attributes to enqueued / registered scripts.
	 *
	 * If #12009 lands in WordPress, this function can no-op since it would be handled in core.
	 *
	 * @link https://core.trac.wordpress.org/ticket/12009
	 *
	 * @param string $tag The script tag.
	 * @param string $handle The script handle.
	 *
	 * @return string Script HTML string.
	 */
	public function filter_script_loader_tag( $tag, $handle ) {
		foreach ( array( 'async', 'defer' ) as $attr ) {
			if ( ! wp_scripts()->get_data( $handle, $attr ) ) {
				continue;
			}
			// Prevent adding attribute when already added in #12009.
			if ( ! preg_match( ":\s$attr(=|>|\s):", $tag ) ) {
				$tag = preg_replace( ':(?=></script>):', " $attr", $tag, 1 );
			}
			// Only allow async or defer, not both.
			break;
		}

		return $tag;
	}

	/**
	 * Used CSS properties
	 *
	 * @param array $attr Array to check.
	 *
	 * @return array
	 * @since   2.0.0
	 * @access  public
	 */
	public function used_css_properties( $attr ) {
		$props = array(
			'background-attachment',
			'background-position',
			'background-repeat',
			'background-size',
			'border-radius',
			'border-top-left-radius',
			'border-top-right-radius',
			'border-bottom-right-radius',
			'border-bottom-left-radius',
			'box-shadow',
			'display',
			'justify-content',
			'mix-blend-mode',
			'opacity',
			'text-shadow',
			'text-transform',
			'transform',
		);

		$list = array_merge( $props, $attr );

		return $list;
	}

	/**
	 * Used HTML properties
	 *
	 * @param array  $tags Allowed HTML tags.
	 * @param string $context Context.
	 *
	 * @return array
	 * @since   2.0.11
	 * @access  public
	 */
	public function used_html_properties( $tags, $context ) {
		if ( 'post' !== $context ) {
			return $tags;
		}

		$global_attributes = array(
			'aria-describedby' => true,
			'aria-details'     => true,
			'aria-label'       => true,
			'aria-labelledby'  => true,
			'aria-hidden'      => true,
			'class'            => true,
			'data-*'           => true,
			'dir'              => true,
			'id'               => true,
			'lang'             => true,
			'style'            => true,
			'title'            => true,
			'role'             => true,
			'xml:lang'         => true,
		);

		if ( isset( $tags['div'] ) ) {
			$tags['div']['name'] = true;
		}

		if ( isset( $tags['form'] ) ) {
			$tags['form']['class'] = true;
		} else {
			$tags['form'] = array(
				'class' => true,
			);
		}

		if ( ! isset( $tags['svg'] ) ) {
			$tags['svg'] = array_merge(
				array(
					'xmlns'   => true,
					'width'   => true,
					'height'  => true,
					'viewbox' => true,
				),
				$global_attributes
			);
		}

		if ( ! isset( $tags['g'] ) ) {
			$tags['g'] = array( 'fill' => true );
		}

		if ( ! isset( $tags['title'] ) ) {
			$tags['title'] = array( 'title' => true );
		}

		if ( ! isset( $tags['path'] ) ) {
			$tags['path'] = array(
				'd'    => true,
				'fill' => true,
			);
		}

		if ( ! isset( $tags['lottie-player'] ) ) {
			$tags['lottie-player'] = array_merge(
				array(
					'autoplay'   => true,
					'hover'      => true,
					'loop'       => true,
					'count'      => true,
					'speed'      => true,
					'direction'  => true,
					'trigger'    => true,
					'mode'       => true,
					'background' => true,
					'src'        => true,
					'width'      => true,
				),
				$global_attributes
			);
		}

		if ( ! isset( $tags['dotlottie-player'] ) ) {
			$tags['dotlottie-player'] = array_merge(
				array(
					'autoplay'   => true,
					'loop'       => true,
					'count'      => true,
					'speed'      => true,
					'direction'  => true,
					'trigger'    => true,
					'mode'       => true,
					'background' => true,
					'src'        => true,
					'width'      => true,
				),
				$global_attributes
			);
		}

		if ( ! isset( $tags['o-dynamic'] ) ) {
			$tags['o-dynamic'] = $global_attributes;
		}

		if ( ! isset( $tags['o-dynamic-link'] ) ) {
			$tags['o-dynamic-link'] = $global_attributes;
		}

		if ( ! isset( $tags['input'] ) ) {
			$tags['input'] = array();
		}

		$tags['input'] = array_merge(
			$tags['input'],
			array(
				'type'        => true,
				'name'        => true,
				'required'    => true,
				'placeholder' => true,
			),
			$global_attributes
		);

		$textarea = array();

		if ( ! isset( $tags['textarea'] ) ) {
			$tags['textarea'] = array();
		}

		$tags['textarea'] = array_merge(
			$tags['textarea'],
			array(
				'name'        => true,
				'required'    => true,
				'placeholder' => true,
				'rows'        => true,
			),
			$global_attributes
		);

		return $tags;
	}

	/**
	 * Allow JSON uploads
	 *
	 * @param array $mimes Supported mimes.
	 *
	 * @return array
	 * @since  1.5.7
	 * @access public
	 */
	public function allow_meme_types( $mimes ) {
		if ( ! isset( $mimes['json'] ) ) {
			$mimes['json'] = 'application/json';
		}

		if ( ! isset( $mimes['lottie'] ) ) {
			$mimes['lottie'] = 'application/zip';
		}

		if ( ! isset( $mimes['svg'] ) ) {
			$mimes['svg'] = 'image/svg+xml';
		}

		if ( ! isset( $mimes['svgz'] ) ) {
			$mimes['svgz'] = 'image/svg+xml';
		}

		return $mimes;
	}

	/**
	 * Check if the file is an SVG, if so handle appropriately
	 *
	 * @param array $file An array of data for a single file.
	 *
	 * @return mixed
	 */
	public function check_svg_and_sanitize( $file ) {
		// Ensure we have a proper file path before processing.
		if ( ! isset( $file['tmp_name'] ) ) {
			return $file;
		}

		$file_name   = isset( $file['name'] ) ? $file['name'] : '';
		$wp_filetype = wp_check_filetype_and_ext( $file['tmp_name'], $file_name );
		$type        = ! empty( $wp_filetype['type'] ) ? $wp_filetype['type'] : '';

		if ( 'image/svg+xml' === $type ) {
			if ( ! current_user_can( 'upload_files' ) ) {
				$file['error'] = __(
					'Sorry, you are not allowed to upload files.',
					'otter-blocks'
				);

				return $file;
			}

			if ( ! $this->sanitize_svg( $file['tmp_name'] ) ) {
				$file['error'] = __(
					"Sorry, this file couldn't be sanitized so for security reasons wasn't uploaded",
					'otter-blocks'
				);
			}
		}

		return $file;
	}

	/**
	 * Sanitize the SVG
	 *
	 * @param string $file Temp file path.
	 *
	 * @return bool|int
	 */
	protected function sanitize_svg( $file ) {
		// We can ignore the phpcs warning here as we're reading and writing to the Temp file.
		$dirty = file_get_contents( $file ); // phpcs:ignore

		// Is the SVG gzipped? If so we try and decode the string.
		$is_zipped = $this->is_gzipped( $dirty );
		if ( $is_zipped && ( ! function_exists( 'gzdecode' ) || ! function_exists( 'gzencode' ) ) ) {
			return false;
		}

		if ( $is_zipped ) {
			$dirty = gzdecode( $dirty );

			// If decoding fails, bail as we're not secure.
			if ( false === $dirty ) {
				return false;
			}
		}

		$sanitizer = new Sanitizer();
		$clean     = $sanitizer->sanitize( $dirty );

		if ( false === $clean ) {
			return false;
		}

		// If we were gzipped, we need to re-zip.
		if ( $is_zipped ) {
			$clean = gzencode( $clean );
		}

		// We can ignore the phpcs warning here as we're reading and writing to the Temp file.
		file_put_contents( $file, $clean ); // phpcs:ignore

		return true;
	}

	/**
	 * Check if the contents are gzipped
	 *
	 * @see http://www.gzip.org/zlib/rfc-gzip.html#member-format
	 *
	 * @param string $contents Content to check.
	 *
	 * @return bool
	 */
	protected function is_gzipped( $contents ) {
		// phpcs:disable Generic.Strings.UnnecessaryStringConcat.Found
		if ( function_exists( 'mb_strpos' ) ) {
			return 0 === mb_strpos( $contents, "\x1f" . "\x8b" . "\x08" );
		} else {
			return 0 === strpos( $contents, "\x1f" . "\x8b" . "\x08" );
		}
		// phpcs:enable
	}

	/**
	 * Allow JSON uploads
	 *
	 * @param array  $data File data.
	 * @param string $file File object.
	 * @param string $filename File name.
	 *
	 * @return array
	 * @since  1.5.7
	 * @access public
	 */
	public function fix_mime_type_json_svg( $data, $file, $filename ) {
		$ext = isset( $data['ext'] ) ? $data['ext'] : '';
		if ( 1 > strlen( $ext ) ) {
			$exploded = explode( '.', $filename );
			$ext      = strtolower( end( $exploded ) );
		}
		if ( 'json' === $ext ) {
			$data['type'] = 'application/json';
			$data['ext']  = 'json';
		}
		if ( 'svg' === $ext ) {
			$data['type'] = 'image/svg+xml';
			$data['ext']  = 'svg';
		}
		return $data;
	}

	/**
	 * Generate SVG attachment metadata if no other plugins does it.
	 *
	 * @param array   $metadata The metadata for and attachment.
	 * @param numeric $attachment_id The attachment ID.
	 * @return array
	 */
	public function generate_svg_attachment_metadata( $metadata, $attachment_id ) {

		if ( 'image/svg+xml' !== get_post_mime_type( $attachment_id ) ) {
			return $metadata;
		}

		if ( isset( $metadata['width'], $metadata['height'] ) ) {
			return $metadata;
		}

		$svg_path = get_attached_file( $attachment_id );
		$filename = basename( $svg_path );

		$svg        = simplexml_load_file( $svg_path );
		$attributes = $svg->attributes();

		// Update metadata with SVG dimensions.
		$metadata['width']  = intval( (string) $attributes->width );
		$metadata['height'] = intval( (string) $attributes->height );
		$metadata['file']   = $filename;

		return $metadata;
	}


	/**
	 * After Update Migration
	 *
	 * @since  2.0.9
	 * @access public
	 */
	public function after_update_migration() {
		$db_version = get_option( 'themeisle_blocks_db_version', 0 );

		if ( version_compare( $db_version, OTTER_BLOCKS_VERSION, '<' ) ) {
			Dashboard_Server::regenerate_styles();
			do_action( 'otter_blocks_plugin_update' );
		}

		return update_option( 'themeisle_blocks_db_version', OTTER_BLOCKS_VERSION );
	}

	/**
	 * About page SDK
	 *
	 * @return array
	 * @since  2.3.1
	 * @access public
	 */
	public function about_page() {
		return array(
			'location'         => 'otter',
			'logo'             => esc_url_raw( OTTER_BLOCKS_URL . 'assets/images/logo-alt.png' ),
			'has_upgrade_menu' => ! DEFINED( 'OTTER_PRO_VERSION' ),
			'upgrade_link'     => tsdk_utmify( Pro::get_url(), 'editor', Pro::get_reference() ),
			'upgrade_text'     => __( 'Get Otter Pro', 'otter-blocks' ),
		);
	}

	/**
	 * Singleton method.
	 *
	 * @static
	 *
	 * @return  Main
	 * @since   1.0.0
	 * @access  public
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access  public
	 * @return  void
	 * @since   1.0.0
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access  public
	 * @return  void
	 * @since   1.0.0
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0.0' );
	}
}
