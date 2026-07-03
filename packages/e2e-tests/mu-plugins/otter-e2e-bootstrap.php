<?php
/**
 * Plugin Name: Otter E2E Bootstrap
 * Description: Test-only MU-plugin that exposes REST endpoints for Playwright fixtures to bootstrap complex state (Pro license stub, option overrides). Mounted by wp-env in the `tests` env via .wp-env.override.json.
 * Author: ThemeIsle (E2E)
 *
 * Precedence note: if a real `license.json` is present at the plugin root, `development.php`
 * will overwrite the stub option on `init` via the real themeisle_sdk_license_process_otter chain.
 * That is expected behavior — the stub is only meaningful on machines without a real license.
 *
 * @package otter-blocks
 */

namespace ThemeIsle\OtterE2E;

// Defence-in-depth: refuse to register routes in production, even if the file is mismounted.
if ( defined( 'WP_ENVIRONMENT_TYPE' ) && 'production' === constant( 'WP_ENVIRONMENT_TYPE' ) ) {
	return;
}

const REST_NAMESPACE = 'otter-e2e/v1';

const PRO_LICENSE_OPTION = 'otter_pro_license_data';

/**
 * Keys the /options endpoint may set. Extend this list when a test needs to flip a new option.
 *
 * @var string[]
 */
const OPTION_WHITELIST = array(
	'themeisle_open_ai_api_key',
	'themeisle_blocks_settings_prompt_actions',
	'themeisle_blocks_settings_ai_toolbar_actions',
	'themeisle_blocks_ai_toolbar_actions_migrated',
	'themeisle_blocks_settings_block_ai_toolbar_module',
	'otter_iphub_api_key',
	'themeisle_blocks_settings_onboarding',
	'themeisle_cloudflare_turnstile_site_key',
	'themeisle_cloudflare_turnstile_secret_key',
	'connectors_ai_openai_api_key',
	'themeisle_google_map_block_api_key',
	// Gates registration of the Atomic Wind blocks (atomic-wind/*); tests that
	// generate or insert those blocks flip this on before loading the editor.
	'themeisle_blocks_settings_atomic_wind_blocks',
	// Form block persists submissions config here; tests reset it to avoid
	// cross-run accumulation that eventually fails REST schema validation.
	'themeisle_blocks_form_emails',
	'themeisle_blocks_form_fields_option',
	'themeisle_blocks_settings_patterns_library',
	'themeisle_blocks_settings_atomic_wind_blocks',
);

/**
 * Transient that inc/server/class-prompt-server.php reads first; if it's set we never hit themeisle.com.
 */
const PROMPTS_TRANSIENT = 'otter_prompts';

/**
 * OpenAI chat completions endpoint used by inc/server/class-prompt-server.php.
 */
const OPENAI_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Prefix shared by bin/e2e-tests.sh and Playwright fixtures for the fake OpenAI key.
 * Real keys are never stubbed; dashboard tests can still assert validation errors for keys like "test".
 */
const OPENAI_STUB_KEY_PREFIX = 'sk_XXXXXXXXX';

/**
 * Mail scenario state: 'ok' (default, pretend-send) or 'fail' (every wp_mail fails).
 */
const MAIL_MODE_OPTION = 'otter_e2e_mail_mode';

/**
 * Every wp_mail attempt is appended here as array{to, subject} so specs can assert
 * which emails (owner notification, admin alert) were attempted and in what order.
 */
const MAIL_LOG_OPTION = 'otter_e2e_mail_log';

/**
 * Captcha provider scenario: 'down' (transport error), 'invalid' (token rejected),
 * 'valid' (token accepted). Unset → requests pass through.
 */
const CAPTCHA_MODE_OPTION = 'otter_e2e_captcha_mode';

/**
 * When truthy, /otter/v1/openai/generate returns a deterministic stub instead of calling OpenAI.
 */
const OPENAI_STUB_OPTION = 'otter_e2e_openai_stub';

/**
 * Form record post type, mirrored from \ThemeIsle\GutenbergBlocks\Plugins\Form_Submissions.
 */
const FORM_RECORD_TYPE = 'otter_form_record';

/**
 * Minimal prompt seeds matching the PromptData shape consumed by src/blocks/components/prompt/index.tsx.
 * Covers the three promptIDs used by the content-generator block: form, textTransformation, patternsPicker.
 *
 * @return array<int, array<string, mixed>>
 */
