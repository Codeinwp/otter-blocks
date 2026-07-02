<?php
/**
 * Class Test_Form_Captcha_Block
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Render\Form_Captcha_Block;

/**
 * Form captcha block render tests: provider fallback and the missing-keys editor warning.
 */
class Test_Form_Captcha_Block extends WP_UnitTestCase {

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		delete_option( 'themeisle_google_captcha_api_site_key' );
		delete_option( 'themeisle_google_captcha_api_secret_key' );
		delete_option( 'themeisle_cloudflare_turnstile_site_key' );
		delete_option( 'themeisle_cloudflare_turnstile_secret_key' );

		parent::tear_down();
	}

	/**
	 * Ensure an unknown provider falls back to recaptcha and known providers pass through.
	 */
	public function test_render_provider_attribute() {
		$block = new Form_Captcha_Block();

		$this->assertStringContainsString( 'data-captcha-provider="recaptcha"', $block->render( array() ) );
		$this->assertStringContainsString( 'data-captcha-provider="recaptcha"', $block->render( array( 'provider' => 'not-a-provider' ) ) );
		$this->assertStringContainsString( 'data-captcha-provider="turnstile"', $block->render( array( 'provider' => 'turnstile' ) ) );
	}

	/**
	 * Ensure the missing-keys warning shows only to users who can edit posts.
	 */
	public function test_render_warning_requires_edit_posts_capability() {
		$block = new Form_Captcha_Block();

		wp_set_current_user( 0 );
		$this->assertStringNotContainsString( 'o-form-captcha-warning', $block->render( array() ) );

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		$this->assertStringContainsString( 'o-form-captcha-warning', $block->render( array() ) );
	}

	/**
	 * Ensure the warning checks the keys of the selected provider, not just any provider.
	 */
	public function test_render_warning_uses_provider_specific_keys() {
		$block = new Form_Captcha_Block();

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );

		update_option( 'themeisle_google_captcha_api_site_key', 'site' );
		update_option( 'themeisle_google_captcha_api_secret_key', 'secret' );

		// reCAPTCHA keys satisfy the recaptcha provider but not turnstile.
		$this->assertStringNotContainsString( 'o-form-captcha-warning', $block->render( array( 'provider' => 'recaptcha' ) ) );
		$this->assertStringContainsString( 'o-form-captcha-warning', $block->render( array( 'provider' => 'turnstile' ) ) );

		update_option( 'themeisle_cloudflare_turnstile_site_key', 'site' );
		update_option( 'themeisle_cloudflare_turnstile_secret_key', 'secret' );

		$this->assertStringNotContainsString( 'o-form-captcha-warning', $block->render( array( 'provider' => 'turnstile' ) ) );
	}
}
