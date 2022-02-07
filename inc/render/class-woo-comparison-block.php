<?php
/**
 * Woo_Comparison_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

use ThemeIsle\GutenbergBlocks\Base_Block;

/**
 * Class Woo_Comparison_Block
 */
class Woo_Comparison_Block extends Base_Block {
	/**
	 * Flag to mark that we can render the table.
	 *
	 * @var bool $should_render Should we render the table?
	 */
	public static $should_render = true;

	/**
	 * Woo_Comparison_Block constructor.
	 *
	 * @since   1.7.0
	 * @access  public
	 */
	public function __construct() {
		parent::__construct();

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
	 * Every block needs a slug, so we need to define one and assign it to the `$this->block_slug` property
	 *
	 * @return mixed
	 */
	protected function set_block_slug() {
		$this->block_slug = 'woo-comparison';
	}

	/**
	 * Set the attributes required on the server side.
	 *
	 * @return mixed
	 */
	protected function set_attributes() {
		$default_fields = array();

		if ( class_exists( '\Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\Fields' ) ) {
			$fields         = new \Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\Fields();
			$default_fields = wp_json_encode( array_keys( ( $fields->get_fields() ) ) );
		}

		$this->attributes = array(
			'id'          => array(
				'type' => 'string',
			),
			'className'   => array(
				'type' => 'string',
			),
			'products'    => array(
				'type'    => 'array',
				'default' => array(),
			),
			'listingType' => array(
				'type'    => 'string',
				'default' => get_theme_mod( 'neve_comparison_table_product_listing_type', 'column' ),
			),
			'altRow'      => array(
				'type'    => 'boolean',
				'default' => get_theme_mod( 'neve_comparison_table_enable_alternating_row_bg_color', false ),
			),
			'fields'      => array(
				'type'    => 'string',
				'default' => get_theme_mod( 'neve_comparison_table_fields', $default_fields ),
			),
			'rowColor'    => array(
				'type'    => 'string',
				'default' => get_theme_mod( 'neve_comparison_table_rows_background_color', 'var(--nv-site-bg)' ),
			),
			'headerColor' => array(
				'type'    => 'string',
				'default' => get_theme_mod( 'neve_comparison_table_header_text_color', 'var(--nv-text-color)' ),
			),
			'textColor'   => array(
				'type'    => 'string',
				'default' => get_theme_mod( 'neve_comparison_table_text_color', 'var(--nv-text-color)' ),
			),
			'borderColor' => array(
				'type'    => 'string',
				'default' => get_theme_mod( 'neve_comparison_table_borders_color', '#BDC7CB' ),
			),
			'altRowColor' => array(
				'type'    => 'string',
				'default' => get_theme_mod( 'neve_comparison_table_alternate_row_bg_color', 'var(--nv-light-bg)' ),
			),
		);
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
	protected function render( $attributes ) {
		if ( ! self::$should_render ) {
			return;
		}

		ob_start();
		$table = new \Neve_Pro\Modules\Woocommerce_Booster\Comparison_Table\View\Table();

		$_GET['is_woo_comparison_block'] = true;
		$_GET['product_ids']             = $attributes['products'];
		$table->render_comparison_products_table( false, true, $attributes );

		$id    = isset( $attributes['id'] ) ? $attributes['id'] : 'wp-block-themeisle-blocks-woo-comparison-' . wp_rand( 10, 100 );
		$class = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$class = 'wp-block-themeisle-blocks-woo-comparison nv-ct-enabled nv-ct-comparison-table-content woocommerce ' . esc_attr( $class );

		$output  = '<div id="' . $id . '" class="' . $class . '">';
		$output .= ob_get_contents();
		$output .= '</div>';
		ob_end_clean();
		return $output;
	}
}