function stub_prompts() {
	return array(
		array(
			'otter_name'          => 'textTransformation',
			'model'               => 'gpt-3.5-turbo',
			'messages'            => array(
				array( 'role' => 'system', 'content' => 'You are a content writer.' ),
				array( 'role' => 'user', 'content' => '{ACTION}: {INSERT_TASK}' ),
			),
			'otter_action_prompt' => 'Transform the following content',
		),
		array(
			'otter_name'    => 'form',
			'model'         => 'gpt-3.5-turbo',
			'messages'      => array(
				array( 'role' => 'system', 'content' => 'You generate web form schemas.' ),
				array( 'role' => 'user', 'content' => '{INSERT_TASK}' ),
			),
			// Forced function calling, mirroring the production template. On the
			// legacy path OpenAI fills choices[0].message.function_call.arguments;
			// on the `wp-ai-client` backend the adaptor translates this into a
			// structured JSON response and reshapes the output the same way.
			'functions'     => array(
				array(
					'name'       => 'create_form',
					'parameters' => array(
						'type'       => 'object',
						'properties' => array(
							'fields' => array(
								'type'  => 'array',
								'items' => array(
									'type'       => 'object',
									'properties' => array(
										'label'    => array( 'type' => 'string' ),
										'type'     => array( 'type' => 'string' ),
										'required' => array( 'type' => 'boolean' ),
									),
								),
							),
						),
					),
				),
			),
			'function_call' => array( 'name' => 'create_form' ),
		),
		array(
			'otter_name'      => 'patternsPicker',
			'model'           => 'gpt-3.5-turbo',
			'messages'        => array(
				array( 'role' => 'system', 'content' => 'You suggest block patterns.' ),
				array( 'role' => 'user', 'content' => '{INSERT_TASK}' ),
			),
			'otter_pro_addon' => array(),
		),
	);
}

/**
 * Build the stub license object. Shape matches what plugins/otter-pro/inc/plugins/class-license.php reads:
 *  - has_active_license() checks ->license not in invalid statuses.
 *  - get_license_type() reads ->price_id (2 → business tier).
 *  - get_license_expiration_date() parses ->expires.
 *
 * @return \stdClass
 */
function stub_license_data() {
	return (object) array(
		'license'  => 'valid',
		'expires'  => '2099-12-31 23:59:59',
		'price_id' => 2,
		'key'      => 'e2e-stub',
	);
}

/**
 * Standard permission callback: limit to admins. The mu-plugin is only mounted in the tests env,
 * so this is a second line of defence rather than the primary gate.
 *
 * @return bool
 */
function require_admin() {
	return current_user_can( 'manage_options' );
}

/**
 * wp-env has no MTA; real wp_mail() returns false and form submissions surface code 106 in E2E.
 *
 * Every attempt is logged to MAIL_LOG_OPTION, and the 'fail' mail mode makes wp_mail()
 * fail so specs can exercise the save-before-deliver retention pipeline.
 *
 * @param null|bool            $short_circuit Value from a previous filter.
 * @param array<string, mixed> $atts The wp_mail() arguments.
 * @return bool|null
 */
function stub_wp_mail_for_e2e( $short_circuit, $atts = array() ) {
	$log   = get_option( MAIL_LOG_OPTION, array() );
	$log   = is_array( $log ) ? $log : array();
	$log[] = array(
		'to'      => isset( $atts['to'] ) ? $atts['to'] : '',
		'subject' => isset( $atts['subject'] ) ? $atts['subject'] : '',
		'headers' => isset( $atts['headers'] ) ? $atts['headers'] : array(),
	);
	update_option( MAIL_LOG_OPTION, $log, false );

	if ( null !== $short_circuit ) {
		return $short_circuit;
	}

	if ( 'fail' === get_option( MAIL_MODE_OPTION, 'ok' ) ) {
		$subject = isset( $atts['subject'] ) ? $atts['subject'] : '';

		// Admin alerts must succeed in fail mode so throttle specs can exercise cooldown semantics.
		if ( false !== strpos( $subject, 'An error with the Form blocks has occurred' ) ) {
			return true;
		}

		return false;
	}

	return true;
}

/**
 * Whether the stored OpenAI key is the E2E stub (not a real secret).
 *
 * @param string $api_key OpenAI API key option value.
 * @return bool
 */
function is_e2e_openai_stub_key( $api_key ) {
	return is_string( $api_key ) && 0 === strpos( $api_key, OPENAI_STUB_KEY_PREFIX );
}

/**
 * HTML content returned for content-generator block E2E tests.
 *
 * @return string
 */
function stub_openai_space_nation_content() {
	return '<h1><strong>Discover the Next Frontier: Space Nation on the Rise</strong></h1>'
		. '<p>Are you ready to embark on a journey to a new world beyond our wildest dreams? Look no further than the rapidly emerging Space Nation that is captivating the imaginations of millions. From groundbreaking technologies to bold explorations, this cosmic civilization is redefining what it means to reach for the stars.</p>'
		. '<h2><em>Unveiling the Wonders of Space Nation</em></h2>'
		. '<p>Peer into the future and witness the awe-inspiring advancements taking place in this celestial realm. With each innovation, Space Nation pushes the boundaries of possibility, offering a glimpse into a future where the impossible becomes reality.</p>'
		. '<h2><em>Join the Movement</em></h2>'
		. '<p>Don\'t miss your chance to be part of history in the making. Whether you are an aspiring pioneer or a curious observer, there is a place for you in the unfolding saga of Space Nation. Embrace the spirit of exploration and venture into a realm where the skies are no longer the limit.</p>'
		. '<h3><strong>Why Space Nation?</strong></h3>'
		. '<ul><li>Experience groundbreaking technologies shaping the future</li><li>Witness bold explorations into the unknown</li><li>Join a community of visionaries and trailblazers</li></ul>'
		. '<h3><strong>Take Action Today</strong></h3>'
		. '<p>Ready to embark on an adventure that transcends the confines of Earth? Step into the world of Space Nation and dare to dream beyond the stars.</p>';
}

