<?php
/**
 * Class Test_AMP_Slider_Block
 *
 * @package gutenberg-blocks
 */

if ( ! function_exists( 'amp_is_request' ) ) {
	/**
	 * AMP plugin stub, off unless a test turns it on.
	 *
	 * @return bool
	 */
	function amp_is_request(): bool {
		return Test_AMP_Slider_Block::$is_amp_request;
	}
}

/**
 * The slider renders as an AMP carousel on AMP requests.
 */
class Test_AMP_Slider_Block extends WP_UnitTestCase {

	/**
	 * Return value of the `amp_is_request()` stub.
	 *
	 * @var bool
	 */
	public static $is_amp_request = false;

	/**
	 * `parse_request` run count before the test, null when it never ran.
	 *
	 * @var int|null
	 */
	private $parse_request_count = null;

	/**
	 * Set up test environment.
	 */
	public function set_up() {
		global $wp_actions;

		parent::set_up();

		$this->parse_request_count = isset( $wp_actions['parse_request'] ) ? $wp_actions['parse_request'] : null;
		$wp_actions['parse_request'] = 1;
		self::$is_amp_request        = true;
	}

	/**
	 * Tear down test environment.
	 */
	public function tear_down() {
		global $wp_actions;

		self::$is_amp_request = false;

		if ( null === $this->parse_request_count ) {
			unset( $wp_actions['parse_request'] );
		} else {
			$wp_actions['parse_request'] = $this->parse_request_count;
		}

		parent::tear_down();
	}

	/**
	 * Render a saved slider block whose slides follow the given extra markup.
	 *
	 * @param string $id    Block `id` attribute.
	 * @param string $extra Markup appended inside the slides wrapper.
	 * @return string
	 */
	private function render_slider( string $id, string $extra = '' ): string {
		$slides = '<div class="wp-block-themeisle-blocks-slider-item-wrapper glide__slide" tabindex="0"><figure><img class="wp-block-themeisle-blocks-slider-item" src="https://example.com/a.jpg?w=1&amp;h=2" alt="Café “ü”" data-id="12"/><figcaption>Cap <strong>bold</strong> &amp; ünï</figcaption></figure></div>'
			. '<div class="wp-block-themeisle-blocks-slider-item-wrapper glide__slide" tabindex="0"><figure><img class="wp-block-themeisle-blocks-slider-item" src="https://example.com/b.jpg" alt="" data-id="13"/></figure></div>';
		$markup = '<!-- wp:themeisle-blocks/slider ' . wp_json_encode( array( 'id' => $id ) ) . ' -->'
			. '<div class="wp-block-themeisle-blocks-slider glide"><div class="glide__track" data-glide-el="track"><div class="glide__slides">' . $slides . $extra . '</div></div></div>'
			. '<!-- /wp:themeisle-blocks/slider -->';

		$blocks = parse_blocks( $markup );

		return render_block( $blocks[0] );
	}

	/**
	 * Expected carousel for the two slides of `render_slider()`.
	 *
	 * @param string $escaped_id Already escaped `id` attribute.
	 * @return string
	 */
	private function expected_carousel( string $escaped_id ): string {
		return '<amp-carousel id="' . $escaped_id . '" class="wp-block-themeisle-blocks-slider" width="400" height="300" layout="responsive" type="slides" autoplay delay="2000">'
			. '<figure><img class="wp-block-themeisle-blocks-slider-item" src="https://example.com/a.jpg?w=1&amp;h=2" alt="Café “ü”" data-id="12"><figcaption>Cap <strong>bold</strong> &amp; ünï</figcaption></figure>'
			. '<figure><img class="wp-block-themeisle-blocks-slider-item" src="https://example.com/b.jpg" alt="" data-id="13"></figure>'
			. '</amp-carousel>';
	}

	/**
	 * The block `id` cannot break out of the carousel `id` attribute.
	 */
	public function test_amp_slider_escapes_id_attribute(): void {
		$this->assertSame(
			$this->expected_carousel( 'x&quot; onmouseover=&quot;alert(1)' ),
			$this->render_slider( 'x" onmouseover="alert(1)' )
		);
	}

	/**
	 * Malformed markup must not stall the request in the HTML parser.
	 */
	public function test_amp_slider_parses_malformed_markup_quickly(): void {
		$malformed = str_repeat( 'x', 200000 ) . str_repeat( '<img src="a.jpg" alt=x"y"z/>', 16000 );

		$start  = microtime( true );
		$output = $this->render_slider( 'wp-block-themeisle-blocks-slider-1a2b3c', $malformed );

		$this->assertLessThan( 2, microtime( true ) - $start );
		$this->assertSame( 2, substr_count( $output, '<figure>' ) );
	}
}
