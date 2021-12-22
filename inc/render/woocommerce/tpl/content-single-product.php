<?php
/**
 * The template for displaying product content in the single-product.php template
 * 
 * @package WooCommerce
 */

defined( 'ABSPATH' ) || exit;

global $product;

do_action( 'woocommerce_before_single_product' );

if ( post_password_required() ) {
	echo get_the_password_form(); // WPCS: XSS ok.
	return;
}
?>
<div id="product-<?php the_ID(); ?>" <?php wc_product_class( '', $product ); ?>>

	<?php do_action( 'themeisle_gutenberg_woocommerce_content' ); ?>
</div>

<?php do_action( 'woocommerce_after_single_product' ); ?>
