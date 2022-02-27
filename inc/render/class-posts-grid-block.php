<?php
/**
 * Grid block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class Posts_Grid_Block
 */
class Posts_Grid_Block {

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
		$categories = 0;

		if ( isset( $attributes['categories'] ) ) {
			$cats = array();

			foreach ( $attributes['categories'] as $category ) {
				array_push( $cats, $category['id'] );
			}

			$categories = join( ', ', $cats );
		}

		$get_custom_post_types_posts = function ( $post_type ) use ( $attributes, $categories ) {
			return wp_get_recent_posts(
				apply_filters(
					'themeisle_gutenberg_posts_block_query',
					array(
						'post_type'        => $post_type,
						'numberposts'      => $attributes['postsToShow'],
						'post_status'      => 'publish',
						'order'            => $attributes['order'],
						'orderby'          => $attributes['orderBy'],
						'offset'           => $attributes['offset'],
						'category'         => $categories,
						'suppress_filters' => false,
					),
					$attributes
				)
			);
		};


		$recent_posts = ( isset( $attributes['postTypes'] ) && 0 < count( $attributes['postTypes'] ) ) ? array_merge( ...array_map( $get_custom_post_types_posts, $attributes['postTypes'] ) ) : wp_get_recent_posts(
			apply_filters(
				'themeisle_gutenberg_posts_block_query',
				array(
					'numberposts'      => $attributes['postsToShow'],
					'post_status'      => 'publish',
					'order'            => $attributes['order'],
					'orderby'          => $attributes['orderBy'],
					'offset'           => $attributes['offset'],
					'category'         => $categories,
					'suppress_filters' => false,
				),
				$attributes
			)
		);

		$list_items_markup = '';

		foreach ( $recent_posts as $post ) {
			$id        = $post['ID'];
			$size      = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'medium';
			$thumbnail = wp_get_attachment_image_src( get_post_thumbnail_id( $id ), $size );
			$category  = get_the_category( $id );

			$list_items_markup .= '<div class="wp-block-themeisle-blocks-posts-grid-post-blog wp-block-themeisle-blocks-posts-grid-post-plain"><div class="wp-block-themeisle-blocks-posts-grid-post">';

			if ( isset( $attributes['displayFeaturedImage'] ) && $attributes['displayFeaturedImage'] ) {
				if ( $thumbnail ) {
					$list_items_markup .= sprintf(
						'<div class="wp-block-themeisle-blocks-posts-grid-post-image"><a href="%1$s">%2$s</a></div>',
						esc_url( get_the_permalink( $id ) ),
						wp_get_attachment_image( get_post_thumbnail_id( $id ), $size ),
						esc_html( get_the_title( $id ) )
					);
				}
			}

			$list_items_markup .= '<div class="wp-block-themeisle-blocks-posts-grid-post-body' . ( $thumbnail && $attributes['displayFeaturedImage'] ? '' : ' is-full' ) . '">';

			foreach ( $attributes['template'] as $element ) {
				if ( 'category' === $element ) {
					if ( isset( $attributes['displayCategory'] ) && isset( $category[0] ) && $attributes['displayCategory'] ) {
						$list_items_markup .= sprintf(
							'<span class="wp-block-themeisle-blocks-posts-grid-post-category">%1$s</span>',
							esc_html( $category[0]->cat_name )
						);
					}
				}

				if ( 'title' === $element ) {
					if ( isset( $attributes['displayTitle'] ) && $attributes['displayTitle'] ) {
						$list_items_markup .= sprintf(
							'<%1$s class="wp-block-themeisle-blocks-posts-grid-post-title"><a href="%2$s">%3$s</a></%1$s>',
							esc_attr( $attributes['titleTag'] ),
							esc_url( get_the_permalink( $id ) ),
							esc_html( get_the_title( $id ) )
						);
					}
				}

				if ( 'meta' === $element ) {
					if ( ( isset( $attributes['displayMeta'] ) && $attributes['displayMeta'] ) && ( ( isset( $attributes['displayDate'] ) && $attributes['displayDate'] ) || ( isset( $attributes['displayAuthor'] ) && $attributes['displayAuthor'] ) ) ) {
						$list_items_markup .= '<p class="wp-block-themeisle-blocks-posts-grid-post-meta">';

						if ( isset( $attributes['displayDate'] ) && $attributes['displayDate'] ) {
							$list_items_markup .= sprintf(
								'%1$s <time datetime="%2$s">%3$s</time> ',
								__( 'on', 'otter-blocks' ),
								esc_attr( get_the_date( 'c', $id ) ),
								esc_html( get_the_date( get_option( 'date_format' ), $id ) )
							);
						}

						if ( isset( $attributes['displayAuthor'] ) && $attributes['displayAuthor'] ) {
							$list_items_markup .= sprintf(
								'%1$s %2$s',
								__( 'by', 'otter-blocks' ),
								get_the_author_meta( 'display_name', get_post_field( 'post_author', $id ) )
							);
						}

						$list_items_markup .= '</p>';
					}
				}

				if ( 'description' === $element ) {
					if ( ( isset( $attributes['excerptLength'] ) && $attributes['excerptLength'] > 0 ) && ( isset( $attributes['displayDescription'] ) && $attributes['displayDescription'] ) ) {
						$list_items_markup .= sprintf(
							'<p class="wp-block-themeisle-blocks-posts-grid-post-description">%1$s</p>',
							$this->get_excerpt_by_id( $id, $attributes['excerptLength'] )
						);
					}
				}
			}

			$list_items_markup .= '</div></div></div>';
		}

		$class = '';

		if ( isset( $attributes['align'] ) ) {
			$class .= ' align' . $attributes['align'];
		}

		if ( isset( $attributes['grid'] ) && true === $attributes['grid'] ) {
			$class .= ' is-grid';
		}

		if ( isset( $attributes['style'] ) ) {
			$class .= ' is-' . $attributes['style'];
		}

		if ( ( isset( $attributes['style'] ) && 'grid' === $attributes['style'] ) || ( isset( $attributes['grid'] ) && true === $attributes['grid'] ) ) {
			$class .= ' wp-block-themeisle-blocks-posts-grid-columns-' . $attributes['columns'];
		}

		if ( isset( $attributes['imageBoxShadow'] ) && true === $attributes['imageBoxShadow'] ) {
			$class .= ' has-shadow';
		}

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class' => trim( $class ),
			) 
		);

		$block_content = sprintf(
			'<div %1$s>%2$s</div>',
			$wrapper_attributes,
			$list_items_markup
		);

		return $block_content;
	}

	/**
	 * Get post excerpt
	 *
	 * @param int $post_id Post id.
	 * @param int $excerpt_length Excerpt size.
	 *
	 * @return string
	 */
	public function get_excerpt_by_id( $post_id, $excerpt_length = 200 ) {
		$excerpt = get_the_excerpt( $post_id );

		if ( mb_strlen( $excerpt ) > $excerpt_length ) {
			$excerpt = mb_substr( $excerpt, 0, $excerpt_length ) . '…';
		}

		return $excerpt;
	}
}
