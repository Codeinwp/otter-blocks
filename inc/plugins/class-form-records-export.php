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

		echo 'csv' === $format ? $this->export_csv() : $this->export_xml(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
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
	 * @return string
	 */
	private function export_csv() {
		$records = get_posts(
			array(
				'post_type'      => Form_Submissions::FORM_RECORD_TYPE,
				'post_status'    => array( 'draft', 'unread', 'read', 'trash', 'publish' ),
				'posts_per_page' => -1,
				'orderby'        => 'ID',
				'order'          => 'ASC',
			)
		);

		update_meta_cache( 'post', wp_list_pluck( $records, 'ID' ) );

		$fixed_columns = array(
			'id'     => __( 'ID', 'otter-blocks' ),
			'status' => __( 'Status', 'otter-blocks' ),
			'date'   => __( 'Submission Date', 'otter-blocks' ),
			'form'   => __( 'Form', 'otter-blocks' ),
			'post'   => __( 'Post URL', 'otter-blocks' ),
		);

		$input_columns = array();
		$rows          = array();

		foreach ( $records as $record ) {
			$post_id = $record->ID;
			$meta    = get_post_meta( $post_id, Form_Submissions::FORM_RECORD_META_KEY, true );

			if ( ! is_array( $meta ) ) {
				continue;
			}

			$row = array(
				'id'     => substr( strval( $post_id ), -8 ),
				'status' => get_post_status( $post_id ),
				'date'   => get_the_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $post_id ),
				'form'   => isset( $meta['form']['value'] ) ? $meta['form']['value'] : '',
				'post'   => isset( $meta['post_url']['value'] ) ? $meta['post_url']['value'] : '',
			);

			$inputs = isset( $meta['inputs'] ) && is_array( $meta['inputs'] ) ? $meta['inputs'] : array();

			foreach ( $inputs as $input ) {
				if ( empty( $input ) || ! isset( $input['type'], $input['label'] ) || 'stripe-field' === $input['type'] ) {
					continue;
				}

				$label      = $input['label'];
 				$column_key = 'input:' . $label;

				if ( ! isset( $input_columns[ $label ] ) ) {
					$input_columns[ $column_key ] = $label;
				}

				$value = isset( $input['value'] ) ? $input['value'] : '';

				if ( 'file' === $input['type'] && isset( $input['metadata']['name'] ) ) {
					$value = $input['metadata']['name'];
				}

				$row[ $column_key ] = $value;
			}

			$rows[] = $row;
		}

		$columns = array_merge( $fixed_columns, $input_columns );

		$stream = fopen( 'php://temp', 'w+' );

		$sanitize_cell = static function ( $value ) {
 			$value = strval( $value );
 			return preg_match( '/^[\x00-\x20]*[=+\-@]/', $value ) ? "'" . $value : $value;
 		};

 		fputcsv( $stream, array_map( $sanitize_cell, array_values( $columns ) ) );

		foreach ( $rows as $row ) {
			$line = array();

			foreach ( array_keys( $columns ) as $key ) {
				$value  = isset( $row[ $key ] ) ? $row[ $key ] : '';
 				$line[] = $sanitize_cell( $value );
			}

			fputcsv( $stream, $line );
		}

		rewind( $stream );
		$csv = stream_get_contents( $stream );
		fclose( $stream );

		// Prefix a UTF-8 BOM so Excel detects the encoding instead of mangling accented characters.
		return "\xEF\xBB\xBF" . $csv;
	}
}
