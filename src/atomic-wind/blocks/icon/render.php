<?php
/**
 * Render the icon block.
 * 
 * @package ThemeIsle\GutenbergBlocks
 */

$icon = isset( $attributes['icon'] ) ? $attributes['icon'] : '';

if ( ! $icon ) {
	return;
}

$svg_path = OTTER_BLOCKS_PATH . '/assets/atomic-wind/icons/' . sanitize_file_name( $icon ) . '.svg';

if ( ! is_file( $svg_path ) ) {
	return;
}

if ( function_exists( 'wpcom_vip_file_get_contents' ) ) {
	$svg = wpcom_vip_file_get_contents( $svg_path );
} else {
	$svg = file_get_contents( $svg_path ); // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
}

if ( ! $svg ) {
	return;
}

$wrapper_attrs = get_block_wrapper_attributes();

// Safe: SVG loaded from plugin-bundled Lucide icons; path is sanitize_file_name + is_file guarded.
echo preg_replace( '/<svg\b/', '<svg ' . $wrapper_attrs, $svg, 1 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