/**
 * Whether an outbound request body is a content-generator block-generation
 * phase. `block-generation.ts` asks for strict JSON and parses the reply with
 * `JSON.parse`, so the mock must answer with JSON (not HTML) here.
 *
 * @param string $request_body Raw outbound request body.
 * @return bool
 */
function is_catalog_plan_request( $request_body ) {
	return false !== strpos( $request_body, 'Pipeline step: OUTLINE (catalog)' )
		|| false !== strpos( $request_body, 'planning a WordPress block layout' )
		|| false !== strpos( $request_body, 'planning the structure' );
}

/**
 * Whether the outbound body is the pattern-aware layout brief step.
 *
 * @param string $request_body Raw outbound request body.
 * @return bool
 */
function is_layout_brief_request( $request_body ) {
	return false !== strpos( $request_body, 'Pipeline step: OUTLINE —' );
}

/**
 * Whether the outbound body is a construct / attribute-fill phase.
 *
 * @param string $request_body Raw outbound request body.
 * @return bool
 */
function is_construct_request( $request_body ) {
	return false !== strpos( $request_body, 'Fill in the attributes' )
		|| false !== strpos( $request_body, 'Pipeline step: CONSTRUCT' );
}

function is_block_generation_request( $request_body ) {
	return is_catalog_plan_request( $request_body )
		|| is_construct_request( $request_body )
		|| false !== strpos( $request_body, 'Pipeline step: STRUCTURE GAPS' );
}

/**
 * Whether the outbound body is an attribute-patch edit (toolbar rewrite, refine).
 *
 * @param string $request_body Raw outbound request body.
 * @return bool
 */
function is_edit_patch_request( $request_body ) {
	return false !== strpos( $request_body, 'Pipeline step: EDIT' );
}

/**
 * Whether the outbound body is the quality-polish patch pass.
 *
 * @param string $request_body Raw outbound request body.
 * @return bool
 */
function is_polish_request( $request_body ) {
	return false !== strpos( $request_body, 'Pipeline step: POLISH' );
}

/**
 * Whether the outbound body is the edit-classifier step (DECIDE_EDIT).
 *
 * @param string $request_body Raw outbound request body.
 * @return bool
 */
function is_decide_edit_request( $request_body ) {
	return false !== strpos( $request_body, 'Pipeline step: DECIDE_EDIT' );
}

/**
 * Whether the outbound body is a text-only edit (TEXT_EDIT: transform fragments).
 *
 * @param string $request_body Raw outbound request body.
 * @return bool
 */
function is_text_edit_request( $request_body ) {
	return false !== strpos( $request_body, 'Pipeline step: TEXT_EDIT' );
}

/**
 * Whether the outbound body is a style-only edit (STYLE_EDIT: restyle elements).
 *
 * @param string $request_body Raw outbound request body.
 * @return bool
 */
function is_style_edit_request( $request_body ) {
	return false !== strpos( $request_body, 'Pipeline step: STYLE_EDIT' );
}

/**
 * Whether the outbound body is a full-markup rewrite (REWRITE).
 *
 * @param string $request_body Raw outbound request body.
 * @return bool
 */
function is_rewrite_request( $request_body ) {
	return false !== strpos( $request_body, 'Pipeline step: REWRITE' );
}

/**
 * Deterministic DECIDE_EDIT classification. 'redesign' is the safe superset — it
 * routes to the full-markup rewrite, which the mock also stubs.
 *
 * @return string JSON-encoded `{ kind, reason }` payload.
 */
function stub_decide_edit_payload() {
	return wp_json_encode(
		array(
			'kind'   => 'redesign',
			'reason' => 'Deterministic E2E edit classification.',
		)
	);
}

/**
 * Deterministic TEXT_EDIT reply: the transformed copy once per fragment, matching
 * the count the prompt asks for so run-text-edit's positional mapping lines up.
 *
 * @param string $request_body Raw outbound request body.
 * @param string $replacement  Copy to write into every fragment.
 * @return string JSON-encoded `{ items: string[] }` payload.
 */
function stub_text_edit_payload( $request_body, $replacement ) {
	$count = 1;

	if ( preg_match( '/JSON array of (\d+) strings/', $request_body, $matches ) ) {
		$count = max( 1, (int) $matches[1] );
	}

	return wp_json_encode( array( 'items' => array_fill( 0, $count, $replacement ) ) );
}

