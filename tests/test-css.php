<?php
/**
 * Class CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Sample test case.
 */
class TestCSS extends WP_UnitTestCase {
	/**
	 * Test Simple CSS.
	 */
	public function test_css_simple() {
		$block = array(
			'attrs' => array(
				'id'      => 'wp-block',
				'spacing' => 10,
			),
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => 'margin',
						'value'    => 'spacing',
						'unit'     => 'px',
					),
				),
			)
		);

		$style = $css->generate();

		$this->assertEquals(
			$style,
			'#wp-block {margin: 10px;}'
		);
	}

	/**
	 * Test CSS Defaults.
	 */
	public function test_css_defaults() {
		$block = array(
			'attrs' => array(
				'id' => 'wp-block',
			),
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => ' .wp-block',
				'properties' => array(
					array(
						'property' => 'margin',
						'value'    => 'spacing',
						'unit'     => 'px',
						'default'  => 20,
					),
				),
			)
		);

		$style = $css->generate();

		$this->assertEquals(
			$style,
			'#wp-block .wp-block {margin: 20px;}'
		);
	}

	/**
	 * Test CSS Format.
	 */
	public function test_css_format() {
		$block = array(
			'attrs' => array(
				'id'      => 'wp-block',
				'spacing' => 10,
			),
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => ' .wp-block',
				'properties' => array(
					array(
						'property' => 'margin',
						'value'    => 'spacing',
						'unit'     => 'px',
						'format'   => function( $value, $attrs ) {
							return $value / 2;
						},
					),
				),
			)
		);

		$style = $css->generate();

		$this->assertEquals(
			$style,
			'#wp-block .wp-block {margin: 5px;}'
		);
	}

	/**
	 * Test CSS Condition.
	 */
	public function test_css_condition() {
		$block = array(
			'attrs' => array(
				'id'      => 'wp-block',
				'spacing' => 10,
			),
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => ' .wp-block',
				'properties' => array(
					array(
						'property'    => 'margin',
						'value'       => 'spacing',
						'unit'        => 'px',
						'condition'   => function( $attrs ) {
							if ( $attrs['spacing'] < 20 ) {
								return false;
							}

							return true;
						},
					),
				),
			)
		);

		$style = $css->generate();

		$this->assertNotEquals(
			$style,
			'#wp-block .wp-block {margin: 10px;}'
		);
	}

	/**
	 * Test CSS Pattern.
	 */
	public function test_css_pattern() {
		$block = array(
			'attrs' => array(
				'id'      => 'wp-block',
				'spacing' => 10,
			),
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => ' .wp-block',
				'properties' => array(
					array(
						'property' => 'margin',
						'pattern'  => 'margin 20px',
						'pattern_values' => array(
							'margin' => array(
								'value'   => 'spacing',
								'unit'    => 'px',
							),
						),
					),
				),
			)
		);

		$style = $css->generate();

		$this->assertEquals(
			$style,
			'#wp-block .wp-block {margin: 10px 20px;}'
		);
	}
}