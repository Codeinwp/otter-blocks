<?php
/**
 * Live Search variant.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

/**
 * Class Live_Search
 */
class Form_Pro_Features {
	/**
	 * The main instance var.
	 *
	 * @var Form_Pro_Features
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( License::has_active_license() ) {
			add_filter( 'otter_form_data_preparation', array( $this, 'save_files_to_uploads' ) );
			add_filter( 'otter_form_data_preparation', array( $this, 'load_files_to_media_library' ) );
			add_action( 'otter_form_after_submit', array( $this, 'clean_files_from_uploads' ) );
			add_action( 'otter_form_after_submit', array( $this, 'send_autoresponder' ), 99 );
		}
	}

	/**
	 * Save the files from the form inputs.
	 *
	 * @param Form_Data_Request $form_data The form data.
	 * @return Form_Data_Request
	 * @since 2.2.5
	 */
	public function save_files_to_uploads( $form_data ) {
		if (
			! isset( $form_data ) ||
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request ) ||
			$form_data->has_error() ) {
			return $form_data;
		}

		$inputs = $form_data->get_form_inputs();

		$saved_files     = array();
		$approved_fields = array();

		try {
			$counts_files = array();

			foreach ( $inputs as $input ) {
				if (
					\ThemeIsle\GutenbergBlocks\Integration\Form_Utils::is_file_field( $input ) &&
					isset( $input['metadata']['fieldOptionName'] ) &&
					$form_data->has_field_option( $input['metadata']['fieldOptionName'] )
				) {
					$name = $input['metadata']['fieldOptionName'];
					if ( ! isset( $counts_files[ $name ] ) ) {
						$counts_files[ $name ] = 1;
					} else {
						$counts_files[ $name ]++;

						if (
							$form_data->get_field_option( $name )->has_option( 'maxFilesNumber' ) &&
							$counts_files[ $name ] > $form_data->get_field_option( $name )->get_option( 'maxFilesNumber' )
						) {
							$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD_MAX_FILES_NUMBER );
							break;
						}

						if (
							! $form_data->get_field_option( $name )->has_option( 'maxFilesSize' ) &&
							$counts_files[ $name ] > 10
						) {
							$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD_MAX_FILES_NUMBER );
							break;
						}
					}
				}
			}

			if ( ! $form_data->has_error() ) {
				foreach ( $inputs as $input ) {

					$field_option_name = null;

					if ( isset( $input['metadata']['fieldOptionName'] ) ) {
						$field_option_name = $input['metadata']['fieldOptionName'];
					}

					if (
						\ThemeIsle\GutenbergBlocks\Integration\Form_Utils::is_file_field( $input ) &&
						isset( $field_option_name )
					) {

						$field_option = $form_data->get_field_option( $field_option_name );

						if ( is_null( $field_option ) ) {
							$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_MISSING_FILE_FIELD_OPTION );
							break;
						}

						$file_data = $input['metadata']['data'];

						// Check the mime type from the data encoding.
						$p1 = strpos( $file_data, 'data:' );
						$p2 = strpos( $file_data, ';base64' );

						$mime_type = substr( $file_data, $p1 + 5, $p2 - $p1 - 5 );
						$mime_type = sanitize_mime_type( $mime_type );

						$form_files_ext = $field_option->get_option( 'allowedFileTypes' );

						if ( ! empty( $form_files_ext ) ) {
							$form_files_ext = str_replace( '.', '', $form_files_ext );
							$form_files_ext = str_replace( '/*', '', $form_files_ext );

							$mime_match = wp_match_mime_types( $form_files_ext, $mime_type );

							if ( 0 == count( $mime_match ) ) {
								$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD_TYPE );
								break;
							}
						}

						$allowed_mime_types = get_allowed_mime_types();
						if ( 0 === count( wp_match_mime_types( $allowed_mime_types, $mime_type ) ) ) {
							$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD_TYPE_WP );
							break;
						}

						// Check the file size.
						if ( $field_option->has_option( 'maxFileSize' ) ) {
							$max_file_size = $field_option->get_option( 'maxFileSize' );
							$max_file_size = $max_file_size * 1024 * 1024;

							$base64_start = strpos( $file_data, ';base64,' );
							$file_data    = substr( $file_data, $base64_start + 8 );
							$file_data    = base64_decode( $file_data );

							if ( false === $file_data || $max_file_size < strlen( $file_data ) ) {
								$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD_MAX_SIZE );
								break;
							}
						}

						$approved_fields[] = $input;
					}
				}
			}

			if ( ! $form_data->has_error() ) {
				foreach ( $approved_fields as $field ) {
					$file = \ThemeIsle\GutenbergBlocks\Integration\Form_Utils::save_file_from_field( $field );

					if ( $file['success'] ) {
						$field_option = $form_data->get_field_option( $field['metadata']['fieldOptionName'] );
						$saved_file   = $field_option->get_option( 'saveFiles' );
						if ( ! empty( $saved_file ) ) {
							$file['file_location_slug'] = $field_option->get_option( 'saveFiles' );
						}
						$saved_files[] = $file;
					} else {
						$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD, array( $file['error'] ) );
						break;
					}
				}

				if ( ! empty( $saved_files ) ) {
					$form_data->set_uploaded_files_path( $saved_files );
				}
			}
		} catch ( \Exception $e ) {
			$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD, array( $e->getMessage() ) );
		} finally {
			if ( $form_data->has_error() ) {
				foreach ( $saved_files as $saved_file ) {
					wp_delete_file( $saved_file['file_path'] );
				}
			}

			return $form_data;
		}
	}

	/**
	 * Delete the files uploaded from the File field via attachments.
	 *
	 * @param Form_Data_Request $form_data The files to delete.
	 * @since 2.2.5
	 */
	public function clean_files_from_uploads( $form_data ) {

		if (
			! isset( $form_data ) ||
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request ) ||
			$form_data->has_error()
		) {
			return $form_data;
		}

		try {
			if ( $form_data->has_uploaded_files() ) {
				foreach ( $form_data->get_uploaded_files_path() as $file ) {
					if ( empty( $file['file_location_slug'] ) ) {
						wp_delete_file( $file['file_path'] );
					}
				}
			}
		} catch ( \Exception $e ) {
			$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_RUNTIME_ERROR, array( $e->getMessage() ) );
		} finally {
			return $form_data;
		}
	}

	/**
	 * Load the files to the media library.
	 *
	 * @param Form_Data_Request $form_data The files to load.
	 * @return Form_Data_Request
	 * @since 2.2.5
	 */
	public function load_files_to_media_library( $form_data ) {
		if (
			! isset( $form_data ) ||
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request ) ||
			$form_data->has_error() ) {
			return $form_data;
		}

		try {
			if ( $form_data->has_uploaded_files() ) {

				$media_files = array();
				foreach ( $form_data->get_uploaded_files_path() as $file ) {

					if ( empty( $file['file_location_slug'] ) || 'media-library' !== $file['file_location_slug'] ) {
						continue;
					}

					$attachment = array(
						'post_mime_type' => $file['file_type'],
						'post_title'     => $file['file_name'],
						'post_content'   => '',
						'post_status'    => 'inherit',
					);

					$attachment_id = wp_insert_attachment( $attachment, $file['file_path'] );

					$media_files[] = array(
						'file_path' => $file['file_path'],
						'file_name' => $file['file_name'],
						'file_type' => $file['file_type'],
						'file_id'   => $attachment_id,
					);
				}

				if ( ! empty( $media_files ) ) {
					$form_data->set_files_loaded_to_media_library( $media_files );
				}
			}
		} catch ( \Exception $e ) {
			$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_RUNTIME_ERROR, array( $e->getMessage() ) );
		} finally {
			return $form_data;
		}
	}

	/**
	 * Send autoresponder email to the subscriber.
	 *
	 * @param Form_Data_Request $form_data The files to load.
	 * @return Form_Data_Request
	 * @since 2.2.5
	 */
	public function send_autoresponder( $form_data ) {

		if (
			! isset( $form_data ) ||
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request ) ||
			$form_data->has_error() ||
			! $form_data->get_form_options()->has_autoresponder()
		) {
			return $form_data;
		}

		try {

			$to = \ThemeIsle\GutenbergBlocks\Server\Form_Server::instance()->get_email_from_form_input( $form_data );
			if ( empty( $to ) ) {
				$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_MISSING_EMAIL_FIELD );
				return $form_data;
			}

			$headers[] = 'Content-Type: text/html';
			$headers[] = 'From: ' . ( $form_data->get_form_options()->has_from_name() ? sanitize_text_field( $form_data->get_form_options()->get_from_name() ) : get_bloginfo( 'name', 'display' ) );

			$autoresponder = $form_data->get_form_options()->get_autoresponder();
			$body          = $this->replace_magic_tags( $autoresponder['body'], $form_data->get_form_inputs() );

			// phpcs:ignore
			if ( ! wp_mail( $to, $autoresponder['subject'], $body, $headers ) ) {
				$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_COULD_NOT_SEND );
			}
		} catch ( \Exception $e ) {
			$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_RUNTIME_ERROR, array( $e->getMessage() ) );
		} finally {
			return $form_data;
		}
	}

	/**
	 * Replace magic tags with the values from the form inputs.
	 *
	 * @param string $content The content to replace the magic tags.
	 * @param array  $form_inputs The form inputs.
	 * @since 2.2.5
	 *
	 * @return string
	 */
	public function replace_magic_tags( $content, $form_inputs ) {
		foreach ( $form_inputs as $field ) {
			if ( isset( $field['id'] ) ) {
				$content = str_replace( '%' . $field['id'] . '%', $field['value'], $content );
			}
		}

		return $content;
	}


	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.1
	 * @access public
	 * @return Form_Pro_Features
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 1.7.1
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @since 1.7.1
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