/**
 * Deterministic STYLE_EDIT reply: no-op. Returning an empty items array leaves
 * every element's attributes untouched (run-style-edit keeps the original when an
 * item is missing), which is enough to exercise the style route without asserting
 * a specific restyle.
 *
 * @return string JSON-encoded `{ items: array }` payload.
 */
function stub_style_edit_payload() {
	return wp_json_encode( array( 'items' => array() ) );
}

/**
 * Deterministic REWRITE reply: a single serialized paragraph carrying the
 * replacement copy, which run-rewrite parses back into blocks.
 *
 * @param string $replacement Copy for the rewritten block.
 * @return string JSON-encoded `{ summary, markup }` payload.
 */
function stub_rewrite_payload( $replacement ) {
	$markup = '<!-- wp:paragraph --><p>' . $replacement . '</p><!-- /wp:paragraph -->';

	return wp_json_encode(
		array(
			'summary' => 'Deterministic E2E rewrite.',
			'markup'  => $markup,
		)
	);
}

/**
 * Deterministic tool-call JSON for the agent planner step.
 *
 * @param string $request_body Raw outbound request body.
 * @return string JSON-encoded tool call.
 */
function stub_tool_call_payload( $request_body ) {
	if ( false !== strpos( $request_body, 'hasReferenceBlocks: true' )
		&& false !== strpos( $request_body, 'preferLocalTools: true' ) ) {
		return wp_json_encode(
			array(
				'tool'   => 'patch',
				'reason' => 'Deterministic E2E edit tool call.',
				'args'   => array( 'patches' => array() ),
			)
		);
	}

	return wp_json_encode(
		array(
			'tool'   => 'generate',
			'reason' => 'Deterministic E2E generate tool call.',
			'args'   => array(),
		)
	);
}

/**
 * Empty layout brief so pattern-aware create flows fall back to the catalog path.
 *
 * @return string JSON-encoded layout brief.
 */
function stub_layout_brief_payload() {
	return wp_json_encode(
		array(
			'mission'  => '',
			'design'   => (object) array(),
			'sections' => array(),
		)
	);
}

/**
 * Deterministic patch JSON for edit/refine requests.
 *
 * @param string $request_body Raw outbound request body.
 * @param string $headline     Replacement copy for the first patched block.
 * @return string JSON-encoded `{ patches: [...] }` payload.
 */
function stub_edit_patch_payload( $request_body, $headline ) {
	if ( preg_match( '/"id"\s*:\s*"([^"]+)"/', $request_body, $matches ) ) {
		return wp_json_encode(
			array(
				'patches' => array(
					array(
						'id'         => $matches[1],
						'attributes' => array( 'content' => $headline ),
					),
				),
			)
		);
	}

	return wp_json_encode( array( 'patches' => array() ) );
}

/**
 * A deterministic Atomic Wind "features" tree used to exercise the section
 * insertion path with the real atomic-wind/* + core/icon blocks (and the
 * icon slugs that 404 via /wp/v2/icons). Returned only when the Atomic Wind
 * option is enabled, so generic block-generation tests keep the lone heading.
 *
 * @param string $headline        Heading text the attribute phase fills in.
 * @param bool   $with_attributes Whether to include attributes (phase 3) or
 *                                just the slug/nesting skeleton (phase 1).
 * @return array<string, mixed> `{ rationale, roots }` payload.
 */
function atomic_wind_features_payload( $headline, $with_attributes ) {
	$icons = array( 'zap', 'shield-check', 'sparkles' );

	$columns = array();
	foreach ( $icons as $icon ) {
		$icon_block = array( 'name' => 'atomic-wind/icon', 'innerBlocks' => array() );
		$heading    = array( 'name' => 'core/heading', 'innerBlocks' => array() );
		$paragraph  = array( 'name' => 'core/paragraph', 'innerBlocks' => array() );

		if ( $with_attributes ) {
			$icon_block['attributes'] = array( 'icon' => $icon, 'className' => 'h-14 w-14 rounded-[18px] p-3' );
			$heading['attributes']    = array( 'content' => $headline, 'level' => 3, 'className' => 'text-xl font-semibold' );
			$paragraph['attributes']  = array( 'content' => 'Bring routine tasks into one clear flow.', 'className' => 'text-base opacity-75' );
		}

		$box = array(
			'name'        => 'atomic-wind/box',
			'innerBlocks' => array( $icon_block, $heading, $paragraph ),
		);
		if ( $with_attributes ) {
			$box['attributes'] = array( 'tagName' => 'article', 'className' => 'flex h-full flex-col gap-6 rounded-[22px] bg-[#FFFFFF] p-8' );
		}

		$column = array( 'name' => 'core/column', 'innerBlocks' => array( $box ) );
		if ( $with_attributes ) {
			$column['attributes'] = array( 'verticalAlignment' => 'top', 'width' => '33.33%' );
		}

		$columns[] = $column;
	}

	$columns_block = array( 'name' => 'core/columns', 'innerBlocks' => $columns );
	$root          = array( 'name' => 'core/group', 'innerBlocks' => array( $columns_block ) );

	if ( $with_attributes ) {
		$columns_block['attributes'] = array( 'verticalAlignment' => 'top', 'align' => 'wide' );
		$root['attributes']          = array( 'tagName' => 'section', 'align' => 'full', 'backgroundColor' => 'accent-5', 'textColor' => 'contrast' );
		$root['innerBlocks']         = array( $columns_block );
	} else {
		$root['notes'] = 'Three-card features section with an icon, title and short description per card.';
	}

	return array(
		'rationale' => array( 'Deterministic E2E Atomic Wind features section.' ),
		'roots'     => array( $root ),
	);
}

