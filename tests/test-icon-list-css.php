<?php
/**
 * Class Test_Icon_List_CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\CSS\Blocks\Icon_List_CSS;

/**
 * Icon List frontend CSS generation.
 *
 * Covers the sub-list indent variable used to offset nested Icon List
 * blocks inside Icon List items. See https://github.com/Codeinwp/otter-blocks/issues/3132
 */
class Test_Icon_List_CSS extends WP_UnitTestCase {

	/**
	 * Render the frontend CSS for an Icon List with the given attributes.
	 *
	 * @param array<string, mixed> $attrs Block attributes.
	 * @return string
	 */
	private function render( array $attrs ): string {
		$block = array(
			'blockName'    => 'themeisle-blocks/icon-list',
			'attrs'        => array_merge( array( 'id' => 'unittest123' ), $attrs ),
			'innerHTML'    => '',
			'innerContent' => array(),
			'innerBlocks'  => array(),
		);

		return (string) ( new Icon_List_CSS() )->render_css( $block );
	}

	/**
	 * A numeric indent is emitted with the pixel unit.
	 */
	public function test_numeric_sublist_indent_is_emitted_in_px() {
		$css = $this->render( array( 'sublistIndent' => 40 ) );

		$this->assertStringContainsString( '--sublist-indent: 40px', $css );
	}

	/**
	 * A string indent keeps its own unit.
	 */
	public function test_string_sublist_indent_is_emitted_as_is() {
		$css = $this->render( array( 'sublistIndent' => '2rem' ) );

		$this->assertStringContainsString( '--sublist-indent: 2rem', $css );
	}

	/**
	 * A unitless numeric string is emitted once, in pixels. Both the numeric
	 * and the string mappings would otherwise fire and the unitless value,
	 * coming last, would win in the cascade.
	 */
	public function test_numeric_string_sublist_indent_is_emitted_once_in_px() {
		$css = $this->render( array( 'sublistIndent' => '32' ) );

		$this->assertSame( 1, substr_count( $css, '--sublist-indent' ) );
		$this->assertStringContainsString( '--sublist-indent: 32px', $css );
	}

	/**
	 * No indent variable when the attribute is not set.
	 */
	public function test_sublist_indent_is_skipped_without_value() {
		$css = $this->render( array() );

		$this->assertStringNotContainsString( '--sublist-indent', $css );
	}
}
