<?php
/**
 * Map block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class Leaflet_Map_Block
 */
class Leaflet_Map_Block {

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Blocks attrs.
	 * @return mixed|string
	 */
	public function render( $attributes ) {
		if ( function_exists( 'is_amp_endpoint' ) && is_amp_endpoint() ) {
			$link = 'https://www.openstreetmap.org/export/embed.html?bbox=' . stripslashes( esc_attr( $attributes['bbox'] ) ) . '&amp;layer=mapnik';

			$output  = '<amp-iframe width="400" height="' . intval( $attributes['height'] ) . '" sandbox="allow-scripts allow-same-origin" layout="responsive" src="' . stripslashes( $link ) . '" style="border: 1px solid black">';
			$output .= '	<amp-img layout="fill" src="' . plugin_dir_url( __FILE__ ) . '../../assets/icons/map-standard.png" placeholder></amp-img>';
			$output .= '</amp-iframe>';

			return $output;
		}

		// Set the ID and the class name.
		$id    = isset( $attributes['id'] ) ? $attributes['id'] : 'wp-block-themeisle-blocks-map-' . wp_rand( 10, 100 );
		$class = '';
		$style = '';

		if ( isset( $attributes['height'] ) ) {
			$style .= 'height:' . esc_attr( $attributes['height'] . 'px;' );
		}

		if ( isset( $attributes['align'] ) ) {
			$class .= 'align' . esc_attr( $attributes['align'] );
		}

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'id'    => $id,
				'class' => $class,
				'style' => $style,
			)
		);

		// Load the attributes in the page and make a placeholder to render the map.
		$output  = '<div ' . $wrapper_attributes . '></div>' . "\n";
		$output .= '<script type="text/javascript">' . "\n";
		$output .= '	/* <![CDATA[ */' . "\n";
		$output .= '		if ( ! window.themeisleLeafletMaps ) window.themeisleLeafletMaps =[];' . "\n";
		$output .= '		window.themeisleLeafletMaps.push( { container: "' . $id . '", attributes: ' . wp_json_encode( $attributes ) . ' } );' . "\n";
		$output .= '	/* ]]> */' . "\n";
		$output .= '</script>' . "\n";

		return $output;
	}
}
