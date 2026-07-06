<?php
/**
 * Render the icon block.
 *
 * @package ThemeIsle\GutenbergBlocks
 */

if ( ! function_exists( 'otter_atomic_wind_svg_allowed_tags' ) ) {
	/**
	 * Get the custom SVG tag allowlist.
	 *
	 * @return array<string, bool>
	 */
	function otter_atomic_wind_svg_allowed_tags() {
		static $allowed = null;

		if ( null === $allowed ) {
			$allowed = array_fill_keys(
				array(
					'svg',
					'g',
					'path',
					'circle',
					'rect',
					'line',
					'polyline',
					'polygon',
					'ellipse',
					'defs',
					'clippath',
					'mask',
					'lineargradient',
					'radialgradient',
					'stop',
					'title',
					'desc',
					'text',
					'tspan',
				),
				true
			);
		}

		return $allowed;
	}
}

if ( ! function_exists( 'otter_atomic_wind_svg_allowed_attributes' ) ) {
	/**
	 * Get the custom SVG attribute allowlist.
	 *
	 * @return array<string, bool>
	 */
	function otter_atomic_wind_svg_allowed_attributes() {
		static $allowed = null;

		if ( null === $allowed ) {
			$allowed = array_fill_keys(
				array(
					'aria-hidden',
					'class',
					'clip-path',
					'clip-rule',
					'cx',
					'cy',
					'd',
					'dx',
					'dy',
					'fill',
					'fill-opacity',
					'fill-rule',
					'focusable',
					'font-family',
					'font-size',
					'font-weight',
					'fx',
					'fy',
					'gradienttransform',
					'gradientunits',
					'height',
					'id',
					'mask',
					'offset',
					'opacity',
					'points',
					'preserveaspectratio',
					'r',
					'role',
					'rx',
					'ry',
					'spreadmethod',
					'stop-color',
					'stop-opacity',
					'stroke',
					'stroke-dasharray',
					'stroke-dashoffset',
					'stroke-linecap',
					'stroke-linejoin',
					'stroke-miterlimit',
					'stroke-opacity',
					'stroke-width',
					'text-anchor',
					'transform',
					'viewbox',
					'width',
					'x',
					'x1',
					'x2',
					'xmlns',
					'y',
					'y1',
					'y2',
				),
				true
			);
		}

		return $allowed;
	}
}

