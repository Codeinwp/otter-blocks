<?php
/**
 * Map block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class Google_Map_Block
 */
class Google_Map_Block {

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Blocks attrs.
	 *
	 * @return mixed|string
	 */
	public function render( $attributes ) {
		if ( function_exists( 'is_amp_endpoint' ) && is_amp_endpoint() ) {
			$apikey = get_option( 'themeisle_google_map_block_api_key' );

			// Don't output anything if there is no API key.
			if ( null === $apikey || empty( $apikey ) ) {
				return;
			}

			$output  = '<amp-iframe width="400" height="' . intval( $attributes['height'] ) . '" sandbox="allow-scripts allow-same-origin" layout="responsive" src="https://www.google.com/maps/embed/v1/place?key=' . esc_attr( $apikey ) . '&q=' . esc_attr( $attributes['latitude'] ) . ', ' . esc_attr( $attributes['longitude'] ) . '">';
			$output .= '	<amp-img layout="fill" src="' . plugin_dir_url( __FILE__ ) . '../../assets/icons/map-standard.png" placeholder></amp-img>';
			$output .= '</amp-iframe>';

			return $output;
		}

		$id    = isset( $attributes['id'] ) ? $attributes['id'] : 'wp-block-themeisle-blocks-google-map-' . wp_rand( 10, 100 );
		$class = '';
		$style = '';

		if ( isset( $attributes['align'] ) ) {
			$class .= 'align' . esc_attr( $attributes['align'] );
		}

		if ( isset( $attributes['height'] ) ) {
			$style .= 'height:' . esc_attr( is_numeric( $attributes['height'] ) ? $attributes['height'] . 'px' : $attributes['height'] );
		}

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class' => $class,
				'style' => $style,
			) 
		);

		$output  = '<div ' . $wrapper_attributes . ' id="' . esc_attr( $id ) . '"></div>' . "\n";
		$output .= '<script type="text/javascript">' . "\n";
		$output .= '	/* <![CDATA[ */' . "\n";
		$output .= '		if ( ! window.themeisleGoogleMaps ) window.themeisleGoogleMaps =[];' . "\n";
		$output .= '		window.themeisleGoogleMaps.push( { container: "' . $id . '", attributes: ' . wp_json_encode( $attributes ) . ' } );' . "\n";
		$output .= '	/* ]]> */' . "\n";
		$output .= '</script>' . "\n";

		return $output;
	}
}
