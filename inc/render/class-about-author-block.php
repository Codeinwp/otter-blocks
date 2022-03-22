<?php
/**
 * About_Author_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class About_Author_Block
 */
class About_Author_Block {

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 * @return mixed|string
	 */
	public function render( $attributes ) {
		$img_markup = sprintf(
			'<a href="%1$s"><img src="%2$s" class="author-image" /></a>',
			esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
			esc_attr( get_avatar_url( get_the_author_meta( 'ID' ), array( 'size' => 130 ) ) )
		);

		$title_markup = sprintf(
			'<h4>%1$s</h4>',
			esc_html( get_the_author_meta( 'display_name' ) )
		);

		$content_markup = '';
		if ( ! empty( get_the_author_meta( 'description' ) ) ) {
			$content_markup = sprintf(
				'<p>%1$s</p>',
				esc_html( wp_strip_all_tags( get_the_author_meta( 'description' ) ) )
			);
		}

		return sprintf(
			'<section %1$s><div class="o-author-image">%2$s</div><div class="o-author-data">%3$s%4$s</div></section>',
			get_block_wrapper_attributes(),
			$img_markup,
			$title_markup,
			$content_markup
		);
	}
}