/**
 * Deterministic `{ rationale, roots }` reply for the block-generation pipeline.
 *
 * Phase 1 (structure) plans a single heading; phase 3 (attributes) fills it
 * with $headline so a spec can assert the rendered text. A lone core/heading
 * survives `validateStructure`/`validateGeneratedBlocks` with no ancestor.
 *
 * @param string $request_body Raw outbound request body (used to pick the phase).
 * @param string $headline     Heading text returned by the attribute phase.
 * @return string JSON-encoded payload for the assistant message content.
 */
function stub_openai_block_generation_payload( $request_body, $headline ) {
	$is_attribute_phase = is_construct_request( $request_body );

	// When Atomic Wind is enabled, return a rich atomic-wind/* tree so the
	// section-insertion E2E exercises the real blocks instead of a lone heading.
	if ( get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) ) {
		return wp_json_encode( atomic_wind_features_payload( $headline, $is_attribute_phase ) );
	}

	if ( $is_attribute_phase ) {
		return wp_json_encode(
			array(
				'rationale' => array( 'Deterministic E2E content.' ),
				'roots'     => array(
					array(
						'name'        => 'core/heading',
						'attributes'  => array( 'content' => $headline ),
						'innerBlocks' => array(),
					),
				),
			)
		);
	}

	return wp_json_encode(
		array(
			'rationale' => array( 'Deterministic E2E structure.' ),
			'roots'     => array(
				array(
					'name'        => 'core/heading',
					'innerBlocks' => array(),
				),
			),
		)
	);
}

/**
 * Pick stub completion content based on the outbound OpenAI request body.
 *
 * @param string $request_body JSON-encoded chat completion request.
 * @return string
 */
function stub_openai_completion_content( $request_body ) {
	$is_space_nation = false !== stripos( $request_body, 'space nation' );

	if ( is_layout_brief_request( $request_body ) ) {
		return stub_layout_brief_payload();
	}

	if ( false !== strpos( $request_body, 'Pipeline step: TOOL_CALL' ) ) {
		return stub_tool_call_payload( $request_body );
	}

	if ( is_polish_request( $request_body ) ) {
		return wp_json_encode( array( 'patches' => array() ) );
	}

	if ( is_decide_edit_request( $request_body ) ) {
		return stub_decide_edit_payload();
	}

	if ( is_text_edit_request( $request_body ) ) {
		$replacement = $is_space_nation
			? 'Discover the Next Frontier: Space Nation on the Rise'
			: 'Rewritten content for testing.';

		return stub_text_edit_payload( $request_body, $replacement );
	}

	if ( is_style_edit_request( $request_body ) ) {
		return stub_style_edit_payload();
	}

	if ( is_rewrite_request( $request_body ) ) {
		$replacement = $is_space_nation
			? 'Discover the Next Frontier: Space Nation on the Rise'
			: 'Rewritten content for testing.';

		return stub_rewrite_payload( $replacement );
	}

	if ( is_block_generation_request( $request_body ) ) {
		$headline = $is_space_nation
			? 'Discover the Next Frontier: Space Nation on the Rise'
			: 'Rewritten content for testing.';

		return stub_openai_block_generation_payload( $request_body, $headline );
	}

	if ( is_edit_patch_request( $request_body ) ) {
		$headline = $is_space_nation
			? 'Discover the Next Frontier: Space Nation on the Rise'
			: 'Rewritten content for testing.';

		return stub_edit_patch_payload( $request_body, $headline );
	}

	if ( $is_space_nation ) {
		return stub_openai_space_nation_content();
	}

	return '<p>Rewritten content for testing.</p>';
}

/**
 * Pick stub content for the /otter/v1/openai/generate REST short-circuit.
 *
 * @param string $request_body Raw REST request body.
 * @return array<string, mixed> Normalized AI_Response envelope.
 */
function stub_openai_generate_from_request( $request_body ) {
	$content = stub_openai_completion_content( $request_body );
	$format  = ( '{' === substr( ltrim( $content ), 0, 1 ) ) ? 'json' : 'text';

	return \ThemeIsle\GutenbergBlocks\Server\AI_Response::success( $content, 30, $format );
}

