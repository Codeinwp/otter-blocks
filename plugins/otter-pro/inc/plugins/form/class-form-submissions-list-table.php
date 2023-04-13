<?php
/**
 * Form Submissions List Table for the otter_form_record custom post type.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins\Form;

if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

use WP_List_Table;

/**
 * Class Form_Submissions_List_Table.
 */
class Form_Submissions_List_Table extends WP_List_Table {
	/**
	 * Form_Submissions_List_Table constructor.
	 */
	public function __construct() {
		parent::__construct(
			array(
				'singular' => 'otter_form_record',
				'plural'   => 'otter_form_records',
				'ajax'     => false,
			)
		);
	}

	/**
	 * Prepare items.
	 *
	 * @return void
	 */
	public function prepare_items() {
		$status = ( isset( $_REQUEST['status'] ) ) ? $_REQUEST['status'] : 'all';

		if ( ! in_array( $status, array( 'all', 'unread', 'read', 'trash', 'draft' ), true ) ) {
			$status = 'all';
		}

		if ( $status === 'all' ) {
			$status = array( 'read', 'unread', 'publish' );
		} elseif ( $status === 'read' ) {
			$status = array( 'read', 'publish' );
		}

		$search    = ( isset( $_REQUEST['s'] ) ) ? $_REQUEST['s'] : '';
		$orderby   = ( isset( $_REQUEST['orderby'] ) ) ? $_REQUEST['orderby'] : '';
		$order     = ( isset( $_REQUEST['order'] ) ) ? $_REQUEST['order'] : '';
		$per_page  = 20;

		$page  = $this->get_pagenum();
		$start = ( $page - 1 ) * $per_page;

		$args = array(
			's'              => $search,
			'orderby'        => $orderby,
			'order'          => $order,
			'offset'         => $start,
			'post_type'      => $this->_args['singular'],
			'posts_per_page' => $per_page,
			'post_status'    => $status,
		);

		$args = array_merge( $args, $this->get_filter_args() );

		$this->items = $this->get_form_records( $args );
		$total_items = $this->get_form_records(
			array_merge(
				array(
					's'              => $search,
					'post_type'      => $this->_args['singular'],
					'posts_per_page' => -1,
					'post_status'    => $status,
				),
				$this->get_filter_args()
			)
		);

		$this->_column_headers = array( $this->get_columns(), array(), $this->get_sortable_columns() );
		$this->set_pagination_args(
			array(
				'total_items' => count( $total_items ),
				'per_page'    => $per_page,
			)
		);
	}

	/**
	 * Displays the search box.
	 *
	 * @param string $text     The 'submit' button label.
	 * @param string $input_id ID attribute value for the search input field.
	 */
	public function search_box( $text, $input_id ) {
		if ( empty( $_REQUEST['s'] ) && ! $this->has_items() ) {
			return;
		}

		$input_id = $input_id . '-search-input';

		if ( ! empty( $_REQUEST['orderby'] ) ) {
			echo '<input type="hidden" name="orderby" value="' . esc_attr( $_REQUEST['orderby'] ) . '" />';
		}
		if ( ! empty( $_REQUEST['order'] ) ) {
			echo '<input type="hidden" name="order" value="' . esc_attr( $_REQUEST['order'] ) . '" />';
		}
		?>
		<input type="hidden" name="post_type" value="<?php echo esc_attr( $this->_args['singular'] ); ?>" />
		<p class="search-box">
			<label class="screen-reader-text" for="<?php echo esc_attr( $input_id ); ?>"><?php esc_html( $text ); ?>:</label>
			<input type="search" id="<?php echo esc_attr( $input_id ); ?>" class="wp-filter-search" name="s" value="<?php _admin_search_query(); ?>" placeholder="<?php esc_attr_e( 'Search...', 'otter-blocks' ); ?>" />
			<?php submit_button( $text, 'hide-if-js', '', false, array( 'id' => 'search-submit' ) ); ?>
		</p>
		<?php
	}

	/**
	 * Get columns.
	 */
	public function get_columns() {
		return array(
			'cb'       => '<input type="checkbox" />',
			'email'    => __( 'Email', 'otter-blocks' ),
			'form'     => __( 'Form ID', 'otter-blocks' ),
			'post_url' => __( 'Post', 'otter-blocks' ),
			'ID'       => __( 'ID', 'otter-blocks' ),
			'date'     => __( 'Submission Date', 'otter-blocks' ),
		);
	}

