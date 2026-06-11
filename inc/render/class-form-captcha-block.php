<?php
/**
 * Form_Captcha_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class Form_Captcha_Block
 */
class Form_Captcha_Block {

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 * @return mixed|string
	 */
	public function render( $attributes ) {
		$provider = isset( $attributes['provider'] ) && in_array( $attributes['provider'], array( 'recaptcha', 'turnstile' ), true ) ? $attributes['provider'] : 'recaptcha';

		$output = '<div class="o-form-captcha" data-captcha-provider="' . esc_attr( $provider ) . '">';

		if ( ! $this->has_keys( $provider ) && current_user_can( 'edit_posts' ) ) {
			$output .= '<p class="o-form-captcha-warning">' . esc_html__( 'Captcha is not configured — form submissions will be blocked. Add the API keys in Settings > Otter > Integrations.', 'otter-blocks' ) . '</p>';
		}

		$output .= '</div>';
		return $output;
	}

	/**
	 * Check if the API keys are set for the given provider.
	 *
	 * @param string $provider Captcha provider.
	 * @return bool
	 */
	private function has_keys( $provider ) {
		if ( 'turnstile' === $provider ) {
			return ! empty( get_option( 'themeisle_cloudflare_turnstile_site_key' ) ) && ! empty( get_option( 'themeisle_cloudflare_turnstile_secret_key' ) );
		}

		return ! empty( get_option( 'themeisle_google_captcha_api_site_key' ) ) && ! empty( get_option( 'themeisle_google_captcha_api_secret_key' ) );
	}
}