/**
 * Build a wp_remote_* response array for a stubbed OpenAI completion.
 *
 * @param string $content Assistant message content.
 * @return array<string, mixed>
 */
function stub_openai_http_response( $content ) {
	return array(
		'headers'  => array(),
		'body'     => wp_json_encode(
			array(
				'id'                 => 'chatcmpl-e2e-stub',
				'object'             => 'chat.completion',
				'created'            => 1721829943,
				'model'              => 'gpt-3.5-turbo-0125',
				'choices'            => array(
					array(
						'index'         => 0,
						'message'       => array(
							'role'    => 'assistant',
							'content' => $content,
						),
						'logprobs'      => null,
						'finish_reason' => 'stop',
					),
				),
				'usage'              => array(
					'prompt_tokens'     => 20,
					'completion_tokens' => 10,
					'total_tokens'      => 30,
				),
				'system_fingerprint' => null,
			)
		),
		'response' => array(
			'code'    => 200,
			'message' => 'OK',
		),
		'cookies'  => array(),
		'filename' => null,
	);
}

/**
 * Short-circuit OpenAI HTTP calls when the E2E stub API key is configured.
 *
 * @param false|array|WP_Error $preempt     A preemptive return value.
 * @param array                $parsed_args Request arguments.
 * @param string               $url         Request URL.
 * @return false|array|WP_Error
 */
function stub_openai_http_for_e2e( $preempt, $parsed_args, $url ) {
	if ( false !== $preempt || OPENAI_COMPLETIONS_URL !== $url ) {
		return $preempt;
	}

	$api_key = get_option( 'themeisle_open_ai_api_key' );

	if ( ! is_e2e_openai_stub_key( $api_key ) ) {
		return $preempt;
	}

	$request_body = isset( $parsed_args['body'] ) ? $parsed_args['body'] : '';
	$content      = stub_openai_completion_content( $request_body );

	return stub_openai_http_response( $content );
}

add_filter( 'pre_wp_mail', __NAMESPACE__ . '\\stub_wp_mail_for_e2e', 10, 2 );
add_filter( 'pre_http_request', __NAMESPACE__ . '\\stub_openai_http_for_e2e', 10, 3 );

// Skip the themeisle-sdk survey (Formbricks) + tracking scripts in e2e so their
// network errors don't pollute the console. Bails Script_loader::setup_actions().
add_filter( 'themeisle_sdk_script_setup', '__return_true' );

/**
 * Mock the reCAPTCHA verification endpoint per the captcha scenario mode, so specs can
 * exercise the provider-failure (infrastructure failure) and invalid-token paths without
 * reaching Google.
 *
 * @param false|array<string, mixed>|\WP_Error $preempt Whether to short-circuit the request.
 * @param array<string, mixed>                 $args Request args.
 * @param string                               $url Request URL.
 * @return false|array<string, mixed>|\WP_Error
 */
function mock_captcha_provider( $preempt, $args, $url ) {
	if ( false === strpos( $url, 'recaptcha/api/siteverify' ) ) {
		return $preempt;
	}

	$mode = get_option( CAPTCHA_MODE_OPTION, '' );

	if ( 'down' === $mode ) {
		return new \WP_Error( 'http_request_failed', 'E2E: captcha provider unreachable.' );
	}

	if ( 'invalid' === $mode || 'valid' === $mode ) {
		return array(
			'response' => array(
				'code'    => 200,
				'message' => 'OK',
			),
			'headers'  => array(),
			'body'     => wp_json_encode( array( 'success' => 'valid' === $mode ) ),
		);
	}

	return $preempt;
}

add_filter( 'pre_http_request', __NAMESPACE__ . '\\mock_captcha_provider', 10, 3 );

/**
 * Deterministic OpenAI chat completion used by AI block E2E specs.
 *
 * @return array<string, mixed>
 */
function stub_openai_generate_response() {
	return array(
		'id'                 => 'chatcmpl-9oWud5dugI37NCO4ZIUFH2GRFJ9Z4',
		'object'             => 'chat.completion',
		'created'            => 1721829943,
		'model'              => 'gpt-3.5-turbo-0125',
		'choices'            => array(
			array(
				'index'         => 0,
				'message'       => array(
					'role'    => 'assistant',
					'content' => '<p>E2E stub</p>',
				),
				'logprobs'      => null,
				'finish_reason' => 'stop',
			),
		),
		'usage'              => array(
			'prompt_tokens'     => 331,
			'completion_tokens' => 338,
			'total_tokens'      => 669,
		),
		'system_fingerprint' => null,
	);
}

/**
 * Short-circuit /otter/v1/openai/generate when the E2E stub mode is active.
 *
 * @param mixed               $result  Response to replace the requested version with, or null.
 * @param \WP_REST_Server     $server  Server instance.
 * @param \WP_REST_Request    $request Request used to generate the response.
 * @return mixed
 */
