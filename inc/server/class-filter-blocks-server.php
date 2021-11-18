<?php
/**
 * Filter blocks server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class Filter_Blocks_Server
 */
class Filter_Blocks_Server {

	/**
	 * The main instance var.
	 *
	 * @var Filter_Blocks_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Filter_Blocks_Server
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Filter_Blocks_Server
	 */
	public $version = 'v1';

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API route
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/filter_blocks',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'filter_blocks' ),
					'args'                => array(
						'block' => array(
							'type'        => 'string',
							'required'    => true,
							'description' => __( 'Block namespace.', 'otter-blocks' ),
						),
					),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Filter Blocks
	 *
	 * Search WordPress posts for requested block type.
	 *
	 * @param mixed $request REST request.
	 * @since 1.7.0
	 * @return mixed|\WP_REST_Response
	 */
	public function filter_blocks( $request ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		$block  = $request->get_param( 'block' );
		$blocks = array();

		$post_types = get_post_types(
			array(
				'public'  => true,
				'show_ui' => true,
			)
		);

		unset( $post_types['attachment'] );
		array_push( $post_types, 'wp_block' );

		foreach ( $post_types as $key => $post_type ) {
			$posts = get_posts(
				array(
					'posts_per_page' => 100,
					'post_type'      => $post_type,
					'meta_query'     => array( // phpcs:ignore WordPress.VIP.SlowDBQuery.slow_db_query_meta_query, WordPress.DB.SlowDBQuery.slow_db_query_meta_query
						array(
							'key'   => '_themeisle_gutenberg_block_has_review',
							'value' => true,
						),
					),
				)
			);

			foreach ( $posts as $post ) {
				if ( ! has_blocks( $post->post_content ) ) {
					$response = new \WP_REST_Response( $blocks, 200 );
				}

				$post_blocks = parse_blocks( $post->post_content );

				foreach ( $post_blocks as $post_block ) {
					if ( $block === $post_block['blockName'] ) {
						if ( 'themeisle-blocks/review' === $post_block['blockName'] ) {
							if ( isset( $post_block['attrs']['product'] ) && intval( $post_block['attrs']['product'] ) >= 0 && class_exists( 'WooCommerce' ) ) {
								$product = wc_get_product( $post_block['attrs']['product'] );

								if ( ! $product ) {
									continue;
								}

								$post_block['attrs']['title']       = $product->get_name();
								$post_block['attrs']['description'] = $product->get_short_description();
								$post_block['attrs']['price']       = $product->get_regular_price() ? $product->get_regular_price() : $product->get_price();
								$post_block['attrs']['currency']    = get_woocommerce_currency();

								if ( ! empty( $product->get_sale_price() ) && $post_block['attrs']['price'] !== $product->get_sale_price() ) {
									$post_block['attrs']['discounted'] = $product->get_sale_price();
								}

								$post_block['attrs']['image'] = array(
									'url' => wp_get_attachment_image_url( $product->get_image_id(), '' ),
									'alt' => get_post_meta( $product->get_image_id(), '_wp_attachment_image_alt', true ),
								);

								$post_block['attrs']['links'] = array(
									array(
										'label'       => __( 'Buy Now', 'otter-blocks' ),
										'href'        => method_exists( $product, 'get_product_url' ) ? $product->get_product_url() : $product->get_permalink(),
										'isSponsored' => method_exists( $product, 'get_product_url' ),
									),
								);
							}
						}

						$blocks[] = array_merge(
							array(
								'ID'         => $post->ID,
								'post_title' => $post->post_title,
							),
							$post_block
						);
					}
				}
			}
		}

		$response = new \WP_REST_Response( $blocks, 200 );

		return $response;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.0
	 * @access public
	 * @return Filter_Blocks_Server
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
	 * @since 1.7.0
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
	 * @since 1.7.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
