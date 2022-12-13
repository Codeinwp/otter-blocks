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
	 * @var Block_Conditions
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( get_option( 'themeisle_blocks_settings_block_conditions', true ) ) {
			add_action( 'render_block', array( $this, 'render_blocks' ), 999, 2 );
			add_action( 'wp_loaded', array( $this, 'add_attributes_to_blocks' ), 999 );
		}
	}

	/**
	 * Render Block
	 *
	 * @param string $block_content Content of block.
	 * @param array  $block Block Attributes.
	 *
	 * @since   1.7.0
	 * @access  public
	 */
	public function render_blocks( $block_content, $block ) {
		if ( ! is_admin() && ! ( defined( 'REST_REQUEST' ) && REST_REQUEST ) && isset( $block['attrs']['otterConditions'] ) ) {
			$display = true;

			foreach ( $block['attrs']['otterConditions'] as $group ) {
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

			if ( false === $display ) {
				return;
			}
		}

		return $block_content;
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
			if ( is_user_logged_in() ) {
				return true;
			} else {
				return false;
			}
		}

		if ( 'loggedOutUser' === $condition['type'] ) {
			if ( is_user_logged_in() ) {
				return false;
			} else {
				return true;
			}
		}

		if ( 'userRoles' === $condition['type'] ) {
			if ( isset( $condition['roles'] ) ) {
				if ( $visibility ) {
					return $this->has_user_roles( $condition['roles'] );
				} else {
					return ! $this->has_user_roles( $condition['roles'] );
				}
			}
		}

		if ( 'postAuthor' === $condition['type'] ) {
			if ( isset( $condition['authors'] ) ) {
				if ( $visibility ) {
					return $this->has_author( $condition['authors'] );
				} else {
					return ! $this->has_author( $condition['authors'] );
				}
			}
		}

		if ( 'postType' === $condition['type'] ) {
			if ( isset( $condition['post_types'] ) ) {
				if ( $visibility ) {
					return $this->is_type( $condition['post_types'] );
				} else {
					return ! $this->is_type( $condition['post_types'] );
				}
			}
		}

		if ( 'postCategory' === $condition['type'] ) {
			if ( isset( $condition['categories'] ) ) {
				if ( $visibility ) {
					return $this->has_category( $condition['categories'] );
				} else {
					return ! $this->has_category( $condition['categories'] );
				}
			}
		}

		if ( 'stripePurchaseHistory' === $condition['type'] ) {
			if ( isset( $condition['product'] ) && Stripe_API::has_keys() ) {
				if ( $visibility ) {
					return $this->has_stripe_product( $condition['product'] );
				} else {
					return ! $this->has_stripe_product( $condition['product'] );
				}
			}
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
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.0
	 * @access public
	 * @return Options_Settings
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