function stub_openai_generate_route( $result, $server, $request ) {
	if ( ! get_option( OPENAI_STUB_OPTION, false ) ) {
		return $result;
	}

	if ( '/otter/v1/openai/generate' !== $request->get_route() || 'POST' !== $request->get_method() ) {
		return $result;
	}

	$body = $request->get_body();

	return rest_ensure_response( stub_openai_generate_from_request( is_string( $body ) ? $body : '' ) );
}

add_filter( 'rest_pre_dispatch', __NAMESPACE__ . '\\stub_openai_generate_route', 10, 3 );

/**
 * List the stored form Submission Records with their Delivery Status meta.
 *
 * @return array<int, array<string, mixed>>
 */
function get_form_records() {
	$posts = get_posts(
		array(
			'post_type'   => FORM_RECORD_TYPE,
			'post_status' => array( 'draft', 'unread', 'read', 'trash' ),
			'numberposts' => -1,
			'orderby'     => 'ID',
			'order'       => 'ASC',
		)
	);

	return array_map(
		function ( $post ) {
			$meta = get_post_meta( $post->ID, 'otter_form_record_meta', true );

			return array(
				'id'              => $post->ID,
				'title'           => $post->post_title,
				'status'          => $post->post_status,
				'form'            => isset( $meta['form']['value'] ) ? $meta['form']['value'] : null,
				'inputs'          => isset( $meta['inputs'] ) ? array_values(
					array_map(
						function ( $input ) {
							return array(
								'label' => isset( $input['label'] ) ? $input['label'] : '',
								'value' => isset( $input['value'] ) ? $input['value'] : '',
							);
						},
						$meta['inputs']
					)
				) : array(),
				'delivery_status' => get_post_meta( $post->ID, 'otter_form_record_delivery_status', true ),
				'delivery_errors' => get_post_meta( $post->ID, 'otter_form_record_delivery_errors', true ),
			);
		},
		$posts
	);
}

/**
 * Delete all stored form Submission Records and the alert-throttle transients tied to them.
 *
 * @return int Number of deleted records.
 */
function cleanup_form_records() {
	$posts = get_posts(
		array(
			'post_type'   => FORM_RECORD_TYPE,
			// 'any' skips statuses flagged exclude_from_search (e.g. draft), so list them.
			'post_status' => array( 'draft', 'unread', 'read', 'trash', 'publish' ),
			'numberposts' => -1,
			'fields'      => 'ids',
		)
	);

	foreach ( $posts as $post_id ) {
		wp_delete_post( $post_id, true );
	}

	return count( $posts );
}

/**
 * Prevent external HTTP calls for captcha verification during E2E.
 *
 * @param mixed  $preempt Whether to preempt an HTTP request.
 * @param array  $request HTTP request arguments.
 * @param string $url The request URL.
 * @return array|mixed
 */
function stub_captcha_http_verification_for_e2e( $preempt, $request, $url ) {
	if ( null !== $preempt ) {
		return $preempt;
	}

	if (
		false !== strpos( $url, 'www.google.com/recaptcha/api/siteverify' ) ||
		false !== strpos( $url, 'challenges.cloudflare.com/turnstile/v0/siteverify' )
	) {
		return array(
			'response' => array(
				'code' => 200,
			),
			'body'     => wp_json_encode(
				array(
					'success' => true,
				)
			),
		);
	}

	return $preempt;
}

