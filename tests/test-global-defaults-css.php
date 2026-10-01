<?php
/**
 * Class Test_Global_Defaults_CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Base_CSS;
use ThemeIsle\GutenbergBlocks\CSS\Blocks\Advanced_Column_CSS;
use ThemeIsle\GutenbergBlocks\CSS\Blocks\Advanced_Columns_CSS;

/**
 * Global Defaults CSS for Section and Section Column.
 */
class Test_Global_Defaults_CSS extends WP_UnitTestCase {

	/**
	 * Remove the saved defaults.
	 */
	public function tear_down(): void {
		delete_option( 'themeisle_blocks_settings_global_defaults' );

		parent::tear_down();
	}

	/**
	 * Section and Section Column renderers with their variable prefix.
	 *
	 * @return array<string, array{0: class-string<Base_CSS>, 1: string, 2: string}>
	 */
	public function blocks_provider(): array {
		return array(
			'section column' => array( Advanced_Column_CSS::class, 'themeisle-blocks/advanced-column', 'column' ),
			'section'        => array( Advanced_Columns_CSS::class, 'themeisle-blocks/advanced-columns', 'section' ),
		);
	}

	/**
	 * Render a block's Global Defaults CSS from the given defaults.
	 *
	 * @param class-string<Base_CSS> $renderer Renderer class.
	 * @param string                 $block    Block name.
	 * @param array<string, mixed>   $attrs    Default attributes.
	 * @return string
	 */
	private function render_global_css( string $renderer, string $block, array $attrs ): string {
		update_option( 'themeisle_blocks_settings_global_defaults', wp_json_encode( array( $block => $attrs ) ) );

		return (string) ( new $renderer() )->render_global_css();
	}

	/**
	 * The mobile top margin is emitted alongside the other mobile sides.
	 *
	 * @dataProvider blocks_provider
	 *
	 * @param class-string<Base_CSS> $renderer Renderer class.
	 * @param string                 $block    Block name.
	 * @param string                 $prefix   CSS variable prefix.
	 */
	public function test_mobile_top_margin_is_emitted( string $renderer, string $block, string $prefix ): void {
		$css = $this->render_global_css(
			$renderer,
			$block,
			array(
				'marginMobile' => array(
					'top'    => '40px',
					'bottom' => '20px',
				),
			)
		);

		$this->assertStringContainsString( '--' . $prefix . '-margin-top-mobile: 40px', $css );
		$this->assertStringContainsString( '--' . $prefix . '-margin-bottom-mobile: 20px', $css );
	}

	/**
	 * No mobile top margin variable without a mobile top value.
	 *
	 * @dataProvider blocks_provider
	 *
	 * @param class-string<Base_CSS> $renderer Renderer class.
	 * @param string                 $block    Block name.
	 * @param string                 $prefix   CSS variable prefix.
	 */
	public function test_mobile_top_margin_is_skipped_without_value( string $renderer, string $block, string $prefix ): void {
		$css = $this->render_global_css(
			$renderer,
			$block,
			array(
				'margin'       => array( 'top' => '10px' ),
				'marginMobile' => array( 'bottom' => '20px' ),
			)
		);

		$this->assertStringNotContainsString( '--' . $prefix . '-margin-top-mobile', $css );
		$this->assertStringContainsString( '--' . $prefix . '-margin-bottom-mobile: 20px', $css );
	}
}
