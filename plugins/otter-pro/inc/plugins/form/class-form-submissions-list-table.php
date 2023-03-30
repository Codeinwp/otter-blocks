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

		if ( ! in_array( $status, array( 'all', 'unread', 'read', 'trash' ), true ) ) {
			$status = 'all';
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
			'post_type'      => $this->post_type,
			'posts_per_page' => $per_page,
			'post_status'    => $status === 'all' ? array( 'read', 'unread' ) : $status
		);

		$this->items = $this->get_form_records( $args );
		$total_items = $this->get_form_records(
			array(
				's'              => $search,
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

		$this->process_bulk_action();
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

	protected function column_email( $item ) {
		$del_nonce = esc_html( '_wpnonce=' . wp_create_nonce( 'trash-otter-form-record_' . $item['ID'] ) );
		$status    = get_post_status( $item['ID'] );
		$actions   = array();

		if ( 'trash' !== $status ) {
			$actions['view'] = sprintf(
				'<a href="%s">%s</a>',
				get_edit_post_link( $item['ID'] ),
				__( 'View', 'otter-blocks' )
			);

			$actions['trash'] = sprintf(
				'<a href="?action=%s&post_id=%s&%s">%s</a>',
				'trash_otter_form_record',
				$item['ID'],
				$del_nonce,
				__( 'Trash', 'otter-blocks' )
			);
		} else {
			$actions['untrash'] = sprintf(
				'<a href="?action=%s&post_id=%s&%s">%s</a>',
				'untrash_otter_form_record',
				$item['ID'],
				$del_nonce,
				__( 'Restore', 'otter-blocks' )
			);

			$actions['delete'] = sprintf(
				'<a href="?action=%s&post_id=%s&%s">%s</a>',
				'delete_otter_form_record',
				$item['ID'],
				$del_nonce,
				__( 'Delete Permanently', 'otter-blocks' )
			);
		}

		if ( 'unread' === $status ) {
			$actions['read'] = sprintf(
				'<a href="?action=%s&post_id=%s&%s">%s</a>',
				'read_otter_form_record',
				$item['ID'],
				$del_nonce,
				__( 'Mark as Read', 'otter-blocks' )
			);
		} else {
			$actions['unread'] = sprintf(
				'<a href="?action=%s&post_id=%s&%s">%s</a>',
				'unread_otter_form_record',
				$item['ID'],
				$del_nonce,
				__( 'Mark as Unread', 'otter-blocks' )
			);
		}

		return $this->format_based_on_status( sprintf( '<a href="mailto:%1$s">%1$s</a>', $item['email'] ), $status ) . $this->row_actions( $actions );
	}

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

	protected function column_id( $item ) {
		$status = get_post_status( $item['ID'] );

		return $this->format_based_on_status( substr( $item['ID'], -8 ), $status );
	}

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

	public function process_bulk_action() {
		$action = $this->current_action();

		if ( ! $action ) {
			return;
		}

		$nonce = isset( $_REQUEST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ) : '';

		if ( ! wp_verify_nonce( $nonce, 'bulk-' . $this->_args['plural'] ) ) {
			wp_die( __( 'Security check failed', 'otter-blocks' ) );
		}

		$ids = isset( $_REQUEST['otter_form_record'] ) ? array_map( 'sanitize_text_field', wp_unslash( $_REQUEST['otter_form_record'] ) ) : array();

		if ( ! $ids ) {
			return;
		}

		switch ( $action ) {
			case 'trash':
				foreach ( $ids as $id ) {
					wp_trash_post( $id );
				}
				break;
			case 'delete':
				foreach ( $ids as $id ) {
					wp_delete_post( $id );
				}
				break;
			case 'untrash':
			case 'read':
				foreach ( $ids as $id ) {
					wp_update_post( array(
						'ID'          => $id,
						'post_status' => 'read',
					) );
				}
				break;
			case 'unread':
				foreach ( $ids as $id ) {
					wp_update_post( array(
						'ID'          => $id,
						'post_status' => 'unread',
					) );
				}
				break;
		}

		// todo: not ok.
		wp_redirect( remove_query_arg( array( 'action', 'action2', 'otter_form_record', '_wpnonce', '_wp_http_referer' ), wp_get_referer() ) );
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
	 * @param array $args Query arguments.
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
				$meta       = get_post_meta( $record->ID, 'otter_form_record_meta', true );
				$meta['ID'] = $record->ID;
				return $meta;
			},
			$records
		);
	}
}