	/**
	 * Get views.
	 *
	 * @return array
	 */
	protected function get_views() {
		$current_status = isset( $_REQUEST['status'] ) ? sanitize_text_field( $_REQUEST['status'] ) : '';
		$url = remove_query_arg( array( 'status', 's' ) );

		$status_links = array(
			'all' => array(
				'url'     => $url,
				'label'   => __( 'All', 'otter-blocks' ) . ' <span class="count">(' . $this->get_number_of_form_records( array( 'unread', 'read', 'publish' ) ) . ')</span>',
				'current' => empty( $current_status ),
			),
			'unread' => array(
				'url'     => add_query_arg( 'status', 'unread', $url ),
				'label'   => __( 'Unread', 'otter-blocks' ) . ' <span class="count">(' . $this->get_number_of_form_records( 'unread' ) . ')</span>',
				'current' => 'unread' === $current_status,
			),
			'read' => array(
				'url'     => add_query_arg( 'status', 'read', $url ),
				'label'   => __( 'Read', 'otter-blocks' ) . ' <span class="count">(' . $this->get_number_of_form_records( array( 'read', 'publish' ) ) . ')</span>',
				'current' => 'read' === $current_status,
			)
		);

		$trashed_records = $this->get_number_of_form_records( 'trash' );
		if ( $trashed_records ) {
			$status_links['trash'] = array(
				'url'     => add_query_arg( 'status', 'trash', $url ),
				'label'   => __( 'Trash', 'otter-blocks' ) . ' <span class="count">(' . $trashed_records . ')</span>',
				'current' => 'trash' === $current_status,
			);
		}

		$drafted_records = $this->get_number_of_form_records( 'draft' );
		if ( $drafted_records ) {
			$status_links['draft'] = array(
				'url'     => add_query_arg( 'status', 'draft', $url ),
				'label'   => __( 'Draft', 'otter-blocks' ) . ' <span class="count">(' . $drafted_records . ')</span>',
				'current' => 'draft' === $current_status,
			);
		}

		return $this->get_views_links( $status_links );
	}

	/**
	 * Column checkbox.
	 *
	 * @param array $item Item.
	 *
	 * @return string
	 */
	protected function column_cb( $item ) {
		return sprintf(
			'<input type="checkbox" name="otter_form_record[]" value="%s" />',
			$item['ID']
		);
	}

	/**
	 * Column email.
	 *
	 * @param $item
	 *
	 * @return string
	 */
	protected function column_email( $item ) {
		$status    = get_post_status( $item['ID'] );
		$actions   = array();

		if ( 'trash' !== $status ) {

			$actions['inline view'] = sprintf(
				'<a href="%s">%s</a>',
				get_edit_post_link( $item['ID'] ),
				__( 'View', 'otter-blocks' )
			);

			$actions['trash'] = sprintf(
				'<a href="?action=%s&otter_form_record=%s&_wpnonce=%s">%s</a>',
				'trash',
				$item['ID'],
				wp_create_nonce( 'trash-' . $this->_args['singular'] . '_' . $item['ID'] ),
				__( 'Trash', 'otter-blocks' )
			);
		} else {
			$actions['untrash'] = sprintf(
				'<a href="?action=%s&otter_form_record=%s&_wpnonce=%s">%s</a>',
				'untrash',
				$item['ID'],
				wp_create_nonce( 'untrash-' . $this->_args['singular'] . '_' . $item['ID'] ),
				__( 'Restore', 'otter-blocks' )
			);

			$actions['delete'] = sprintf(
				'<a href="?action=%s&otter_form_record=%s&_wpnonce=%s">%s</a>',
				'delete',
				$item['ID'],
				wp_create_nonce( 'delete-' . $this->_args['singular'] . '_' . $item['ID'] ),
				__( 'Delete Permanently', 'otter-blocks' )
			);
		}

		if ( 'unread' === $status ) {
			$actions['read'] = sprintf(
				'<a href="?action=%s&otter_form_record=%s&_wpnonce=%s">%s</a>',
				'read',
				$item['ID'],
				wp_create_nonce( 'read-' . $this->_args['singular'] . '_' . $item['ID'] ),
				__( 'Mark as Read', 'otter-blocks' )
			);
		} else {
			$actions['unread'] = sprintf(
				'<a href="?action=%s&otter_form_record=%s&_wpnonce=%s">%s</a>',
				'unread',
				$item['ID'],
				wp_create_nonce( 'unread-' . $this->_args['singular'] . '_' . $item['ID'] ),
				__( 'Mark as Unread', 'otter-blocks' )
			);
		}

		return $this->format_based_on_status( sprintf( '<a href="%1$s">%2$s</a>', get_edit_post_link( $item['ID'] ), $item['email'] ), $status ) . $this->row_actions( $actions );
	}

