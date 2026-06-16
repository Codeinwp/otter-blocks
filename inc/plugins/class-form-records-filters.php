<?php
/**
 * Form Submission Record list-table filters.
 *
 * Filtering Submission Records by form and by source post is an Otter Pro feature.
 * Without Pro the controls are rendered disabled as an upsell, and the query is left
 * untouched.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use ThemeIsle\GutenbergBlocks\Pro;
use WP_Query;

/**
 * Class Form_Records_Filters
 */
class Form_Records_Filters {
	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'restrict_manage_posts', array( $this, 'form_record_add_filters' ) );
		add_filter( 'parse_query', array( $this, 'form_record_filter_query' ) );
	}

	/**
	 * Add form record filters.
	 *
	 * Filter controls are always visible; without Pro they are disabled with an inline upsell.
	 *
	 * @return void
	 */
	public function form_record_add_filters() {
		if ( ! get_current_screen() || get_current_screen()->id !== 'edit-' . Form_Submissions::FORM_RECORD_TYPE ) {
			return;
		}

		if ( ! Pro::is_pro_active() ) {
			$this->locked_filters_upsell();
			return;
		}

		$this->form_dropdown();
		$this->post_dropdown();
	}

	/**
	 * Render the disabled filter controls with the Pro upsell.
	 *
	 * @return void
	 */
	private function locked_filters_upsell() {
		?>
		<span class="o-filters-locked" title="<?php esc_attr_e( 'Filtering by form and post is available in Otter Pro.', 'otter-blocks' ); ?>">
			<select disabled>
				<option><?php esc_html_e( 'All Forms', 'otter-blocks' ); ?></option>
			</select>
			<select disabled>
				<option><?php esc_html_e( 'All Posts', 'otter-blocks' ); ?></option>
			</select>
		</span>
		<?php
	}

	/**
	 * Parse form record filters. Filtering is a Pro feature.
	 *
	 * @param WP_Query $query Query.
	 *
	 * @return WP_Query
	 */
	public function form_record_filter_query( $query ) {
		if ( ! Pro::is_pro_active() ) {
			return $query;
		}

		if ( empty( $_GET['filters_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_GET['filters_nonce'] ), 'filter' ) ) {
			return $query;
		}

		if ( ! is_admin() || ! isset( $_GET['post_type'] ) || Form_Submissions::FORM_RECORD_TYPE !== $_GET['post_type'] ) {
			return $query;
		}

		if ( ! isset( $query->query['post_type'] ) || Form_Submissions::FORM_RECORD_TYPE !== $query->query['post_type'] ) {
			return $query;
		}

		global $pagenow;
		if ( 'edit.php' !== $pagenow || ! isset( $_GET['filter_action'] ) ) {
			return $query;
		}

		$form = ( ! empty( $_REQUEST['otter_form_filter'] ) && is_string( $_REQUEST['otter_form_filter'] ) ) ? sanitize_text_field( wp_unslash( $_REQUEST['otter_form_filter'] ) ) : '';
		$post = ( ! empty( $_REQUEST['otter_post_filter'] ) && is_string( $_REQUEST['otter_post_filter'] ) ) ? esc_url_raw( wp_unslash( $_REQUEST['otter_post_filter'] ) ) : '';

		if ( ! empty( $form ) ) {
			$query->query_vars['meta_query'][] = array(
				'key'     => Form_Submissions::FORM_RECORD_META_KEY,
				'value'   => $form,
				'compare' => 'LIKE',
			);
		}

		if ( ! empty( $post ) ) {
			$query->query_vars['meta_query'][] = array(
				'key'     => Form_Submissions::FORM_RECORD_META_KEY,
				'value'   => $post,
				'compare' => 'LIKE',
			);
		}

		return $query;
	}

	/**
	 * Get filter options.
	 *
	 * @param string $filter Filter.
	 *
	 * @return array
	 */
	private function get_filter( $filter ) {
		/**
		 * Get all form records. Here we want to avoid using WP_Query to not
		 * trigger the 'form_record_filter_query'. This is why the $wpdb.
		 */
		$cache_key    = 'otter_form_records';
		$cache_group  = 'otter_form';
		$form_records = wp_cache_get( $cache_key, $cache_group );

		if ( ! $form_records ) {
			global $wpdb;
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$form_records = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT ID FROM $wpdb->posts WHERE post_type = %s AND post_status IN ('read', 'unread', 'trash', 'publish')",
					Form_Submissions::FORM_RECORD_TYPE
				)
			);

			wp_cache_set( $cache_key, $form_records, $cache_group, 5 * MINUTE_IN_SECONDS );
		}

		if ( ! is_array( $form_records ) ) {
			return array();
		}

		// Prime the meta cache for all the records at once to avoid one query per record.
		update_meta_cache( 'post', wp_list_pluck( $form_records, 'ID' ) );

		$options = array();
		foreach ( $form_records as $record ) {
			$meta = get_post_meta( $record->ID, Form_Submissions::FORM_RECORD_META_KEY, true );

			if ( ! is_array( $meta ) ) {
				continue;
			}

			switch ( $filter ) {
				case 'form':
					if ( ! isset( $meta['form']['value'] ) ) {
						break;
					}

					$options[ $meta['form']['value'] ] = substr( $meta['form']['value'], -8 );
					break;
				case 'post':
					if ( ! isset( $meta['post_url']['value'] ) ) {
						break;
					}

					if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
						$post_id = wpcom_vip_url_to_postid( $meta['post_url']['value'] );
					} else {
						$post_id = url_to_postid( $meta['post_url']['value'] ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
					}

					$options[ $meta['post_url']['value'] ] = $post_id ? get_the_title( $post_id ) : $meta['post_url']['value'];
					break;
			}
		}

		return $options;
	}

	/**
	 * Get forms dropdown.
	 *
	 * @return void
	 */
	private function form_dropdown() {
		$forms = $this->get_filter( 'form' );

		if ( empty( $forms ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$form = isset( $_GET['otter_form_filter'] ) && is_string( $_GET['otter_form_filter'] ) ? sanitize_text_field( wp_unslash( $_GET['otter_form_filter'] ) ) : '';

		?>
		<label for="filter-by-form"></label>
		<select name="otter_form_filter" id="filter-by-form">
			<option value=""><?php esc_html_e( 'All Forms', 'otter-blocks' ); ?></option>
			<?php foreach ( $forms as $form_id => $form_name ) : ?>
				<option value="<?php echo esc_attr( $form_id ); ?>" <?php selected( $form, $form_id ); ?>><?php echo esc_html( $form_name ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
	}

	/**
	 * Get posts dropdown.
	 *
	 * @return void
	 */
	private function post_dropdown() {
		$posts = $this->get_filter( 'post' );

		if ( empty( $posts ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$post = isset( $_GET['otter_post_filter'] ) && is_string( $_GET['otter_post_filter'] ) ? sanitize_text_field( wp_unslash( $_GET['otter_post_filter'] ) ) : '';

		?>
		<label for="filter-by-post"></label>
		<select name="otter_post_filter" id="filter-by-post">
			<option value=""><?php esc_html_e( 'All Posts', 'otter-blocks' ); ?></option>
			<?php foreach ( $posts as $post_id => $post_title ) : ?>
				<option value="<?php echo esc_attr( $post_id ); ?>" <?php selected( $post, $post_id ); ?>><?php echo esc_html( $post_title ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
		wp_nonce_field( 'filter', 'filters_nonce' );
	}
}
