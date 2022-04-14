<?php
/**
 * Pro Support.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Pro
 */
class Pro {
	/**
	 * Singleton.
	 *
	 * @var Pro Class object.
	 */
	protected static $instance = null;

	/**
	 * Method to define hooks needed.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function init() {
		if ( self::is_pro_active() ) {
			return;
		}

		add_action( 'add_meta_boxes', array( $this, 'register_metabox' ) );
	}

	/**
	 * Check if Otter Pro is available
	 * 
	 * @since   2.0.0
	 * @access  public
	 * @return  bool
	 */
	public static function is_pro_installed() {
		return class_exists( '\ThemeIsle\OtterPro\Main' ) && defined( 'OTTER_PRO_VERSION' );
	}

	/**
	 * Check if Otter Pro is active
	 * 
	 * @since   2.0.0
	 * @access  public
	 * @return  bool
	 */
	public static function is_pro_active() {
		return self::is_pro_installed() && 'valid' === apply_filters( 'product_otter_license_status', false );
	}

	/**
	 * Get Otter Pro URL
	 * 
	 * @since   2.0.0
	 * @access  public
	 * @return  string
	 */
	public static function get_url() {
		return 'https://themeisle.com/plugins/otter-blocks';
	}


	/**
	 * Get Otter Docs URL
	 * 
	 * @since   2.0.0
	 * @access  public
	 * @return  string
	 */
	public static function get_docs_url() {
		return 'https://docs.themeisle.com/article/1478-otter-blocks-documentation';
	}

	/**
	 * Register Metabox
	 * 
	 * @param string $post_type Post type.
	 *
	 * @since   2.0.0
	 * @access  public
	 */
	public function register_metabox( $post_type ) {
		add_meta_box(
			'otter_woo_builder',
			__( 'WooCommerce Builder by Otter', 'otter-blocks' ),
			array( $this, 'render_metabox_upsell' ),
			'product',
			'side',
			'high'
		);
	}

	/**
	 * Render Metabox
	 * 
	 * @param string $post_type Post type.
	 * 
	 * @since   2.0.0
	 * @access  public
	 */
	public function render_metabox_upsell( $post_type ) {
		if ( ! self::is_pro_installed() ) {
			?>
			<div class="clear">
				<p><?php _e( 'Unlock the full power of WooCommerce Builder with Otter Pro.', 'otter-blocks' ); ?></p>

				<a href="<?php echo esc_url( self::get_url() ); ?>" target="_blank" class="button button-primary">
					<?php _e( 'Get Otter Pro', 'otter-blocks' ); ?>
				</a>
			</div>
			<?php
			return;
		}

		?>
		<div class="clear">
			<p><?php _e( 'Unlock the full power of WooCommerce Builder by activating Otter Pro license.', 'otter-blocks' ); ?></p>

			<a href="<?php echo esc_url( admin_url( 'options-general.php?page=otter' ) ); ?>" target="_blank" class="button button-primary">
				<?php _e( 'Activate License', 'otter-blocks' ); ?>
			</a>
		</div>
		<?php
	}

	/**
	 * Singleton method.
	 *
	 * @static
	 *
	 * @return  GutenbergBlocks
	 * @since   1.0.0
	 * @access  public
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access  public
	 * @return  void
	 * @since   1.0.0
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access  public
	 * @return  void
	 * @since   1.0.0
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0.0' );
	}
}
