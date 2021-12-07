<?php
/**
 * Product_Short_Description_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

use ThemeIsle\GutenbergBlocks\Base_Block;

/**
 * Class Product_Short_Description_Block
 */
class Product_Short_Description_Block extends Base_Block {

	/**
	 * Every block needs a slug, so we need to define one and assign it to the `$this->block_slug` property
	 *
	 * @return mixed
	 */
	protected function set_block_slug() {
		$this->block_slug = 'product-short-description';
	}

	/**
	 * Set the attributes required on the server side.
	 *
	 * @return mixed
	 */
	protected function set_attributes() {
		$this->attributes = array();
	}

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 * @return mixed|string
	 */
	protected function render( $attributes ) {
		if ( ! 'valid' === apply_filters( 'product_neve_license_status', false ) || ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		ob_start();
		global $post;

		$short_description = apply_filters( 'woocommerce_short_description', $post->post_excerpt );
		
		if ( ! $short_description ) {
			return;
		}
		
		?>
		<div class="woocommerce-product-details__short-description">
			<?php echo $short_description; // WPCS: XSS ok. ?>
		</div>
		<?php
		$output = ob_get_clean();
		return $output;
	}
}
