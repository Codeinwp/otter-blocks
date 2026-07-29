<?php
/**
 * Form Submission Record export.
 *
 * Handles the admin-ajax bulk export of Submission Records. Exporting is an Otter Pro
 * feature.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use ThemeIsle\GutenbergBlocks\Pro;

/**
 * Class Form_Records_Export
 */
class Form_Records_Export {
	/**
	 * The number of submissions to fetch in each batch when exporting to CSV.
	 *
	 * @var int
	 */
	const EXPORT_BATCH_SIZE = 100;

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'wp_ajax_otter_form_submissions', array( $this, 'export_submissions' ) );
	}

	/**
	 * Export submissions with ajax. Bulk export is a Pro feature.
	 */
	public function export_submissions() {
		if ( ! Pro::is_pro_active() ) {
			wp_die( esc_html( __( 'Exporting submissions requires Otter Pro.', 'otter-blocks' ) ) );
		}

		$nonce = isset( $_POST['_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['_nonce'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! wp_verify_nonce( $nonce, 'otter_form_export_submissions' ) ) {
			wp_die( esc_html( __( 'Invalid nonce.', 'otter-blocks' ) ) );
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html( __( 'You are not allowed to export submissions.', 'otter-blocks' ) ) );
		}

		$format = isset( $_POST['format'] ) ? sanitize_key( wp_unslash( $_POST['format'] ) ) : 'xml'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( 'csv' === $format ) {
			$this->export_csv();
		} else {
			echo $this->export_xml(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}

		wp_die();
	}

	/**
	 * Build the WordPress WXR (XML) export of all submissions.
	 *
	 * @return string
	 */
	private function export_xml() {
		require_once ABSPATH . 'wp-admin/includes/export.php';

		ob_start();
		export_wp( array( 'content' => Form_Submissions::FORM_RECORD_TYPE ) );
		$export = ob_get_clean();

		return ent2ncr( $export );
	}

	/**
	 * Build a CSV export of all submissions.
	 *
	 * @return void
	 */
	private function export_csv() {
		$columns = array_merge( $this->get_fixed_columns(), $this->collect_input_columns() );

		$stream = fopen( 'php://output', 'w' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen

		if ( false === $stream ) {
			return;
		}

		// Prefix a UTF-8 BOM so Excel detects the encoding instead of mangling accented characters.
		fwrite( $stream, "\xEF\xBB\xBF" ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_fwrite

		fputcsv( $stream, array_map( array( $this, 'sanitize_cell' ), array_values( $columns ) ) ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_fputcsv

		$column_keys = array_keys( $columns );

		$this->walk_submissions(
			function ( $meta, $record ) use ( $stream, $column_keys ) {
				$row  = $this->get_record_row( $record, $meta );
				$line = array();

				foreach ( $column_keys as $key ) {
					$line[] = $this->sanitize_cell( isset( $row[ $key ] ) ? $row[ $key ] : '' );
				}

				fputcsv( $stream, $line ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_fputcsv
			}
		);

		fclose( $stream ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
	}

	/**
	 * Columns present for every submission, in export order.
	 *
	 * @return array<string, string> Column key => header label.
	 */
	private function get_fixed_columns() {
		return array(
			'id'     => __( 'ID', 'otter-blocks' ),
			'status' => __( 'Status', 'otter-blocks' ),
			'date'   => __( 'Submission Date', 'otter-blocks' ),
			'form'   => __( 'Form', 'otter-blocks' ),
			'post'   => __( 'Post URL', 'otter-blocks' ),
		);
	}

	/**
	 * Collect the dynamically generated input columns found across every submission.
	 *
	 * @return array<string, string> Column key => header label, in order of first appearance.
	 */
	private function collect_input_columns() {
		$input_columns = array();

		$this->walk_submissions(
			function ( $meta ) use ( &$input_columns ) {
				foreach ( $this->get_record_inputs( $meta ) as $column_key => $input ) {
					if ( isset( $input_columns[ $column_key ] ) ) {
						continue;
					}

					$input_columns[ $column_key ] = $input['label'];
				}
			}
		);

		return $input_columns;
	}

	/**
	 * Run a callback over every submission, loading them in bounded batches.
	 *
	 * @param callable $callback Receives the submission record meta and the submission post.
	 * @return void
	 */
	private function walk_submissions( $callback ) {
		$offset               = 0;
		$has_more_submissions = false;

		do {
			$records = $this->get_submissions_batch( $offset );
			$count   = count( $records );

			if ( 0 === $count ) {
				return;
			}

			$ids = wp_list_pluck( $records, 'ID' );
			update_meta_cache( 'post', $ids );

			foreach ( $records as $record ) {
				$meta = get_post_meta( $record->ID, Form_Submissions::FORM_RECORD_META_KEY, true );

				if ( ! is_array( $meta ) ) {
					continue;
				}

				$callback( $meta, $record );
			}

			foreach ( $ids as $id ) {
				wp_cache_delete( $id, 'posts' );
				wp_cache_delete( $id, 'post_meta' );
			}

			unset( $records, $ids );

			$offset              += $count;
			$has_more_submissions = self::EXPORT_BATCH_SIZE === $count;
		} while ( $has_more_submissions );
	}

	/**
	 * Fetch a batch of submissions, oldest first.
	 *
	 * @param int $offset How many submissions to skip.
	 * @return \WP_Post[]
	 */
	private function get_submissions_batch( $offset ) {
		return get_posts(
			array(
				'post_type'              => Form_Submissions::FORM_RECORD_TYPE,
				'post_status'            => array( 'draft', 'unread', 'read', 'trash', 'publish' ),
				'posts_per_page'         => self::EXPORT_BATCH_SIZE,
				'offset'                 => $offset,
				'orderby'                => 'ID',
				'order'                  => 'ASC',
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);
	}

	/**
	 * Build the CSV row of a single submission, keyed by column.
	 *
	 * @param \WP_Post             $record Submission post.
	 * @param array<string, mixed> $meta   Submission record meta.
	 * @return array<string, mixed>
	 */
	private function get_record_row( $record, $meta ) {
		$post_id = $record->ID;

		$row = array(
			'id'     => substr( strval( $post_id ), -8 ),
			'status' => get_post_status( $post_id ),
			'date'   => get_the_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $post_id ),
			'form'   => isset( $meta['form']['value'] ) ? $meta['form']['value'] : '',
			'post'   => isset( $meta['post_url']['value'] ) ? $meta['post_url']['value'] : '',
		);

		foreach ( $this->get_record_inputs( $meta ) as $column_key => $input ) {
			$row[ $column_key ] = $input['value'];
		}

		return $row;
	}

	/**
	 * Extract the exportable inputs of a submission, keyed by column.
	 *
	 * @param array<string, mixed> $meta Submission record meta.
	 * @return array<string, array<string, mixed>> Column key => array with the `label` and `value` of the input.
	 */
	private function get_record_inputs( $meta ) {
		$inputs = isset( $meta['inputs'] ) && is_array( $meta['inputs'] ) ? $meta['inputs'] : array();
		$parsed = array();

		foreach ( $inputs as $input ) {
			if ( empty( $input ) || ! isset( $input['type'], $input['label'] ) || 'stripe-field' === $input['type'] ) {
				continue;
			}

			$value = isset( $input['value'] ) ? $input['value'] : '';

			if ( 'file' === $input['type'] && isset( $input['metadata']['name'] ) ) {
				$value = $input['metadata']['name'];
			}

			$parsed[ 'input:' . $input['label'] ] = array(
				'label' => $input['label'],
				'value' => $value,
			);
		}

		return $parsed;
	}

	/**
	 * Sanitize a cell value for CSV export, prefixing with a single quote if it looks like a formula.
	 *
	 * @param mixed $value Cell value.
	 * @return string
	 */
	private function sanitize_cell( $value ) {
		$value = strval( $value );

		return preg_match( '/^[\x00-\x20]*[=+\-@]/', $value ) ? "'" . $value : $value;
	}
}
