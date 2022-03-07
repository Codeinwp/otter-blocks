<?php
/**
 * Block Conditions.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

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
		add_action( 'render_block', array( $this, 'render_blocks' ), 999, 2 );
		add_action( 'wp_loaded', array( $this, 'add_attributes_to_blocks' ), 999 );
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

		$has_pro    = 'valid' === apply_filters( 'product_neve_license_status', false );
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

		if ( 'postMeta' === $condition['type'] && $has_pro ) {
			if ( isset( $condition['meta_key'] ) ) {
				if ( $visibility ) {
					return $this->has_meta( $condition );
				} else {
					return ! $this->has_meta( $condition );
				}
			}
		}

		if ( 'dateRange' === $condition['type'] && $has_pro ) {
			if ( isset( $condition['start_date'] ) ) {
				return $this->has_date_range( $condition );
			}
		}

		if ( 'dateRecurring' === $condition['type'] && $has_pro ) {
			if ( isset( $condition['days'] ) ) {
				return $this->has_date_recurring( $condition['days'] );
			}
		}

		if ( 'timeRecurring' === $condition['type'] && $has_pro ) {
			if ( isset( $condition['start_time'] ) ) {
				return $this->has_time_recurring( $condition );
			}
		}

		if ( 'queryString' === $condition['type'] ) {
			if ( isset( $condition['query_string'] ) && isset( $condition['match'] ) && $has_pro ) {
				if ( $visibility ) {
					return $this->has_query_string( $condition );
				} else {
					return ! $this->has_query_string( $condition );
				}
			}
		}

		if ( 'wooProductsInCart' === $condition['type'] && class_exists( 'WooCommerce' ) && $has_pro ) {
			if ( isset( $condition['on'] ) ) {
				if ( $visibility ) {
					return $this->has_products_in_cart( $condition );
				} else {
					return ! $this->has_products_in_cart( $condition );
				}
			}
		}

		if ( 'wooTotalCartValue' === $condition['type'] && class_exists( 'WooCommerce' ) && $has_pro ) {
			if ( isset( $condition['value'] ) ) {
				if ( 'greater_than' === $condition['compare'] ) {
					return $this->has_total_cart_value( $condition['value'] );
				} else {
					return ! $this->has_total_cart_value( $condition['value'] );
				}
			}
		}

		if ( 'wooPurchaseHistory' === $condition['type'] && class_exists( 'WooCommerce' ) && $has_pro ) {
			if ( isset( $condition['products'] ) ) {
				if ( $visibility ) {
					return $this->has_products( $condition['products'] );
				} else {
					return ! $this->has_products( $condition['products'] );
				}
			}
		}

		if ( 'wooTotalSpent' === $condition['type'] && class_exists( 'WooCommerce' ) && $has_pro ) {
			if ( isset( $condition['value'] ) ) {
				if ( 'greater_than' === $condition['compare'] ) {
					return $this->has_total_spent( $condition['value'] );
				} else {
					return ! $this->has_total_spent( $condition['value'] );
				}
			}
		}

		if ( 'learnDashPurchaseHistory' === $condition['type'] && defined( 'LEARNDASH_VERSION' ) && $has_pro ) {
			if ( isset( $condition['on'] ) ) {
				if ( $visibility ) {
					return $this->has_courses_or_groups( $condition );
				} else {
					return ! $this->has_courses_or_groups( $condition );
				}
			}
		}

		if ( 'learnDashCourseStatus' === $condition['type'] && defined( 'LEARNDASH_VERSION' ) && $has_pro ) {
			if ( isset( $condition['course'] ) ) {
				if ( $visibility ) {
					return $this->has_course_status( $condition );
				} else {
					return ! $this->has_course_status( $condition );
				}
			}
		}

		return true;
	}

	/**
	 * Check URL parameters
	 * Returns true if URL matches the parameters from the condition.
	 *
	 * @param array $condition Condition.
	 *
	 * @access public
	 */
	public function has_query_string( $condition ) {
		$url = home_url( add_query_arg( null, null ) );

		$url_components = wp_parse_url( $url );

		if ( ! isset( $url_components['query'] ) ) {
			return false;
		}

		$query_string = preg_replace( '/\s/', '', $condition['query_string'] );

		parse_str( $url_components['query'], $params );
		parse_str( $query_string, $cond_params );

		if ( 'any' === $condition['match'] ) {
			return count( array_intersect( $cond_params, $params ) ) > 0;
		}

		return array_intersect( $cond_params, $params ) === $cond_params;
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
	 * Check meta compare.
	 *
	 * @param array $condition Condition.
	 *
	 * @since  1.7.0
	 * @access public
	 */
	public function has_meta( $condition ) {
		if ( ! isset( $condition['meta_key'] ) || ! isset( $condition['meta_compare'] ) ) {
			return true;
		}

		$id   = get_the_ID();
		$meta = get_post_meta( $id, $condition['meta_key'], true );

		if ( 'is_true' === $condition['meta_compare'] ) {
			return true === boolval( $meta );
		}

		if ( 'is_false' === $condition['meta_compare'] ) {
			return false === boolval( $meta );
		}

		if ( 'is_empty' === $condition['meta_compare'] ) {
			return empty( $meta );
		}

		if ( 'if_equals' === $condition['meta_compare'] && isset( $condition['meta_value'] ) ) {
			return $meta === $condition['meta_value'];
		}

		if ( 'if_contains' === $condition['meta_compare'] && isset( $condition['meta_value'] ) ) {
			return false !== strpos( $meta, $condition['meta_value'] );
		}

		return false;
	}

	/**
	 * Check date range.
	 *
	 * @param array $condition Condition.
	 *
	 * @since  1.7.0
	 * @access public
	 */
	public function has_date_range( $condition ) {
		if ( ! isset( $condition['start_date'] ) ) {
			return true;
		}

		$timezone     = $this->get_timezone();
		$start_date   = strtotime( $condition['start_date'] . $timezone );
		$current_time = time();
		$start_date   = $current_time > $start_date;
		$end_date     = true;

		if ( isset( $condition['end_date'] ) ) {
			$end_date = strtotime( $condition['end_date'] . $timezone );
			$end_date = $current_time < $end_date;
		}

		if ( $start_date && $end_date ) {
			return true;
		}

		return false;
	}

	/**
	 * Check recurring days.
	 *
	 * @param array $days Days of Week.
	 *
	 * @since  1.7.0
	 * @access public
	 */
	public function has_date_recurring( $days ) {
		$time = current_time( 'l' );
		$day  = strtolower( $time );

		if ( ! in_array( $day, $days ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Check recurring days.
	 *
	 * @param array $condition Condition.
	 *
	 * @since  1.7.0
	 * @access public
	 */
	public function has_time_recurring( $condition ) {
		if ( ! isset( $condition['start_time'] ) ) {
			return true;
		}

		$timezone     = $this->get_timezone();
		$start_time   = strtotime( $condition['start_time'] . $timezone );
		$current_time = time();
		$start_time   = $current_time > $start_time;
		$end_time     = true;

		if ( isset( $condition['end_time'] ) ) {
			$end_time = strtotime( $condition['end_time'] . $timezone );
			$end_time = $current_time < $end_time;
		}

		if ( $start_time && $end_time ) {
			return true;
		}

		return false;
	}


	/**
	 * Get WordPress timezone..
	 *
	 * @since  1.7.0
	 * @access public
	 */
	public function get_timezone() {
		$offset   = 60 * get_option( 'gmt_offset' );
		$sign     = $offset < 0 ? '-' : '+';
		$absmin   = abs( $offset );
		$timezone = sprintf( '%s%02d:%02d', $sign, $absmin / 60, $absmin % 60 );
		return $timezone;
	}

	/**
	 * Check based on WooCommerce cart.
	 *
	 * @param array $condition Condition.
	 *
	 * @since  2.0.0
	 * @access public
	 */
	public function has_products_in_cart( $condition ) {
		$in_cart = false;

		if ( 'products' === $condition['on'] && isset( $condition['products'] ) ) {
			foreach ( \WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
				if ( in_array( $cart_item['product_id'], $condition['products'], true ) ) {
					$in_cart = true;
					break;
				}
			}
		}

		if ( 'categories' === $condition['on'] && isset( $condition['categories'] ) ) {
			foreach ( \WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
				$terms = get_the_terms( $cart_item['product_id'], 'product_cat' );

				if ( gettype( $terms ) !== 'array' ) {
					continue;
				}

				foreach ( $terms as $term ) {
					if ( in_array( $term->term_id, $condition['categories'], true ) ) {
						$in_cart = true;
						break;
					}
				}

				if ( $in_cart ) {
					break;
				}
			}
		}

		return $in_cart;
	}

	/**
	 * Check based on WooCommerce cart value.
	 *
	 * @param array $value Cart Value.
	 *
	 * @since  2.0.0
	 * @access public
	 */
	public function has_total_cart_value( $value ) {
		$total = \WC()->cart->total;

		if ( floatval( $value ) < floatval( $total ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Check based on WooCommerce total spent.
	 *
	 * @param array $value Total Money Spent.
	 *
	 * @since  2.0.0
	 * @access public
	 */
	public function has_total_spent( $value ) {
		$total = wc_get_customer_total_spent( get_current_user_id() );

		if ( floatval( $value ) < $total ) {
			return true;
		}

		return false;
	}

	/**
	 * Check based on WooCommerce product history.
	 *
	 * @param array $products IDs of Products.
	 *
	 * @since  2.0.0
	 * @access public
	 */
	public function has_products( $products ) {
		$bought       = false;
		$current_user = wp_get_current_user();

		foreach ( $products as $product ) {
			if ( wc_customer_bought_product( $current_user->user_email, $current_user->ID, $product ) ) {
				$bought = true;
				break;
			};
		}

		return $bought;
	}

	/**
	 * Check based on LearnDash product history.
	 *
	 * @param array $condition Condition.
	 *
	 * @since  2.0.0
	 * @access public
	 */
	public function has_courses_or_groups( $condition ) {
		$bought       = false;
		$current_user = wp_get_current_user();

		if ( 'courses' === $condition['on'] && isset( $condition['courses'] ) ) {
			foreach ( $condition['courses'] as $course ) {
				if ( ld_course_check_user_access( $course, $current_user->ID ) ) {
					$bought = true;
					break;
				};
			}
		}

		if ( 'groups' === $condition['on'] && isset( $condition['groups'] ) ) {
			foreach ( $condition['groups'] as $group ) {
				$users = learndash_get_groups_user_ids( $group );

				if ( in_array( $current_user->ID, $users, true ) ) {
					$bought = true;
					break;
				}

				if ( $bought ) {
					break;
				}
			}
		}

		return $bought;
	}

	/**
	 * Check based on LearnDash course status.
	 *
	 * @param array $condition Condition.
	 *
	 * @since  2.0.0
	 * @access public
	 */
	public function has_course_status( $condition ) {
		$current_user = wp_get_current_user();
		$progress     = learndash_user_get_course_progress( $current_user->ID, $condition['course'], 'summary' );

		if ( $progress['status'] === $condition['status'] ) {
			return true;
		}

		return false;
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
