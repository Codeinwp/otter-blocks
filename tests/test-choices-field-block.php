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
}