add_filter( 'pre_http_request', __NAMESPACE__ . '\\stub_captcha_http_verification_for_e2e', 10, 3 );

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			REST_NAMESPACE,
			'/pro/activate',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					update_option( PRO_LICENSE_OPTION, stub_license_data() );
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/pro/deactivate',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					delete_option( PRO_LICENSE_OPTION );
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/options',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function ( \WP_REST_Request $request ) {
					$body = $request->get_json_params();
					if ( ! is_array( $body ) || empty( $body ) ) {
						return new \WP_Error(
							'otter_e2e_invalid_body',
							'Body must be a non-empty JSON object.',
							array( 'status' => 400 )
						);
					}

					$rejected = array();
					$applied  = array();
					foreach ( $body as $key => $value ) {
						if ( ! in_array( $key, OPTION_WHITELIST, true ) ) {
							$rejected[] = $key;
							continue;
						}
						update_option( $key, $value );
						$applied[] = $key;
					}

					if ( ! empty( $rejected ) ) {
						return new \WP_Error(
							'otter_e2e_option_not_whitelisted',
							'Some option keys are not in the whitelist.',
							array(
								'status'   => 400,
								'rejected' => $rejected,
								'allowed'  => OPTION_WHITELIST,
							)
						);
					}

					return rest_ensure_response(
						array(
							'ok'      => true,
							'applied' => $applied,
						)
					);
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/prompts/seed',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					set_transient( PROMPTS_TRANSIENT, stub_prompts(), WEEK_IN_SECONDS );
					// Clear any throttle/timeout cooldown set by a previous failed fetch.
					delete_transient( 'otter_prompts_timeout' );
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/mail',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function ( \WP_REST_Request $request ) {
					$mode = $request->get_param( 'mode' );

					if ( ! in_array( $mode, array( 'ok', 'fail' ), true ) ) {
						return new \WP_Error(
							'otter_e2e_invalid_mail_mode',
							'Mail mode must be "ok" or "fail".',
							array( 'status' => 400 )
						);
					}

					update_option( MAIL_MODE_OPTION, $mode, false );
					update_option( MAIL_LOG_OPTION, array(), false );

					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/mail/log',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					return rest_ensure_response( get_option( MAIL_LOG_OPTION, array() ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/openai',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function ( \WP_REST_Request $request ) {
					$mode = $request->get_param( 'mode' );

					if ( ! in_array( $mode, array( 'stub', 'off' ), true ) ) {
						return new \WP_Error(
							'otter_e2e_invalid_openai_mode',
							'OpenAI mode must be "stub" or "off".',
							array( 'status' => 400 )
						);
					}

					if ( 'off' === $mode ) {
						delete_option( OPENAI_STUB_OPTION );
					} else {
						update_option( OPENAI_STUB_OPTION, true, false );
					}

					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/captcha',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function ( \WP_REST_Request $request ) {
					$mode = $request->get_param( 'mode' );

					if ( ! in_array( $mode, array( 'down', 'invalid', 'valid', 'off' ), true ) ) {
						return new \WP_Error(
							'otter_e2e_invalid_captcha_mode',
							'Captcha mode must be "down", "invalid", "valid" or "off".',
							array( 'status' => 400 )
						);
					}

					if ( 'off' === $mode ) {
						delete_option( CAPTCHA_MODE_OPTION );
						delete_option( 'themeisle_google_captcha_api_secret_key' );
					} else {
						update_option( CAPTCHA_MODE_OPTION, $mode, false );

						// Verification short-circuits with ERROR_CAPTCHA_NOT_CONFIGURED unless a
						// secret is stored, so the recaptcha scenarios (down/invalid/valid) need a
						// dummy key for the scenario mode to actually drive the outcome.
						update_option( 'themeisle_google_captcha_api_secret_key', 'e2e-recaptcha-secret', false );
					}

					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/form/options',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function ( \WP_REST_Request $request ) {
					$body = $request->get_json_params();

					if ( ! is_array( $body ) || empty( $body['form'] ) || ! is_string( $body['form'] ) ) {
						return new \WP_Error(
							'otter_e2e_invalid_form_option',
							'Body must be a JSON object with a "form" key.',
							array( 'status' => 400 )
						);
					}

					$options = get_option( 'themeisle_blocks_form_emails', array() );
					$options = is_array( $options ) ? $options : array();
					$index   = null;

					foreach ( $options as $i => $entry ) {
						if ( isset( $entry['form'] ) && $entry['form'] === $body['form'] ) {
							$index = $i;
							break;
						}
					}

					$entry = null !== $index ? $options[ $index ] : array();

					// Merge the payload; a null value removes the key (used to simulate legacy entries).
					foreach ( $body as $key => $value ) {
						if ( null === $value ) {
							unset( $entry[ $key ] );
						} else {
							$entry[ $key ] = $value;
						}
					}

					if ( null !== $index ) {
						$options[ $index ] = $entry;
					} else {
						$options[] = $entry;
					}

					update_option( 'themeisle_blocks_form_emails', $options );

					return rest_ensure_response(
						array(
							'ok'    => true,
							'entry' => $entry,
						)
					);
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/form/nonce',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					return rest_ensure_response( array( 'nonce' => wp_create_nonce( 'form-verification' ) ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/form/records',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					return rest_ensure_response( get_form_records() );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/form/records/cleanup',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					return rest_ensure_response( array( 'deleted' => cleanup_form_records() ) );
				},
			)
		);

		register_rest_route(
			REST_NAMESPACE,
			'/reset',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'permission_callback' => __NAMESPACE__ . '\\require_admin',
				'callback'            => function () {
					// Re-stub rather than delete: global-setup activates the Pro
					// license once for the whole run, so reset() must restore that
					// baseline. Deleting it deactivates Pro for every later spec and
					// the Pro-gated Form tests (file field, export, …) then fail.
					update_option( PRO_LICENSE_OPTION, stub_license_data() );
					foreach ( OPTION_WHITELIST as $key ) {
						delete_option( $key );
					}
					delete_option( 'themeisle_blocks_settings_ai_toolbar_actions' );
					delete_option( 'themeisle_blocks_ai_toolbar_actions_migrated' );
					delete_transient( PROMPTS_TRANSIENT );
					delete_transient( 'otter_prompts_timeout' );
					delete_option( MAIL_MODE_OPTION );
					delete_option( MAIL_LOG_OPTION );
					delete_option( CAPTCHA_MODE_OPTION );
					delete_option( OPENAI_STUB_OPTION );
					cleanup_form_records();
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);
	}
);
