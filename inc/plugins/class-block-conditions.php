<?php
/**
 * Block Conditions.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use ThemeIsle\GutenbergBlocks\Plugins\Stripe_API;

/**
 * Class Block_Conditions
 */
class Block_Conditions {

	/**
	 * The main instance var.
	 *
	 * @var Block_Conditions|null
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( get_option( 'themeisle_blocks_settings_block_conditions', true ) ) {
			add_filter( 'render_block', array( $this, 'render_blocks' ), 999, 2 );
			add_action( 'wp_loaded', array( $this, 'add_attributes_to_blocks' ), 999 );
		}
	}

	/**
	 * Render Block
	 *
	 * @param string $block_content Content of block.
	 * @param array  $block Block Attributes.
	 * 
	 * @return string
	 *
	 * @since   1.7.0
	 * @access  public
	 */
	public function render_blocks( $block_content, $block ) {
		if ( ! is_admin() && ! ( defined( 'REST_REQUEST' ) && REST_REQUEST ) && isset( $block['attrs']['otterConditions'] ) ) {
			
			$display = $this->evaluate_condition_collection( $block['attrs']['otterConditions'] );

			if ( false === $display ) {
				return '';
			}

			$enhanced_content = $this->should_add_hide_css_class( $this->get_hide_css_condition( $block['attrs']['otterConditions'] ), $block_content );

			if ( false !== $enhanced_content && is_string( $enhanced_content ) ) {
				return $enhanced_content;
			}
		}

		return $block_content;
	}

	/**
	 * Evaluate conditions
	 *
	 * @param array<array> $collection The conditions collection to evaluate.
	 * @return bool Whether the conditions are met.
	 */
	public function evaluate_condition_collection( $collection ) {
		$display = true;

		foreach ( $collection as $group ) {
			if ( 0 === count( $group ) ) {
				continue;
			}

			$visibility = true;

			foreach ( $group as $condition ) {
				if ( ! $this->evaluate_condition( $condition ) ) {
					$visibility = false;
				}
			}

			if ( true === $visibility ) {
				$display = true;
				break;
			}

			if ( false === $visibility ) {
				$display = false;
			}
		}
			
		return $display;
	}

	/**
	 * Get the hide CSS condition.
	 * 
	 * @param array<array> $collection The conditions collection to evaluate.
	 * @return array|bool The hide CSS condition, or false if none is found.
	 */
	public function get_hide_css_condition( $collection ) {
		foreach ( $collection as $group ) {
			if ( 0 === count( $group ) ) {
				continue;
			}
			
			foreach ( $group as $condition ) {
				if ( ! empty( $condition['type'] ) && ! empty( $condition['screen_sizes'] ) ) {
					return $condition;
				}
			}
		}
			
		return false;
	}

	/**
	 * Adds the `otterConditions` attributes to all blocks, to avoid `Invalid parameter(s): attributes`
	 * error in Gutenberg.
	 *
	 * @since   1.7.0
	 * @access  public
	 */
	public function add_attributes_to_blocks() {
		$registered_blocks = \WP_Block_Type_Registry::get_instance()->get_all_registered();

		foreach ( $registered_blocks as $name => $block ) {
			$block->attributes['otterConditions'] = array(
				'type'    => 'array',
				'default' => array(),
			);
		}
	}

	/**
	 * Evaluate single condition
	 *
	 * @param array $condition condition.
	 *
	 * @return bool
	 */
	public function evaluate_condition( $condition ) {
		if ( ! isset( $condition['type'] ) ) {
			return true;
		}

		$visibility = isset( $condition['visibility'] ) ? boolval( $condition['visibility'] ) : true;

		if ( 'loggedInUser' === $condition['type'] ) {
			return is_user_logged_in();
		}

		if ( 'loggedOutUser' === $condition['type'] ) {
			return ! is_user_logged_in();
		}

		if ( 'userRoles' === $condition['type'] && isset( $condition['roles'] ) ) {
			return $visibility ? $this->has_user_roles( $condition['roles'] ) : ! $this->has_user_roles( $condition['roles'] );
		}

		if ( 'postAuthor' === $condition['type'] && isset( $condition['authors'] ) ) {
			return $visibility ? $this->has_author( $condition['authors'] ) : ! $this->has_author( $condition['authors'] );
		}

		if ( 'postType' === $condition['type'] && isset( $condition['post_types'] ) ) {
			return $visibility ? $this->is_type( $condition['post_types'] ) : ! $this->is_type( $condition['post_types'] );
		}

		if ( 'postCategory' === $condition['type'] && isset( $condition['categories'] ) ) {
			return $visibility ? $this->has_category( $condition['categories'] ) : ! $this->has_category( $condition['categories'] );
		}

		if ( 'postTag' === $condition['type'] && isset( $condition['tags'] ) ) {
			return $visibility ? has_tag( $condition['tags'] ) : ! has_tag( $condition['tags'] );
		}

		if ( 'screenSize' === $condition['type'] ) {
			return true;
		}

		if ( 'stripePurchaseHistory' === $condition['type'] && isset( $condition['product'] ) && Stripe_API::has_keys() ) {
			return $visibility ? $this->has_stripe_product( $condition['product'] ) : ! $this->has_stripe_product( $condition['product'] );
		}

		return apply_filters( 'otter_blocks_evaluate_condition', true, $condition, $visibility );
	}

