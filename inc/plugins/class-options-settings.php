<?php
/**
 * Options.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

/**
 * Class Options_Settings
 */
class Options_Settings {

	/**
	 * The main instance var.
	 *
	 * @var Options_Settings|null
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'init', array( $this, 'register_settings' ), 99 );
		add_action( 'init', array( $this, 'default_block' ), 99 );
		add_action( 'init', array( $this, 'register_meta' ), 19 );
	}

	/**
	 * Register Settings
	 *
	 * @since   1.2.0
	 * @access  public
	 */
	public function register_settings() {
		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_redirect',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Redirect on new install.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_onboarding',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Show Editor Onboarding.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_css_module',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Custom CSS module allows to add custom CSS to each block in Block Editor.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_blocks_animation',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Blocks Animation module allows to add CSS animations to each block in Block Editor.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_block_conditions',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Blocks Conditions module allows to hide/display blocks to your users based on selected conditions.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_patterns_library',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Patterns Library module allows to add predefined patterns to your blocks.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_dynamic_content',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Dynamic Content allows you to display dynamic content, link and images in your content.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_highlight_dynamic',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Easily differentiate between dynamic and normal text in the editor.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_optimize_animations_css',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Optimize Animations CSS.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_disable_review_schema',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Enable Rich Schema in Product Review Block.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_review_scale',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Use 0.5 Scale for Review Block.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => false,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_block_ai_toolbar_module',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Enable the AI Block Toolbar in Editor', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'otter_blocks_logger_flag',
			array(
				'type'         => 'string',
				'description'  => __( 'Become a contributor by opting in to our anonymous data tracking. We guarantee no sensitive data is collected.', 'otter-blocks' ),
				'show_in_rest' => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'otter_blocks_logger_data',
			array(
				'type'         => 'object',
				'description'  => __( 'Anonymous data tracking object.', 'otter-blocks' ),
				'show_in_rest' => array(
					'schema' => array(
						'type'       => 'object',
						'properties' => array(
							'blocks'    => array(
								'type'  => 'array',
								'items' => array(
									'type'       => 'object',
									'properties' => array(
										'name'      => array(
											'type' => 'string',
										),
										'instances' => array(
											'type' => 'number',
										),
									),
								),
							),
							'templates' => array(
								'type'  => 'array',
								'items' => array(
									'type'       => 'object',
									'properties' => array(
										'url'       => array(
											'type' => 'string',
										),
										'instances' => array(
											'type' => 'number',
										),
									),
								),
							),
						),
					),
				),
				'default'      => array(
					'blocks'    => array(),
					'templates' => array(),
				),
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_google_map_block_api_key',
			array(
				'type'              => 'string',
				'description'       => __( 'Google Map API key for the Google Maps Gutenberg Block.', 'otter-blocks' ),
				'sanitize_callback' => 'sanitize_text_field',
				'show_in_rest'      => true,
				'default'           => '',
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_stripe_api_key',
			array(
				'type'              => 'string',
				'description'       => __( 'Stripe API key for the Stripe Block.', 'otter-blocks' ),
				'sanitize_callback' => 'sanitize_text_field',
				'show_in_rest'      => true,
				'default'           => '',
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_google_captcha_api_site_key',
			array(
				'type'              => 'string',
				'description'       => __( 'Google reCaptcha Site API key for the Form Block.', 'otter-blocks' ),
				'sanitize_callback' => 'sanitize_text_field',
				'show_in_rest'      => true,
				'default'           => '',
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_google_captcha_api_secret_key',
			array(
				'type'              => 'string',
				'description'       => __( 'Google reCaptcha Secret API key for the Form Block.', 'otter-blocks' ),
				'sanitize_callback' => 'sanitize_text_field',
				'show_in_rest'      => true,
				'default'           => '',
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_default_block',
			array(
				'type'              => 'boolean',
				'description'       => __( 'Make Section block your default block for Pages?', 'otter-blocks' ),
				'sanitize_callback' => 'rest_sanitize_boolean',
				'show_in_rest'      => true,
				'default'           => false,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_global_defaults',
			array(
				'type'              => 'string',
				'description'       => __( 'Global defaults for Gutenberg Blocks.', 'otter-blocks' ),
				'sanitize_callback' => 'sanitize_text_field',
				'show_in_rest'      => true,
				'default'           => '',
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_form_emails',
			array(
				'type'              => 'array',
				'description'       => __( 'Email used in the Form block.', 'otter-blocks' ),
				'sanitize_callback' => function ( $array ) {
					return array_map(
						function ( $item ) {
							if ( isset( $item['form'] ) ) {
								$item['form'] = sanitize_text_field( $item['form'] );
							}
							if ( isset( $item['email'] ) ) {
								$item['email'] = sanitize_text_field( $item['email'] );
							}
							if ( isset( $item['redirectLink'] ) ) {
								$item['redirectLink'] = sanitize_text_field( $item['redirectLink'] );
							}
							if ( isset( $item['titleSubject'] ) ) {
								$item['titleSubject'] = sanitize_text_field( $item['titleSubject'] );
							}
							if ( isset( $item['fromName'] ) ) {
								$item['fromName'] = sanitize_text_field( $item['fromName'] );
							}
							if ( isset( $item['cc'] ) ) {
								$item['cc'] = sanitize_text_field( $item['cc'] );
							}
							if ( isset( $item['bcc'] ) ) {
								$item['bcc'] = sanitize_text_field( $item['bcc'] );
							}
							if ( isset( $item['autoresponder']['body'] ) ) {
								$item['autoresponder']['body'] = wp_kses( $item['autoresponder']['body'], $this::get_allowed_mail_html() );
							}
							if ( isset( $item['autoresponder']['subject'] ) ) {
								$item['autoresponder']['subject'] = sanitize_text_field( $item['autoresponder']['subject'] );
							}
							if ( isset( $item['submitMessage'] ) ) {
								$item['submitMessage'] = sanitize_text_field( $item['submitMessage'] );
							}
							if ( isset( $item['errorMessage'] ) ) {
								$item['errorMessage'] = sanitize_text_field( $item['errorMessage'] );
							}
							if ( isset( $item['integration']['provider'] ) ) {
								$item['integration']['provider'] = sanitize_text_field( $item['integration']['provider'] );
							}
							if ( isset( $item['integration']['apiKey'] ) ) {
								$item['integration']['apiKey'] = sanitize_text_field( $item['integration']['apiKey'] );
							}
							if ( isset( $item['integration']['listId'] ) ) {
								$item['integration']['listId'] = sanitize_text_field( $item['integration']['listId'] );
							}
							if ( isset( $item['integration']['action'] ) ) {
								$item['integration']['action'] = sanitize_text_field( $item['integration']['action'] );
							}
							if ( isset( $item['submissionsSaveLocation'] ) ) {
								$item['submissionsSaveLocation'] = sanitize_text_field( $item['submissionsSaveLocation'] );
							}

							if ( isset( $item['requiredFields'] ) ) {
								if ( is_array( $item['requiredFields'] ) ) {
									$item['requiredFields'] = array_map( 'sanitize_text_field', $item['requiredFields'] );
								} else {
									$item['requiredFields'] = array();
								}
							}

							return $item;
						},
						$array
					);
				},
				'show_in_rest'      => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type'       => 'object',
							'properties' => array(
								'form'                    => array(
									'type' => 'string',
								),
								'hasCaptcha'              => array(
									'type' => array( 'boolean', 'number', 'string' ),
								),
								'email'                   => array(
									'type' => 'string',
								),
								'fromName'                => array(
									'type' => 'string',
								),
								'redirectLink'            => array(
									'type' => 'string',
								),
								'emailSubject'            => array(
									'type' => 'string',
								),
								'submitMessage'           => array(
									'type' => 'string',
								),
								'errorMessage'            => array(
									'type' => 'string',
								),
								'cc'                      => array(
									'type' => 'string',
								),
								'bcc'                     => array(
									'type' => 'string',
								),
								'autoresponder'           => array(
									'type'       => 'object',
									'properties' => array(
										'subject' => array(
											'type' => 'string',
										),
										'body'    => array(
											'type' => 'string',
										),
									),
								),
								'integration'             => array(
									'type'       => 'object',
									'properties' => array(
										'provider' => array(
											'type' => 'string',
										),
										'apiKey'   => array(
											'type' => 'string',
										),
										'listId'   => array(
											'type' => 'string',
										),
										'action'   => array(
											'type' => 'string',
										),
									),
								),
								'submissionsSaveLocation' => array(
									'type' => 'string',
								),
								'webhookId'               => array(
									'type' => 'string',
								),
								'requiredFields'          => array(
									'type'  => 'array',
									'items' => array(
										'type' => 'string',
									),
								),
							),
						),
					),
				),
				'default'           => array(),
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_form_fields_option',
			array(
				'type'              => 'array',
				'description'       => __( 'Form Fields used in the Form block.', 'otter-blocks' ),
				'sanitize_callback' => function ( $array ) {
					return array_map(
						function ( $item ) {
							if ( isset( $item['fieldOptionName'] ) ) {
								$item['fieldOptionName'] = sanitize_text_field( $item['fieldOptionName'] );
							}
							if ( isset( $item['fieldOptionType'] ) ) {
								$item['fieldOptionType'] = sanitize_text_field( $item['fieldOptionType'] );
							}

							if ( isset( $item['options']['maxFileSize'] ) ) {
								$item['options']['maxFileSize'] = sanitize_text_field( $item['options']['maxFileSize'] );
							}
							if ( isset( $item['options']['allowedFileTypes'] ) && is_array( $item['options']['allowedFileTypes'] ) ) {
								foreach ( $item['options']['allowedFileTypes'] as $key => $value ) {
									$item['options']['allowedFileTypes'][ $key ] = sanitize_text_field( $value );
								}
							}
							if ( isset( $item['options']['saveFiles'] ) ) {
								$item['options']['saveFiles'] = sanitize_text_field( $item['options']['saveFiles'] );
							}
							if ( isset( $item['options']['maxFilesNumber'] ) && ! is_int( $item['options']['maxFilesNumber'] ) ) {
								$item['options']['maxFilesNumber'] = sanitize_text_field( $item['options']['maxFilesNumber'] );
							}

							if ( isset( $item['stripe']['product'] ) ) {
								$item['stripe']['product'] = sanitize_text_field( $item['stripe']['product'] );
							}

							if ( isset( $item['stripe']['price'] ) ) {
								$item['stripe']['price'] = sanitize_text_field( $item['stripe']['price'] );
							}

							if ( isset( $item['stripe']['quantity'] ) && ! is_int( $item['stripe']['quantity'] ) ) {
								$item['stripe']['quantity'] = sanitize_text_field( $item['stripe']['quantity'] );
							}

							return $item;
						},
						$array
					);
				},
				'show_in_rest'      => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type'       => 'object',
							'properties' => array(
								'fieldOptionName' => array(
									'type' => 'string',
								),
								'fieldOptionType' => array(
									'type' => 'string',
								),
								'options'         => array(
									'type'       => 'object',
									'properties' => array(
										'maxFileSize'      => array(
											'type' => array( 'string', 'number' ),
										),
										'allowedFileTypes' => array(
											'type'  => 'array',
											'items' => array(
												'type' => 'string',
											),
										),
										'saveFiles'        => array(
											'type' => 'string',
										),
										'maxFilesNumber'   => array(
											'type' => array( 'string', 'number' ),
										),
									),
									'default'    => array(),
								),
								'stripe'          => array(
									'type'       => 'object',
									'properties' => array(
										'product'  => array(
											'type' => 'string',
										),
										'price'    => array(
											'type' => 'string',
										),
										'quantity' => array(
											'type'    => 'number',
											'default' => 1,
										),
									),

								),
							),
						),
					),
				),
				'default'           => array(),
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_notifications',
			array(
				'type'              => 'object',
				'description'       => __( 'Notifications Logs.', 'otter-blocks' ),
				'sanitize_callback' => function ( $array ) {
					return array_map(
						function ( $item ) {
							if ( isset( $item['editor_upsell'] ) ) {
								$item['editor_upsell'] = boolval( $item['editor_upsell'] );
							}
							return $item;
						},
						$array
					);
				},
				'show_in_rest'      => array(
					'schema' => array(
						'type'       => 'object',
						'properties' => array(
							'editor_upsell' => array(
								'type' => array( 'boolean', 'number', 'string' ),
							),
						),
					),
				),
				'default'           => array(
					'editor_upsell' => false,
				),
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_webhooks_options',
			array(
				'type'              => 'array',
				'description'       => __( 'Otter Registered Webhooks.', 'otter-blocks' ),
				'sanitize_callback' => function ( $array ) {
					return array_map(
						function ( $item ) {
							if ( isset( $item['id'] ) ) {
								$item['id'] = sanitize_text_field( $item['id'] );
							}
							if ( isset( $item['url'] ) ) {
								$item['url'] = esc_url_raw( $item['url'] );
							}
							if ( isset( $item['name'] ) ) {
								$item['name'] = sanitize_text_field( $item['name'] );
							}
							if ( isset( $item['method'] ) ) {
								$item['method'] = sanitize_text_field( $item['method'] );
							}
							if ( isset( $item['headers'] ) && is_array( $item['headers'] ) ) {
								foreach ( $item['headers'] as &$header ) {
									$header['key']   = sanitize_text_field( $header['key'] );
									$header['value'] = sanitize_text_field( $header['value'] );
								}
							} else {
								$item['headers'] = array();
							}
							return $item;
						},
						$array
					);
				},
				'show_in_rest'      => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type'       => 'object',
							'properties' => array(
								'id'      => array(
									'type' => 'string',
								),
								'url'     => array(
									'type' => 'string',
								),
								'headers' => array(
									'type'  => 'array',
									'items' => array(
										'type'       => 'object',
										'properties' => array(
											'key'   => array(
												'type' => 'string',
											),
											'value' => array(
												'type' => 'string',
											),
										),
									),
								),
								'name'    => array(
									'type' => 'string',
								),
								'method'  => array(
									'type' => 'string',
								),
							),
						),
					),
				),
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_open_ai_api_key',
			array(
				'type'              => 'string',
				'description'       => __( 'The OpenAI API Key required for usage of Otter AI features.', 'otter-blocks' ),
				'sanitize_callback' => 'sanitize_text_field',
				'show_in_rest'      => true,
				'default'           => '',
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_otter_ai_usage',
			array(
				'type'         => 'object',
				'description'  => __( 'Usage of Otter AI features.', 'otter-blocks' ),
				'show_in_test' => array(
					'schema' => array(
						'type'       => 'object',
						'properties' => array(
							'usage_count' => array(
								'type'    => 'array',
								'items'   => array(
									'type'       => 'object',
									'properties' => array(
										'key'   => array(
											'type' => 'string',
										),
										'value' => array(
											'type' => 'string',
										),
									),
								),
								'default' => array(),
							),
							'prompts'     => array(
								'type'    => 'array',
								'items'   => array(
									'type'       => 'object',
									'properties' => array(
										'key'    => array(
											'type' => 'string',
										),
										'values' => array(
											'type'  => 'array',
											'items' => array(
												'type' => 'string',
											),
										),
									),
								),
								'default' => array(),
							),
						),
					),
				),
				'default'      => array(),
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_disabled_blocks',
			array(
				'type'              => 'array',
				'description'       => __( 'The disabled blocks that will no longer be shown in Inserter.', 'otter-blocks' ),
				'sanitize_callback' => function( $array ) {
					return array_map( 'sanitize_text_field', $array );
				},
				'default'           => array(),
				'show_in_rest'      => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type' => 'string',
						),
					),
				),
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_onboarding_wizard',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Enable FSE Onboarding Wizard.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);
		
		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_prompt_actions',
			array(
				'type'              => 'array',
				'description'       => __( 'The prompt actions list of toolbar.', 'otter-blocks' ),
				'sanitize_callback' => function( $array ) {
					return array_map(
						function( $item ) {
							if ( isset( $item['title'] ) ) {
								$item['title'] = sanitize_text_field( $item['title'] );
							}
							if ( isset( $item['prompt'] ) ) {
								$item['prompt'] = sanitize_text_field( $item['prompt'] );
							}
							return $item;
						},
						$array
					);
				},
				'default'           => array(
					array(
						'title'  => 'Fix Grammar',
						'prompt' => 'Fix any grammatical errors in the following: {text_input}',
					),
					array(
						'title'  => 'Rephrase',
						'prompt' => 'Rephrase the following following: {text_input}',
					),
					array(
						'title'  => 'Make Shorter',
						'prompt' => 'Summarize or shorten the following: {text_input}',
					),
					array(
						'title'  => 'Make Longer',
						'prompt' => 'Expand or elaborate on the following: {text_input}',
					),
				),
				'show_in_rest'      => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type'       => 'object',
							'properties' => array(
								'title'  => array(
									'type' => 'string',
								),
								'prompt' => array(
									'type' => 'string',
								),
							),
						),
					),
				),
			)
		);
	}

	/**
	 * Register post meta.
	 *
	 * @since  1.7.0
	 * @access public
	 * @link   https://developer.wordpress.org/reference/functions/register_meta/
	 */
	public function register_meta() {
		register_post_meta(
			'',
			'_themeisle_gutenberg_block_has_review',
			array(
				'show_in_rest'  => true,
				'single'        => true,
				'type'          => 'boolean',
				'auth_callback' => function() {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * Display Default Block
	 *
	 * @since   1.2.0
	 * @access  public
	 */
	public function default_block() {
		if ( ! get_option( 'themeisle_blocks_settings_default_block', false ) ) {
			return;
		}

		$attributes = array();

		$defaults = get_option( 'themeisle_blocks_settings_global_defaults' );
		if ( ! empty( $defaults ) ) {
			$defaults = json_decode( $defaults, true );

			if ( isset( $defaults['themeisle-blocks/advanced-columns'] ) ) {
				$attributes = $defaults['themeisle-blocks/advanced-columns'];
			}
		}

		$post_type_object           = get_post_type_object( 'page' );
		$post_type_object->template = array(
			array( 'themeisle-blocks/advanced-columns', $attributes ),
		);
	}

	/**
	 * Get allowed HTML for mail body.
	 *
	 * @static
	 * @access public
	 * @return array
	 */
	public static function get_allowed_mail_html() {
		$allowed_html = wp_kses_allowed_html( 'post' );

		$not_allowed_tags = array( 'input', 'label', 'form', 'select', 'textarea', 'button', 'fieldset', 'legend', 'datalist', 'output', 'option', 'optgroup', 'video', 'audio' );
		foreach ( $not_allowed_tags as $tag ) {
			unset( $allowed_html[ $tag ] );
		}

		return $allowed_html;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.2.0
	 * @access public
	 * @return Options_Settings
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
	 * @since 1.2.0
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
	 * @since 1.2.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
