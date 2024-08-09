<?php
/**
 * Class Modal_CSS.
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\OtterPro\Render;

use ThemeIsle\OtterPro\Plugins\License;

/**
 * Class Modal_CSS.
 *
 * This class handles the CSS for the modal block.
 */
class Modal_Block {

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array     $attributes The block attributes.
	 * @param array     $content The saved content.
	 * @param \WP_Block $block The parsed block.
	 * 
	 * @return mixed|string
	 */
	public function render( $attributes, $content, $block ) {

		if ( ! License::has_active_license() ) {
			return '';
		}

		if ( empty( $attributes['trigger'] ) ) {
			$attributes['trigger'] = 'onClick';
		}

		$container_tag = '<div ';
		if ( ! empty( $attributes['id'] ) ) {
			$container_tag .= 'id="' . esc_attr( $attributes['id'] ) . '" ';
		}

		$classes = array( 'wp-block-themeisle-blocks-modal', 'is-active', 'is-front' );

		if ( ! empty( $attributes['className'] ) ) {
			$classes[] = esc_attr( $attributes['className'] );
		}

		if ( ! empty( $attributes['closeButtonType'] ) && 'outside' === $attributes['closeButtonType'] ) {
			$classes[] = 'with-outside-button';
		}

		$container_tag .= 'class="' . ( implode( ' ', $classes ) ) . '" ';
		$container_tag .= 'data-open="' . esc_attr( $attributes['trigger'] ) . '" ';
	
		if ( 'onClick' === $attributes['trigger'] ) {
			$container_tag .= 'data-anchor="' . ( ! empty( $attributes['anchor'] ) ? esc_attr( $attributes['anchor'] ) : '' ) . '" ';
		}

		if ( ! empty( $attributes['recurringClose'] ) ) {
			$container_tag .= 'data-dismiss="' . ( ! empty( $attributes['recurringTime'] ) ? esc_attr( $attributes['recurringTime'] ) : '' ) . '" ';
		}

		if ( ! empty( $attributes['outsideClose'] ) ) {
			$container_tag .= 'data-outside="' . esc_attr( $attributes['outsideClose'] ) . '" ';
		}

		if ( ! empty( $attributes['anchorClose'] ) ) {
			$container_tag .= 'data-anchorclose="' . esc_attr( $attributes['closeAnchor'] ) . '" ';
		}

		if ( ! empty( $attributes['lockScrolling'] ) ) {
			$container_tag .= 'data-lock-scrolling="1" ';
		}

		if ( ! empty( $attributes['disableOn'] ) ) {
			$container_tag .= 'data-disable-on="' . esc_attr( $attributes['disableOn'] ) . '" ';
		}

		$container_tag .= '>';

		$modal_wrap  = '<div class="otter-popup__modal_wrap">';
		$modal_wrap .= '<div role="presentation" class="otter-popup__modal_wrap_overlay"></div>';

		$modal_content = '<div class="otter-popup__modal_content">';
		if ( ! empty( $attributes['showClose'] ) ) {
			$modal_content .= '<div class="otter-popup__modal_header">';
			$modal_content .= '<button type="button" class="components-button has-icon">';
			$modal_content .= '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true">';
			$modal_content .= '<path d="M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z"></path>';
			$modal_content .= '</svg>';
			$modal_content .= '</button>';
			$modal_content .= '</div>';
		}

		$modal_content .= '<div class="otter-popup__modal_body">';
		foreach ( $block->inner_blocks as $inner_block ) {
			$modal_content .= $inner_block->render();
		}
		$modal_content .= '</div>'; // Close otter-popup__modal_body.
		$modal_content .= '</div>'; // Close otter-popup__modal_content.

		$modal_wrap .= $modal_content;
		$modal_wrap .= '</div>'; // Close otter-popup__modal_wrap.

		$container_tag .= $modal_wrap;
		$container_tag .= '</div>'; // Close container tag.

		return $container_tag;
	}
}
