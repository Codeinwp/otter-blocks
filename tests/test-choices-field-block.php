<?php
/**
 * Test Multiple Choice Field Block.
 *
 * @package otter-blocks
 */

use ThemeIsle\GutenbergBlocks\Render\Form_Multiple_Choice_Block;

/**
 * Class Test Multiple Choices Block
 */
class Test_Multiple_Choices_Block extends WP_UnitTestCase {

    public function test_label_sanitization_render() {
        $block_render = new Form_Multiple_Choice_Block();

        $expected  = '<div class="o-form-multiple-choice-field">';
        $expected .= '<input type="checkbox" name="otter-blocks" id="otter-blocks" value="otter-blocks"  />';
        $expected .= '<label for="otter-blocks" class="o-form-choice-label">Option with <a href="www.example.com">link</a></label>';
        $expected .= '</div>';

        $output = $block_render->render_field( 'checkbox', 'Option with <a href="www.example.com">link</a>', 'otter-blocks', 'otter-blocks', 'otter-blocks' );

        $this->assertEquals( $expected, $output );

        $malicious_label = 'Option with <a href="www.example.com">link</a><script></script>';
        $output = $block_render->render_field( 'checkbox', $malicious_label, 'otter-blocks', 'otter-blocks', 'otter-blocks' );

        $this->assertEquals( $expected, $output );

        $malicious_label = 'Option with <a href="www.example.com" onclick="alert(123)">link</a>';
        $output = $block_render->render_field( 'checkbox', $malicious_label, 'otter-blocks', 'otter-blocks', 'otter-blocks' );

        $this->assertEquals( $expected, $output );
    }

	/**
	 * Ensure required sign is rendered only when needed.
	 */
	public function test_render_required_sign() {
		$block_render = new Form_Multiple_Choice_Block();

		$this->assertSame( '<span class="required">*</span>', $block_render->render_required_sign( true ) );
		$this->assertSame( '', $block_render->render_required_sign( false ) );
	}

	/**
	 * Ensure select rendering skips empty options and marks selected default.
	 */
	public function test_render_select_field_marks_default_option_and_skips_empty_options() {
		$block_render = new Form_Multiple_Choice_Block();
		$output       = $block_render->render_select_field(
			'Pick one',
			array(
				array(
					'content' => '',
				),
				array(
					'content'   => 'First Option',
					'isDefault' => true,
				),
				array(
					'content' => 'Second Option',
				),
			),
			'field-id',
			'mapped_name',
			false,
			true
		);

		$this->assertStringContainsString( 'required', $output );
		$this->assertStringContainsString( '<option value="first-option"selected>First Option</option>', $output );
		$this->assertStringContainsString( '<option value="second-option">Second Option</option>', $output );
	}

	/**
	 * Ensure field rendering includes required and checked attributes.
	 */
	public function test_render_field_includes_required_and_checked_attributes() {
		$block_render = new Form_Multiple_Choice_Block();
		$output       = $block_render->render_field(
			'checkbox',
			'Label',
			'value',
			'field_name',
			'field-id',
			true,
			true
		);

		$this->assertStringContainsString( 'name="field_name"', $output );
		$this->assertStringContainsString( 'required checked', $output );
	}
}
