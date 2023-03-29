<?php
/**
 * Form Response List Table for the otter_form_response custom post type.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins\Form;

use WP_List_Table;

/**
 * Class Form_Submissions_List_Table.
 */
class Form_Submissions_List_Table extends WP_List_Table {
	/**
	 * The custom post type of the form records.
	 *
	 * @var string
	 */
	private $post_type = 'otter_form_record';

	/**
	 * Get columns.
	 */
	public function get_columns() {
		return array(
			'cb'      => '<input type="checkbox" />',
			'email'   => __( 'Email', 'otter-blocks' ),
			'form'    => __( 'Form', 'otter-blocks' ),
			'postUrl' => __( 'Post', 'otter-blocks' ),
			'ID'      => __( 'ID', 'otter-blocks' ),
			'date'    => __( 'Submission Date', 'otter-blocks' ),
		);
	}

	/**
	 * Prepare items.
	 *
	 * @return void
	 */
	public function prepare_items() {
		$status = ( isset( $_REQUEST['status'] ) ) ? $_REQUEST['status'] : 'all';

		if ( ! in_array( $status, array( 'all', 'unread', 'read', 'trash' ), true ) ) {
			$status = 'all';
		}

		$search    = ( isset( $_REQUEST['s'] ) ) ? $_REQUEST['s'] : '';
		$orderby   = ( isset( $_REQUEST['orderby'] ) ) ? $_REQUEST['orderby'] : '';
		$order     = ( isset( $_REQUEST['order'] ) ) ? $_REQUEST['order'] : '';
		$per_page  = 5;

		$page  = $this->get_pagenum();
		$start = ( $page - 1 ) * $per_page;

		$args = array(
			's'              => $search,
			'orderby'        => $orderby,
			'order'          => $order,
			'offset'         => $start,
			'post_type'      => $this->post_type,
			'posts_per_page' => $per_page,
			'post_status'    => $status === 'all' ? array( 'read', 'unread' ) : $status
		);

		$this->items = $this->get_form_records( $args );
		$total_items = $this->get_form_records(
			array(
				'post_type'      => $this->post_type,
				'posts_per_page' => -1,
				'post_status'    => $status === 'all' ? array( 'read', 'unread' ) : $status,
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
	 * Get sortable columns.
	 *
	 * @return array[]
	 */
	function get_sortable_columns() {
		return array(
			'email' => array( 'email', false ),
			'ID'    => array( 'ID', false ),
			'date'  => array( 'date', false ),
		);
	}

	/**
	 * Column default.
	 *
	 * @param array  $item Item.
	 * @param string $column_name Column Name.
	 *
	 * @return mixed|string|true|void
	 */
	public function column_default( $item, $column_name ) {
		$column_value = $item[ $column_name ];
		$status       = get_post_status( $item['ID'] );

		switch ( $column_name ) {
			case 'email':
				$del_nonce = esc_html( '_wpnonce=' . wp_create_nonce( 'trash-otter-form-record_' . $item['ID'] ) );

				$actions = array();

				if ( $status !== 'trash' ) {
					$actions['view'] = sprintf(
							'<a href="%s">%s</a>',
							get_edit_post_link( $item['ID'] ),
							__( 'View' )
					);

					$actions['trash'] = sprintf(
						'<a href="?&action=%s&post_id=%s&%s">%s</a>',
						'trash_otter_form_record',
						$item['ID'],
						$del_nonce,
						__( 'Trash', 'otter-blocks' )
					);
				} else {
					$actions['untrash'] = sprintf(
						'<a href="?&action=%s&post_id=%s&%s">%s</a>',
						'untrash_otter_form_record',
						$item['ID'],
						$del_nonce,
						__( 'Restore', 'otter-blocks' )
					);

					$actions['delete'] = sprintf(
						'<a href="?&action=%s&post_id=%s&%s">%s</a>',
						'delete_otter_form_record',
						$item['ID'],
						$del_nonce,
						__( 'Delete Permanently', 'otter-blocks' )
					);
				}

				if ( $status === 'unread' ) {
					$actions['read'] = sprintf(
						'<a href="?&action=%s&post_id=%s&%s">%s</a>',
						'read_otter_form_record',
						$item['ID'],
						$del_nonce,
						__( 'Mark as Read', 'otter-blocks' )
					);
				} else {
					$actions['unread'] = sprintf(
						'<a href="?&action=%s&post_id=%s&%s">%s</a>',
						'unread_otter_form_record',
						$item['ID'],
						$del_nonce,
						__( 'Mark as Unread', 'otter-blocks' )
					);
				}

				$column_value = $this->format_based_on_status( sprintf( '<a href="mailto:%1$s">%1$s</a>', $item['email'] ), $status ) . $this->row_actions( $actions );
				break;
			case 'form':
				$column_value = $this->format_based_on_status(
					sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url( $item['postUrl'] ),
						$item['form']
					),
					$status
				);
				break;
			case 'postUrl':
				$title = url_to_postid( $item['postUrl'] ) ? get_the_title( url_to_postid( $item['postUrl'] ) ) : $item['postUrl'];
				$column_value = $this->format_based_on_status(
					sprintf(
						'<a href="%s">%s</a>',
						esc_url( $item['postUrl'] ),
						$title
					),
					$status
				);
				break;
			case 'date':
				$column_value = $this->format_based_on_status(
					wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $item['date'] ),
					$status
				);
				break;
			case 'ID':
				$column_value = $this->format_based_on_status( $item['ID'], $status );
				break;
		}

		return $column_value;
	}

	/**
	 * Get bulk actions.
	 *
	 * @return array
	 */
	public function get_bulk_actions() {
		return array(
			'delete' => 'Delete',
			'read'   => 'Mark as Read',
		);
	}

	/**
	 * Column checkbox.
	 *
	 * @param array $item Item.
	 *
	 * @return string
	 */
	public function column_cb( $item ) {
		return sprintf(
			'<input type="checkbox" name="otter_form_record[]" value="%s" />',
			$item['ID']
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
		<p class="search-box">
			<label class="screen-reader-text" for="<?php echo esc_attr( $input_id ); ?>"><?php esc_html( $text ); ?>:</label>
			<input type="search" id="<?php echo esc_attr( $input_id ); ?>" class="wp-filter-search" name="s" value="<?php _admin_search_query(); ?>" placeholder="<?php esc_attr_e( 'Search...', 'otter-blocks' ); ?>" />
			<?php submit_button( $text, 'hide-if-js', '', false, array( 'id' => 'search-submit' ) ); ?>
		</p>
		<?php
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
				'label'   => __( 'All', 'otter-blocks' ) . ' <span class="count">(' . $this->get_number_of_form_records( array( 'unread', 'read' ) ) . ')</span>',
				'current' => empty( $current_status ),
			),
			'unread' => array(
				'url'     => add_query_arg( 'status', 'unread', $url ),
				'label'   => __( 'Unread', 'otter-blocks' ) . ' <span class="count">(' . $this->get_number_of_form_records( 'unread' ) . ')</span>',
				'current' => 'unread' === $current_status,
			),
			'read' => array(
				'url'     => add_query_arg( 'status', 'read', $url ),
				'label'   => __( 'Read', 'otter-blocks' ) . ' <span class="count">(' . $this->get_number_of_form_records( 'read' ) . ')</span>',
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

		return $this->get_views_links( $status_links );
	}

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
	protected function get_number_of_form_records( $status = 'all' ) {
		$args = array(
			'post_type'      => $this->post_type,
			'posts_per_page' => -1,
			'post_status'    => $status,
		);

		$records = $this->get_form_records( $args );

		return count( $records );
	}

	/**
	 * Get all form records.
	 *
	 * @return array
	 */
	private function get_form_records( $args = array() ) {
		if ( empty( $args ) ) {
			$args = array(
				'post_type'      => $this->post_type,
				'posts_per_page' => -1,
			);
		}

		$records = get_posts( $args );

		return array_map(
			function( $record ) {
				$meta = get_post_meta( $record->ID, 'otter_form_record_meta', true );
				$meta['ID'] = $record->ID;
				return $meta;
			},
			$records
		);
	}
}
