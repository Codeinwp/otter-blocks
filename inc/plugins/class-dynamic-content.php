<?php
/**
 * Dynamic Content.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

/**
 * Class Dynamic_Content
 */
class Dynamic_Content {

	/**
	 * The main instance var.
	 *
	 * @var Dynamic_Content
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'the_content', array( $this, 'apply_dynamic_content' ) );
	}

	/**
	 * Filter post content.
	 *
	 * @param string $content Post content.
	 *
	 * @return string
	 */
	public function apply_dynamic_content( $content ) { 
		if ( false === strpos( $content, '<o-dynamic' ) ) {
			return $content;
		}

		$re = '/<\s*o-dynamic[^>]*>(.*?)<\s*\/\s*o-dynamic>/';

		preg_match_all( $re, $content, $matches, PREG_SET_ORDER, 0 );

		$tags = array_map(
			function( $match ) {
				return $match[0];
			},
			$matches 
		);

		$re_attrs = '/<o-dynamic(?:\s+(?:data-type=["\'](?P<type>[^"\'<>]+)["\']|data-id=["\'](?P<id>[^"\'<>]+)["\']|\w+=["\'][^"\'<>]+["\']))+/';

		$changes = array();

		foreach ( $tags as $tag ) {
			preg_match_all( $re_attrs, $tag, $matches, PREG_SET_ORDER, 0 );
			$matches = $matches[0];

			$data            = $this->apply_data( $matches );
			$changes[ $tag ] = $data;
		}

		$content = strtr( $content, $changes );

		return $content;
	}

	/**
	 * Apply dynamic data.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string
	 */
	public function apply_data( $data ) {
		if ( ! isset( $data['type'] ) ) {
			return true;
		}

		if ( 'postTitle' === $data['type'] ) {
			return get_the_title();
		}

		if ( 'postID' === $data['type'] ) {
			return get_the_id();
		}
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.2.0
	 * @access public
	 * @return Dynamic_Content
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
	 * @since 1.2.0
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @since 1.2.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