	/**
	 * Column form.
	 *
	 * @param $item
	 *
	 * @return string
	 */
	protected function column_form( $item ) {
		$status = get_post_status( $item['ID'] );

		return $this->format_based_on_status(
			sprintf(
				'<a href="%1$s">%2$s</a>',
				esc_url( $item['post_url'] . '#' . $item['form'] ),
				substr( $item['form'], -8 )
			),
			$status
		);
	}

	/**
	 * Column post.
	 *
	 * @param $item
	 *
	 * @return string
	 */
	protected function column_post_url( $item ) {
		$status = get_post_status( $item['ID'] );

		if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
			$post_id = wpcom_vip_url_to_postid( $item['post_url'] );
		} else {
			$post_id = url_to_postid( $item['post_url'] ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
		}

		$title = get_the_title( $post_id ) ? get_the_title( $post_id ) : $item['post_url'];

		return $this->format_based_on_status(
			sprintf(
				'<a href="%s">%s</a>',
				esc_url( $item['post_url'] ),
				$title
			),
			$status
		);
	}

	/**
	 * Column ID.
	 *
	 * @param $item
	 *
	 * @return string
	 */
	protected function column_id( $item ) {
		$status = get_post_status( $item['ID'] );

		return $this->format_based_on_status( substr( $item['ID'], -8 ), $status );
	}

