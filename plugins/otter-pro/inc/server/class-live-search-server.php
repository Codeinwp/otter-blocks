<?php
/**
 * Live Search server logic.
 *
 * @package ThemeIsle\OtterPro\Server
 */

namespace ThemeIsle\OtterPro\Server;

use WP_Query;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Class Live_Search_Server
 */
class Live_Search_Server {

	/**
	 * The main instance var.
	 *
	 * @var Live_Search_Server|null
	 * @since 2.0.0
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var string
	 * @since 2.0.0
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var string
	 * @since 2.0.0
	 */
	public $version = 'v1';


	/**
	 * Initialize the class
	 *
	 * @since 2.0.0
	 */
	public function init() {
		/**
		 * Register the REST API endpoints.
		 */
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		add_filter( 'query_vars', array( $this, 'add_query_vars' ) );
		add_action( 'parse_query', array( $this, 'parse_query' ) );
	}

	/**
	 * Add custom query vars.
	 *
	 * @param array $query_vars Query vars.
	 * @return array
	 */
	public function add_query_vars( $query_vars ) {
		$query_vars[] = 'o_post_type';
		return $query_vars;
	}

	/**
	 * Parse the custom query vars.
	 *
	 * @param WP_Query $query WP Query object.
	 */
	public function parse_query( $query ) {
		if ( get_query_var( 'o_post_type' ) ) {
			$query->set( 'post_type', explode( ',', get_query_var( 'o_post_type' ) ) );
		}

		return $query;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Live_Search_Server
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Register REST API route
	 *
	 * @return void
	 * @since 2.0.0
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;
		register_rest_route(
			$namespace,
			'/live-search',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'search' ),
				'permission_callback' => function ( $request ) {
					$nonces = $request->get_header_as_array( 'X-WP-Nonce' );
					if ( isset( $nonces ) ) {
						foreach ( $nonces as $nonce ) {
							if ( wp_verify_nonce( $nonce, 'wp_rest' ) ) {
								return __return_true();
							}
						}
					}
					return __return_false();
				},
			)
		);
	}

	/**
	 * Get information from the provider services.
	 *
	 * @param WP_REST_Request $request The API request.
	 * @return WP_REST_Response
	 * @since 2.0.3
	 */
	public function search( WP_REST_Request $request ) {
		$cat = $request->get_param( 'cat' ) ? sanitize_text_field( $request->get_param( 'cat' ) ) : '';

		$query = new WP_Query(
			$this->prepare_search_query( $request->get_param( 's' ), $request->get_param( 'post_type' ), $cat )
		);

		return new WP_REST_Response(
			array(
				'success' => true,
				'results' => array_map(
					function( $post ) {
						$data = array(
							'id'     => $post->ID,
							'link'   => get_permalink( $post->ID ),
							'title'  => $post->post_title,
							'type'   => $post->post_type,
							'date'   => get_the_date( 'F d, Y', $post ),
							'author' => get_the_author_meta( 'display_name', intval( $post->post_author ) ),
							'parent' => get_post( $post->post_parent ) ? get_post( $post->post_parent )->post_title : '',
						);

						if ( 'product' === $post->post_type && class_exists( 'WooCommerce' ) ) {
							$data['price'] = wc_get_product( $post->ID )->get_price_html();
						}

						return $data;
					},
					$query->posts
				),
			)
		);
	}

	/**
	 * Prepare the search query. Remove the post types that are not searchable.
	 * 
	 * @param string       $s Search query.
	 * @param string|array $post_types Post type.
	 * @param string       $cat Category.
	 * 
	 * @return array
	 */
	public function prepare_search_query( $s, $post_types, $cat = '' ) {
		$s   = sanitize_text_field( $s );
		$cat = sanitize_text_field( $cat );

		if ( is_array( $post_types ) ) {
			$post_types = array_map( 'sanitize_text_field', $post_types );
		} else {
			$post_types = sanitize_text_field( $post_types );
		}

		if ( ! empty( $post_types ) ) {
			$searchable_post_types = get_post_types(
				array(
					'public'              => true,
					'exclude_from_search' => false,
				),
				'names' 
			);
	
			$needed_post_types = is_array( $post_types ) ? $post_types : explode( ',', $post_types );

			$post_types = array_values(
				array_filter(
					$searchable_post_types,
					function( $post_type ) use ( $needed_post_types ) {
						return in_array( $post_type, $needed_post_types, true );
					}
				) 
			);
		}

		$params = array(
			'posts_per_page' => 20,
			's'              => $s,
			'post_status'    => 'publish',
			'post_type'      => $post_types,
		);

		if ( ! empty( $cat ) ) {
			$params['category_name'] = $cat;
		}

		return $params;
	}
		
	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @return void
	 * @since 2.0.0
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-pro' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @return void
	 * @since 2.0.0
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-pro' ), '1.0.0' );
	}
}
