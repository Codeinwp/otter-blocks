<?php
/**
 * Form Submission Record uploaded-file cleanup.
 *
 * Deletes the upload files a Submission Record owns when the record is permanently
 * deleted, while leaving media-library attachments and files still referenced by
 * another record untouched.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use WP_Post;

/**
 * Class Form_Records_Files
 */
class Form_Records_Files {
	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'before_delete_post', array( $this, 'delete_uploaded_files_on_record_delete' ), 10, 2 );
	}

	/**
	 * Delete uploaded files owned by a Submission Record when it is permanently deleted.
	 *
	 * @param int          $post_id The post ID.
	 * @param WP_Post|null $post The post object.
	 * @return void
	 */
	public function delete_uploaded_files_on_record_delete( $post_id, $post = null ) {
		if ( ! $post instanceof WP_Post ) {
			$post = get_post( $post_id );
		}

		if ( ! $post instanceof WP_Post || Form_Submissions::FORM_RECORD_TYPE !== $post->post_type ) {
			return;
		}

		$meta = get_post_meta( $post_id, Form_Submissions::FORM_RECORD_META_KEY, true );

		foreach ( $this->get_owned_upload_paths_from_meta( $meta ) as $path ) {
			if ( $this->is_upload_path_referenced_by_another_record( $path, $post_id ) ) {
				continue;
			}

			if ( $this->is_safe_upload_path( $path ) ) {
				wp_delete_file( $path );
			}
		}
	}

	/**
	 * Extract non-media upload paths from Submission Record meta.
	 *
	 * @param mixed $meta The record meta.
	 * @return string[]
	 */
	private function get_owned_upload_paths_from_meta( $meta ) {
		if ( ! is_array( $meta ) || empty( $meta['inputs'] ) || ! is_array( $meta['inputs'] ) ) {
			return array();
		}

		$paths = array();

		foreach ( $meta['inputs'] as $input ) {
			if (
				! is_array( $input ) ||
				( isset( $input['type'] ) && 'file' !== $input['type'] ) ||
				! empty( $input['saved_in_media'] ) ||
				empty( $input['path'] ) ||
				! is_string( $input['path'] )
			) {
				continue;
			}

			$paths[] = $input['path'];
		}

		return array_values( array_unique( $paths ) );
	}

	/**
	 * Check whether another Submission Record still references the upload path.
	 *
	 * @param string $path The upload path.
	 * @param int    $excluded_record_id The record being deleted.
	 * @return bool
	 */
	private function is_upload_path_referenced_by_another_record( $path, $excluded_record_id ) {
		$records = get_posts(
			array(
				'post_type'      => Form_Submissions::FORM_RECORD_TYPE,
				'post_status'    => array( 'draft', 'unread', 'read', 'trash' ),
				'posts_per_page' => -1,
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'     => Form_Submissions::FORM_RECORD_META_KEY,
						'value'   => $path,
						'compare' => 'LIKE',
					),
				),
			)
		);

		foreach ( $records as $record ) {
			$record_id = (int) $record->ID;

			if ( $record_id === (int) $excluded_record_id ) {
				continue;
			}

			$meta = get_post_meta( $record_id, Form_Submissions::FORM_RECORD_META_KEY, true );
			if ( in_array( $path, $this->get_owned_upload_paths_from_meta( $meta ), true ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check whether a path points to an existing file inside the uploads directory.
	 *
	 * @param string $path The upload path.
	 * @return bool
	 */
	private function is_safe_upload_path( $path ) {
		if ( ! file_exists( $path ) ) {
			return false;
		}

		$uploads   = wp_upload_dir();
		$base_dir  = realpath( $uploads['basedir'] );
		$file_path = realpath( $path );

		if ( false === $base_dir || false === $file_path ) {
			return false;
		}

		$base_dir  = trailingslashit( wp_normalize_path( $base_dir ) );
		$file_path = wp_normalize_path( $file_path );

		return 0 === strpos( $file_path, $base_dir );
	}
}