	/**
	 * Column date.
	 *
	 * @param $item
	 *
	 * @return string
	 */
	protected function column_date( $item ) {
		$status = get_post_status( $item['ID'] );

		return $this->format_based_on_status(
			get_the_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $item['ID'] ),
			$status
		);
	}

	/**
	 * Get sortable columns.
	 *
	 * @return array[]
	 */
	protected function get_sortable_columns() {
		return array(
			'email' => array( 'email', false ),
			'ID'    => array( 'ID', false ),
			'date'  => array( 'date', false ),
		);
	}

	/**
	 * Get bulk actions.
	 *
	 * @return array
	 */
	protected function get_bulk_actions() {
		$status       = isset( $_GET['status'] ) ? sanitize_text_field( wp_unslash( $_GET['status'] ) ) : 'all';
		$bulk_actions = array();

		if ( $status !== 'trash' ) {
			$bulk_actions['trash'] = 'Move to Trash';

			if ( $status !== 'read' ) {
				$bulk_actions['read'] = 'Mark as Read';
			}

			if ( $status !== 'unread' ) {
				$bulk_actions['unread'] = 'Mark as Unread';
			}
		} else {
			$bulk_actions['untrash'] = 'Restore';
			$bulk_actions['delete']  = 'Delete Permanently';
		}

		return $bulk_actions;
	}

	/**
	 * Add filters.
	 *
	 * @param string $which Top or bottom.
	 *
	 * @return void
	 */
	protected function extra_tablenav( $which ) {
		static $has_items;

		if ( ! isset( $has_items ) ) {
			$has_items = $this->has_items();
		}

		echo '<div class="alignleft actions">';

		if ( 'top' === $which ) {
			ob_start();

			$this->form_dropdown();
			$this->post_dropdown();
			$this->months_dropdown( 'otter_form_record' );

			?>
			<input type="hidden" name="post_type" value="<?php echo esc_attr( $this->_args['singular'] ); ?>" />
			<?php

			$output = ob_get_clean();
			if ( ! empty( $output ) ) {
				echo $output;
				submit_button( __( 'Filter' ), '', 'filter_action', false, array( 'id' => 'post-query-submit' ) );
			}
		}

		echo '</div>';
	}

	/**
	 * Get meta query args from filter values.
	 *
	 * @return array
	 */
	private function get_filter_args() {
		$extra_args = array();
		$meta_query = array();

		if ( ! $this->current_action() && isset( $_REQUEST['filter_action'] ) && 'Filter' === $_REQUEST['filter_action'] ) {
			$form = ( ! empty( $_REQUEST['form'] ) ) ? $_REQUEST['form'] : '';
			$post = ( ! empty( $_REQUEST['post'] ) ) ? $_REQUEST['post'] : '';
			$date = ( ! empty( $_REQUEST['m'] && '0' !== $_REQUEST['m'] ) ) ? $_REQUEST['m'] : '';

			if ( ! empty( $form ) ) {
				$meta_query[] = array(
					'key'     => 'otter_form_record_meta',
					'value'   => serialize( $form ),
					'compare' => 'LIKE',
				);
			}

			if ( ! empty( $post ) ) {
				$meta_query['relation'] = 'AND';

				$meta_query[] = array(
					'key'     => 'otter_form_record_meta',
					'value'   => serialize( $post ),
					'compare' => 'LIKE',
				);
			}

			$extra_args['meta_query'] = $meta_query;
			if ( ! empty( $date ) ) {
				$extra_args['date_query'] = array(
					array(
						'year'  => substr( $date, 0, 4 ),
						'month' => substr( $date, 4, 2 )
					),
				);
			}
		}

		return $extra_args;
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

		$form = isset( $_GET['form'] ) ? sanitize_text_field( wp_unslash( $_GET['form'] ) ) : '';

		?>
		<label for="filter-by-form"></label>
		<select name="form" id="filter-by-form">
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

		$post = isset( $_GET['post'] ) ? sanitize_text_field( wp_unslash( $_GET['post'] ) ) : '';

		?>
		<label for="filter-by-post"></label>
		<select name="post" id="filter-by-post">
			<option value=""><?php esc_html_e( 'All Posts', 'otter-blocks' ); ?></option>
			<?php foreach ( $posts as $post_id => $post_title ) : ?>
				<option value="<?php echo esc_attr( $post_id ); ?>" <?php selected( $post, $post_id ); ?>><?php echo esc_html( $post_title ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
	}

	/**
	 * Get filter options.
	 *
	 * @param string $filter Filter.
	 *
	 * @return array
	 */
	private function get_filter( $filter ) {
		$form_records = $this->get_form_records();

		$options = array();

		foreach ( $form_records as $record ) {
			switch ( $filter ) {
				case 'form':
					$options[ $record['form'] ] = substr( $record['form'], -8 );
					break;
				case 'post':
					if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
						$post_id = wpcom_vip_url_to_postid( $record['post_url'] );
					} else {
						$post_id = url_to_postid( $record['post_url'] ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
					}

					$options[ $record['post_url'] ] = get_the_title( $post_id );
					break;
			}
		}

		return $options;
	}

	/**
	 * Make unread form records bold.
	 *
	 * @param string $content The content of the column.
	 * @param string $status The status of the form record.
	 *
	 * @return string
	 */
	private function format_based_on_status( $content, $status ) {
		if ( 'unread' === $status ) {
			return '<strong>' . $content . '</strong>';
		}

		return $content;
	}

	/**
	 * Get number of form submissions.
	 *
	 * @param string $status Read status.
	 *
	 * @return int
	 */
	private function get_number_of_form_records( $status = 'all' ) {
		$args = array(
			'post_type'      => $this->_args['singular'],
			'posts_per_page' => -1,
			'post_status'    => $status,
		);

		$records = $this->get_form_records( $args );

		return count( $records );
	}

	/**
	 * Get all form records.
	 *
	 * @param array $args Query arguments.
	 * @return array
	 */
	private function get_form_records( $args = array() ) {
		if ( empty( $args ) ) {
			$args = array(
				'post_type'      => $this->_args['singular'],
				'posts_per_page' => -1,
				'post_status'    => array( 'read', 'unread', 'trash', 'publish' ),
			);
		}

		$records = get_posts( $args );

		return array_map(
			function( $record ) {
				$meta = get_post_meta( $record->ID, 'otter_form_record_meta', true );

				$meta['email']    = $meta['email']['value'];
				$meta['form']     = $meta['form']['value'];
				$meta['post_url'] = $meta['post_url']['value'];
				$meta['ID']       = $record->ID;

				return $meta;
			},
			$records
		);
	}
}
