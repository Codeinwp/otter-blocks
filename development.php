<?php
/**
 * Development Helpers.
 *
 * @package ThemeIsle
 */

// phpcs:ignoreFile

if ( ! defined( 'ENABLE_OTTER_PRO_DEV' ) ) {
	define( 'ENABLE_OTTER_PRO_DEV', true );
}

if ( ENABLE_OTTER_PRO_DEV && defined( 'WPINC' ) && class_exists( '\ThemeIsle\OtterPro\Main' ) ) {
	add_filter(
		'themeisle_sdk_products',
		function ( $products ) {
			$products[] = dirname( __FILE__ ) . '/plugins/otter-pro/otter-pro.php';
	
			return $products;
		}
	);
	
	add_filter(
		'themesle_sdk_namespace_' . md5( dirname( __FILE__ ) . '/plugins/otter-pro/otter-pro.php' ),
		function () {
			return 'otter';
		}
	);
	
	add_filter(
		'otter_pro_lc_no_valid_string',
		function ( $message ) {
			return str_replace( '<a href="%s">', '<a href="' . admin_url( 'options-general.php?page=otter' ) . '">', $message );
		}
	);
	
	add_filter( 'otter_pro_hide_license_field', '__return_true' );

	\ThemeIsle\OtterPro\Main::instance();

	if ( class_exists( '\ThemeIsle\OtterPro\Plugins\License' ) && ! ThemeIsle\OtterPro\Plugins\License::has_active_license() ) {
		add_action( 'init', function() {
			$license_file = dirname( __FILE__ )  . '/license.json';

			global $wp_filesystem;

			if ( ! is_file( $license_file ) ) {
				return false;
			}

			require_once ABSPATH . '/wp-admin/includes/file.php';

			\WP_Filesystem();

			$content = json_decode( $wp_filesystem->get_contents( $license_file ) );

			if ( ! is_object( $content ) ) {
				return false;
			}

			if ( ! isset( $content->key ) ) {
				return false;
			}

			$license_key = $content->key;

			apply_filters( 'themeisle_sdk_license_process_otter', $license_key, 'activate' );
		} );
	}
}
