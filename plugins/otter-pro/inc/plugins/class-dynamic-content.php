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
