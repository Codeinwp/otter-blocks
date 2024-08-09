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
	 * @return string
	 */
	public function render( $attributes ) {

		$has_pagination = isset( $attributes['hasPagination'] ) && $attributes['hasPagination'];
		$page_number    = 1;
		$is_tiled       = isset( $attributes['className'] ) && false !== strpos( $attributes['className'], 'is-style-tiled' );

		if ( $has_pagination ) {
			if ( ! empty( get_query_var( 'page' ) ) || ! empty( get_query_var( 'paged' ) ) ) {
				$page_number = is_front_page() ? get_query_var( 'page' ) : get_query_var( 'paged' );
			}
		}

		$total_posts  = 0;
		$recent_posts = $this->retrieve_posts( $attributes, $has_pagination, $page_number, $total_posts );

		if ( isset( $attributes['featuredPostOrder'] ) && 'sticky-first' === $attributes['featuredPostOrder'] ) {

			$sticky_posts_id = get_option( 'sticky_posts' );

			if ( isset( $sticky_posts_id ) ) {
				$sticky_posts = array_filter(
					$recent_posts,
					function ( $x ) use ( $sticky_posts_id ) {
						return in_array( $x instanceof \WP_Post ? $x->ID : $x, $sticky_posts_id );
					}
				);

				$non_sticky_posts = array_filter(
					$recent_posts,
					function ( $x ) use ( $sticky_posts_id ) {
						return ! in_array( $x instanceof \WP_Post ? $x->ID : $x, $sticky_posts_id );
					}
				);

				$recent_posts = array_merge( $sticky_posts, $non_sticky_posts );
			}
		}

		$list_items_markup = '';

		foreach ( array_slice( $recent_posts, isset( $attributes['enableFeaturedPost'] ) && $attributes['enableFeaturedPost'] && isset( $recent_posts[0] ) ? 1 : 0 ) as $post ) {

			$id = $post instanceof \WP_Post ? $post->ID : $post;

			if ( isset( $attributes['featuredPost'] ) && $attributes['featuredPost'] === $id ) {
				continue;
			}

			$size      = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'medium';
			$thumb_id  = get_post_thumbnail_id( $id );
			$thumbnail = wp_get_attachment_image_src( $thumb_id, $size );
			$style     = '';

			if ( $is_tiled && $thumbnail ) {
				$style = sprintf(
					' style="background-image: url(%1$s); background-size: cover; background-position: center center;"',
					esc_url( $thumbnail[0] )
				);
			}

			$list_items_markup .= '<div class="o-posts-grid-post-blog o-posts-grid-post-plain"' . $style . '><div class="o-posts-grid-post">';

			if ( isset( $attributes['displayFeaturedImage'] ) && $attributes['displayFeaturedImage'] && ! $is_tiled ) {
				if ( $thumbnail ) {
					$image_alt = get_post_meta( $thumb_id, '_wp_attachment_image_alt', true );

					if ( ! $image_alt ) {
						$image_alt = get_the_title( $id );
					}

					$list_items_markup .= sprintf(
						'<div class="o-posts-grid-post-image"><a href="%1$s">%2$s</a></div>',
						esc_url( get_the_permalink( $id ) ),
						wp_get_attachment_image( $thumb_id, $size, false, array( 'alt' => $image_alt ) )
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

		$wrapper_attributes = get_block_wrapper_attributes();

		$block_content = sprintf(
			'<div %1$s id="%2$s">%3$s<div class="%4$s">%5$s</div> %6$s</div>',
			$wrapper_attributes,
			isset( $attributes['id'] ) ? esc_attr( $attributes['id'] ) : '',
			isset( $attributes['enableFeaturedPost'] ) && $attributes['enableFeaturedPost'] && isset( $recent_posts[0] ) ? $this->render_featured_post( $recent_posts[0], $attributes ) : '',
			esc_attr( trim( $class ) ),
			$list_items_markup,
			$has_pagination ? $this->render_pagination( $page_number, $total_posts ) : ''
		);

		return $block_content;
	}

	/**
	 * Render Post Fields
	 *
	 * @param \WP_Post|int $id Post ID.
	 * @param array        $attributes Blocks attrs.
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
						esc_url( get_category_link( $category[0]->term_id ) ),
						esc_html( $category[0]->name )
					);
				}
			}

			if ( 'title' === $element ) {
				if ( isset( $attributes['displayTitle'] ) && $attributes['displayTitle'] ) {
					$html .= $this->render_post_title( $attributes['titleTag'], get_the_permalink( $id ), get_the_title( $id ) );
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
						$post_author = intval( get_post_field( 'post_author', $id ) );

						$posted_by = sprintf(
							'%1$s <a href="%2$s">%3$s</a>',
							__( 'by', 'otter-blocks' ),
							esc_url( get_author_posts_url( $post_author ) ),
							esc_html( get_the_author_meta( 'display_name', $post_author ) )
						);

						$posted_on .= apply_filters( 'otter_blocks_posts_author', $posted_by );
					}

					$meta[] = $posted_on;

					if ( isset( $attributes['displayComments'] ) && $attributes['displayComments'] && $post->comment_count ) {
						$meta[] = sprintf(
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
								esc_html( $cat->name )
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
	 * @param \WP_Post|int $post Post.
	 * @param array        $attributes Blocks attrs.
	 *
	 * @return string
	 */
	protected function render_featured_post( $post, $attributes ) {
		$html      = '';
		$id        = $post instanceof \WP_Post ? $post->ID : $post;
		$size      = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'medium';
		$thumb_id  = get_post_thumbnail_id( $id );
		$image_alt = get_post_meta( $thumb_id, '_wp_attachment_image_alt', true );
		$style     = '';
		$image_url = wp_get_attachment_image_src( $thumb_id, $size );
		$is_tiled  = isset( $attributes['className'] ) && false !== strpos( $attributes['className'], 'is-style-tiled' );

		if ( ! $image_alt ) {
			$image_alt = get_the_title( $id );
		}

		$thumbnail = wp_get_attachment_image( $thumb_id, $size, false, array( 'alt' => $image_alt ) );

		if ( $image_url && ! $is_tiled ) {
			$html .= sprintf(
				'<div class="o-posts-grid-post-image"><a href="%1$s">%2$s</a></div>',
				esc_url( get_the_permalink( $id ) ),
				$thumbnail
			);
		}

		if ( $is_tiled && $image_url ) {
			$style = sprintf(
				' style="background-image: url(%1$s); background-size: cover; background-position: center center;"',
				esc_url( $image_url[0] )
			);
		}

		$html .= '<div class="o-posts-grid-post-body' . ( $thumbnail && $attributes['displayFeaturedImage'] ? '' : ' is-full' ) . '">';

		$html .= $this->get_post_fields( $id, $attributes );
		$html .= '</div>';
		return sprintf( '<div class="o-featured-container"><div class="o-featured-post"' . $style . '>%1$s</div></div>', $html );
	}

	/**
	 * Get posts to display.
	 *
	 * @param array $attributes Blocks attrs.
	 * @param bool  $count_posts Enable post count.
	 * @param int   $page_number Page number.
	 * @param int   $total_posts Total posts.
	 * @return array|int[]|null[]|\WP_Post[] Posts.
	 */
	protected function retrieve_posts( $attributes, $count_posts, $page_number, &$total_posts ) {

		$offset = ! empty( $attributes['offset'] ) ? $attributes['offset'] : 0;

		$categories = 0;

		if ( isset( $attributes['categories'] ) ) {
			$cats = array();

			foreach ( $attributes['categories'] as $category ) {
				$cats[] = $category['id'];
			}

			$categories = join( ', ', $cats );
		}

		$args = array(
			'post_type'        => $attributes['postTypes'],
			'posts_per_page'   => $attributes['postsToShow'],
			'post_status'      => 'publish',
			'order'            => $attributes['order'],
			'orderby'          => $attributes['orderBy'],
			'offset'           => $offset,
			'cat'              => $categories,
			'suppress_filters' => false,
			'no_found_rows'    => true,
		);

		if ( $count_posts ) {
			$args['offset']        = (int) $args['posts_per_page'] * ( (int) $page_number - 1 ) + (int) $args['offset'];
			$args['no_found_rows'] = false;
			$args['paged']         = $page_number;
		}

		// Handle the case when the post type is a WooCommerce product.
		if ( isset( $args['post_type'] ) && in_array( 'product', $args['post_type'] ) && function_exists( 'wc_get_products' ) ) {

			if ( isset( $attributes['categories'] ) ) {

				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				$args['tax_query'] = array();
				foreach ( $attributes['categories'] as $category ) {
					if ( isset( $category['slug'] ) ) {
						$args['tax_query'][] = array(
							'taxonomy' => 'product_cat',
							'field'    => 'slug',
							'terms'    => $category['slug'],
						);
					}
				}
				$args['tax_query']['relation'] = 'OR';
			}
		}

		$args = apply_filters(
			'themeisle_gutenberg_posts_block_query',
			$args,
			$attributes
		);

		$query = new \WP_Query( $args );

		if ( $count_posts ) {
			$total_posts += $query->max_num_pages;
		}

		return $query->posts;
	}

	/**
	 * Render the pagination.
	 *
	 * @param int $page_number The page number.
	 * @param int $total_pages The total pages.
	 * @return string
	 */
	protected function render_pagination( $page_number, $total_pages ) {
		$big  = 9999999;
		$base = str_replace( strval( $big ), '%#%', esc_url( get_pagenum_link( $big ) ) );

		$output  = '<div class="o-posts-grid-pag">';
		$output .= paginate_links(
			array(
				'base'      => $base,
				'format'    => '?paged=%#%',
				'current'   => $page_number,
				'total'     => $total_pages,
				'prev_text' => __( 'Prev', 'otter-blocks' ),
				'next_text' => __( 'Next', 'otter-blocks' ),
			)
		);
		$output .= '</div>';

		return $output;
	}

	/**
	 * Render the post title.
	 * 
	 * @param string $tag The html tag.
	 * @param string $post_url The post URL.
	 * @param string $post_title The post title.
	 * 
	 * @return string The rendered post title.
	 */
	public function render_post_title( $tag, $post_url, $post_title ) {

		$tag = sanitize_key( $tag );
		
		if ( ! in_array( $tag, array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ), true ) ) {
			$tag = 'h4';
		}

		return sprintf(
			'<%1$s class="o-posts-grid-post-title"><a href="%2$s">%3$s</a></%1$s>',
			$tag,
			esc_url( $post_url ),
			esc_html( $post_title )
		);
	}
}
