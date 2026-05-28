<?php
/**
 * Class Test_Form_Nonce_Block
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Render\Form_Nonce_Block;

/**
 * Form nonce block tests.
 */
class Test_Form_Nonce_Block extends WP_UnitTestCase {
	/**
	 * Ensure custom form ID is used in nonce field name.
	 */
	public function test_render_with_form_id_uses_form_specific_nonce_field() {
		$block  = new Form_Nonce_Block();
		$output = $block->render(
			array(
				'formId' => 'contact_form',
			)
		);

		$this->assertStringContainsString( 'class="protection"', $output );
		$this->assertStringContainsString( 'name="contact_form_nonce_field"', $output );
		$this->assertStringContainsString( '<input class="o-anti-bot" type="checkbox">', $output );
	}

	/**
	 * Ensure fallback nonce field name is used without form ID.
	 */
	public function test_render_without_form_id_uses_default_nonce_field() {
		$block  = new Form_Nonce_Block();
		$output = $block->render( array() );

		$this->assertStringContainsString( 'name="_nonce_field"', $output );
		$this->assertStringContainsString( '<input class="o-anti-bot" type="checkbox">', $output );
	}
}
