<?php
/**
 * Class for Form Utils.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks\Integration;

use enshrined\svgSanitize\Sanitizer;

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
			'eleven',
			'twelve',
			'thirteen',
			'fourteen',
			'fifteen',
		);

		$name_1 = $words[ wp_rand( 0, count( $words ) - 1 ) ];
		$name_2 = $words[ wp_rand( 2, count( $words ) ) - 1 ];

		return "Otter-Form-successfully-connected.delete-on-confirmation.$name_1.$name_2@themeisle.com";
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
		return isset( $field['metadata']['name'] ) && isset( $field['metadata']['size'] ) && isset( $field['metadata']['data'] ) && is_string( $field['metadata']['name'] ) && is_numeric( $field['metadata']['size'] ) && is_string( $field['metadata']['data'] );
	}

	/**
	 * Save file from field metadata.
	 *
	 * @param array $field Field data.
	 * @param array $files Files array.
	 * @return array
	 * @since 2.3
	 */
	public static function save_file_from_field( $field, $files ) {
		$result = array(
			'success'   => false,
			'file_name' => '',
			'file_path' => '',
			'file_type' => '',
			'error'     => null,
		);

		$file_name     = self::generate_file_name( $field['metadata']['name'] );
		$file_data_key = $field['metadata']['data'];

		if ( ! isset( $file_data_key ) || ! isset( $files[ $file_data_key ] ) ) {
			return $result;
		}

		try {
			$file_data = $files[ $file_data_key ];

			if ( 'svg' === pathinfo( $file_name, PATHINFO_EXTENSION ) ) {
				$file_contents = file_get_contents( $file_data['tmp_name'] );

				$sanitizer     = new Sanitizer();
				$file_contents = $sanitizer->sanitize( $file_contents );

				global $wp_filesystem;

				if ( ! is_a( $wp_filesystem, 'WP_Filesystem_Base' ) ) {
					$creds = request_filesystem_credentials( site_url() );
					wp_filesystem( $creds );
				}

				$wp_filesystem->put_contents( $file_data['tmp_name'], $file_contents );
			}

			// Save file to uploads folder.
			require_once ABSPATH . 'wp-admin/includes/file.php';

			$upload = wp_handle_sideload( $file_data, array( 'test_form' => false ) );

			// Check if file was saved.
			if ( ! isset( $upload['error'] ) || ! $upload['error'] ) {
				$result['success']   = true;
				$result['file_name'] = $file_name;
				$result['file_url']  = $upload['url'];
				$result['file_type'] = $upload['type'];
				$result['file_path'] = $upload['file'];
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
		$original_name = sanitize_file_name( $original_name );
		$hash_code     = md5( $original_name . wp_rand() );
		$hash_code     = substr( $hash_code, 0, 8 );

		return $hash_code . '_' . $original_name;
	}
}
