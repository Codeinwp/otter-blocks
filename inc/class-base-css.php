<?php
/**
 *  Common logic for CSS handling class.
 *
 * @package ThemeIsle\GutenbergBlocks
 */

namespace ThemeIsle\GutenbergBlocks;

use Sabberworm\CSS\Parser;
use Sabberworm\CSS\OutputFormat;
use Sabberworm\CSS\RuleSet\DeclarationBlock;
use Sabberworm\CSS\CSSList\AtRuleBlockList;
use Sabberworm\CSS\CSSList\KeyFrame;

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
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Button_Group_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Button_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Circle_Counter_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Countdown_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Core_Image_Plugin_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Font_Awesome_Icons_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Google_Map_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Icon_List_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Icon_List_Item_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Leaflet_Map_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Form_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Form_Input_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Form_Textarea_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Flip_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Progress_Bar_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Popup_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Slider_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Review_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Tabs_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Posts_CSS',
			'\ThemeIsle\GutenbergBlocks\CSS\Blocks\Sharing_Icons_CSS',
		);

		self::$blocks_classes = apply_filters( 'otter_blocks_register_css', self::$blocks_classes );
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
	public static function hex2rgba( $color, $opacity = false ) {
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
			$blocks  = parse_blocks( $content );

			if ( ! is_array( $blocks ) || empty( $blocks ) ) {
				return;
			}

			$animations = boolval( preg_match( '/\banimated\b/', $content ) );

			return $this->cycle_through_static_blocks( $blocks, $animations );
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

			$blocks = parse_blocks( $content );

			if ( ! is_array( $blocks ) || empty( $blocks ) ) {
				return;
			}

			$animations = boolval( preg_match( '/\banimated\b/', $content ) );

			return $this->cycle_through_static_blocks( $blocks, $animations );
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

		$blocks     = parse_blocks( $reusable_block->post_content );
		$animations = boolval( preg_match( '/\banimated\b/', $reusable_block->post_content ) );

		return $this->cycle_through_static_blocks( $blocks, $animations );
	}

	/**
	 * Cycle thorugh Static Blocks
	 *
	 * @param array $blocks List of blocks.
	 * @param bool  $animations To check for animations or not.
	 *
	 * @return string Style.
	 * @since   1.3.0
	 * @access  public
	 */
	public function cycle_through_static_blocks( $blocks, $animations = true ) {
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

			$custom_css = apply_filters( 'otter_blocks_css', $block );

			if ( is_string( $custom_css ) ) {
				$style .= $custom_css;
			}

			if ( isset( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$style .= $this->cycle_through_static_blocks( $block['innerBlocks'], false );
			}
		}

		if ( true === $animations && class_exists( '\ThemeIsle\GutenbergBlocks\Blocks_Animation' ) && get_option( 'themeisle_blocks_settings_blocks_animation', true ) && get_option( 'themeisle_blocks_settings_optimize_animations_css', true ) ) {
			$style .= $this->get_animation_css( $blocks );
		}

		return $style;
	}

	/**
	 * Get Animation CSS
	 *
	 * @param array $blocks List of blocks.
	 *
	 * @return string CSS.
	 * @since   2.0.10
	 * @access  public
	 */
	public function get_animation_css( $blocks ) {
		$style   = '';
		$classes = $this->get_animation_classes( $blocks );

		if ( 0 === count( $classes ) ) {
			return $style;
		}

		$prepared_classes = array( ':root' );

		foreach ( $classes as $class ) {
			array_push( $prepared_classes, '.' . $class, '.animated.' . $class );
		}

		$classes = $prepared_classes;

		$content = get_transient( 'otter_animations_parsed' );

		if ( false === $content ) {
			$parser = null;
			if ( function_exists( 'wpcom_vip_file_get_contents' ) ) {
				$parser = new Parser( wpcom_vip_file_get_contents( OTTER_BLOCKS_PATH . '/build/animation/index.css' ) );
			} else {
				$parser = new Parser( file_get_contents( OTTER_BLOCKS_PATH . '/build/animation/index.css' ) ); // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
			}

			$content = $parser->parse()->getContents();

			set_transient( 'otter_animations_parsed', $content, MONTH_IN_SECONDS );
		}

		$format = OutputFormat::createCompact();

		foreach ( $content as $rule ) {
			if ( $rule instanceof DeclarationBlock ) {
				foreach ( $rule->getSelectors() as $selector ) {
					if ( in_array( $selector, $classes ) ) {
						$style .= $rule->render( $format );
					}
				}
				continue;
			}

			/*
			 * This is used to get the reduced-motion animation styles.
			 */
			if ( $rule instanceof AtRuleBlockList ) {
				if ( false === in_array( $rule->atRuleArgs(), array( '(prefers-reduced-motion:reduce),print', 'screen' ) ) ) {
					continue;
				}

				$style .= $rule->render( $format );
				continue;
			}

			/*
			 * This is used to get actual animation which is a @keyframe.
			 */
			if ( $rule instanceof KeyFrame ) {
				if ( in_array( '.' . $rule->getAnimationName(), $classes ) ) {
					$style .= $rule->render( $format );
				}
				continue;
			}
		}

		return $style;
	}

	/**
	 * Get Animation Classes
	 *
	 * @param array $blocks List of blocks.
	 *
	 * @return array CSS classes.
	 * @since   2.0.10
	 * @access  public
	 */
	public function get_animation_classes( $blocks ) {
		$classes = array();

		$allowed_classes = array(
			'animated',
			'bounce',
			'flash',
			'pulse',
			'rubberBand',
			'shakeX',
			'shakeY',
			'headShake',
			'swing',
			'tada',
			'wobble',
			'jello',
			'heartBeat',
			'hinge',
			'jackInTheBox',
			'backInDown',
			'backInLeft',
			'backInRight',
			'backInUp',
			'backOutDown',
			'backOutLeft',
			'backOutRight',
			'backOutUp',
			'bounceIn',
			'bounceInDown',
			'bounceInLeft',
			'bounceInRight',
			'bounceInUp',
			'bounceOut',
			'bounceOutDown',
			'bounceOutLeft',
			'bounceOutRight',
			'bounceOutUp',
			'fadeIn',
			'fadeInDown',
			'fadeInDownBig',
			'fadeInLeft',
			'fadeInLeftBig',
			'fadeInRight',
			'fadeInRightBig',
			'fadeInUp',
			'fadeInTopLeft',
			'fadeInTopRight',
			'fadeInBottomLeft',
			'fadeInBottomRight',
			'fadeOut',
			'fadeOutDown',
			'fadeOutDownBig',
			'fadeOutLeft',
			'fadeOutLeftBig',
			'fadeOutRight',
			'fadeOutRightBig',
			'fadeOutUp',
			'fadeOutUpBig',
			'fadeOutTopLeft',
			'fadeOutTopRight',
			'fadeOutBottomRight',
			'fadeOutBottomLeft',
			'flip',
			'flipInX',
			'flipInY',
			'flipOutX',
			'flipOutY',
			'lightSpeedInRight',
			'lightSpeedInLeft',
			'lightSpeedOutRight',
			'lightSpeedOutLeft',
			'rotateIn',
			'rotateInDownLeft',
			'rotateInDownRight',
			'rotateInUpLeft',
			'rotateInUpRight',
			'rotateOut',
			'rotateOutDownLeft',
			'rotateOutDownRight',
			'rotateOutUpLeft',
			'rotateOutUpRight',
			'slideInDown',
			'slideInLeft',
			'slideInRight',
			'slideInUp',
			'slideOutDown',
			'slideOutLeft',
			'slideOutRight',
			'slideOutUp',
			'zoomIn',
			'zoomInDown',
			'zoomInLeft',
			'zoomInRight',
			'zoomInUp',
			'zoomOut',
			'zoomOutDown',
			'zoomOutLeft',
			'zoomOutRight',
			'zoomOutUp',
			'rollIn',
			'rollOut',
			'backOutDown',
			'backOutLeft',
			'backOutRight',
			'backOutUp',
			'bounceOut',
			'bounceOutDown',
			'bounceOutLeft',
			'bounceOutRight',
			'bounceOutUp',
			'fadeOut',
			'fadeOutDown',
			'fadeOutDownBig',
			'fadeOutLeft',
			'fadeOutLeftBig',
			'fadeOutRight',
			'fadeOutRightBig',
			'fadeOutUp',
			'fadeOutUpBig',
			'fadeOutTopLeft',
			'fadeOutTopRight',
			'fadeOutBottomRight',
			'fadeOutBottomLeft',
			'flipOutX',
			'flipOutY',
			'lightSpeedOutRight',
			'lightSpeedOutLeft',
			'rotateOut',
			'rotateOutDownLeft',
			'rotateOutDownRight',
			'rotateOutUpLeft',
			'rotateOutUpRight',
			'slideOutDown',
			'slideOutLeft',
			'slideOutRight',
			'slideOutUp',
			'zoomOut',
			'zoomOutDown',
			'zoomOutLeft',
			'zoomOutRight',
			'zoomOutUp',
			'rollOut',
			'delay-100ms',
			'delay-200ms',
			'delay-500ms',
			'delay-1s',
			'delay-2s',
			'delay-3s',
			'delay-4s',
			'delay-5s',
			'slow',
			'slower',
			'fast',
			'faster',
		);

		foreach ( $blocks as $block ) {
			if ( isset( $block['attrs']['className'] ) && ! empty( $block['attrs']['className'] ) ) {
				if ( preg_match( '/\banimated\b/', $block['attrs']['className'] ) ) {
					$classes = array_merge( $classes, explode( ' ', trim( $block['attrs']['className'] ) ) );
				}
			}

			if ( isset( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$classes = array_merge( $classes, $this->get_animation_classes( $block['innerBlocks'] ) );
			}
		}

		$classes = array_intersect( array_unique( $classes ), $allowed_classes );

		return $classes;
	}

	/**
	 * Cycle thorugh Global Styles
	 *
	 * @return string Style.
	 * @since   2.0.0
	 * @access  public
	 */
	public function cycle_through_global_styles() {
		$style = '';
		foreach ( self::$blocks_classes as $classname ) {
			$path = new $classname();

			if ( method_exists( $path, 'render_global_css' ) ) {
				$style .= $path->render_global_css();
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
	public static function is_image_url( $url ) {
		return is_string( $url ) && ( preg_match( '/\.(jpeg|jpg|png|gif|svg|bmp|ico|tiff|webp)$/i', $url ) || preg_match( '/\/dynamic\/?.[^"]*/i', $url ) );
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
