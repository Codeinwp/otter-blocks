<?php
/**
 * Live Search variant.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

/**
 * Class Live_Search
 */
class Live_Search {
	/**
	 * The main instance var.
	 *
	 * @var Live_Search
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_filter( 'render_block', array( $this, 'render_blocks' ), 10, 2 );
	}

	/**
	 * Block render function for server-side.
	 *
	 * @param string $block_content Blocks content.
	 * @param array  $block Blocks data.
	 * @return mixed|string
	 */
	public function render_blocks( $block_content, $block ) {
		$has_license = in_array( License::get_license_type(), array( 2, 3 ) ) || ( License::has_active_license() && isset( License::get_license_data()->otter_pro ) );

		if ( is_admin() || 'core/search' !== $block['blockName'] || ! ( isset( $block['attrs']['otterIsLive'] ) && true === $block['attrs']['otterIsLive'] ) || ! $has_license ) {
			return $block_content;
		}

		$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/live-search.asset.php';
		wp_enqueue_script(
			'otter-live-search',
			OTTER_BLOCKS_URL . 'build/blocks/live-search.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);
		wp_localize_script(
			'otter-live-search',
			'liveSearchData',
			array(
				'nonce'              => wp_create_nonce( 'wp_rest' ),
				'restUrl'            => esc_url_raw( get_rest_url() ) . 'otter/v1/live-search',
				'permalinkStructure' => get_option( 'permalink_structure' ),
				'strings'            => array(
					/* translators: This is followed by the search string */
					'noResults' => __( 'No results for', 'otter-blocks' ),
					'noTitle'   => sprintf( '(%s)', __( 'no title', 'otter-blocks' ) ),
				),
			)
		);

		$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/live-search-style.asset.php';
		wp_enqueue_style( 'otter-live-search-style', OTTER_BLOCKS_URL . 'build/blocks/live-search-style.css', $asset_file['dependencies'], $asset_file['version'] );

		$post_types_data = '';
		if ( isset( $block['attrs']['otterSearchQuery']['post_type'] ) ) {
			$post_types_data = 'data-post-types=' . wp_json_encode( $block['attrs']['otterSearchQuery']['post_type'] );
		}

		// Insert hidden fields to filter core's search results.
		$query_params_markup = '';
		if ( isset( $block['attrs']['otterSearchQuery'] ) && count( $block['attrs']['otterSearchQuery'] ) > 0 ) {
			foreach ( $block['attrs']['otterSearchQuery'] as $param => $value ) {
				$query_params_markup .= sprintf(
					'<input type="hidden" name="o_%s" value="%s" />',
					esc_attr( $param ),
					esc_attr( implode( ',', $value ) )
				);
			}
		}

		$block_content = substr( $block_content, 0, strpos( $block_content, '</form>' ) ) . $query_params_markup . substr( $block_content, strpos( $block_content, '</form>' ) );
		return '<div class="o-live-search"' . $post_types_data . '>' . $block_content . '</div>';
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.1
	 * @access public
	 * @return Live_Search
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
	 * @since 1.7.1
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
	 * @since 1.7.1
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
