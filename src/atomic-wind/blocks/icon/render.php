<?php
/**
 * Render the icon block.
 *
 * @package ThemeIsle\GutenbergBlocks
 */

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

$icon = isset( $attributes['icon'] ) ? $attributes['icon'] : '';

if ( ! $icon || ! isset( $aw_icons_map[ $icon ] ) ) {
	return;
}

$wrapper_attrs = get_block_wrapper_attributes();

// Safe: inner markup from plugin-bundled Lucide icons only.
echo '<svg ' . $wrapper_attrs . ' viewBox="0 0 24 24" fill="none" stroke="currentColor" ' // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	. 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
	. $aw_icons_map[ $icon ] // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	. '</svg>';