if ( ! function_exists( 'otter_atomic_wind_is_safe_svg_attribute' ) ) {
	/**
	 * Validate a sanitized SVG attribute against the block allowlist.
	 *
	 * @param string $name  Attribute name.
	 * @param string $value Attribute value.
	 * @return bool
	 */
	function otter_atomic_wind_is_safe_svg_attribute( $name, $value ) {
		$lower_name  = strtolower( $name );
		$lower_value = html_entity_decode( strtolower( $value ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$allowed     = otter_atomic_wind_svg_allowed_attributes();

		if ( 0 === strpos( $lower_name, 'on' ) ) {
			return false;
		}

		if ( ! isset( $allowed[ $lower_name ] ) && 0 !== strpos( $lower_name, 'aria-' ) ) {
			return false;
		}

		if (
			false !== strpos( $lower_value, 'javascript:' ) ||
			false !== strpos( $lower_value, 'vbscript:' ) ||
			false !== strpos( $lower_value, 'data:' ) ||
			preg_match( '/expression\s*\(/i', $value )
		) {
			return false;
		}

		return ! preg_match( '/url\s*\(\s*[\'"]?(?!#)/i', $value );
	}
}

// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMDocument exposes camelCase properties.
if ( ! function_exists( 'otter_atomic_wind_clean_svg_attributes' ) ) {
	/**
	 * Remove unsupported attributes from an SVG element.
	 *
	 * @param DOMElement $element SVG element.
	 * @return void
	 */
	function otter_atomic_wind_clean_svg_attributes( $element ) {
		$attributes = array();

		foreach ( $element->attributes as $attribute ) {
			$attributes[] = $attribute;
		}

		foreach ( $attributes as $attribute ) {
			if ( ! otter_atomic_wind_is_safe_svg_attribute( $attribute->nodeName, $attribute->nodeValue ) ) {
				$element->removeAttribute( $attribute->nodeName );
			}
		}
	}
}

if ( ! function_exists( 'otter_atomic_wind_clean_svg_node' ) ) {
	/**
	 * Remove unsupported nodes from an SVG tree.
	 *
	 * @param DOMNode $node SVG node.
	 * @return void
	 */
	function otter_atomic_wind_clean_svg_node( $node ) {
		$allowed  = otter_atomic_wind_svg_allowed_tags();
		$children = array();

		foreach ( $node->childNodes as $child ) {
			$children[] = $child;
		}

		foreach ( $children as $child ) {
			if ( XML_ELEMENT_NODE === $child->nodeType ) {
				$tag_name = strtolower( $child->tagName );

				if ( ! isset( $allowed[ $tag_name ] ) ) {
					$node->removeChild( $child );
					continue;
				}

				otter_atomic_wind_clean_svg_attributes( $child );
				otter_atomic_wind_clean_svg_node( $child );
				continue;
			}

			if ( XML_TEXT_NODE !== $child->nodeType ) {
				$node->removeChild( $child );
			}
		}
	}
}

if ( ! function_exists( 'otter_atomic_wind_sanitize_custom_svg' ) ) {
	/**
	 * Sanitize and parse custom SVG block markup.
	 *
	 * @param string $svg_code Raw SVG code.
	 * @return array{attrs: array<string, string>, inner: string}|false
	 */
	function otter_atomic_wind_sanitize_custom_svg( $svg_code ) {
		if ( ! is_string( $svg_code ) ) {
			return false;
		}

		$svg_code = trim( $svg_code );
		if ( '' === $svg_code || 50000 < strlen( $svg_code ) || ! class_exists( 'DOMDocument' ) || ! class_exists( 'enshrined\svgSanitize\Sanitizer' ) ) {
			return false;
		}

		if ( false === stripos( $svg_code, '<svg' ) ) {
			return false;
		}

		$sanitizer = new \enshrined\svgSanitize\Sanitizer();
		$sanitizer->removeRemoteReferences( true );
		$sanitizer->removeXMLTag( true );
		$sanitizer->minify( true );

		$clean = $sanitizer->sanitize( $svg_code );
		if ( false === $clean || '' === trim( $clean ) ) {
			return false;
		}

		$document                     = new DOMDocument();
		$document->preserveWhiteSpace = false;
		$previous                     = libxml_use_internal_errors( true );
		$loaded                       = $document->loadXML( $clean, LIBXML_NONET );
		libxml_clear_errors();
		libxml_use_internal_errors( $previous );

		if ( ! $loaded || ! $document->documentElement || 'svg' !== strtolower( $document->documentElement->tagName ) ) {
			return false;
		}

		$root = $document->documentElement;
		otter_atomic_wind_clean_svg_attributes( $root );
		otter_atomic_wind_clean_svg_node( $root );

		$attrs = array();
		foreach ( $root->attributes as $attribute ) {
			$attrs[ $attribute->nodeName ] = $attribute->nodeValue;
		}

		$inner = '';
		foreach ( $root->childNodes as $child ) {
			$inner .= $document->saveXML( $child );
		}

		if ( '' === trim( $inner ) ) {
			return false;
		}

		return array(
			'attrs' => $attrs,
			'inner' => $inner,
		);
	}
}
// phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

if ( ! isset( $attributes ) || ! is_array( $attributes ) ) {
	return;
}

$use_custom_svg = ! empty( $attributes['customSvgEnabled'] );

if ( $use_custom_svg ) {
	$custom_svg = isset( $attributes['customSvg'] ) ? $attributes['customSvg'] : '';
	$clean_svg  = otter_atomic_wind_sanitize_custom_svg( $custom_svg );

	if ( ! $clean_svg ) {
		return;
	}

	$wrapper_attrs = get_block_wrapper_attributes( $clean_svg['attrs'] );

	echo '<svg ' . $wrapper_attrs . '>' . $clean_svg['inner'] . '</svg>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}

// Static cache: populated once per request from the bundled icons.json.
static $aw_icons_map = null;
if ( null === $aw_icons_map ) {
	$aw_icons_map = array();
	$json_path    = OTTER_BLOCKS_PATH . '/assets/atomic-wind/icons.json';

	if ( ! is_file( $json_path ) ) {
		return;
	}

	$content = function_exists( 'wpcom_vip_file_get_contents' )
		? wpcom_vip_file_get_contents( $json_path )
		: file_get_contents( $json_path ); // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown

	$decoded = $content ? json_decode( $content, true ) : null;
	if ( is_array( $decoded ) ) {
		$aw_icons_map = $decoded;
	}
}

$icon = isset( $attributes['icon'] ) ? $attributes['icon'] : 'circle';

if ( ! $icon || ! isset( $aw_icons_map[ $icon ] ) ) {
	$icon = 'circle';
}

if ( ! isset( $aw_icons_map[ $icon ] ) ) {
	return;
}

$wrapper_attrs = get_block_wrapper_attributes();

// Safe: inner markup from plugin-bundled Lucide icons only.
echo '<svg ' . $wrapper_attrs . ' viewBox="0 0 24 24" fill="none" stroke="currentColor" ' // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	. 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
	. $aw_icons_map[ $icon ] // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	. '</svg>';
