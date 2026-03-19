<?php
$icon = $attributes['icon'] ?? '';

if ( ! $icon ) {
	return;
}

$svg_path = plugin_dir_path( __FILE__ ) . '../../../../assets/atomic-wind/icons/' . sanitize_file_name( $icon ) . '.svg';

if ( ! file_exists( $svg_path ) ) {
	return;
}

$svg           = file_get_contents( $svg_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
$wrapper_attrs = get_block_wrapper_attributes();

echo preg_replace( '/<svg\b/', '<svg ' . $wrapper_attrs, $svg, 1 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