	/**
	 * Check current user's role.
	 *
	 * @param array $roles Selected user roles.
	 *
	 * @since  1.7.0
	 * @access public
	 */
	public function has_user_roles( $roles ) {
		$user = wp_get_current_user();

		$user_roles = (array) $user->roles;

		foreach ( (array) $roles as $role ) {
			if ( in_array( $role, $user_roles ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check current user's role.
	 *
	 * @param array $authors Selected user roles.
	 *
	 * @since  1.7.0
	 * @access public
	 */
	public function has_author( $authors ) {
		$id       = get_the_author_meta( 'ID' );
		$user     = get_user_by( 'id', $id );
		$username = $user->user_login;

		if ( in_array( $username, $authors ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Check post type.
	 *
	 * @param array $types Selected post types.
	 *
	 * @access public
	 */
	public function is_type( $types ) {
		$type = get_post_type();
		return in_array( $type, $types );
	}

	/**
	 * Check post category.
	 *
	 * @param array $categories Selected post categories.
	 *
	 * @access public
	 */
	public function has_category( $categories ) {
		$used = get_the_category();

		$used_categories = array_map(
			function ( $category ) {
				return $category->slug;
			},
			$used
		);

		return array_intersect( $categories, $used_categories ) === $categories;
	}

	/**
	 * Check Stripe Product.
	 *
	 * @param string $product Selected Stripe product.
	 *
	 * @access public
	 */
	public function has_stripe_product( $product ) {
		$stripe = new Stripe_API();
		return $stripe->check_purchase( $product );
	}

	/**
	 * If the block has a hide condition, add the appropriate CSS class.
	 *
	 * @param array  $condition Condition.
	 * @param string $block_content Reference to block content.
	 * @return string|bool
	 */
	public function should_add_hide_css_class( $condition, $block_content ) {

		if ( empty( $condition['type'] ) || empty( $condition['screen_sizes'] ) ) {
			return false;
		}

		$screen_sizes     = $condition['screen_sizes'];
		$hide_css_classes = '';

		if ( in_array( 'mobile', $screen_sizes ) ) {
			$hide_css_classes .= ' o-hide-on-mobile';
		}

		if ( in_array( 'tablet', $screen_sizes ) ) {
			$hide_css_classes .= ' o-hide-on-tablet';
		}

		if ( in_array( 'desktop', $screen_sizes ) ) {
			$hide_css_classes .= ' o-hide-on-desktop';
		}

		if ( empty( $hide_css_classes ) ) {
			return false;
		}

		// Get the parent node.
		$html_nodes_matches = array();
		preg_match( '/<[^>]+>/', $block_content, $html_nodes_matches, PREG_OFFSET_CAPTURE );

		// If we have not match, then the content might not be a valid HTML element.
		if ( empty( $html_nodes_matches ) ) {
			return false;
		}

		$parent_node      = $html_nodes_matches[0][0];
		$hide_css_classes = ltrim( $hide_css_classes, ' ' );

		// If we have a class attribute, append the CSS class to it. Otherwise, add the class attribute.
		if ( false !== strpos( $parent_node, 'class="' ) ) {
			$before_class  = strstr( $block_content, 'class="', true );
			$after_class   = strstr( $block_content, 'class="' );
			$after_class   = substr( $after_class, strlen( 'class="' ) );
			$block_content = $before_class . 'class="' . $hide_css_classes . ' ' . $after_class;
		} elseif ( false !== strpos( $parent_node, "class='" ) ) {
			// Special case with single quotes.
			$before_class  = strstr( $block_content, "class='", true );
			$after_class   = strstr( $block_content, "class='" );
			$after_class   = substr( $after_class, strlen( "class='" ) );
			$block_content = $before_class . "class='" . $hide_css_classes . ' ' . $after_class;
		} else {
			$class_attribute_string = ' class="' . $hide_css_classes . '"';
			$enhanced_parent_node   = preg_replace( '/>$/', $class_attribute_string . '>', $parent_node );
			$block_content          = str_replace( $parent_node, $enhanced_parent_node, $block_content );
		}

		return $block_content;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.0
	 * @access public
	 * @return Block_Conditions
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
