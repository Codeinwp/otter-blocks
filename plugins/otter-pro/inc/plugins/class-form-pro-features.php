<?php
/**
 * Form Block Pro Functionalities.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request;
use ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response;
use ThemeIsle\GutenbergBlocks\Plugins\Stripe_API;
use ThemeIsle\GutenbergBlocks\Server\Form_Server;
use WP_Error;
use WP_HTTP_Response;
use WP_REST_Response;

/**
 * Class Form_Pro_Features
 */
class Form_Pro_Features {
	/**
	 * The main instance var.
	 *
	 * @var Form_Pro_Features|null
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
			add_action( 'otter_form_after_submit', array( $this, 'trigger_webhook' ) );
			add_action( 'otter_form_after_submit', array( $this, 'create_stripe_session' ) );
		}
	}

	/**
	 * Save the files from the form inputs.
	 *
	 * @param Form_Data_Request|null $form_data The form data.
	 * @return Form_Data_Request|null
	 * @since 2.2.5
	 */
	public function save_files_to_uploads( $form_data ) {

		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if (
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
			$files        = $form_data->get_request()->get_file_params();

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

						$file_data_key = $input['metadata']['data'];

						if ( ! isset( $file_data_key ) || ! isset( $files[ $file_data_key ] ) ) {
							$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_MISSING_BINARY );
							break;
						}

						$file_data = $files[ $file_data_key ];

						// Get the extension from file using WordPress functions.
						$extension = wp_check_filetype( $file_data['name'] );

						if ( ! $extension['ext'] ) {
							$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD_TYPE_WP );
							break;
						}

						$form_files_ext = $field_option->get_option( 'allowedFileTypes' );

