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
	 * @var Dynamic_Content|null
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( License::has_active_license() ) {
			add_filter( 'otter_blocks_evaluate_dynamic_content_text', array( $this, 'evaluate_content' ), 10, 2 );
			add_filter( 'otter_blocks_evaluate_dynamic_content_link', array( $this, 'evaluate_content_link' ), 10, 2 );
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
	 * @return mixed
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

		if ( 'acf' === $data['type'] && class_exists( 'ACF' ) ) {
			return $this->get_acf( $data );
		}

		if ( 'authorMeta' === $data['type'] ) {
			return $this->get_author_meta( $data );
		}

		if ( 'loggedInUserMeta' === $data['type'] ) {
			return $this->get_loggedin_meta( $data );
		}

		if ( 'queryString' === $data['type'] ) {
			return $this->get_query_string( $data );
		}

		if ( 'country' === $data['type'] ) {
			return $this->get_country( $data );
		}

		return $value;
	}

	/**
	 * Evaluate dynamic content links
	 *
	 * @param string $value a default value.
	 * @param array  $data Content data.
	 *
	 * @since 2.0.14
	 * @return mixed
	 */
	public function evaluate_content_link( $value, $data ) {
		if ( 'acfURL' === $data['type'] ) {
			return $this->get_acf( $data );
		}

		if ( 'postMetaURL' === $data['type'] ) {
			return $this->get_post_meta( $data );
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
			$date = get_the_modified_date( $format, $data['context'] );
		} else {
			$date = get_the_date( $format, $data['context'] );
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
			$time = get_the_modified_time( $format, $data['context'] );
		} else {
			$time = get_the_time( $format, $data['context'] );
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
			$terms = get_the_tag_list( '', $separator, '', $data['context'] );
		} elseif ( isset( $data['termType'] ) && 'custom' === $data['termType'] && isset( $data['taxonomy'] ) ) {
			$taxonomy_terms = get_the_term_list( $data['context'], $data['taxonomy'], '', $separator, '' );
			if ( ! empty( $taxonomy_terms ) && ! is_wp_error( $taxonomy_terms ) ) {
				$terms = $taxonomy_terms;
			}
		} else {
			$terms = get_the_category_list( $separator, '', $data['context'] );
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
		$meta    = '';

		if ( isset( $data['metaKey'] ) ) {
			$meta = get_post_meta( $data['context'], esc_html( $data['metaKey'] ), true );
		}

		if ( empty( $meta ) || ! is_string( $meta ) ) {
			$meta = $default;
		}

		return esc_html( $meta );
	}

	/**
	 * Get ACF Meta.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string|string[]
	 */
	public function get_acf( $data ) {
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$meta    = '';

		if ( ! isset( $data['metaKey'] ) ) {
			return $default;
		}

		$field_key = esc_html( $data['metaKey'] );
		$meta      = get_field( $field_key, $data['context'] );

		// Get the ACF repeater's sub-field value.
		if ( ( null === $meta || false === $meta || '' === $meta ) && function_exists( 'acf_get_field' ) ) {
			$sub_value = $this->get_acf_repeater_sub_field( $field_key, $data['context'] );
			if ( null !== $sub_value ) {
				return $sub_value;
			}
		}

		if ( is_array( $meta ) ) {
			if ( isset( $meta[0] ) ) {
				$display = array();

				if ( is_string( $meta[0] ) ) {
					$display = $meta;
				} elseif ( isset( $meta[0]['label'] ) ) {
					foreach ( $meta as $item ) {
						if ( isset( $item['label'] ) ) {
							$display[] = $item['label'];
						}
					}
				}

				$meta = implode( ', ', $display );
			}

			if ( isset( $meta['label'] ) ) {
				$meta = $meta['label'];
			}
		}

		if ( false === $meta || true === $meta ) {
			$meta = $meta ? __( 'Yes', 'otter-pro' ) : __( 'No', 'otter-pro' );
		}

		if ( empty( $meta ) || ! is_string( $meta ) ) {
			$meta = $default;
		}

		return esc_html( $meta );
	}

	/**
	 * Get ACF Repeater Sub-field Values.
	 *
	 * @param string $sub_field_key ACF field key of the targeted sub-field.
	 * @param int    $post_id       Post ID.
	 * @return string[]|null           Array of sub-field values, or null on failure.
	 */
	private function get_acf_repeater_sub_field( $sub_field_key, $post_id ) {
		$field = acf_get_field( $sub_field_key );
		if ( ! $field || ! isset( $field['parent'] ) ) {
			return null;
		}

		$path   = array( $field['name'] );
		$cursor = $field;

		while ( true ) {
			$parent = acf_get_field( (int) $cursor['parent'] );
			if ( ! $parent ) {
				break;
			}
			array_unshift( $path, $parent['name'] );
			$cursor = $parent;
		}

		// The top-level ancestor must be a repeater field.
		if ( 'repeater' !== $cursor['type'] ) {
			return null;
		}

		$rows = get_field( $cursor['key'], $post_id );
		if ( ! is_array( $rows ) || empty( $rows ) ) {
			return null;
		}

		// $path[0] is the top-level repeater's own name — already consumed by
		// get_field(). Pass the remainder as the drill-down path.
		$values = $this->collect_acf_sub_field_values( $rows, array_slice( $path, 1 ) );

		if ( empty( $values ) ) {
			return null;
		}

		$items = array();
		foreach ( $values as $v ) {
			$items[] = esc_html( $v );
		}

		return $items;
	}

	/**
	 * Recursively collect values of a specific sub-field from ACF repeater rows.
	 *
	 * @param mixed    $rows Repeater rows at the current depth level.
	 * @param string[] $path Remaining field names leading to the target leaf.
	 * @return string[]      Flat array of unescaped leaf string values.
	 */
	private function collect_acf_sub_field_values( $rows, $path ) {
		if ( empty( $path ) || ! is_array( $rows ) ) {
			return array();
		}

		$field_name = array_shift( $path );
		$collected  = array();

		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) || ! isset( $row[ $field_name ] ) ) {
				continue;
			}

			$value = $row[ $field_name ];

			if ( empty( $path ) ) {
				// Leaf node: collect non-empty strings.
				if ( is_string( $value ) && '' !== $value ) {
					$collected[] = $value;
				}
			} elseif ( is_array( $value ) ) {
				// Intermediate node pointing to a nested repeater.
				$collected = array_merge(
					$collected,
					$this->collect_acf_sub_field_values( $value, $path )
				);
			}
		}

		return $collected;
	}

	/**
	 * Get ACF Repeater Sub-field Image Values.
	 *
	 * @param string $sub_field_key ACF field key of the image sub-field.
	 * @param int    $post_id       Post ID.
	 * @return mixed[]              Flat array of raw image values, or empty array on failure.
	 */
	private function get_acf_repeater_sub_field_image( $sub_field_key, $post_id ) {
		if ( ! function_exists( 'acf_get_field' ) ) {
			return array();
		}

		$field = acf_get_field( $sub_field_key );
		if ( ! $field || ! isset( $field['parent'] ) ) {
			return array();
		}

		// Walk up the ancestor chain to find the top-level repeater.
		$path   = array( $field['name'] );
		$cursor = $field;

		while ( true ) {
			$parent = acf_get_field( (int) $cursor['parent'] );
			if ( ! $parent ) {
				break;
			}
			array_unshift( $path, $parent['name'] );
			$cursor = $parent;
		}

		if ( 'repeater' !== $cursor['type'] ) {
			return array();
		}

		$rows = get_field( $cursor['key'], $post_id );
		if ( ! is_array( $rows ) || empty( $rows ) ) {
			return array();
		}

		return $this->collect_acf_sub_field_images( $rows, array_slice( $path, 1 ) );
	}

	/**
	 * Recursively collect image values of a specific sub-field from ACF repeater rows.
	 *
	 * @param mixed    $rows Repeater rows at the current depth level.
	 * @param string[] $path Remaining field names leading to the target leaf.
	 * @return mixed[]       Flat array of raw image values.
	 */
	private function collect_acf_sub_field_images( $rows, $path ) {
		if ( empty( $path ) || ! is_array( $rows ) ) {
			return array();
		}

		$field_name = array_shift( $path );
		$collected  = array();

		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) || ! isset( $row[ $field_name ] ) ) {
				continue;
			}

			$value = $row[ $field_name ];

			if ( empty( $path ) ) {
				// Leaf node: collect any non-empty image value.
				if ( ! empty( $value ) ) {
					$collected[] = $value;
				}
			} elseif ( is_array( $value ) ) {
				// Intermediate node: recurse into nested repeater rows.
				$collected = array_merge(
					$collected,
					$this->collect_acf_sub_field_images( $value, $path )
				);
			}
		}

		return $collected;
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
		$meta    = get_the_author_meta( esc_html( $data['metaKey'] ), intval( get_post_field( 'post_author', $data['context'] ) ) );

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
	 * Format String.
	 *
	 * @param string $value String.
	 * @param string $format String Format Type.
	 *
	 * @return string
	 */
	public function format_string( $value, $format = 'default' ) {
		$value = $value;

		switch ( $format ) {
			case 'capitalize':
				$value = ucfirst( $value );
				break;
			case 'uppercase':
				$value = strtoupper( $value );
				break;
			case 'lowercase':
				$value = strtolower( $value );
				break;
			default:
				$value = $value;
		}

		return $value;
	}

	/**
	 * Get Query String Value.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_query_string( $data ) {
		$value  = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$format = isset( $data['format'] ) ? esc_html( $data['format'] ) : 'default';
		$url    = home_url( add_query_arg( null, null ) );

		$url_components = wp_parse_url( $url );

		if ( ! isset( $url_components['query'] ) ) {
			return $value;
		}

		parse_str( $url_components['query'], $params );

		if ( isset( $params[ $data['parameter'] ] ) && is_string( $params[ $data['parameter'] ] ) ) {
			$value = $params[ $data['parameter'] ];
		}

		return esc_html( $this->format_string( $value, $format ) );
	}

	/**
	 * Get the client IP address
	 *
	 * @return string
	 */
	public static function get_client_ip() {
		$ipaddress = '';
		// phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPressVIPMinimum.Variables.ServerVariables.UserControlledHeaders, WordPressVIPMinimum.Variables.RestrictedVariables.cache_constraints___SERVER__REMOTE_ADDR__
		if ( isset( $_SERVER['HTTP_CLIENT_IP'] ) ) {
			$ipaddress = $_SERVER['HTTP_CLIENT_IP'];
		} elseif ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
			$ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
		} elseif ( isset( $_SERVER['HTTP_X_FORWARDED'] ) ) {
			$ipaddress = $_SERVER['HTTP_X_FORWARDED'];
		} elseif ( isset( $_SERVER['HTTP_FORWARDED_FOR'] ) ) {
			$ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
		} elseif ( isset( $_SERVER['HTTP_FORWARDED'] ) ) {
			$ipaddress = $_SERVER['HTTP_FORWARDED'];
		} elseif ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
			$ipaddress = $_SERVER['REMOTE_ADDR'];
		} else {
			$ipaddress = '';
		}
		// phpcs:enable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPressVIPMinimum.Variables.ServerVariables.UserControlledHeaders, WordPressVIPMinimum.Variables.RestrictedVariables.cache_constraints___SERVER__REMOTE_ADDR__
		return $ipaddress;
	}

	/**
	 * Get User Location.
	 *
	 * @param string $value Value to return.
	 *
	 * @return string|bool
	 */
	public static function get_user_location( $value = 'countryName' ) {
		$api = get_option( 'otter_iphub_api_key', '' );

		if ( empty( $api ) ) {
			return false;
		}

		$ip   = self::get_client_ip();
		$url  = 'http://v2.api.iphub.info/ip/' . $ip;
		$args = array(
			'method'  => 'GET',
			'headers' => array(
				'X-Key' => $api,
			),
		);

		$response = '';

		if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
			$response = vip_safe_wp_remote_get( $url, '', 3, 1, 20, $args );
		} else {
			$response = wp_remote_get( $url, $args ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return false;
		}

		if ( isset( $body[ $value ] ) && 'ZZ' !== $body[ $value ] ) {
			return $body[ $value ];
		}

		return false;
	}

	/**
	 * Get User Country.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_country( $data ) {
		$value    = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$location = self::get_user_location();

		if ( false !== $location ) {
			$value = $location;
		}

		return $value;
	}

	/**
	 * Evaluate dynamic media content
	 *
	 * @param string           $path Current image path.
	 * @param \WP_REST_Request $request Request data.
	 *
	 * @since 2.0.9
	 * @return string|string[]
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

		if ( 'product' === $type && class_exists( 'WooCommerce' ) && ! empty( $id ) ) {
			$product = wc_get_product( $id );
			$image   = $product->get_image_id();

			if ( $image ) {
				$path = wp_get_original_image_path( intval( $image ) );
			} else {
				$image = get_option( 'woocommerce_placeholder_image', 0 );

				if ( $image ) {
					$path = wp_get_original_image_path( $image );
				}
			}
		}

		if ( 'acf' === $type && ! empty( $meta ) && class_exists( 'ACF' ) ) {
			$field = get_field( $meta, $context );

			// Fall back to repeater sub-field traversal when the field is a
			// sub-field inside a repeater (get_field() returns nothing for those).
			if ( empty( $field ) ) {
				$images = $this->get_acf_repeater_sub_field_image( $meta, $context );
				if ( ! empty( $images ) ) {
					$path = array();
					foreach ( $images as $image ) {
						$path[] = $this->get_server_attachment_path( $image );
					}
					return $path;
				}
			}

			if ( ! empty( $field ) ) {
				$path = $this->get_server_attachment_path( $field );
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
	 * @return string|string[]
	 */
	public function evaluate_content_media_content( $value, $data ) {
		if ( 'postMeta' === $data['type'] && isset( $data['meta'] ) && ! empty( $data['meta'] ) ) {
			$meta = get_post_meta( $data['context'], $data['meta'], true );

			if ( ! empty( $meta ) ) {
				$value = esc_url( $meta );
			}
		}

		if ( 'product' === $data['type'] && class_exists( 'WooCommerce' ) && isset( $data['id'] ) && ! empty( $data['id'] ) ) {
			$product = wc_get_product( $data['id'] );
			$image   = $product->get_image_id();

			if ( $image ) {
				$value = wp_get_attachment_image_url( intval( $image ), 'full' );
			} else {
				$image = get_option( 'woocommerce_placeholder_image', 0 );

				if ( $image ) {
					$value = wp_get_attachment_image_url( $image, 'full' );
				}
			}
		}

		if ( 'acf' === $data['type'] && ! empty( $data['meta'] ) && class_exists( 'ACF' ) ) {
			$field = get_field( $data['meta'], $data['context'] );

			// Fall back to repeater sub-field traversal when the field is a
			// sub-field inside a repeater (get_field() returns nothing for those).
			if ( empty( $field ) ) {
				$images = $this->get_acf_repeater_sub_field_image( $data['meta'], $data['context'] );
				if ( ! empty( $images ) ) {
					$value = array();
					foreach ( $images as $image ) {
						$value[] = $this->get_attachment_url( $image );
					}
					return $value;
				}
			}

			if ( ! empty( $field ) ) {
				$value = $this->get_attachment_url( $field );
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
	 * @return int|false
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
	 * Get attachment URL from ACF field value.
	 *
	 * @param mixed $field ACF field value.
	 * @return string URL of the attachment, or empty string if it cannot be determined.
	 */
	private function get_attachment_url( $field ) {
		$value = '';
		if ( is_array( $field ) && isset( $field['url'] ) ) {
			$value = $field['url'];
		}

		if ( is_string( $field ) ) {
			$value = $field;
		}

		if ( is_int( $field ) ) {
			$value = wp_get_attachment_image_url( $field, 'full' );
		}

		return esc_url( $value );
	}

	/**
	 * Get attchament path.
	 *
	 * @param mixed $field ACF field value.
	 * @return string URL of the attachment, or empty string if it cannot be determined.
	 */
	private function get_server_attachment_path( $field ) {
		$path = '';
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

		return esc_url( $path );
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
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-pro' ), '1.0.0' );
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
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-pro' ), '1.0.0' );
	}
}
