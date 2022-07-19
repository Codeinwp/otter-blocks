<?php
/**
 * Dynamic Content.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

use ThemeIsle\OtterPro\Plugins\License;

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
		if ( License::has_active_license() ) {
			add_filter( 'otter_blocks_evaluate_dynamic_content', array( $this, 'evaluate_content' ), 10, 2 );
			add_filter( 'otter_blocks_evaluate_dynamic_content_media_server', array( $this, 'evaluate_content_media_server' ), 10, 2 );
			add_filter( 'otter_blocks_evaluate_dynamic_content_media_content', array( $this, 'evaluate_content_media_content' ), 10, 2 );
		}
	}

	/**
	 * Evaluate dynamic content
	 *
	 * @param string $value a default value.
	 * @param array  $data Content data.
	 *
	 * @since 2.0.5
	 * @return bool
	 */
	public function evaluate_content( $value, $data ) {
		if ( 'postDate' === $data['type'] ) {
			return $this->get_date( $data );
		}

		if ( 'postTime' === $data['type'] ) {
			return $this->get_time( $data );
		}

		if ( 'postTerms' === $data['type'] ) {
			return $this->get_terms( $data );
		}

		if ( 'postMeta' === $data['type'] ) {
			return $this->get_post_meta( $data );
		}

		if ( 'authorMeta' === $data['type'] ) {
			return $this->get_author_meta( $data );
		}

		if ( 'loggedInUserMeta' === $data['type'] ) {
			return $this->get_loggedin_meta( $data );
		}

		return $value;
	}

	/**
	 * Get Date.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_date( $data ) {
		$format = '';

		if ( isset( $data['dateFormat'] ) && 'default' !== $data['dateFormat'] && 'custom' !== $data['dateFormat'] ) {
			$format = esc_html( $data['dateFormat'] );
		}

		if ( isset( $data['dateCustom'] ) && isset( $data['dateFormat'] ) && 'custom' === $data['dateFormat'] ) {
			$format = esc_html( $data['dateCustom'] );
		}

		if ( isset( $data['dateType'] ) && 'modified' === $data['dateType'] ) {
			$date = get_the_modified_date( $format );
		} else {
			$date = get_the_date( $format );
		}

		return $date;
	}

	/**
	 * Get Time.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_time( $data ) {
		$format = '';

		if ( isset( $data['timeFormat'] ) && 'default' !== $data['timeFormat'] && 'custom' !== $data['timeFormat'] ) {
			$format = esc_html( $data['timeFormat'] );
		}

		if ( isset( $data['timeCustom'] ) && isset( $data['timeFormat'] ) && 'custom' === $data['timeFormat'] ) {
			$format = esc_html( $data['timeCustom'] );
		}

		if ( isset( $data['timeType'] ) && 'modified' === $data['timeType'] ) {
			$time = get_the_modified_time( $format );
		} else {
			$time = get_the_time( $format );
		}

		return $time;
	}

	/**
	 * Get Terms.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_terms( $data ) {
		$terms     = '';
		$separator = ', ';

		if ( isset( $data['termSeparator'] ) && ! empty( $data['termSeparator'] ) ) {
			$separator = esc_html( $data['termSeparator'] );
		}

		if ( isset( $data['termType'] ) && 'tags' === $data['termType'] ) {
			$terms = get_the_tag_list( '', $separator );
		} else {
			$terms = get_the_category_list( $separator );
		}

		return $terms;
	}

	/**
	 * Get Post Meta.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_post_meta( $data ) {
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$id      = get_the_ID();
		$meta    = get_post_meta( $id, esc_html( $data['metaKey'] ), true );

		if ( empty( $meta ) || ! is_string( $meta ) ) {
			$meta = $default;
		}

		return esc_html( $meta );
	}

	/**
	 * Get Author Meta.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_author_meta( $data ) {
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$meta    = get_the_author_meta( esc_html( $data['metaKey'] ) );

		if ( empty( $meta ) || ! is_string( $meta ) ) {
			$meta = $default;
		}

		return esc_html( $meta );
	}

	/**
	 * Get Logged-in User Description.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_loggedin_meta( $data ) {
		$user_id = get_current_user_id();
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$meta    = get_user_meta( $user_id, esc_html( $data['metaKey'] ), true );

		if ( empty( $meta ) || ! is_string( $meta ) ) {
			$meta = $default;
		}

		return esc_html( $meta );
	}

	/**
	 * Evaluate dynamic media content
	 *
	 * @param string $path Current image path.
	 * @param array  $request Request data.
	 *
	 * @since 2.0.9
	 * @return string
	 */
	public function evaluate_content_media_server( $path, $request ) {
		$type    = $request->get_param( 'type' );
		$context = $request->get_param( 'context' );
		$id      = $request->get_param( 'id' );
		$meta    = $request->get_param( 'meta' );

		if ( 'postMeta' === $type && ! empty( $meta ) ) {
			$value = get_post_meta( $context, $meta, true );

			if ( ! empty( $value ) ) {
				$path = esc_url( $value );
			}
		}

		if ( 'product' === $type && ! empty( $id ) ) {
			$product = wc_get_product( $id );
			$image   = $product->get_image_id();
			
			if ( $image ) {
				$path = wp_get_original_image_path( $image );
			} else {
				$image = get_option( 'woocommerce_placeholder_image', 0 );

				if ( $image ) {
					$path = wp_get_original_image_path( $image );
				}
			}
		}

		if ( 'acf' === $type && ! empty( $meta ) && class_exists( 'ACF' ) ) {
			$field = get_field( $meta, $context );

			if ( ! empty( $field ) ) {
				if ( is_array( $field ) && isset( $field['ID'] ) ) {
					$path = wp_get_original_image_path( $field['ID'] );
				}

				if ( is_string( $field ) ) {
					$image = $this->get_image_id_from_url( $field );

					if ( $image ) {
						$path = wp_get_original_image_path( $image );
					} else {
						$path = $field;
					}
				}

				if ( is_int( $field ) ) {
					$path = wp_get_original_image_path( $field );
				}
			}
		}

		return $path;
	}

	/**
	 * Evaluate dynamic media content
	 *
	 * @param string $value Current image path.
	 * @param array  $data Request data.
	 *
	 * @since 2.0.9
	 * @return string
	 */
	public function evaluate_content_media_content( $value, $data ) {
		if ( 'postMeta' === $data['type'] && isset( $data['meta'] ) && ! empty( $data['meta'] ) ) {
			$meta = get_post_meta( $data['context'], $data['meta'], true );

			if ( ! empty( $meta ) ) {
				$value = esc_url( $meta );
			}
		}

		if ( 'product' === $data['type'] && isset( $data['id'] ) && ! empty( $data['id'] ) ) {
			$product = wc_get_product( $data['id'] );
			$image   = $product->get_image_id();
			
			if ( $image ) {
				$value = wp_get_attachment_image_url( $image, 'full' );
			} else {
				$image = get_option( 'woocommerce_placeholder_image', 0 );

				if ( $image ) {
					$value = wp_get_attachment_image_url( $image, 'full' );
				}
			}
		}

		if ( 'acf' === $data['type'] && ! empty( $data['meta'] ) && class_exists( 'ACF' ) ) {
			$field = get_field( $data['meta'], $data['context'] );

			if ( ! empty( $field ) ) {
				if ( is_array( $field ) && isset( $field['url'] ) ) {
					$value = $field['url'];
				}

				if ( is_string( $field ) ) {
					$value = $field;
				}

				if ( is_int( $field ) ) {
					$value = wp_get_attachment_image_url( $field, 'full' );
				}
			}
		}

		return $value;
	}

	/**
	 * Get image id from URL
	 *
	 * @param string $url Image URL.
	 *
	 * @since 2.0.9
	 * @return int
	 */
	public function get_image_id_from_url( $url ) {
		global $wpdb;

		$transient_key = 'otter_image_id_from_url_' . esc_urL( $url );

		$image = get_transient( $transient_key );

		if ( false === $image ) {
			$image = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM $wpdb->posts WHERE guid=%s;", $url ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		} else {
			return $image;
		}

		if ( ! empty( $image ) ) {
			set_transient( $transient_key, $image[0], DAY_IN_SECONDS );
			return $image[0];
		}

		return false;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 2.0.5
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
	 * @since 2.0.5
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
	 * @since 2.0.5
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
