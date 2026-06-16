<?php
/**
 * Form Submission Record list-table presentation.
 *
 * Renders the Submissions admin list: columns, sortable columns, bulk-action and row-action
 * definitions, the per-column values (including the delivery status) and the unread-row
 * styling. Status mutations triggered from this table live in Form_Submissions.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use ThemeIsle\GutenbergBlocks\Pro;
use WP_Post;

/**
 * Class Form_Records_List_Table
 */
class Form_Records_List_Table {
	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'admin_head', array( $this, 'add_style' ) );

		add_filter( 'manage_' . Form_Submissions::FORM_RECORD_TYPE . '_posts_columns', array( $this, 'form_record_columns' ) );
		add_filter( 'manage_edit-' . Form_Submissions::FORM_RECORD_TYPE . '_sortable_columns', array( $this, 'form_record_sortable_columns' ) );
		add_filter( 'manage_' . Form_Submissions::FORM_RECORD_TYPE . '_posts_custom_column', array( $this, 'form_record_column_values' ), 10, 2 );
		add_filter( 'bulk_actions-edit-' . Form_Submissions::FORM_RECORD_TYPE, array( $this, 'form_record_bulk_actions' ) );
		add_filter( 'post_row_actions', array( $this, 'form_record_row_actions' ), 10, 2 );
	}

	/**
	 * Hide the default headline.
	 *
	 * @return void
	 */
	public function add_style() {
		$screen = get_current_screen();
		if ( $screen && 'edit-' . Form_Submissions::FORM_RECORD_TYPE === $screen->id ) {
			?>
			<style>
			.wrap h1.wp-heading-inline {
				display: none;
			}
			.o-delivery-complete {
				color: #008a20;
			}
			.o-delivery-failed {
				color: #d63638;
				font-weight: 600;
			}
			.o-filters-locked {
				display: inline-flex;
				align-items: center;
				gap: 6px;
				margin-right: 6px;
			}
			.o-filters-locked select:disabled {
				opacity: .7;
				margin: 0;
			}
			</style>
			<?php
		}
	}

	/**
	 * Set the table columns.
	 *
	 * @return array
	 */
	public function form_record_columns() {
		return array(
			'cb'              => '<input type="checkbox" />',
			'title'           => __( 'Title', 'otter-blocks' ),
			'form'            => __( 'Form ID', 'otter-blocks' ),
			'post_url'        => __( 'Post', 'otter-blocks' ),
			'ID'              => __( 'ID', 'otter-blocks' ),
			'delivery'        => __( 'Delivery', 'otter-blocks' ),
			'submission_date' => __( 'Submission Date', 'otter-blocks' ),
		);
	}

	/**
	 * Set the table sortable columns.
	 *
	 * @return array
	 */
	public function form_record_sortable_columns() {
		return array(
			'title'           => __( 'Title', 'otter-blocks' ),
			'ID'              => __( 'ID', 'otter-blocks' ),
			'submission_date' => __( 'Submission Date', 'otter-blocks' ),
		);
	}

	/**
	 * Set form records bulk actions.
	 *
	 * @return array
	 */
	public function form_record_bulk_actions() {
		$status       = isset( $_GET['post_status'] ) ? sanitize_text_field( wp_unslash( $_GET['post_status'] ) ) : 'all'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$bulk_actions = array();

		if ( 'trash' !== $status ) {
			$bulk_actions['trash'] = __( 'Move to Trash', 'otter-blocks' );

			if ( 'unread' !== $status ) {
				$bulk_actions['unread'] = __( 'Mark as Unread', 'otter-blocks' );
			}

			if ( 'read' !== $status ) {
				$bulk_actions['read'] = __( 'Mark as Read', 'otter-blocks' );
			}
		} else {
			$bulk_actions['untrash'] = __( 'Restore', 'otter-blocks' );
			$bulk_actions['delete']  = __( 'Delete Permanently', 'otter-blocks' );
		}

		return $bulk_actions;
	}

	/**
	 * Manage form records row actions.
	 *
	 * @param array   $actions The current row actions.
	 * @param WP_Post $post The current post object.
	 *
	 * @return array
	 */
	public function form_record_row_actions( $actions, $post ) {
		if ( Form_Submissions::FORM_RECORD_TYPE !== $post->post_type ) {
			return $actions;
		}

		unset( $actions['inline hide-if-no-js'] );
		unset( $actions['edit'] );

		$status = $post->post_status;
		if ( 'trash' !== $status ) {
			$actions['view'] = sprintf(
				'<a href="%s">%s</a>',
				get_edit_post_link( $post->ID ),
				__( 'View', 'otter-blocks' )
			);
		}

		if ( 'unread' === $status ) {
			$actions['read'] = sprintf(
				'<a href="?action=%s&' . Form_Submissions::FORM_RECORD_TYPE . '=%s&_wpnonce=%s">%s</a>',
				'row-read',
				$post->ID,
				wp_create_nonce( 'read-' . Form_Submissions::FORM_RECORD_TYPE . '_' . $post->ID ),
				__( 'Mark as Read', 'otter-blocks' )
			);
		} elseif ( 'trash' !== $status ) {
			$actions['unread'] = sprintf(
				'<a href="?action=%s&' . Form_Submissions::FORM_RECORD_TYPE . '=%s&_wpnonce=%s">%s</a>',
				'row-unread',
				$post->ID,
				wp_create_nonce( 'unread-' . Form_Submissions::FORM_RECORD_TYPE . '_' . $post->ID ),
				__( 'Mark as Unread', 'otter-blocks' )
			);
		}

		return $actions;
	}

	/**
	 * Manage form record columns.
	 *
	 * @param string $column The column name.
	 * @param int    $post_id The post ID.
	 *
	 * @return string The column value.
	 */
	public function form_record_column_values( $column, $post_id ) {
		$meta = get_post_meta( $post_id, Form_Submissions::FORM_RECORD_META_KEY, true );

		switch ( $column ) {
			case 'title':
				if ( get_post_status( $post_id ) !== 'trash' ) {
					$this->format_based_on_status(
						sprintf(
							'<a href="%1$s">%2$s</a>',
							esc_url( get_edit_post_link( $post_id ) ),
							esc_html( get_the_title( $post_id ) )
						),
						get_post_status( $post_id )
					);
					break;
				}

				echo esc_html( get_the_title( $post_id ) );
				break;
			case 'form':
				// Filtering is a Pro feature; without it, keep linking to the form on the source page.
				if ( Pro::is_pro_active() ) {
					$url = add_query_arg(
						array(
							'post_type'         => Form_Submissions::FORM_RECORD_TYPE,
							'otter_form_filter' => $meta['form']['value'],
							'filter_action'     => 'Filter',
							'filters_nonce'     => wp_create_nonce( 'filter' ),
						),
						admin_url( 'edit.php' )
					);
				} else {
					$url = $meta['post_url']['value'] . '#' . $meta['form']['value'];
				}

				$this->format_based_on_status(
					sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url( $url ),
						esc_html( substr( $meta['form']['value'], -8 ) )
					),
					get_post_status( $post_id )
				);
				break;
			case 'post_url':
				// If the post ID is set, use that to get the title and URL for better accuracy.
				if ( ! empty( $meta['post_id'] ) ) {
					$source_post = '0' !== $meta['post_id']['value'] ? $meta['post_id']['value'] : get_option( 'page_for_posts' );
					$title       = get_the_title( $source_post );
					$url         = get_permalink( $source_post );
				} else {
					if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
						$source_post = wpcom_vip_url_to_postid( $meta['post_url']['value'] );
					} else {
						$source_post = url_to_postid( $meta['post_url']['value'] ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
					}

					$source_post = 0 !== $source_post ? $source_post : get_option( 'page_for_posts' );
					$title       = $source_post ? get_the_title( $source_post ) : $meta['post_url']['value'];
					$url         = $meta['post_url']['value'];
				}

				if ( empty( $url ) && isset( $meta['post_url']['value'] ) ) {
					$url = $meta['post_url']['value'];
				}

				if ( '' === trim( (string) $title ) ) {
					$title = __( '(no title)', 'otter-blocks' );
				}

				$this->format_based_on_status(
					sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url( $url ),
						esc_html( $title )
					),
					get_post_status( $post_id )
				);
				break;
			case 'ID':
				$this->format_based_on_status( substr( strval( $post_id ), -8 ), get_post_status( $post_id ) );
				break;
			case 'delivery':
				$this->render_delivery_status( $post_id );
				break;
			case 'submission_date':
				$this->format_based_on_status(
					esc_html( get_the_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $post_id ) ),
					get_post_status( $post_id )
				);
				break;
		}

		return $column;
	}

	/**
	 * Render the Delivery Status for a record.
	 *
	 * @param int $post_id The record post ID.
	 * @return void
	 */
	private function render_delivery_status( $post_id ) {
		$status = get_post_meta( $post_id, Form_Submissions::DELIVERY_STATUS_META_KEY, true );

		if ( Form_Submissions::DELIVERY_STATUS_FAILED === $status ) {
			$errors   = get_post_meta( $post_id, Form_Submissions::DELIVERY_ERRORS_META_KEY, true );
			$messages = array();

			if ( is_array( $errors ) ) {
				foreach ( $errors as $error ) {
					$messages[] = ( isset( $error['action'] ) ? $error['action'] . ': ' : '' ) . ( isset( $error['message'] ) ? $error['message'] : '' );
				}
			}

			printf(
				'<span class="o-delivery-failed" title="%s">%s</span>',
				esc_attr( implode( ' | ', $messages ) ),
				esc_html__( 'Failed', 'otter-blocks' )
			);
			return;
		}

		if ( Form_Submissions::DELIVERY_STATUS_COMPLETE === $status ) {
			printf( '<span class="o-delivery-complete">%s</span>', esc_html__( 'Complete', 'otter-blocks' ) );
			return;
		}

		echo '&#8212;';
	}

	/**
	 * Make unread rows bold.
	 *
	 * @param string $content Content.
	 * @param string $status The post status.
	 */
	private function format_based_on_status( $content, $status ) {
		if ( 'unread' === $status ) {
			echo '<strong>' . wp_kses_post( $content ) . '</strong>';
			return;
		}

		echo wp_kses_post( $content );
	}
}
