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
			return get_posts(
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

		$recent_posts = ( isset( $attributes['postTypes'] ) && 0 < count( $attributes['postTypes'] ) ) ? array_merge( ...array_map( $get_custom_post_types_posts, $attributes['postTypes'] ) ) : get_posts(
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

		if ( isset( $attributes['featuredPostOrder'] ) && 'sticky-first' === $attributes['featuredPostOrder'] ) {

			$sticky_posts_id = get_option( 'sticky_posts' );

			if ( isset( $sticky_posts_id ) ) {
				$sticky_posts = array_filter(
					$recent_posts,
					function ( $x ) use ( $sticky_posts_id ) {
						return in_array( $x instanceof WP_Post ? $x->ID : $x, $sticky_posts_id );
					}
				);
		
				$non_sticky_posts = array_filter(
					$recent_posts,
					function ( $x ) use ( $sticky_posts_id ) {
						return ! in_array( $x instanceof WP_Post ? $x->ID : $x, $sticky_posts_id );
					}
				);
		
				$recent_posts = array_merge( $sticky_posts, $non_sticky_posts );
			}
		}

		$list_items_markup = '';
	
		foreach ( array_slice( $recent_posts, isset( $attributes['enableFeaturedPost'] ) && $attributes['enableFeaturedPost'] && isset( $recent_posts[0] ) ? 1 : 0 ) as $post ) {

			$id = $post instanceof WP_Post ? $post->ID : $post;

			if ( isset( $attributes['featuredPost'] ) && $attributes['featuredPost'] === $id ) {
				continue;
			}

			$size      = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'medium';
			$thumbnail = wp_get_attachment_image_src( get_post_thumbnail_id( $id ), $size );

			$list_items_markup .= '<div class="o-posts-grid-post-blog o-posts-grid-post-plain"><div class="o-posts-grid-post">';

			if ( isset( $attributes['displayFeaturedImage'] ) && $attributes['displayFeaturedImage'] ) {
				if ( $thumbnail ) {
					$list_items_markup .= sprintf(
						'<div class="o-posts-grid-post-image"><a href="%1$s">%2$s</a></div>',
						esc_url( get_the_permalink( $id ) ),
						wp_get_attachment_image( get_post_thumbnail_id( $id ), $size ),
						esc_html( get_the_title( $id ) ) // This does nothing?
					);
				}
			}

			$list_items_markup .= '<div class="o-posts-grid-post-body' . ( $thumbnail && $attributes['displayFeaturedImage'] ? '' : ' is-full' ) . '">';

			$list_items_markup .= $this->get_post_fields( $id, $attributes );

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
			$class .= ' o-posts-grid-columns-' . $attributes['columns'];
		}

		if ( isset( $attributes['cropImage'] ) && true === $attributes['cropImage'] ) {
			$class .= ' o-crop-img';
		}

		$wrapper_attributes = get_block_wrapper_attributes();

		$block_content = sprintf(
			'<div %1$s id="%2$s">%3$s<div class="%4$s">%5$s</div> </div>',
			$wrapper_attributes,
			isset( $attributes['id'] ) ? $attributes['id'] : '',
			isset( $attributes['enableFeaturedPost'] ) && $attributes['enableFeaturedPost'] && isset( $recent_posts[0] ) ? $this->render_featured_post( $recent_posts[0], $attributes ) : '',
			trim( $class ),
			$list_items_markup
		);

		return $block_content;
	}

	/**
	 * Render Post Fields
	 *
	 * @param WP_Post $id Post ID.
	 * @param array   $attributes Blocks attrs.
	 *
	 * @return string
	 */
	public function get_post_fields( $id, $attributes ) {
		$html     = '';
		$post     = get_post( $id );
		$category = get_the_category( $id );

		foreach ( $attributes['template'] as $element ) {
			if ( 'category' === $element ) {
				if ( isset( $attributes['displayCategory'] ) && isset( $category[0] ) && $attributes['displayCategory'] ) {
					$html .= sprintf(
						'<span class="o-posts-grid-post-category"><a href="%1$s">%2$s</a></span>',
						esc_url( get_category_link( $category[0]->cat_ID ) ),
						esc_html( $category[0]->cat_name )
					);
				}
			}

			if ( 'title' === $element ) {
				if ( isset( $attributes['displayTitle'] ) && $attributes['displayTitle'] ) {
					$html .= sprintf(
						'<%1$s class="o-posts-grid-post-title"><a href="%2$s">%3$s</a></%1$s>',
						esc_attr( $attributes['titleTag'] ),
						esc_url( get_the_permalink( $id ) ),
						esc_html( get_the_title( $id ) )
					);
				}
			}

			if ( 'meta' === $element ) {
				if ( ( isset( $attributes['displayMeta'] ) && $attributes['displayMeta'] ) && ( ( isset( $attributes['displayDate'] ) && $attributes['displayDate'] ) || ( isset( $attributes['displayAuthor'] ) && $attributes['displayAuthor'] ) || ( isset( $attributes['displayComments'] ) && $attributes['displayComments'] ) || ( isset( $attributes['displayPostCategory'] ) && $attributes['displayPostCategory'] ) ) ) {
					$html .= '<p class="o-posts-grid-post-meta">';

					$meta      = array();
					$posted_on = '';

					if ( isset( $attributes['displayDate'] ) && $attributes['displayDate'] ) {
						if ( isset( $attributes['displayUpdatedDate'] ) && $attributes['displayUpdatedDate'] ) {
							$posted_on .= sprintf(
								'%1$s <time datetime="%2$s">%3$s</time> ',
								__( 'Updated on', 'otter-blocks' ),
								esc_attr( get_the_modified_date( 'c', $id ) ),
								esc_html( get_the_modified_date( get_option( 'date_format' ), $id ) )
							);
						} else {
							$posted_on .= sprintf(
								'%1$s <time datetime="%2$s">%3$s</time> ',
								__( 'Posted on', 'otter-blocks' ),
								esc_attr( get_the_date( 'c', $id ) ),
								esc_html( get_the_date( get_option( 'date_format' ), $id ) )
							);
						}
					}

					if ( isset( $attributes['displayAuthor'] ) && $attributes['displayAuthor'] ) {
						$posted_on .= sprintf(
							'%1$s <a href="%2$s">%3$s</a>',
							__( 'by', 'otter-blocks' ),
							esc_url( get_author_posts_url( get_post_field( 'post_author', $id ) ) ),
							esc_html( get_the_author_meta( 'display_name', get_post_field( 'post_author', $id ) ) )
						);
					}

					$meta[] = $posted_on;

					if ( isset( $attributes['displayComments'] ) && $attributes['displayComments'] && isset( $post->comment_count ) ) {
						$meta[] .= sprintf(
							'%1$s %2$s',
							$post->comment_count,
							'1' === $post->comment_count ? __( 'comment', 'otter-blocks' ) : __( 'comments', 'otter-blocks' )
						);
					}

					if ( isset( $attributes['displayPostCategory'] ) && $attributes['displayPostCategory'] && isset( $category[0] ) ) {
						$output = '';
						foreach ( $category as $cat ) {
							$separator = ', ';
							$output   .= sprintf(
								'<a href="%1$s">%2$s</a>',
								esc_url( get_category_link( $cat->term_id ) ),
								esc_html( $cat->cat_name )
							) . $separator;
						}

						$meta[] = trim( $output, $separator );
					}

					$html .= implode( ' / ', $meta );

					$html .= '</p>';
				}
			}

			if ( 'description' === $element ) {
				if ( ( isset( $attributes['displayDescription'] ) && $attributes['displayDescription'] ) || ( isset( $attributes['displayReadMoreLink'] ) && $attributes['displayReadMoreLink'] ) ) {
					$html .= '<div class="o-posts-grid-post-description">';

					if ( ( isset( $attributes['excerptLength'] ) && $attributes['excerptLength'] > 0 ) && ( isset( $attributes['displayDescription'] ) && $attributes['displayDescription'] ) ) {
						$html .= sprintf(
							'<p>%1$s</p>',
							esc_html( $this->get_excerpt_by_id( $id, $attributes['excerptLength'] ) )
						);
					}

					if ( isset( $attributes['displayReadMoreLink'] ) && $attributes['displayReadMoreLink'] ) {
						$html .= sprintf(
							'<a class="o-posts-read-more" href="%1$s">%2$s</a>',
							esc_url( get_the_permalink( $id ) ),
							__( 'Read More', 'otter-blocks' )
						);
					}

					$html .= '</div>';
				}
			}

			$html .= apply_filters( 'otter_blocks_posts_fields', '', $attributes, $id, $element );
		}

		return $html;
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
		$excerpt = wp_strip_all_tags( get_the_excerpt( $post_id ) );

		if ( mb_strlen( $excerpt ) > $excerpt_length ) {
			$excerpt = mb_substr( $excerpt, 0, $excerpt_length ) . '…';
		}

		return $excerpt;
	}

	/**
	 * Render the featured post
	 *
	 * @param WP_Post $post Post.
	 * @param array   $attributes Blocks attrs.
	 *
	 * @return string
	 */
	protected function render_featured_post( $post, $attributes ) {
		if ( ! isset( $post ) ) {
			return '';
		}

		$html = '';

		$id        = $post instanceof WP_Post ? $post->ID : $post;
		$size      = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'medium';
		$thumbnail = wp_get_attachment_image( get_post_thumbnail_id( $id ), $size );

		if ( isset( $thumbnail ) ) {
			$html .= sprintf(
				'<div class="o-posts-grid-post-image"><a href="%1$s">%2$s</a></div>',
				esc_url( get_the_permalink( $id ) ),
				$thumbnail
			);
		}

		$html .= '<div class="o-posts-grid-post-body' . ( $thumbnail && $attributes['displayFeaturedImage'] ? '' : ' is-full' ) . '">';

		$html .= $this->get_post_fields( $id, $attributes );
		$html .= '</div>';
		return sprintf( '<div class="o-featured-container"><div class="o-featured-post">%1$s</div></div>', $html );
	}
}
