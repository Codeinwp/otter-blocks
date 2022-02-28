<?php
/**
 * Woo_Comparison_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class Woo_Comparison_Block
 */
class Woo_Comparison_Block {
	/**
	 * Flag to mark that we can render the custom meta fields from ACF.
	 *
	 * @var bool $should_render Should we render the custom meta fields from ACF?
	 */
	public static $should_render = true;

	/**
	 * Woo_Comparison_Block constructor.
	 *
	 * @since   1.7.0
	 * @access  public
	 */
	public function __construct() {
		if (
			! 'valid' === apply_filters( 'product_neve_license_status', false ) ||
			true !== apply_filters( 'neve_has_block_editor_module', false ) ||
			! class_exists( 'WooCommerce' ) ||
			! class_exists( '\Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\View\Table' ) ||
			(
				class_exists( '\Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\Options' ) && true !== boolval( \Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\Options::is_module_activated() )
			)
		) {
			self::$should_render = false;
			return;
		}

		if ( is_admin() && class_exists( '\Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\Main' ) ) {
			wp_enqueue_style( 'neve-woocommerce', NEVE_ASSETS_URL . 'css/woocommerce' . ( ( NEVE_DEBUG ) ? '' : '.min' ) . '.css', array( 'woocommerce-general' ), apply_filters( 'neve_version_filter', NEVE_VERSION ) );

			$table = new \Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\Main();

			if ( method_exists( $table, 'enqueue_assets' ) ) {
				$table->enqueue_assets();
			}
		}

		if ( is_admin() && class_exists( '\Neve_Pro\Modules\Woocommerce_Booster\Module' ) ) {
			$module = new \Neve_Pro\Modules\Woocommerce_Booster\Module();
			add_action( 'admin_enqueue_scripts', array( $module, 'enqueue_scripts' ) );
		}
	}

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 *
	 * @return mixed|string
	 */
	public function render( $attributes ) {
		if ( ! self::$should_render && 0 < count( $attributes['products'] ) ) {
			return;
		}

		$default_fields = array();

		if ( class_exists( '\Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\Fields' ) ) {
			$fields         = new \Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\Fields();
			$default_fields = wp_json_encode( array_keys( ( $fields->get_fields() ) ) );
		}

		$defaults = array(
			'listingType' => get_theme_mod( 'neve_comparison_table_product_listing_type', 'column' ),
			'altRow'      => get_theme_mod( 'neve_comparison_table_enable_alternating_row_bg_color', false ),
			'fields'      => get_theme_mod( 'neve_comparison_table_fields', $default_fields ),
			'rowColor'    => get_theme_mod( 'neve_comparison_table_rows_background_color', 'var(--nv-site-bg)' ),
			'headerColor' => get_theme_mod( 'neve_comparison_table_header_text_color', 'var(--nv-text-color)' ),
			'textColor'   => get_theme_mod( 'neve_comparison_table_text_color', 'var(--nv-text-color)' ),
			'borderColor' => get_theme_mod( 'neve_comparison_table_borders_color', '#BDC7CB' ),
			'altRowColor' => get_theme_mod( 'neve_comparison_table_alternate_row_bg_color', 'var(--nv-light-bg)' ),
		);

		$attributes = array_merge( $defaults, array_filter( $attributes ) );

		ob_start();
		$table = new \Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\View\Table();

		$_GET['is_woo_comparison_block'] = true;
		$_GET['product_ids']             = $attributes['products'];
		$table->render_comparison_products_table( false, true, $attributes );

		$id    = isset( $attributes['id'] ) ? $attributes['id'] : 'wp-block-themeisle-blocks-woo-comparison-' . wp_rand( 10, 100 );
		$class = 'nv-ct-enabled nv-ct-comparison-table-content woocommerce';

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'id'    => $id,
				'class' => $class,
			)
		);

		$output  = '<div ' . $wrapper_attributes . '>';
		$output .= ob_get_contents();
		$output .= '</div>';
		ob_end_clean();
		return $output;
	}
}
