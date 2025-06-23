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
	 * @var Dynamic_Content|null
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_filter( 'render_block', array( $this, 'apply_dynamic_content' ) );
		add_filter( 'render_block', array( $this, 'apply_dynamic_magic_tags' ) );
		add_filter( 'render_block', array( $this, 'apply_dynamic_link' ) );
		add_filter( 'render_block', array( $this, 'apply_dynamic_link_button' ) );
		add_filter( 'render_block', array( $this, 'apply_dynamic_images' ) );
		add_filter( 'otter_apply_dynamic_image', array( $this, 'apply_dynamic_images' ) );
	}

	/**
	 * Filter post content for dynamic content.
	 *
	 * @param string $content Post content.
	 *
	 * @return string
	 */
	public function apply_dynamic_content( $content ) {
		if ( false === strpos( $content, '<o-dynamic' ) ) {
			return $content;
		}

		$matches = array();
		$num     = self::parse_dynamic_content_query( $content, $matches );

		if ( isset( $num ) && 0 === $num ) {
			return $content;
		}

		foreach ( $matches as $match ) {
			$replacement       = $this->apply_data( $match );
			$string_to_replace = $match[0];
			$position          = strstr( $content, $string_to_replace, true );

			if ( false === $position ) {
				continue;
			}

			$position = strlen( $position );
			$content  = substr_replace( $content, $replacement, $position, strlen( $string_to_replace ) );
		}

		return $content;
	}

	/**
	 * Get the Dynamic Content regex.
	 *
	 * @return string
	 */
	public static function dynamic_content_regex() {
		// Todo: Improve this Regex, it can't go on for like this. Soon it will be longer than the available space in the universe!!!
		return '/<o-dynamic(?:\s+(?:data-type=["\'](?P<type>[^"\'<>]+)["\']|data-id=["\'](?P<id>[^"\'<>]+)["\']|data-before=["\'](?P<before>[^"\'<>]+)["\']|data-after=["\'](?P<after>[^"\'<>]+)["\']|data-length=["\'](?P<length>[^"\'<>]+)["\']|data-date-type=["\'](?P<dateType>[^"\'<>]+)["\']|data-date-format=["\'](?P<dateFormat>[^"\'<>]+)["\']|data-date-custom=["\'](?P<dateCustom>[^"\'<>]+)["\']|data-time-type=["\'](?P<timeType>[^"\'<>]+)["\']|data-time-format=["\'](?P<timeFormat>[^"\'<>]+)["\']|data-time-custom=["\'](?P<timeCustom>[^"\'<>]+)["\']|data-term-type=["\'](?P<termType>[^"\'<>]+)["\']|data-term-separator=["\'](?P<termSeparator>[^"\'<>]+)["\']|data-meta-key=["\'](?P<metaKey>[^"\'<>]+)["\']|data-parameter=["\'](?P<parameter>[^"\'<>]+)["\']|data-format=["\'](?P<format>[^"\'<>]+)["\']|data-context=["\'](?P<context>[^"\'<>]+)["\']|data-taxonomy=["\'](?P<taxonomy>[^"\'<>]+)["\']|[a-zA-Z-]+=["\'][^"\'<>]+["\']))*\s*>(?<default>[^ $].*?)<\s*\/\s*o-dynamic>/';
	}

	/**
	 * Parse dynamic content query.
	 *
	 * @param string $content The content to parse.
	 * @param array  $matches The matches.
	 * @return mixed
	 */
	public static function parse_dynamic_content_query( $content, &$matches ) {
		$re = self::dynamic_content_regex();
		return preg_match_all( $re, $content, $matches, PREG_SET_ORDER, 0 );
	}

	/**
	 * Filter post content for Magic Tags.
	 *
	 * @param string $content Post content.
	 *
	 * @return string
	 */
	public function apply_dynamic_magic_tags( $content ) {
		if ( false === strpos( $content, '{otterDynamic?' ) ) {
			return $content;
		}

		$re = '/{(otterDynamic\/?.[^"]*)}/';

		return preg_replace_callback( $re, array( $this, 'apply_magic_tags' ), $content );
	}

	/**
	 * Apply dynamic data for Magic Tags.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string|void
	 */
	public function apply_magic_tags( $data ) {
		if ( ! isset( $data[1] ) ) {
			return;
		}

		$data = explode( 'otterDynamic', $data[1] );
		$data = self::query_string_to_array( $data[1] );

		if ( ! isset( $data['default'] ) ) {
			$data['default'] = '';
		}

		$data = $this->apply_data( $data, true );

		return $data;
	}

	/**
	 * Filter post content for dynamic link.
	 *
	 * @param string $content Post content.
	 *
	 * @return string
	 */
	public function apply_dynamic_link( $content ) {
		if ( false === strpos( $content, '<o-dynamic-link' ) ) {
			return $content;
		}

		$re = '/<o-dynamic-link(?:\s+(?:data-type=["\'](?P<type>[^"\'<>]+)["\']|data-target=["\'](?P<target>[^"\'<>]+)["\']|data-meta-key=["\'](?P<metaKey>[^"\'<>]+)["\']|data-context=["\'](?P<context>[^"\'<>]+)["\']|[a-zA-Z-]+=["\'][^"\'<>]+["\']))*\s*>(?<text>[^ $].*?)<\s*\/\s*o-dynamic-link>/';

		return preg_replace_callback( $re, array( $this, 'apply_link' ), $content );
	}

	/**
	 * Filter post content for dynamic link buttons.
	 *
	 * @param string $content Post content.
	 *
	 * @return string
	 */
	public function apply_dynamic_link_button( $content ) {
		if ( false === strpos( $content, '#otterDynamicLink' ) ) {
			return $content;
		}

		$re = '/#otterDynamicLink\/?.[^"]*/';

		return preg_replace_callback( $re, array( $this, 'apply_link_button' ), $content );
	}

	/**
	 * Filter post content for dynamic images.
	 *
	 * @param string $content Post content.
	 *
	 * @return string
	 */
	public function apply_dynamic_images( $content ) {
		if ( false === strpos( $content, 'otter/v1/dynamic' ) ) {
			return $content;
		}

		$rest_url = get_rest_url( null, 'otter/v1' );
		$rest_url = preg_replace( '/([^A-Za-z0-9\s_-])/', '\\\\$1', $rest_url );

		$re = '/' . $rest_url . '\/dynamic\/?.[^"]*/';

		return preg_replace_callback( $re, array( $this, 'apply_images' ), $content );
	}

	/**
	 * Apply dynamic data.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string|void
	 */
	public function apply_images( $data ) {
		if ( ! isset( $data[0] ) ) {
			return;
		}

		$data  = self::query_string_to_array( $data[0] );
		$value = $this->get_image( $data );

		return $value;
	}

	/**
	 * Apply dynamic image.
	 *
	 * @param array $data Query array.
	 *
	 * @return string
	 */
	public function get_image( $data ) {
		$value = OTTER_BLOCKS_URL . 'assets/images/placeholder.jpg';

		global $post;

		$id = ( defined( 'REST_REQUEST' ) && REST_REQUEST || ( isset( $data['context'] ) && 'query' === $data['context'] ) ) ? $post->ID : get_queried_object_id();

		if ( isset( $data['context'] ) && ( 0 === $data['context'] || 'query' === $data['context'] || ( is_singular() && $data['context'] !== $id ) ) ) {
			$data['context'] = $id;
		}

		if ( isset( $data['fallback'] ) && ! empty( $data['fallback'] ) ) {
			$value = esc_url( $data['fallback'] );
		}

		if ( ! isset( $data['type'] ) && empty( $data['type'] ) ) {
			return $value;
		}

		if ( 'featuredImage' === $data['type'] ) {
			$image = get_the_post_thumbnail_url( $data['context'] );

			if ( $image ) {
				$value = $image;
			}
		}

		if ( 'author' === $data['type'] ) {
			$author = get_post_field( 'post_author', $data['context'] );
			$value  = get_avatar_url( $author );
		}

		if ( 'loggedInUser' === $data['type'] ) {
			$user = get_current_user_id();

			if ( true === boolval( $user ) ) {
				$value = get_avatar_url( $user );
			}
		}

		if ( 'logo' === $data['type'] ) {
			$custom_logo_id = get_theme_mod( 'custom_logo' );

			if ( $custom_logo_id ) {
				$value = wp_get_attachment_image_url( $custom_logo_id, 'full' );
			}
		}

		$value = apply_filters( 'otter_blocks_evaluate_dynamic_content_media_content', $value, $data );

		return $value;
	}

	/**
	 * Apply dynamic data.
	 *
	 * @param array $data Dynamic request.
	 * @param bool  $magic_tags Is a request for Magic Tags.
	 *
	 * @return string
	 */
	public function apply_data( $data, $magic_tags = false ) {
		$value = $this->get_data( $data, $magic_tags );

		if ( isset( $data['before'] ) || isset( $data['after'] ) ) {
			$value = $this->apply_formatting( $value, $data );
		}

		if ( isset( $data['default'] ) && false !== strpos( $data['default'], '<o-dynamic-link' ) ) {
			$link = $this->apply_dynamic_link( $data['default'] );
			return preg_replace( '/(<a.*?>).*?(<\/a>)/', '$1' . $value . '$2', $link );
		}

		return $value;
	}

	/**
	 * Apply formatting.
	 *
	 * @param string $value Dynamic value.
	 * @param array  $data Dynamic request.
	 *
	 * @return string
	 */
	public function apply_formatting( $value, $data ) {
		if ( isset( $data['before'] ) ) {
			$value = esc_html( $data['before'] ) . $value;
		}

		if ( isset( $data['after'] ) ) {
			$value = $value . esc_html( $data['after'] );
		}

		return $value;
	}

	/**
	 * Get dynamic data.
	 *
	 * @param array $data Dynamic request.
	 * @param bool  $magic_tags Is a request for Magic Tags.
	 *
	 * @return string
	 */
	public function get_data( $data, $magic_tags ) {
		if ( ! ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || true === $magic_tags ) {
			if ( isset( $data['context'] ) && 'query' === $data['context'] ) {
				$data['context'] = get_the_ID();
			} else {
				/*
				* We use the queried object ID to make sure when posts are displayed inside other posts
				* the displayed post is being used as a source for the dynamic tags. Eg. Custom Layouts inside Neve.
				*/
				$data['context'] = get_queried_object_id();
			}
		} else {
			$data['default'] = '';
		}

		if ( ! isset( $data['type'] ) && isset( $data['default'] ) ) {
			return esc_html( $data['default'] );
		}

		if ( 'postID' === $data['type'] ) {
			return $data['context'];
		}

		if ( 'postTitle' === $data['type'] ) {
			return get_the_title( $data['context'] );
		}

		if ( 'postContent' === $data['type'] ) {
			return $this->get_content( $data );
		}

		if ( 'postExcerpt' === $data['type'] ) {
			return $this->get_excerpt( $data );
		}

		if ( 'postType' === $data['type'] ) {
			return get_post_type( $data['context'] );
		}

		if ( 'postStatus' === $data['type'] ) {
			return get_post_status( $data['context'] );
		}

		if ( 'siteTitle' === $data['type'] ) {
			return get_bloginfo( 'name' );
		}

		if ( 'siteTagline' === $data['type'] ) {
			return get_bloginfo( 'description' );
		}

		if ( 'authorName' === $data['type'] ) {
			return get_the_author_meta( 'display_name', intval( get_post_field( 'post_author', $data['context'] ) ) );
		}

		if ( 'authorDescription' === $data['type'] ) {
			return get_the_author_meta( 'description', intval( get_post_field( 'post_author', $data['context'] ) ) );
		}

		if ( 'loggedInUserName' === $data['type'] ) {
			return $this->get_loggedin_name( $data );
		}

		if ( 'loggedInUserDescription' === $data['type'] ) {
			return $this->get_loggedin_description( $data );
		}

		if ( 'loggedInUserEmail' === $data['type'] ) {
			return $this->get_loggedin_email( $data );
		}

		if ( 'archiveTitle' === $data['type'] ) {
			return get_the_archive_title();
		}

		if ( 'archiveDescription' === $data['type'] ) {
			return $this->get_archive_description( $data );
		}

		if ( 'date' === $data['type'] ) {
			return $this->get_current_date( $data );
		}

		if ( 'time' === $data['type'] ) {
			return $this->get_current_time( $data );
		}

		return apply_filters( 'otter_blocks_evaluate_dynamic_content_text', $data['default'], $data );
	}

	/**
	 * Get Content.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_content( $data ) {
		$data = $this->mark_exceptions( $data );
		$key  = $this->get_exception_key( $data );

		if ( isset( $data[ $key ] ) ) {
			return '';
		}

		$content = get_the_content( $data['context'] );
		$content = apply_filters( 'the_content', str_replace( ']]>', ']]&gt;', $content ) );
		return wp_kses_post( $content );
	}

	/**
	 * Get Excerpt.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_excerpt( $data ) {
		$post    = get_post( $data['context'] );
		$excerpt = $post->post_excerpt; // Here we don't use get_the_excerpt() function as it causes an infinite loop.

		if ( empty( $excerpt ) ) {
			$data = $this->mark_exceptions( $data );
			$key  = $this->get_exception_key( $data, $post->ID );

			if ( ! isset( $data[ $key ] ) ) {
				$excerpt = wp_trim_excerpt( '', $post );
			}
		}

		if ( isset( $data['length'] ) && ! empty( $data['length'] ) ) {
			$excerpt = substr( $excerpt, 0, intval( $data['length'] ) ) . '…';
		}

		if ( empty( $excerpt ) ) {
			return $data['default'];
		}

		return sanitize_text_field( $excerpt );
	}

	/**
	 * Get Logged-in User Name.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_loggedin_name( $data ) {
		$user_id = get_current_user_id();
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$user    = get_userdata( $user_id );

		if ( false === $user ) {
			$display_name = $default;
		} else {
			$display_name = $user->display_name;
		}

		return esc_html( $display_name );
	}

	/**
	 * Get Logged-in User Description.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_loggedin_description( $data ) {
		$user_id = get_current_user_id();
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$user    = get_userdata( $user_id );

		if ( false === $user ) {
			$description = $default;
		} else {
			$description = $user->description;
		}

		return esc_html( $description );
	}

	/**
	 * Get Logged-in User Email.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_loggedin_email( $data ) {
		$user    = wp_get_current_user();
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$email   = $user->user_email;

		if ( empty( $email ) ) {
			$email = $default;
		}

		return esc_html( $email );
	}

	/**
	 * Get Archive Description.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_archive_description( $data ) {
		$description = get_the_archive_description();

		if ( empty( $description ) ) {
			$description = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		}

		return wp_strip_all_tags( $description );
	}

	/**
	 * Get Current Date.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_current_date( $data ) {
		$format = get_option( 'date_format' );

		if ( isset( $data['dateFormat'] ) && ! empty( $data['dateFormat'] ) && 'default' !== $data['dateFormat'] && 'custom' !== $data['dateFormat'] ) {
			$format = esc_html( $data['dateFormat'] );
		}

		if ( isset( $data['dateCustom'] ) && ! empty( $data['dateCustom'] ) && isset( $data['dateFormat'] ) && 'custom' === $data['dateFormat'] ) {
			$format = esc_html( $data['dateCustom'] );
		}

		$date = date( $format );

		return $date;
	}

	/**
	 * Get Current Date.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_current_time( $data ) {
		$format = get_option( 'time_format' );

		if ( isset( $data['timeFormat'] ) && ! empty( $data['timeFormat'] ) && 'default' !== $data['timeFormat'] && 'custom' !== $data['timeFormat'] ) {
			$format = esc_html( $data['timeFormat'] );
		}

		if ( isset( $data['timeCustom'] ) && ! empty( $data['timeCustom'] ) && isset( $data['timeFormat'] ) && 'custom' === $data['timeFormat'] ) {
			$format = esc_html( $data['timeCustom'] );
		}

		$time = date( $format );

		return $time;
	}

	/**
	 * Convert Query String to Array.
	 *
	 * @param string $qry URL.
	 *
	 * @return array|bool
	 */
	public static function query_string_to_array( $qry ) {
		$result = array();

		if ( strpos( $qry, '=' ) ) {
			if ( strpos( $qry, '?' ) !== false ) {
				$qry = str_replace( array( '&#038;', '&amp;' ), '&', $qry );
				$q   = wp_parse_url( $qry );
				$qry = isset( $q['query'] ) ? $q['query'] : $q['fragment'];
			}
		} else {
			return false;
		}

		foreach ( explode( '&', $qry ) as $couple ) {
			list ( $key, $val ) = array_pad( explode( '=', $couple ), 2, null );
			$result[ $key ]     = $val;
		}

		return $result;
	}

	/**
	 * Apply dynamic data.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string
	 */
	public function apply_link( $data ) {
		$link = $this->get_link( $data );

		if ( empty( $link ) ) {
			$link = get_site_url();
		}

		$attrs = '';

		if ( isset( $data['target'] ) && '_blank' === $data['target'] ) {
			$attrs = 'target="_blank"';
		}

		$value = sprintf(
			'<a href="%s" %s>%s</a>',
			esc_url( $link ),
			$attrs,
			wp_kses_post( $data['text'] )
		);

		return $value;
	}

	/**
	 * Apply dynamic data for Buttons.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string|void
	 */
	public function apply_link_button( $data ) {
		if ( ! isset( $data[0] ) ) {
			return;
		}

		$data = explode( '#otterDynamicLink', $data[0] );
		$data = self::query_string_to_array( $data[1] );

		$link = $this->get_link( $data );

		if ( empty( $link ) ) {
			$link = get_site_url();
		}

		return $link;
	}

	/**
	 * Apply dynamic data.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string|void
	 */
	public function get_link( $data ) {
		if ( ! isset( $data['type'] ) ) {
			return;
		}

		if ( isset( $data['context'] ) && 'query' === $data['context'] ) {
			$data['context'] = get_the_ID();
		} else {
			$data['context'] = get_queried_object_id();
		}

		if ( 'postURL' === $data['type'] ) {
			return get_the_permalink( $data['context'] );
		}

		if ( 'siteURL' === $data['type'] ) {
			return get_site_url();
		}

		if ( 'featuredImageURL' === $data['type'] ) {
			return wp_get_attachment_url( get_post_thumbnail_id( $data['context'] ) );
		}

		if ( 'authorURL' === $data['type'] ) {
			return get_author_posts_url( intval( get_post_field( 'post_author', $data['context'] ) ) );
		}

		if ( 'authorWebsite' === $data['type'] ) {
			return get_the_author_meta( 'url', intval( get_post_field( 'post_author', $data['context'] ) ) );
		}

		return apply_filters( 'otter_blocks_evaluate_dynamic_content_link', '', $data );
	}

	/**
	 * Mark the exceptions for Dynamic request.
	 *
	 * Features that are using complex functions like `get_content` (directly or indirectly) might not behave correctly in every situation.
	 * Based on the context, we decide if it is safe to use those functions..
	 *
	 * @param array $data Dynamic request.
	 * @return array Dynamic request with marked exceptions.
	 */
	public function mark_exceptions( $data ) {
		if ( 'postExcerpt' === $data['type'] || 'postContent' === $data['type'] ) {
			if (
				'valid' === apply_filters( 'product_neve_license_status', false ) &&
				class_exists( '\Neve_Pro\Modules\Custom_Layouts\Module' )
			) {
				$post = get_post( $data['context'] );
				if ( isset( $post ) && 'neve_custom_layouts' === $post->post_type ) {
					$key = $this->get_exception_key( $data, $post->ID );
					if ( $key ) {
						$data[ $key ] = true;
					}
				}
			}

			if ( 'postContent' === $data['type'] ) {

				// To do not trigger postContent action if the given content contains the postContent dynamic tag, because it will cause an infinite loop.
				$content = get_the_content( $data['context'] );
				if ( isset( $post ) && strpos( $content, 'data-type="postContent"' ) ) {
					$key = $this->get_exception_key( $data, $post->ID );
					if ( $key ) {
						$data[ $key ] = true;
					}
				}
			}
		}

		if ( has_filter( 'otter_blocks_dynamic_content_exception' ) ) {

			/**
			 * Gather exceptions for Dynamic request from other plugins via hooks. Before merging the changes, we make sure that critical data is present.
			 */
			$data_exceptions = apply_filters( 'otter_blocks_dynamic_content_exception', $data );
			if (
				isset( $data_exceptions ) &&
				is_array( $data_exceptions )
			) {
				$merged = array_merge( $data, $data_exceptions );

				if ( isset( $merged['type'] ) && isset( $merged['context'] ) ) {
					$data = $merged;
				}
			}
		}

		return $data;
	}

	/**
	 * Get the exception key for Dynamic request.
	 *
	 * @param array   $data Dynamic request.
	 * @param numeric $post_id Post ID.
	 * @return string|null
	 */
	public function get_exception_key( $data, $post_id = null ) {
		if ( null == $post_id ) {
			$post = get_post( $data['context'] );
			if ( isset( $post ) ) {
				$post_id = $post->ID;
			}
		}

		return 'exception_dynamic_content_' . $data['type'] . '_' . $post_id;
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
