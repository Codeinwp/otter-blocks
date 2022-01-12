<?php
/**
 * Css handling logic.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS
 */

namespace ThemeIsle\GutenbergBlocks\CSS;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use WP_REST_Request;

/**
 * Class Block_Frontend
 */
class Block_Frontend extends Base_CSS {

	/**
	 * The main instance var.
	 *
	 * @var Block_Frontend
	 */
	public static $instance = null;

	/**
	 * The namespace to check if excerpt exists.
	 *
	 * @var bool
	 */
	private $has_excerpt = false;

	/**
	 * The namespace to check if fonts exists.
	 *
	 * @var bool
	 */
	private $has_fonts = true;

	/**
	 * Inline CSS size.
	 *
	 * @var int
	 */
	private $total_inline_size = 0;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_filter( 'get_the_excerpt', array( $this, 'get_excerpt_start' ), 1 );
		add_action( 'wp', array( $this, 'render_post_css' ), 10 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_google_fonts' ), 19 );
		add_action( 'wp_head', array( $this, 'enqueue_google_fonts_backward' ), 19 );
		add_filter( 'get_the_excerpt', array( $this, 'get_excerpt_end' ), 20 );
		add_filter( 'wp_footer', array( $this, 'enqueue_widgets_css' ) );
	}

	/**
	 * Method to start checking if excerpt exists.
	 *
	 * @param string $excerpt Excerpt.
	 *
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function get_excerpt_start( $excerpt ) {
		$this->has_excerpt = true;

		return $excerpt;
	}

	/**
	 * Method to stop checking if excerpt exists.
	 *
	 * @param string $excerpt Excerpt.
	 *
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function get_excerpt_end( $excerpt ) {
		$this->has_excerpt = false;

		return $excerpt;
	}

	/**
	 * Method to define hooks needed.
	 *
	 * @param int $post_id Post id.
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function enqueue_google_fonts( $post_id = '' ) {
		if ( ! is_singular() && ! $post_id ) {
			return;
		}

		$post_id    = $post_id ? $post_id : get_the_ID();
		$fonts_list = get_post_meta( $post_id, '_themeisle_gutenberg_block_fonts', true );
		$content    = get_post_field( 'post_content', $post_id );
		$blocks     = $this->parse_blocks( $content );

		if ( is_array( $blocks ) || ! empty( $blocks ) ) {
			$this->enqueue_reusable_fonts( $blocks );
		}

		if ( empty( $fonts_list ) ) {
			$this->has_fonts = false;

			return;
		}

		$fonts = array();

		if ( count( $fonts_list ) > 0 ) {
			foreach ( $fonts_list as $font ) {
				if ( empty( $font['fontfamily'] ) ) {
					continue;
				}
				$item = str_replace( ' ', '+', $font['fontfamily'] );
				if ( count( $font['fontvariant'] ) > 0 ) {
					$item .= ':' . implode( ',', $font['fontvariant'] );
				}
				array_push( $fonts, $item );
			}

			if ( count( $fonts ) > 0 ) {
				wp_enqueue_style( 'otter-google-fonts-' . $post_id, '//fonts.googleapis.com/css?family=' . implode( '|', $fonts ), [], THEMEISLE_BLOCKS_VERSION );
			}
		}
	}

	/**
	 * Method to define hooks needed.
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function enqueue_google_fonts_backward() {
		if ( $this->has_fonts ) {
			return;
		}

		$fonts = array();

		if ( count( self::$google_fonts ) > 0 ) {
			foreach ( self::$google_fonts as $font ) {
				$item = str_replace( ' ', '+', $font['fontfamily'] );
				if ( count( $font['fontvariant'] ) > 0 ) {
					$item .= ':' . implode( ',', $font['fontvariant'] );
				}
				array_push( $fonts, $item );
			}

			wp_enqueue_style( 'otter-google-fonts', '//fonts.googleapis.com/css?family=' . implode( '|', $fonts ), [], THEMEISLE_BLOCKS_VERSION );
		}
	}

	/**
	 * Get Google Fonts for Reusable Blocks
	 *
	 * @param array $blocks Blocks list.
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function enqueue_reusable_fonts( $blocks ) {
		foreach ( $blocks as $block ) {
			if ( 'core/block' === $block['blockName'] && ! empty( $block['attrs']['ref'] ) ) {
				$this->enqueue_google_fonts( $block['attrs']['ref'] );
			}

			if ( isset( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$this->enqueue_reusable_fonts( $block['innerBlocks'] );
			}
		}
	}

	/**
	 * Render server-side CSS
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_post_css() {
		$id = 0;

		if ( is_singular() ) {
			// Enqueue main post attached style.
			$id = get_the_ID();
			$this->enqueue_styles();
		}

		// Enqueue styles for other posts that display the_content, if any.
		add_filter(
			'the_content',
			function ( $content ) use ( $id ) {
				$post_id = get_the_ID();

				if ( $this->has_excerpt || $id === $post_id ) {
					return $content;
				}

				$this->enqueue_styles( $post_id, true );
				$this->enqueue_google_fonts( $post_id );

				return $content;
			}
		);
	}

	/**
	 * Enqueue CSS file
	 *
	 * @param int  $post_id Post id.
	 * @param bool $footer IN footer.
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function enqueue_styles( $post_id = '', $footer = false ) {
		$post_id  = $post_id ? $post_id : get_the_ID();
		$location = 'wp_head';

		if ( ! function_exists( 'has_blocks' ) ) {
			return;
		}

		if ( ! has_blocks( $post_id ) ) {
			return;
		}

		if ( $footer ) {
			$location = 'wp_footer';
		}

		if ( is_preview() ) {
			add_action(
				$location,
				function () use ( $post_id ) {
					return $this->get_post_css( $post_id );
				}
			);

			return;
		}

		if ( ! CSS_Handler::has_css_file( $post_id ) ) {
			CSS_Handler::generate_css_file( $post_id );

			add_action(
				$location,
				function () use ( $post_id ) {
					return $this->get_post_css( $post_id );
				}
			);

			return;
		}

		$file_url = CSS_Handler::get_css_url( $post_id );

		$file_name = basename( $file_url );

		$content = get_post_field( 'post_content', $post_id );

		$blocks = $this->parse_blocks( $content );

		if ( is_array( $blocks ) || ! empty( $blocks ) ) {
			$this->enqueue_reusable_styles( $blocks, $footer );
		}

		$total_inline_limit = 20000;
		$total_inline_limit = apply_filters( 'styles_inline_size_limit', 20000 );

		$wp_upload_dir = wp_upload_dir( null, false );
		$basedir       = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/';
		$file_path     = $basedir . $file_name;
		$file_size     = filesize( $file_path );

		if ( $this->total_inline_size + $file_size < $total_inline_limit ) {
			add_action(
				$location,
				function () use ( $post_id ) {
					return $this->get_post_css( $post_id );
				}
			);

			$this->total_inline_size += (int) $file_size;
			return;
		}

		if ( $footer ) {
			add_action(
				'wp_footer',
				function () use ( $post_id, $file_name, $file_url ) {
					return wp_enqueue_style( 'otter-' . $file_name, $file_url, array( 'otter-blocks' ), THEMEISLE_BLOCKS_VERSION );
				}
			);

			return;
		}

		add_action(
			'wp_enqueue_scripts',
			function () use ( $post_id, $file_name, $file_url ) {
				return wp_enqueue_style( 'otter-' . $file_name, $file_url, array( 'otter-blocks' ), THEMEISLE_BLOCKS_VERSION );
			}
		);
	}

	/**
	 * Enqueue CSS file for Reusable Blocks
	 *
	 * @param array $blocks List of blocks.
	 * @param bool  $footer Should we load on footer.
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function enqueue_reusable_styles( $blocks, $footer = false ) {
		foreach ( $blocks as $block ) {
			if ( 'core/block' === $block['blockName'] && ! empty( $block['attrs']['ref'] ) ) {
				$this->enqueue_styles( $block['attrs']['ref'], $footer );
			}

			if ( isset( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$this->enqueue_reusable_styles( $block['innerBlocks'], $footer );
			}
		}
	}

	/**
	 * Get Post CSS
	 *
	 * @param string $post_id Post id.
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function get_post_css( $post_id = '' ) {
		$post_id = $post_id ? $post_id : get_the_ID();
		if ( function_exists( 'has_blocks' ) && has_blocks( $post_id ) ) {
			$css = $this->get_page_css_meta( $post_id );

			if ( empty( $css ) || is_preview() ) {
				$css = $this->get_page_css_inline( $post_id );
			}

			if ( empty( $css ) ) {
				return;
			}

			$style  = "\n" . '<style type="text/css" media="all">' . "\n";
			$style .= $css;
			$style .= "\n" . '</style>' . "\n";

			echo $style;// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}

	/**
	 * Get Blocks CSS from Meta
	 *
	 * @param int $post_id Post id.
	 *
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function get_page_css_meta( $post_id ) {
		$style = '';
		if ( function_exists( 'has_blocks' ) && has_blocks( $post_id ) ) {
			$style .= get_post_meta( $post_id, '_themeisle_gutenberg_block_styles', true );

			$content = get_post_field( 'post_content', $post_id );

			$blocks = $this->parse_blocks( $content );

			if ( ! is_array( $blocks ) || empty( $blocks ) ) {
				return $style;
			}

			$style .= $this->get_reusable_block_meta( $blocks );
		}

		return $style;
	}

	/**
	 * Get Reusable Block Meta
	 *
	 * @param array $blocks List of blocks.
	 *
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function get_reusable_block_meta( $blocks ) {
		$style = '';
		foreach ( $blocks as $block ) {
			if ( 'core/block' === $block['blockName'] && ! empty( $block['attrs']['ref'] ) ) {
				$style .= get_post_meta( $block['attrs']['ref'], '_themeisle_gutenberg_block_styles', true );
			}

			if ( isset( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$style .= $this->get_reusable_block_meta( $block['innerBlocks'] );
			}
		}

		if ( empty( $style ) ) {
			$style .= $this->cycle_through_reusable_blocks( $blocks );
		}

		return $style;
	}

	/**
	 * Get Blocks CSS Inline
	 *
	 * @param int $post_id Post id.
	 *
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function get_page_css_inline( $post_id ) {
		global $post;

		if ( function_exists( 'has_blocks' ) && has_blocks( $post_id ) ) {
			if ( is_preview() && ( $post_id === $post->ID ) ) {
				$content = $post->post_content;
			} else {
				$content = get_post_field( 'post_content', $post_id );
			}

			$blocks = $this->parse_blocks( $content );

			if ( ! is_array( $blocks ) || empty( $blocks ) ) {
				return '';
			}

			$css = $this->cycle_through_blocks( $blocks );
		}

		return $css;
	}

	/**
	 * Cycle thorugh Blocks
	 *
	 * @param array $blocks List of blocks.
	 *
	 * @return string Block styles.
	 * @since   1.3.0
	 * @access  public
	 */
	public function cycle_through_blocks( $blocks ) {
		$style  = '';
		$style .= $this->cycle_through_static_blocks( $blocks );
		$style .= $this->cycle_through_reusable_blocks( $blocks );

		return $style;
	}

