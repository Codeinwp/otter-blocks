<?php
/**
 * Plugin Name: Otter E2E Captcha Mock
 * Description: Test-only MU-plugin that answers the Cloudflare Turnstile verification server-side for the E2E secret key, so the Form captcha check runs without network access.
 * Author: ThemeIsle (E2E)
 *
 * Only requests that use the E2E secret (`turnstile-secret`, set by
 * form-turnstile.spec.js) are answered. The token `turnstile-token` (the token of
 * the mocked widget) is valid. Any other token is invalid.
 *
 * @package otter-blocks
 */

namespace ThemeIsle\OtterE2E\CaptchaMock;

// Defence-in-depth: refuse to run in production, even if the file is mismounted.
if ( defined( 'WP_ENVIRONMENT_TYPE' ) && 'production' === constant( 'WP_ENVIRONMENT_TYPE' ) ) {
	return;
}

const SECRET = 'turnstile-secret';

const TOKEN = 'turnstile-token';

add_filter(
	'pre_http_request',
	static function ( $preempt, $args, $url ) {
		if ( 'https://challenges.cloudflare.com/turnstile/v0/siteverify' !== $url || ! isset( $args['body'] ) || ! is_string( $args['body'] ) ) {
			return $preempt;
		}

		parse_str( $args['body'], $body );

		if ( ! isset( $body['secret'] ) || SECRET !== $body['secret'] ) {
			return $preempt;
		}

		return array(
			'headers'  => array(),
			'body'     => wp_json_encode( array( 'success' => isset( $body['response'] ) && TOKEN === $body['response'] ) ),
			'response' => array(
				'code'    => 200,
				'message' => 'OK',
			),
			'cookies'  => array(),
			'filename' => null,
		);
	},
	10,
	3
);
