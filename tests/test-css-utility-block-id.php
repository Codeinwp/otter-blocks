<?php
/**
 * Class Test_CSS_Utility_Block_ID
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

use PHPUnit\Framework\TestCase;

/**
 * The Block ID is interpolated into CSS selectors, so characters that would
 * invalidate those selectors must be filtered out. Otherwise the generated
 * stylesheet contains rules browsers report in the console.
 *
 * Covers https://github.com/Codeinwp/otter-blocks/issues/3085.
 */
class Test_CSS_Utility_Block_ID extends TestCase {

	/**
	 * Build the CSS for a block carrying the given stored id.
	 *
	 * @param mixed $id Value of the block's id attribute.
	 * @return string Generated CSS.
	 */
	private function css_for_stored_id( $id ) {
		$block = array(
			'attrs' => array(
				'id' => $id,
			),
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => ' .highlight',
				'properties' => array(
					array(
						'property' => 'color',
						'default'  => 'red',
					),
				),
			)
		);

		return $css->generate();
	}

	/**
	 * Punctuation and whitespace must not survive into the selector.
	 */
	public function test_invalid_characters_are_stripped_from_generated_selectors() {
		$style = $this->css_for_stored_id( 'bad id.with:chars_and spaces' );

		$this->assertSame( '#badidwithchars_andspaces .highlight {color: red;}', $style );
	}

	/**
	 * Hyphens, underscores and non-ASCII characters are valid in selectors and
	 * are kept as is, so that ids already present in the saved markup keep matching.
	 */
	public function test_valid_css_identifier_characters_are_kept() {
		$this->assertSame( '#my-anchorx .highlight {color: red;}', $this->css_for_stored_id( 'my-anchor.x' ) );
		$this->assertSame( '#my_section .highlight {color: red;}', $this->css_for_stored_id( 'my_section' ) );
		$this->assertSame( '#sección_1 .highlight {color: red;}', $this->css_for_stored_id( 'sección_1' ) );
		$this->assertSame( '#café .highlight {color: red;}', $this->css_for_stored_id( 'café' ) );
	}

	/**
	 * Ids produced by the editor stay byte for byte the same.
	 */
	public function test_valid_generated_id_is_left_untouched() {
		$id    = 'wp-block-themeisle-blocks-advanced-heading-1a2b3c4d';
		$style = $this->css_for_stored_id( $id );

		$this->assertStringContainsString( '#' . $id . ' .highlight', $style );
	}

	/**
	 * A custom id set with set_id() goes through the same filtering.
	 */
	public function test_custom_id_is_sanitized() {
		$block = array(
			'attrs' => array(
				'id' => 'original-id',
			),
		);

		$css = new CSS_Utility( $block );
		$css->set_id( 'custom id:x' );

		$css->add_item(
			array(
				'selector'   => ' .highlight',
				'properties' => array(
					array(
						'property' => 'color',
						'default'  => 'red',
					),
				),
			)
		);

		$this->assertSame( '#customidx .highlight {color: red;}', $css->generate() );
	}

	/**
	 * The [id] placeholder used by some blocks is filtered too.
	 */
	public function test_id_placeholder_is_sanitized() {
		$block = array(
			'attrs' => array(
				'id' => 'c:1',
			),
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => '[id] .bar',
				'properties' => array(
					array(
						'property' => 'color',
						'default'  => 'red',
					),
				),
			)
		);

		$this->assertSame( '#c1 .bar {color: red;}', $css->generate() );
	}

	/**
	 * Ids that cannot form a valid CSS identifier (empty after filtering,
	 * starting with a digit, or starting the way a custom property does)
	 * drop the rules instead of emitting selectors no browser would apply.
	 */
	public function test_ids_outside_the_css_identifier_syntax_emit_no_rules() {
		$this->assertSame( '', $this->css_for_stored_id( '!!!' ) );
		$this->assertSame( '', $this->css_for_stored_id( array( 'nope' ) ) );
		$this->assertSame( '', $this->css_for_stored_id( '42' ) );
		$this->assertSame( '', $this->css_for_stored_id( '--foo--' ) );
		$this->assertSame( '', $this->css_for_stored_id( '-1x' ) );
	}

	/**
	 * A single leading hyphen before letters is a valid selector and stays.
	 */
	public function test_leading_hyphen_before_letters_is_kept() {
		$this->assertSame( '#-foo .highlight {color: red;}', $this->css_for_stored_id( '-foo' ) );
	}
}
