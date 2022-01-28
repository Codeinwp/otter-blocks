<?php
/**
 *  Common logic for CSS handling class.
 *
 * @package ThemeIsle\GutenbergBlocks
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Base_CSS
 */
class Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	protected $library_prefix = 'themeisle-blocks';

	/**
	 * Rest route namespace.
	 *
	 * @var string
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var string
	 */
	public $version = 'v1';

	/**
	 * The namespace under which the block classees are saved.
	 *
	 * @var string
	 */
	protected static $blocks_classes = array();

	/**
	 * The namespace under which the fonts are saved.
	 *
	 * @var array
	 */
	protected static $google_fonts = array();

	/**
	 * Base_CSS constructor.
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'autoload_block_classes' ), 99 );
		add_filter( 'safe_style_css', array( $this, 'used_css_properties' ), 99 );
	}

	/**
	 * Autoload classes for each block.
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function autoload_block_classes() {
		self::$blocks_classes = array(
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Accordion_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Advanced_Column_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Advanced_Columns_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Advanced_Heading_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Business_Hours_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Business_Hours_Item_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Button_Group_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Button_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Circle_Counter_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Countdown_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Core_Image_Plugin_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Font_Awesome_Icons_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Icon_List_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Icon_List_Item_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Progress_Bar_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Popup_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Review_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Review_Comparison_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Tabs_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Woo_Comparison_CSS',
		);
	}

	/**
	 * Parse Blocks for Gutenberg and WordPress 5.0
	 *
	 * @param string $content Content.
	 *
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function parse_blocks( $content ) {
		if ( ! function_exists( 'parse_blocks' ) ) {
			return gutenberg_parse_blocks( $content );
		} else {
			return parse_blocks( $content );
		}
	}

	/**
	 * Check if string is empty without accepting zero
	 *
	 * @param string $var Var to check.
	 *
	 * @return bool
	 * @since   1.3.1
	 * @access  public
	 */
	public function is_empty( $var ) {
		return empty( $var ) && 0 !== $var;
	}

	/**
	 * Get block attribute value with default
	 *
	 * @param mixed $attr Attributes.
	 * @param mixed $default Default value.
	 *
	 * @return mixed
	 * @since   1.3.0
	 * @access  public
	 */
	public function get_attr_value( $attr, $default = 'unset' ) {
		if ( ! $this->is_empty( $attr ) ) {
			return $attr;
		} else {
			return $default;
		}
	}

	/**
	 * Get Google Fonts
	 *
	 * @param array $attr Attr values.
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function get_google_fonts( $attr ) {
		if ( isset( $attr['fontFamily'] ) ) {
			if ( ! array_key_exists( $attr['fontFamily'], self::$google_fonts ) ) {
				self::$google_fonts[ $attr['fontFamily'] ] = array(
					'fontfamily'  => $attr['fontFamily'],
					'fontvariant' => ( isset( $attr['fontVariant'] ) && ! empty( $attr['fontVariant'] ) ? array( $attr['fontVariant'] ) : array() ),
				);
			} else {
				if ( ! in_array( $attr['fontVariant'], self::$google_fonts[ $attr['fontFamily'] ]['fontvariant'], true ) ) {
					array_push( self::$google_fonts[ $attr['fontFamily'] ]['fontvariant'], ( isset( $attr['fontStyle'] ) && 'italic' === $attr['fontStyle'] ) ? $attr['fontVariant'] . ':i' : $attr['fontVariant'] );
				}
			}
		}
	}

	/**
	 * Convert HEX to RGBA.
	 *
	 * @param string $color Color data.
	 * @param bool   $opacity Opacity status.
	 *
	 * @return mixed
	 * @since   1.3.0
	 * @access  public
	 */
	public function hex2rgba( $color, $opacity = false ) {
		$default = 'rgb(0,0,0)';

		if ( empty( $color ) ) {
			return $default;
		}

		if ( '#' == $color[0] ) {
			$color = substr( $color, 1 );
		}

		if ( strlen( $color ) == 6 ) {
			$hex = array( $color[0] . $color[1], $color[2] . $color[3], $color[4] . $color[5] );
		} elseif ( strlen( $color ) == 3 ) {
			$hex = array( $color[0] . $color[0], $color[1] . $color[1], $color[2] . $color[2] );
		} else {
			return $default;
		}

		$rgb = array_map( 'hexdec', $hex );

		if ( $opacity >= 0 ) {
			if ( abs( $opacity ) > 1 ) {
				$opacity = 1.0;
			}
			$output = 'rgba( ' . implode( ',', $rgb ) . ',' . $opacity . ' )';
		} else {
			$output = 'rgb( ' . implode( ',', $rgb ) . ' )';
		}

		return $output;
	}

	/**
	 * Used CSS properties
	 *
	 * @param array $attr Array to check.
	 *
	 * @return array
	 * @since   1.3.0
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
	 * Get Blocks CSS
	 *
	 * @param int $post_id Post id.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function get_blocks_css( $post_id ) {
		if ( function_exists( 'has_blocks' ) ) {
			$content = get_post_field( 'post_content', $post_id );
			$blocks  = $this->parse_blocks( $content );

			if ( ! is_array( $blocks ) || empty( $blocks ) ) {
				return;
			}

			return $this->cycle_through_static_blocks( $blocks );
		}
	}

	/**
	 * Get Widgets CSS
	 *
	 * @return string
	 * @since   1.7.0
	 * @access  public
	 */
	public function get_widgets_css() {
		if ( function_exists( 'has_blocks' ) ) {
			$content = '';
			$widgets = get_option( 'widget_block', array() );

			foreach ( $widgets as $widget ) {
				if ( is_array( $widget ) && isset( $widget['content'] ) ) {
					$content .= $widget['content'];
				}
			}

			$blocks = $this->parse_blocks( $content );

			if ( ! is_array( $blocks ) || empty( $blocks ) ) {
				return;
			}

			return $this->cycle_through_static_blocks( $blocks );
		}
	}

	/**
	 * Get Reusable Blocks CSS
	 *
	 * @param int $post_id Post id.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function get_reusable_block_css( $post_id ) {
		$reusable_block = get_post( $post_id );

		if ( ! $reusable_block || 'wp_block' !== $reusable_block->post_type ) {
			return;
		}

		if ( 'publish' !== $reusable_block->post_status || ! empty( $reusable_block->post_password ) ) {
			return;
		}

		$blocks = $this->parse_blocks( $reusable_block->post_content );

		return $this->cycle_through_static_blocks( $blocks );
	}

	/**
	 * Cycle thorugh Static Blocks
	 *
	 * @param array $blocks List of blocks.
	 *
	 * @return string Style.
	 * @since   1.3.0
	 * @access  public
	 */
	public function cycle_through_static_blocks( $blocks ) {
		$style = '';
		foreach ( $blocks as $block ) {
			foreach ( self::$blocks_classes as $classname ) {
				$path = new $classname();

				if ( method_exists( $path, 'render_css' ) ) {
					if ( ( isset( $path->library_prefix ) ? $path->library_prefix : $this->library_prefix ) . '/' . $path->block_prefix === $block['blockName'] ) {
						$style .= $path->render_css( $block );
					}
				}
			}

			$custom_css = apply_filters( 'themeisle_gutenberg_blocks_css', $block );

			if ( is_string( $custom_css ) ) {
				$style .= $custom_css;
			}

			if ( isset( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$style .= $this->cycle_through_static_blocks( $block['innerBlocks'] );
			}
		}

		return $style;
	}

	/**
	 * Cycle thorugh Reusable Blocks
	 *
	 * @param array $blocks List of blocks.
	 *
	 * @return string Style.
	 * @since   1.3.0
	 * @access  public
	 */
	public function cycle_through_reusable_blocks( $blocks ) {
		$style = '';
		foreach ( $blocks as $block ) {
			if ( 'core/block' === $block['blockName'] && ! empty( $block['attrs']['ref'] ) ) {
				$style .= $this->get_reusable_block_css( $block['attrs']['ref'] );
			}

			if ( isset( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$style .= $this->cycle_through_reusable_blocks( $block['innerBlocks'] );
			}
		}

		return $style;
	}

	/**
	 * Check if an url points to an image by checking if the an image extension exists.
	 *
	 * @param string $url The url.
	 *
	 * @return bool
	 * @since   1.4.4
	 * @access  public
	 */
	public function is_image_url( $url ) {
		return is_string( $url ) && preg_match( '/\.(jpeg|jpg|png|gif|svg|bmp|ico|tiff)$/i', $url );
	}

	/**
	 * Method to return path to child class in a Reflective Way.
	 *
	 * @return  string
	 * @since   1.3.0
	 * @access  protected
	 */
	protected function get_dir() {
		return dirname( __FILE__ );
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access  public
	 * @return  void
	 * @since   1.3.0
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
	 * @since   1.3.0
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0.0' );
	}
}