						if ( ! empty( $form_files_ext ) ) {
							$form_files_ext = str_replace( '.', '', $form_files_ext );
							$form_files_ext = str_replace( '/*', '', $form_files_ext );

							$mime_match = wp_match_mime_types( $form_files_ext, $extension['type'] );

							if ( 0 == count( $mime_match ) ) {
								$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD_TYPE );
								break;
							}
						}

						// Check the file size.
						if ( $field_option->has_option( 'maxFileSize' ) ) {
							$max_file_size = $field_option->get_option( 'maxFileSize' );
							$max_file_size = $max_file_size * 1024 * 1024;

							// Get $file_data file size.
							$file_size = filesize( $file_data['tmp_name'] );
							if ( false === $file_size || $max_file_size < $file_size ) {
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
					$file = \ThemeIsle\GutenbergBlocks\Integration\Form_Utils::save_file_from_field( $field, $files );

					if ( $file['success'] ) {
						$field_option = $form_data->get_field_option( $field['metadata']['fieldOptionName'] );
						$saved_file   = $field_option->get_option( 'saveFiles' );
						if ( ! empty( $saved_file ) ) {
							$file['file_location_slug'] = $saved_file;
						}
						$file['key']                               = $field['metadata']['data'];
						$saved_files[ $field['metadata']['data'] ] = $file;
					} else {
						$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD, $file['error'] );
						break;
					}
				}

				if ( ! empty( $saved_files ) ) {
					$form_data->set_uploaded_files_path( $saved_files );
				}
			}
		} catch ( \Exception $e ) {
			$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD, $e->getMessage() );
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
	 * @param Form_Data_Request|null $form_data The files to delete.
	 * @since 2.2.5
	 */
	public function clean_files_from_uploads( $form_data ) {

		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if (
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request ) ||
			$form_data->has_error()
		) {
			return $form_data;
		}

		try {
			$form_options = $form_data->get_form_wp_options();
			$can_delete   = ! $form_data->is_temporary_data();

			if ( isset( $form_options ) ) {
				$can_delete = 'email' === $form_options->get_submissions_save_location();
			}

			if ( $can_delete && $form_data->has_uploaded_files() ) {
				foreach ( $form_data->get_uploaded_files_path() as $file ) {
					if ( ! empty( $file['file_path'] ) ) {
						wp_delete_file( $file['file_path'] );
					}
				}
			}
		} catch ( \Exception $e ) {
			$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_RUNTIME_ERROR, $e->getMessage() );
		} finally {
			return $form_data;
		}
	}

	/**
	 * Load the files to the media library.
	 *
	 * @param Form_Data_Request|null $form_data The files to load.
	 * @return Form_Data_Request|null
	 * @since 2.2.5
	 */
	public function load_files_to_media_library( $form_data ) {

		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if (
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

					$media_files[ $file['key'] ] = array(
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
			$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_RUNTIME_ERROR, $e->getMessage() );
		} finally {
			return $form_data;
		}
	}

	/**
	 * Send autoresponder email to the subscriber.
	 *
	 * @param Form_Data_Request|null $form_data The files to load.
	 * @since 2.2.5
	 */
	public function send_autoresponder( $form_data ) {
		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if (
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request ) ||
			$form_data->has_error() ||
			! $form_data->get_form_wp_options()->has_autoresponder() ||
			$form_data->is_temporary_data()
		) {
			return $form_data;
		}

		$to = \ThemeIsle\GutenbergBlocks\Server\Form_Server::instance()->get_email_from_form_input( $form_data );

		if ( empty( $to ) ) {
			$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_MISSING_EMAIL_FIELD );
			return $form_data;
		}

		try {
			$headers[] = 'Content-Type: text/html';
			$headers[] = 'From: ' . ( $form_data->get_form_wp_options()->has_from_name() ? sanitize_text_field( $form_data->get_form_wp_options()->get_from_name() ) : get_bloginfo( 'name', 'display' ) );

			$autoresponder = $form_data->get_form_wp_options()->get_autoresponder();
			$body          = $this->replace_magic_tags( $autoresponder['body'], $form_data->get_form_inputs() );

			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_mail_wp_mail
			if ( ! wp_mail( $to, $autoresponder['subject'], $body, $headers ) ) {
				$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_COULD_NOT_SEND );
			}
		} catch ( \Exception $e ) {
			$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_RUNTIME_ERROR, $e->getMessage() );
		} finally {
			return $form_data;
		}
	}

	/**
	 * Send autoresponder email to the subscriber.
	 *
	 * @param Form_Data_Request|null $form_data The files to load.
	 * @since 2.4
	 */
	public function trigger_webhook( $form_data ) {

		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if (
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request ) ||
			$form_data->has_error() ||
			empty( $form_data->get_form_wp_options()->get_webhook_id() )
		) {
			return $form_data;
		}

		try {
			$form_webhook_id = $form_data->get_form_wp_options()->get_webhook_id();

			$webhooks = get_option( 'themeisle_webhooks_options', array() );

			$webhook = null;

			foreach ( $webhooks as $hook ) {
				if ( $hook['id'] === $form_webhook_id ) {
					$webhook = $hook;
					break;
				}
			}

			if ( ! empty( $webhook ) && ! empty( $webhook['url'] ) ) {
				$method        = empty( $webhook['method'] ) ? 'POST' : $webhook['method'];
				$url           = $webhook['url'];
				$headers_pairs = empty( $webhook['headers'] ) ? array() : $webhook['headers'];
				$headers       = array();

				foreach ( $headers_pairs as $pair ) {
					if ( empty( $pair['key'] ) || empty( $pair['value'] ) ) {
						continue;
					}

					$headers[] = $pair['key'] . ': ' . $pair['value'];
				}

				$payload = $this->prepare_webhook_payload( array(), $form_data, $webhook );
				$payload = apply_filters( 'otter_form_webhook_payload', $payload, $form_data, $webhook );
				$payload = wp_json_encode( $payload );

				$response = wp_remote_request(
					$url,
					array(
						'method'  => $method,
						'headers' => $headers,
						'body'    => $payload,
					)
				);

				if ( is_wp_error( $response ) ) {
					$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_WEBHOOK_COULD_NOT_TRIGGER, $response->get_error_message() );

					if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
						// TODO: use logger.
						// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
						error_log( __( '[Otter Webhook]', 'otter-blocks' ) . $response->get_error_message() );
					}
				}
			}
		} catch ( \Exception $e ) {
			$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_RUNTIME_ERROR, $e->getMessage() );
		} finally {
			return $form_data;
		}
	}

	/**
	 * Prepare webhook payload with form data.
	 *
	 * @param mixed             $payload The payload.
	 * @param Form_Data_Request $form_data The form data.
	 * @param mixed             $webhook The webhook.
	 * @return mixed
	 */
	public function prepare_webhook_payload( $payload, $form_data, $webhook ) {

		if ( ! is_array( $payload ) ) {
			return $payload;
		}

		$inputs         = $form_data->get_form_inputs();
		$uploaded_files = $form_data->get_uploaded_files_path();

		foreach ( $inputs as $input ) {
			if ( isset( $input['id'] ) && isset( $input['value'] ) ) {
				$key   = str_replace( 'wp-block-themeisle-blocks-form-', '', $input['id'] );
				$value = $input['value'];

				if ( ! empty( $input['metadata']['mappedName'] ) ) {
					$key = $input['metadata']['mappedName'];
				}

				$is_file_field = ! empty( $input['type'] ) && 'file' === $input['type'];

				if ( $is_file_field && ! empty( $input['metadata']['data'] ) ) {
					$file_data_key = $input['metadata']['data'];

					if ( ! empty( $uploaded_files[ $file_data_key ] ) ) {
						$value = $uploaded_files[ $file_data_key ]['file_path'];

						/**
						 * If the file was uploaded to the media library, we use the URL instead of the path.
						 */
						if ( ! empty( $uploaded_files[ $file_data_key ]['file_url'] ) ) {
							$value = $uploaded_files[ $file_data_key ]['file_url'];
						}
					}
				}

				if ( array_key_exists( $key, $payload ) ) {
					if ( is_array( $payload[ $key ] ) ) {
						$payload[ $key ][] = $value;
					} else {
						/**
						 * Overwrite the value if it's not an array.
						 */
						$payload[ $key ] = $value;
					}
				} elseif ( $is_file_field ) {
					/**
					 * If the field is a file field, we need to make sure the value is an array.
					 */
					$payload[ $key ] = array( $value );
				} else {
					$payload[ $key ] = $value;
				}
			}
		}

		return $payload;
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
	 * Create a Stripe session.
	 *
	 * @param Form_Data_Request $form_data The form data.
	 */
	public function create_stripe_session( $form_data ) {
		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if (
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request ) ||
			$form_data->has_error()
		) {
			return $form_data;
		}

		$has_stripe = false;

		$fields_options = $form_data->get_wp_fields_options();

		foreach ( $fields_options as $field ) {
			if ( $field->has_type() && 'stripe' === $field->get_type() ) {
				$has_stripe = true;
				break;
			}
		}

		if ( ! $has_stripe ) {
			return $form_data;
		}

		$required_fields = $form_data->get_form_wp_options()->get_required_fields();

		$products_to_process = array();

		foreach ( $fields_options as $field ) {
			if (
				$field->has_name() &&
				'stripe' === $field->get_type() &&
				in_array( $field->get_name(), $required_fields, true ) &&
				$field->has_stripe_product_info()
			) {
				$products_to_process[] = $field->get_stripe_product_info();
			}
		}

		if ( empty( $products_to_process ) ) {
			return $form_data;
		}

		$payload = array(
			'mode' => 'payment',
		);

		$permalink = add_query_arg(
			array(
				'stripe_session_id' => '{CHECKOUT_SESSION_ID}',
			),
			$form_data->get_payload_field( 'postUrl' )
		);

		$payload['success_url'] = $permalink;
		$payload['cancel_url']  = $permalink;

		$customer_email = $form_data->get_email_from_form_input();
		if ( ! empty( $customer_email ) ) {
			$payload['customer_email'] = $customer_email;
		}

		// Prepare the line items for the Stripe session request.
		$line_items = array();
		foreach ( $products_to_process as $product ) {
			$line_items[] = array(
				'price'    => $product['price'],
				'quantity' => 1,
			);
		}
		$payload['line_items'] = $line_items;


		// Create the metadata array for the Stripe session request.
		// TODO: Save also the record ID.
		$raw_metadata = $this->prepare_webhook_payload( array(), $form_data, null );
		$metadata     = array();
		foreach ( $raw_metadata as $key => $value ) {
			$metadata[ mb_substr( $key, 0, 40 ) ] = mb_substr( wp_json_encode( $value ), 0, 500 );
		}
		$payload['metadata'] = $metadata;

		$stripe = new Stripe_API();

		$session = $stripe->create_request(
			'create_session',
			$payload
		);


		return $form_data;
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
