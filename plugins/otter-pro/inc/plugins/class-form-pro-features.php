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
	 * System prompt used when generating an AI autoresponder reply.
	 *
	 * @var string
	 */
	const AI_AUTORESPONDER_SYSTEM_PROMPT = 'You write the body of an automated email reply to a website form submission. Reply in a warm, polite and professional tone, and keep it concise. Write a complete, ready-to-send message. Never include placeholders, brackets, or fill-in tokens such as [name], [Your name], {{name}} or [Tu nombre]: if a detail such as the recipient\'s name is not provided, use a neutral greeting like "Hi there" instead of a placeholder. Write in the same language as the submission and the instructions you are given. Stay strictly on-topic to the submission and those instructions. Never echo, quote, or repeat profanity, abuse, slurs, or hostile language from the submission. Do not invent facts: never fabricate names, order numbers, tracking numbers, dates, prices, discounts, links, account details, or commitments that were not explicitly provided to you. Output plain text only, with no markdown, no HTML, and no subject line.';

	/**
	 * System prompt used when validating a candidate AI autoresponder reply.
	 *
	 * @var string
	 */
	const AI_AUTORESPONDER_VALIDATOR_PROMPT = 'You review an automated email reply before it is sent to a person who submitted a website form. Set valid to false ONLY for concrete problems: it contains, echoes, or repeats profanity, abuse, slurs, or hostile language; it contains hallucinated specifics (fabricated names, order numbers, tracking numbers, dates, prices, discounts, links, account details, or commitments); it contains placeholders, brackets, or unfilled fill-in tokens such as [name] or [Tu nombre]; it is empty; or it is clearly off-topic or unsafe to send. Otherwise set valid to true. Do not reject a reply merely for being brief, generic, warm, or friendly — those are acceptable for an automated confirmation. Return your verdict using the provided function and give a short reason.';

	/**
	 * Key under which the AI autoresponder audit is stashed on the form data
	 * metadata so the submission record can persist it.
	 *
	 * Mirrors Form_Submissions::AI_AUTORESPONDER_META_KEY.
	 *
	 * @var string
	 */
	const AI_AUTORESPONDER_AUDIT_METADATA_KEY = 'otter_form_record_ai_autoresponder';

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( License::has_active_license() ) {
			add_filter( 'otter_form_data_preparation', array( $this, 'save_files_to_uploads' ) );
			add_filter( 'otter_form_data_preparation', array( $this, 'load_files_to_media_library' ) );
			add_filter( 'otter_form_data_preparation', array( $this, 'mark_request_with_stripe_as_temp' ), 0 );

			add_action( 'otter_form_after_submit', array( $this, 'clean_files_from_uploads' ) );
			add_action( 'otter_form_after_submit', array( $this, 'send_autoresponder' ), 99 );
			add_action( 'otter_form_after_submit', array( $this, 'trigger_webhook' ) );
			add_action( 'otter_form_after_submit', array( $this, 'create_stripe_session' ), 50 );
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

		$inputs = $form_data->get_fields();

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
						++$counts_files[ $name ];

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
						$file_validation = wp_check_filetype( $file_data['name'] );

						if ( ! $file_validation['ext'] || ! $file_validation['type'] ) {
							$form_data->set_error( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_FILE_UPLOAD_TYPE_WP );
							break;
						}

						$form_files_ext = $field_option->get_option( 'allowedFileTypes' );

						if ( ! empty( $form_files_ext ) ) {
							$mime_types    = wp_get_mime_types();
							$allowed_mimes = array();

							$ext_to_mime = array();
							foreach ( $mime_types as $exts => $mime ) {
								$ext_list = explode( '|', $exts );
								foreach ( $ext_list as $ext ) {
									$ext_to_mime[ $ext ] = $mime;
								}
							}

							foreach ( $form_files_ext as $type ) {
								$type = strtolower( trim( str_replace( '.', '', $type ) ) );

								// Handle wildcard mime types like image/*.
								if ( false !== strpos( $type, '/' ) ) {
									$allowed_mimes[] = $type;
									continue;
								}

								// Use lookup map for direct access.
								if ( isset( $ext_to_mime[ $type ] ) ) {
									$allowed_mimes[] = $ext_to_mime[ $type ];
								}
							}

							// Remove duplicate MIME types.
							$allowed_mimes = array_unique( $allowed_mimes );

							$mime_match = wp_match_mime_types( $allowed_mimes, $file_validation['type'] );

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
			$can_delete = ! $form_data->is_temporary();

			if ( method_exists( $form_data, 'has_record_id' ) ) {
				// The Submission Record references the uploaded file paths; deleting them would orphan the Record.
				$can_delete = $can_delete && ! $form_data->has_record_id();
			} else {
				// Older otter-blocks build: keep the legacy save-location behavior.
				$form_options = $form_data->get_wp_options();
				if ( isset( $form_options ) ) {
					$can_delete = 'email' === $form_options->get_submissions_save_location();
				}
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
	 * Log an autoresponder debug message to the WordPress debug log.
	 *
	 * Only writes when WP_DEBUG is enabled, so it is safe to leave in place.
	 *
	 * @param string $message The message to log.
	 * @return void
	 */
	private function log_autoresponder_debug( $message ) {
		if ( ! ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ) {
			return;
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( '[Otter Autoresponder] ' . $message );
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
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request )
		) {
			$this->log_autoresponder_debug( 'Skipped: invalid form data object.' );
			return $form_data;
		}

		// Log exactly which gate stops the autoresponder, to make "nothing sent" debuggable.
		if ( $form_data->has_error() ) {
			$this->log_autoresponder_debug( 'Skipped: the submission has a blocking error.' );
			return $form_data;
		}

		if ( ! $form_data->get_wp_options()->has_autoresponder() ) {
			$this->log_autoresponder_debug( 'Skipped: no autoresponder is configured (subject/body empty). Note: enabling "Reply with AI" alone is not enough — set a subject.' );
			return $form_data;
		}

		if ( $form_data->is_temporary() ) {
			$this->log_autoresponder_debug( 'Skipped: the submission is temporary (e.g. pending Stripe payment).' );
			return $form_data;
		}

		$to = \ThemeIsle\GutenbergBlocks\Server\Form_Server::instance()->get_email_from_form_input( $form_data );

		if ( empty( $to ) ) {
			$this->log_autoresponder_debug( 'Skipped: no email field value found in the submission to send the autoresponder to.' );
			$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_MISSING_EMAIL_FIELD );
			return $form_data;
		}

		$this->log_autoresponder_debug( 'Recipient resolved: ' . $to );

		try {
			$from_email = sanitize_email( get_site_option( 'admin_email' ) );

			if ( $form_data->get_wp_options()->has_from_email() && '' !== $form_data->get_wp_options()->get_from_email() ) {
				$from_email = sanitize_email( $form_data->get_wp_options()->get_from_email() );
			}

			$headers[] = 'Content-Type: text/html';
			$headers[] = 'From: ' . ( $form_data->get_wp_options()->has_from_name() ? sanitize_text_field( $form_data->get_wp_options()->get_from_name() ) : get_bloginfo( 'name', 'display' ) ) . ' <' . $from_email . '>';

			$autoresponder = $form_data->get_wp_options()->get_autoresponder();

			/**
			 * Filters whether the AI autoresponder should run for this submission.
			 *
			 * Lets developers force-enable or force-disable the AI path per form or
			 * context. Defaults to the form's `aiAutoresponder.enabled` option.
			 *
			 * @param bool              $enabled   Whether the AI autoresponder is enabled for this submission.
			 * @param Form_Data_Request $form_data The form data request.
			 *
			 * @since 0.0.0
			 */
			$ai_enabled = apply_filters( 'otter_form_ai_autoresponder_enabled', $form_data->get_wp_options()->has_ai_autoresponder(), $form_data );

			$this->log_autoresponder_debug( 'AI autoresponder enabled: ' . ( $ai_enabled ? 'yes' : 'no' ) );

			if ( $ai_enabled ) {
				$body = $this->build_ai_autoresponder_body( $form_data, $autoresponder );

				// An empty fallback body means there is nothing safe to send: skip the send entirely.
				if ( '' === $body ) {
					$this->log_autoresponder_debug( 'Skipped send: AI failed/rejected and the fallback body is empty.' );
					return $form_data;
				}
			} else {
				$body = $this->replace_magic_tags( isset( $autoresponder['body'] ) ? $autoresponder['body'] : '', $form_data->get_fields() );
			}

			$subject = isset( $autoresponder['subject'] ) ? $autoresponder['subject'] : '';

			$this->log_autoresponder_debug( sprintf( 'Sending via wp_mail. to=%s, subject=%s, body_length=%d', $to, $subject, strlen( $body ) ) );

			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_mail_wp_mail
			$sent = wp_mail( $to, $subject, $body, $headers );

			$this->log_autoresponder_debug( 'wp_mail returned: ' . ( $sent ? 'true' : 'false' ) );

			if ( ! $sent ) {
				$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_COULD_NOT_SEND );
			}
		} catch ( \Throwable $e ) {
			// Catch \Throwable (not just \Exception) so a runtime \Error — e.g. a
			// missing class or bad filter return — degrades to a warning instead of
			// silently aborting the autoresponder, and is recorded in the log.
			$this->log_autoresponder_debug( sprintf( 'Exception while sending: %s in %s:%d', $e->getMessage(), $e->getFile(), $e->getLine() ) );
			$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_RUNTIME_ERROR, $e->getMessage() );
		}

		return $form_data;
	}

	/**
	 * Build the autoresponder body via the AI path.
	 *
	 * Generates a candidate reply, validates it, and falls back to the static
	 * autoresponder body on any error or rejection. Records usage, a warning on
	 * failure, and an audit array on the form data for the submission record.
	 *
	 * @param Form_Data_Request    $form_data     The form data.
	 * @param array<string, mixed> $autoresponder The autoresponder settings (subject/body).
	 * @return string The email body to send. An empty string means: do not send.
	 */
	private function build_ai_autoresponder_body( $form_data, $autoresponder ) {
		$ai         = $form_data->get_wp_options()->get_ai_autoresponder();
		$raw_prompt = $ai['prompt'];
		$prompt     = $this->replace_magic_tags( $raw_prompt, $form_data->get_fields() );

		// Diagnostics: show whether the magic-tag tokens were actually replaced.
		$field_ids = array();
		foreach ( $form_data->get_fields() as $f ) {
			if ( isset( $f['id'] ) ) {
				$field_ids[] = $f['id'];
			}
		}
		$this->log_autoresponder_debug( 'Submitted field ids: ' . implode( ', ', $field_ids ) );
		$this->log_autoresponder_debug( 'Raw prompt (with tokens): ' . $raw_prompt );
		$this->log_autoresponder_debug( 'Resolved prompt (after replacement): ' . $prompt );

		/**
		 * Filters the resolved user prompt sent to the AI for the autoresponder.
		 *
		 * Runs after magic tags have been replaced with submitted values and
		 * before the prompt is sent to the AI backend.
		 *
		 * @param string            $prompt    The resolved user prompt.
		 * @param Form_Data_Request $form_data The form data request.
		 *
		 * @since 0.0.0
		 */
		$prompt = apply_filters( 'otter_form_ai_autoresponder_prompt', $prompt, $form_data );

		$used_tokens   = 0;
		$candidate     = '';
		$valid         = false;
		$reason        = '';
		$outcome       = 'fallback';
		$generation_ok = false;

		$this->log_autoresponder_debug( 'AI generation: resolved prompt length=' . strlen( $prompt ) );

		$generated = $this->generate_ai_autoresponder_body( $prompt, $form_data );

		if ( is_wp_error( $generated ) ) {
			$this->log_autoresponder_debug( 'AI generation error: ' . $generated->get_error_message() );
		}

		if ( is_array( $generated ) ) {
			$candidate    = $generated['content'];
			$used_tokens += $generated['used_tokens'];

			/**
			 * Filters the candidate reply body returned from AI generation.
			 *
			 * Runs before the candidate is validated. Returning an empty string
			 * triggers the fallback path.
			 *
			 * @param string            $candidate The generated candidate reply body.
			 * @param Form_Data_Request $form_data The form data request.
			 *
			 * @since 0.0.0
			 */
			$candidate = apply_filters( 'otter_form_ai_autoresponder_generated_body', $candidate, $form_data );
		}

		if ( is_wp_error( $generated ) || '' === $candidate ) {
			$form_data->add_warning(
				\ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_AI_GENERATION_FAILED,
				is_wp_error( $generated ) ? $generated->get_error_message() : ''
			);
		} else {
			$generation_ok = true;

			$validation = $this->validate_ai_autoresponder_body( $candidate, $form_data );

			if ( is_wp_error( $validation ) ) {
				$this->log_autoresponder_debug( 'AI validation error: ' . $validation->get_error_message() );
				$form_data->add_warning(
					\ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_AI_VALIDATION_FAILED,
					$validation->get_error_message()
				);
			} else {
				$used_tokens += $validation['used_tokens'];
				$valid        = $validation['valid'];
				$reason       = $validation['reason'];

				$this->log_autoresponder_debug( sprintf( 'AI validation verdict: valid=%s reason=%s', $valid ? 'true' : 'false', $reason ) );

				if ( ! $valid ) {
					$form_data->add_warning( \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Response::ERROR_AUTORESPONDER_AI_VALIDATION_FAILED, $reason );
				}
			}
		}

		if ( $generation_ok && $valid ) {
			$body    = wp_kses_post( wpautop( $candidate ) );
			$outcome = 'ai';
		} else {
			$body = $this->replace_magic_tags( isset( $autoresponder['body'] ) ? $autoresponder['body'] : '', $form_data->get_fields() );

			if ( '' === trim( $body ) ) {
				$body    = '';
				$outcome = 'none';
			}
		}

		$this->log_autoresponder_debug( sprintf( 'AI autoresponder outcome: %s (used_tokens=%d)', $outcome, $used_tokens ) );

		/**
		 * Filters the final autoresponder email body before it is sent.
		 *
		 * Applies to both the AI-generated body (after wpautop/wp_kses_post) and
		 * the static fallback body. An empty string means the send is skipped.
		 *
		 * @param string            $body      The final email body to send.
		 * @param string            $outcome   The resolved outcome: 'ai', 'fallback', or 'none'.
		 * @param Form_Data_Request $form_data The form data request.
		 *
		 * @since 0.0.0
		 */
		$body = apply_filters( 'otter_form_ai_autoresponder_body', $body, $outcome, $form_data );

		$audit = array(
			'generated_body' => $candidate,
			'valid'          => $valid,
			'reason'         => $reason,
			'outcome'        => $outcome,
			'used_tokens'    => $used_tokens,
		);

		/**
		 * Filters the AI autoresponder audit array before it is persisted.
		 *
		 * The audit is stored on the submission record and shown read-only in the
		 * admin metabox.
		 *
		 * @param array             $audit     The audit array: generated_body, valid, reason, outcome, used_tokens.
		 * @param Form_Data_Request $form_data The form data request.
		 *
		 * @since 0.0.0
		 */
		$form_data->metadata[ self::AI_AUTORESPONDER_AUDIT_METADATA_KEY ] = apply_filters( 'otter_form_ai_autoresponder_audit', $audit, $form_data );

		return $body;
	}

	/**
	 * Generate a candidate AI autoresponder reply body.
	 *
	 * @param string            $prompt    The admin prompt with magic tags already replaced.
	 * @param Form_Data_Request $form_data The form data request.
	 * @return array{content: string, used_tokens: int}|\WP_Error
	 */
	private function generate_ai_autoresponder_body( $prompt, $form_data ) {
		/**
		 * Filters the system prompt used when generating the AI autoresponder reply.
		 *
		 * Defaults to the hardcoded {@see self::AI_AUTORESPONDER_SYSTEM_PROMPT}.
		 *
		 * @param string            $system_prompt The system prompt string.
		 * @param Form_Data_Request $form_data     The form data request.
		 *
		 * @since 0.0.0
		 */
		$system_prompt = apply_filters( 'otter_form_ai_autoresponder_system_prompt', self::AI_AUTORESPONDER_SYSTEM_PROMPT, $form_data );

		// Note: temperature is intentionally omitted — some models (e.g. newer
		// OpenAI reasoning models) reject a non-default temperature with a 400.
		// Add it via the generation-payload filter when the model supports it.
		$payload = array(
			'messages' => array(
				array(
					'role'    => 'system',
					'content' => $system_prompt,
				),
				array(
					'role'    => 'user',
					'content' => $prompt,
				),
			),
		);

		/**
		 * Filters the full OpenAI-shaped payload sent to the AI generation call.
		 *
		 * This is the main extension point for the AI autoresponder structure:
		 * developers can change the model, temperature, messages, or add fields.
		 *
		 * @param array             $payload   The OpenAI-shaped generation payload.
		 * @param Form_Data_Request $form_data The form data request.
		 *
		 * @since 0.0.0
		 */
		$payload = apply_filters( 'otter_form_ai_autoresponder_generation_payload', $payload, $form_data );

		$backend = \ThemeIsle\GutenbergBlocks\Server\AI_Backend_Resolver::resolve();

		$this->log_autoresponder_debug( sprintf( 'AI backend resolved: %s (available=%s)', get_class( $backend ), $backend->is_available() ? 'yes' : 'no' ) );

		$result = $backend->generate( $payload );

		\ThemeIsle\GutenbergBlocks\Server\AI_Usage::record( 'formAutoresponder::generate', $prompt );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( ! \ThemeIsle\GutenbergBlocks\Server\AI_Response::is_valid( $result ) ) {
			return new \WP_Error( 'otter_ai_autoresponder_invalid_response', __( 'The AI response was malformed.', 'otter-pro' ) );
		}

		$content = trim( $result['content'] );

		if ( '' === $content ) {
			return new \WP_Error( 'otter_ai_autoresponder_empty_response', __( 'The AI response was empty.', 'otter-pro' ) );
		}

		return array(
			'content'     => $content,
			'used_tokens' => (int) $result['usedTokens'],
		);
	}

	/**
	 * Validate a candidate AI autoresponder reply body.
	 *
	 * Forces a structured JSON verdict `{ valid: bool, reason: string }` via the
	 * OpenAI functions/function_call mechanism.
	 *
	 * @param string            $candidate The candidate reply body.
	 * @param Form_Data_Request $form_data The form data request.
	 * @return array{valid: bool, reason: string, used_tokens: int}|\WP_Error
	 */
	private function validate_ai_autoresponder_body( $candidate, $form_data ) {
		/**
		 * Filters the validator instruction (system prompt) used to vet the candidate reply.
		 *
		 * Defaults to the hardcoded {@see self::AI_AUTORESPONDER_VALIDATOR_PROMPT}.
		 *
		 * @param string            $validator_prompt The validator instruction string.
		 * @param string            $candidate        The candidate reply body being validated.
		 * @param Form_Data_Request $form_data        The form data request.
		 *
		 * @since 0.0.0
		 */
		$validator_prompt = apply_filters( 'otter_form_ai_autoresponder_validator_prompt', self::AI_AUTORESPONDER_VALIDATOR_PROMPT, $candidate, $form_data );

		// Temperature omitted for the same reason as generation (model 400s).
		$payload = array(
			'messages'      => array(
				array(
					'role'    => 'system',
					'content' => $validator_prompt,
				),
				array(
					'role'    => 'user',
					'content' => $candidate,
				),
			),
			'functions'     => array(
				array(
					'name'        => 'report_verdict',
					'description' => 'Report whether the candidate auto-reply is safe and adequate to send.',
					'parameters'  => array(
						'type'       => 'object',
						'properties' => array(
							'valid'  => array(
								'type'        => 'boolean',
								'description' => 'True when the reply is safe and adequate to send as-is.',
							),
							'reason' => array(
								'type'        => 'string',
								'description' => 'A short explanation of the verdict.',
							),
						),
						'required'   => array( 'valid', 'reason' ),
					),
				),
			),
			'function_call' => array( 'name' => 'report_verdict' ),
		);

		/**
		 * Filters the OpenAI-shaped payload sent to the AI validation call.
		 *
		 * Includes the functions/function_call structure that forces a JSON
		 * `{ valid, reason }` verdict. Developers can adjust the model, the
		 * forced-JSON schema, or other request fields.
		 *
		 * @param array             $payload   The OpenAI-shaped validation payload.
		 * @param string            $candidate The candidate reply body being validated.
		 * @param Form_Data_Request $form_data The form data request.
		 *
		 * @since 0.0.0
		 */
		$payload = apply_filters( 'otter_form_ai_autoresponder_validation_payload', $payload, $candidate, $form_data );

		$result = \ThemeIsle\GutenbergBlocks\Server\AI_Backend_Resolver::resolve()->generate( $payload );

		\ThemeIsle\GutenbergBlocks\Server\AI_Usage::record( 'formAutoresponder::validate', $candidate );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( ! \ThemeIsle\GutenbergBlocks\Server\AI_Response::is_valid( $result ) ) {
			return new \WP_Error( 'otter_ai_autoresponder_invalid_verdict', __( 'The AI validation response was malformed.', 'otter-pro' ) );
		}

		$verdict = json_decode( $result['content'], true );

		if ( ! is_array( $verdict ) || ! isset( $verdict['valid'] ) ) {
			return new \WP_Error( 'otter_ai_autoresponder_invalid_verdict', __( 'The AI validation response could not be parsed.', 'otter-pro' ) );
		}

		return array(
			'valid'       => (bool) $verdict['valid'],
			'reason'      => isset( $verdict['reason'] ) ? (string) $verdict['reason'] : '',
			'used_tokens' => (int) $result['usedTokens'],
		);
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
			empty( $form_data->get_wp_options()->get_webhook_id() )
		) {
			return $form_data;
		}

		try {
			$form_webhook_id = $form_data->get_wp_options()->get_webhook_id();

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
						error_log( __( '[Otter Webhook]', 'otter-pro' ) . $response->get_error_message() );
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

		$inputs         = $form_data->get_fields();
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
	 * Mark request with Stripe as temp.
	 *
	 * @param Form_Data_Request|null $form_data The form data.
	 */
	public function mark_request_with_stripe_as_temp( $form_data ) {
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

		$fields_options = $form_data->get_wp_fields_options();

		foreach ( $fields_options as $field ) {
			if ( $field->has_type() && 'stripe' === $field->get_type() ) {
				$form_data->mark_as_temporary();
				break;
			}
		}

		return $form_data;
	}

	/**
	 * Create a Stripe session.
	 *
	 * @param Form_Data_Request|null $form_data The form data.
	 * @see https://stripe.com/docs/api/checkout/sessions/create
	 */
	public function create_stripe_session( $form_data ) {
		if ( ! isset( $form_data ) ) {
			return $form_data;
		}

		if (
			( ! class_exists( 'ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request' ) ) ||
			! ( $form_data instanceof \ThemeIsle\GutenbergBlocks\Integration\Form_Data_Request ) ||
			$form_data->has_error() ||
			$form_data->is_duplicate()
		) {
			return $form_data;
		}

		if ( ! $form_data->has_metadata( 'otter_form_record_id' ) ) {
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

		$required_fields = $form_data->get_wp_options()->get_required_fields();

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
				'stripe_checkout' => '{CHECKOUT_SESSION_ID}', // Testing mode.
			),
			$form_data->get_data_from_payload( 'postUrl' )
		);

		$payload['success_url'] = $permalink;
		$payload['cancel_url']  = $permalink;

		$stripe = new Stripe_API();

		// Prepare the line items for the Stripe session request.
		$line_items = array();
		foreach ( $products_to_process as $product ) {
			$line_items[] = array(
				'price'    => $product['price'],
				'quantity' => 1,
			);

			if ( 'payment' === $payload['mode'] ) {
				$price = $stripe->create_request( 'price', $product['price'] );
				if ( is_wp_error( $price ) ) {
					$form_data->set_error( Form_Data_Response::ERROR_STRIPE_CHECKOUT_SESSION_CREATION );
					$form_data->add_warning( Form_Data_Response::ERROR_STRIPE_CHECKOUT_SESSION_CREATION, $price->get_error_message() );
					return $form_data;
				}

				if ( 'recurring' === $price['type'] ) {
					$payload['mode'] = 'subscription';
				}
			}
		}
		$payload['line_items'] = $line_items;


		// Create the metadata array for the Stripe session request.
		$raw_metadata = $this->prepare_webhook_payload( array(), $form_data, null );
		$metadata     = array();
		foreach ( $raw_metadata as $key => $value ) {
			$metadata[ mb_substr( $key, 0, 40 ) ] = mb_substr( is_string( $value ) ? $value : wp_json_encode( $value ), 0, 500 );
		}
		$metadata['otter_form_record_id'] = $form_data->metadata['otter_form_record_id'];

		if ( $form_data->get_wp_options()->get_redirect_link() !== null ) {
			$metadata['otter_redirect_link'] = $form_data->get_wp_options()->get_redirect_link();
		}

		$payload['metadata'] = $metadata;

		$session = $stripe->create_request(
			'create_session',
			$payload
		);

		if ( is_wp_error( $session ) ) {
			$form_data->set_error( Form_Data_Response::ERROR_STRIPE_CHECKOUT_SESSION_CREATION );
			$form_data->add_warning( Form_Data_Response::ERROR_STRIPE_CHECKOUT_SESSION_CREATION, $session->get_error_message() );
			return $form_data;
		}

		$form_data->metadata['otter_form_stripe_checkout_session_id'] = $session->id;
		$form_data->metadata['otter_form_stripe_payment_intent_id']   = $session->payment_intent;

		do_action( 'otter_form_update_record_meta_dump', $form_data, $form_data->metadata['otter_form_record_id'] );

		$form_data->metadata['frontend_external_confirmation_url'] = $session->url;

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
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-pro' ), '1.0.0' );
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
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-pro' ), '1.0.0' );
	}
}