	/**
	 * Enqueue widgets CSS file
	 *
	 * @since   1.7.0
	 * @access  public
	 */
	public function enqueue_widgets_css() {
		$empty = '';
		global $wp_registered_sidebars;

		$has_widgets = false;

		foreach ( $wp_registered_sidebars as $key => $sidebar ) {
			if ( is_active_sidebar( $key ) ) {
				$has_widgets = true;
				break;
			}
		}

		if ( ! $has_widgets ) {
			return $empty;
		}

		$fonts_list = get_option( 'themeisle_blocks_widgets_fonts', array() );
		$fonts      = array();

		if ( count( $fonts_list ) > 0 ) {
			foreach ( $fonts_list as $font ) {
				if ( empty( $font['fontfamily'] ) ) {
					continue;
				}
				$item = str_replace( ' ', '+', $font['fontfamily'] );
				if ( count( $font['fontvariant'] ) > 0 ) {
					$item .= ':' . implode( ',', $font['fontvariant'] );
				}
				array_push( $fonts, $item );
			}

			if ( count( $fonts ) > 0 ) {
				wp_enqueue_style( 'otter-widgets-fonts', '//fonts.googleapis.com/css?family=' . implode( '|', $fonts ), [], THEMEISLE_BLOCKS_VERSION );
			}
		}

		if ( ! CSS_Handler::has_css_file( 'widgets' ) ) {
			CSS_Handler::save_widgets_styles();

			$css = get_option( 'themeisle_blocks_widgets_css' );

			if ( empty( $css ) ) {
				$css = $this->get_widgets_css();
			}

			if ( empty( $css ) ) {
				return $empty;
			}

			$style  = "\n" . '<style type="text/css" media="all">' . "\n";
			$style .= $css;
			$style .= "\n" . '</style>' . "\n";
			echo $style;// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			return $empty;
		}

		$file_url = CSS_Handler::get_css_url( 'widgets' );

		return wp_enqueue_style( 'otter-widgets', $file_url, array( 'otter-blocks' ), THEMEISLE_BLOCKS_VERSION );
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @return Block_Frontend
	 * @since 1.3.0
	 * @access public
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
	 * @access public
	 * @return void
	 * @since 1.3.0
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @return void
	 * @since 1.3.0
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
