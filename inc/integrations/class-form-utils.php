<?php
/**
 * Class for Form Utils.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Form Utils
 *
 * @since 2.0.3
 */
class Form_Utils {

	/**
	 * Generate a random email address.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public static function generate_test_email() {

		$words = array(
			'alfa',
			'bravo',
			'charlie',
			'delta',
			'echo',
			'foxtrot',
			'golf',
			'one',
			'two',
			'three',
			'four',
			'five',
			'six',
			'seven',
			'eight',
			'nine',
			'ten',
		);

		$name_1 = $words[ wp_rand( 0, count( $words ) ) ];
		$name_2 = $words[ wp_rand( 2, count( $words ) ) - 1 ];

		return "Otter-Form-successfully-connected.delete-on-confirmation.$name_1.$name_2@otter-blocks.com";
	}

	/**
	 * Check if field is a file field.
	 *
	 * @param array $field Field data.
	 * @return bool
	 * @since 2.2.3
	 */
	public static function is_file_field( $field ) {
		return isset( $field['type'] ) && 'file' === $field['type'];
	}

	/**
	 * Check if file fields has valid data.
	 *
	 * @param array $field Field data.
	 * @return bool
	 * @since 2.2.3
	 */
	public static function is_file_field_valid( $field ) {
		return isset( $field['metadata']['name'] ) && isset( $field['metadata']['size'] ) && isset( $field['metadata']['data'] ) && is_string( $field['metadata']['name'] ) && is_numeric( $field['metadata']['size'] ) && is_string( $field['metadata']['data'] ) && self::is_base64_string( $field['metadata']['data'] );
	}

	/**
	 * Save file from field metadata.
	 *
	 * @param array $field Field data.
	 * @return array
	 * @since 2.2.3
	 */
	public static function save_file_from_field( $field ) {
		$result = array(
			'success' => false,
			'file_id' => '',
			'error'   => null,
		);

		try {
			$file_name = self::generate_file_name( $field['metadata']['name'] );
			$file_data = $field['metadata']['data'];

			$parts     = explode( ';base64,', $file_data );
			$file_data = base64_decode( $parts[1] );

			// Save file to uploads folder.
			$upload = wp_upload_bits( $file_name, null, $file_data );

			// Check if file was saved.
			if ( ! $upload['error'] ) {
				// Save file to media library.
				$attachment = array(
					'post_mime_type' => $upload['type'],
					'post_title'     => $file_name,
					'post_content'   => '',
					'post_status'    => 'inherit',
				);

				$attach_id = wp_insert_attachment( $attachment, $upload['file'] );

				$result['success'] = true;
				$result['file_id'] = $attach_id;

				$attach_data = wp_generate_attachment_metadata( $attach_id, $upload['file'] );
				wp_update_attachment_metadata( $attach_id, $attach_data );
			} else {
				$result['error'] = $upload['error'];
			}
		} catch ( \Exception $e ) {
			// Do nothing.
			$result['error'] = $e->getMessage();
		} finally {
			return $result;
		}
	}

	/**
	 * Generate a new file name.
	 *
	 * @param string $original_name Original file name.
	 * @return string
	 * @since 2.2.3
	 */
	public static function generate_file_name( $original_name ) {
		$original_name = str_replace( ' ', '_', $original_name );
		return md5( wp_rand() ) . '_' . $original_name;
	}

	/**
	 * Check if a string is a valid base64 string.
	 *
	 * @param string $data String to check.
	 * @return boolean
	 * @since 2.2.3
	 */
	public static function is_base64_string( $data ) {
		// Separate out the headers from the data.
		$parts = explode( ';base64,', $data );
		return preg_match( '%^[a-zA-Z0-9/+]*={0,2}$%', $parts[1] );
	}
}
