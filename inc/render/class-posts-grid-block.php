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

		$uri = esc_url_raw( $_SERVER['REQUEST_URI'] );

		if ( preg_match( '#/page/(\d+)$#', $uri, $matches ) ) {
			$page_number = intval( $matches[1] );
		} else {
			$page_number = 1;
		}

		$offset = ( $page_number - 1 ) * $attributes['postsToShow'] + $attributes['offset'];

		$categories = 0;

		if ( isset( $attributes['categories'] ) ) {
			$cats = array();

			foreach ( $attributes['categories'] as $category ) {
				array_push( $cats, $category['id'] );
			}

			$categories = join( ', ', $cats );
		}

		$base_query_args = array(
			'numberposts'      => $attributes['postsToShow'],
			'post_status'      => 'publish',
			'order'            => $attributes['order'],
			'orderby'          => $attributes['orderBy'],
			'offset'           => $offset,
			'category'         => $categories,
			'suppress_filters' => false,
		);

		$query_args = apply_filters(
			'themeisle_gutenberg_posts_block_query',
			$base_query_args,
			$attributes
		);

		$total_posts  = 0;
		$recent_posts = $this->get_posts( $query_args, $attributes, $total_posts );

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
			$thumbnail = wp_get_attachment_image_src( get_post_thumbnail_id( $id ), $size );

			$list_items_markup .= '<div class="o-posts-grid-post-blog o-posts-grid-post-plain"><div class="o-posts-grid-post">';

			if ( isset( $attributes['displayFeaturedImage'] ) && $attributes['displayFeaturedImage'] ) {
				if ( $thumbnail ) {
					$list_items_markup .= sprintf(
						'<div class="o-posts-grid-post-image"><a href="%1$s">%2$s</a></div>',
						esc_url( get_the_permalink( $id ) ),
						wp_get_attachment_image( get_post_thumbnail_id( $id ), $size )
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
			'<div %1$s id="%2$s">%3$s<div class="%4$s">%5$s</div> %6$s</div>',
			$wrapper_attributes,
			isset( $attributes['id'] ) ? $attributes['id'] : '',
			isset( $attributes['enableFeaturedPost'] ) && $attributes['enableFeaturedPost'] && isset( $recent_posts[0] ) ? $this->render_featured_post( $recent_posts[0], $attributes ) : '',
			trim( $class ),
			$list_items_markup,
			$this->render_pagination( $uri, $page_number, ceil( $total_posts / $attributes['postsToShow'] ) )
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
						$post_author = intval( get_post_field( 'post_author', $id ) );

						$posted_on .= sprintf(
							'%1$s <a href="%2$s">%3$s</a>',
							__( 'by', 'otter-blocks' ),
							esc_url( get_author_posts_url( $post_author ) ),
							esc_html( get_the_author_meta( 'display_name', $post_author ) )
						);
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
		$thumbnail = wp_get_attachment_image( get_post_thumbnail_id( $id ), $size );

		if ( $thumbnail ) {
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

	/**
	 * Get posts to display.
	 *
	 * @param array $args Query args.
	 * @param array $attributes Blocks attrs.
	 * @param int   $total_posts Total posts.
	 * @return array|array[]|int[]|null[]|\WP_Post[] Posts.
	 */
	protected function get_posts( $args, $attributes, &$total_posts ) {

		$posts               = array();
		$fetch_only_products = false;

		if ( isset( $args['post_type'] ) && in_array( 'product', $args['post_type'] ) && function_exists( 'wc_get_products' ) ) {

			$copy_args = json_decode( wp_json_encode( $args ), true );
			unset( $copy_args['post_type'] );

			// Remove 'product' from $args['post_type'] so that get_posts() doesn't complain about an invalid post type.
			$args['post_type'] = array_diff( $args['post_type'], array( 'product' ) );

			if ( empty( $args['post_type'] ) ) {
				$fetch_only_products = true;
			}

			$categories = array();
			if ( isset( $attributes['categories'] ) ) {
				foreach ( $attributes['categories'] as $category ) {
					if ( isset( $category['slug'] ) ) {
						array_push( $categories, $category['slug'] );
					}
				}
				$copy_args['category'] = $categories;
			}


			$products = wc_get_products( $args );
			foreach ( $products as $product ) {
				$posts[] = $product->get_id();
			}

			$count_args = array(
				'limit'            => -1,
				'post_status'      => 'publish',
				'order'            => $attributes['order'],
				'orderby'          => $attributes['orderBy'],
				'category'         => $categories,
				'suppress_filters' => false,
				'return'           => 'ids',
			);

			$query        = new \WC_Product_Query( $count_args );
			$total_posts += count( $query->get_products() );
		}

		if ( ! $fetch_only_products ) {
			$posts = array_merge( $posts, get_posts( $args ) );

			unset( $args['offset'] );
			unset( $args['numberposts'] );
			$args['posts_per_page'] = -1;
			$args['fields']         = 'ids';

			$total_posts += ( new \WP_Query( $args ) )->found_posts;
		}

		return $posts;
	}

	/**
	 * Render the pagination.
	 *
	 * @param string $url The url.
	 * @param int    $page_number The page number.
	 * @param int    $total_pages The total pages.
	 * @return string
	 */
	protected function render_pagination( $url, $page_number, $total_pages ) {

		// Remove the page number from the url.
		$url = preg_replace( '#page/\d+#', '', $url );

		$output = '<div class="o-posts-grid-pag">';

		if ( $page_number > 1 ) {
			$output .= '<div class="o-posts-grid-pag-btn">';
			$output .= '<a href="' . $url . '/page/' . ( $page_number - 1 ) . '">';
			$output .= __( 'Prev', 'otter-blocks' );
			$output .= '</a>';
			$output .= '</div>';
		}

		$current_btn  = 1;
		$skip 	      = false;
		$skip_trigger = 5;

		while ( $current_btn <= $total_pages && ! $skip ) {
			$output .= '<div class="o-posts-grid-pag-btn"' . ( $current_btn === $page_number ? ' aria-current="page"' : '' ) . '>';
			$output .= '<a href="' . $url . 'page/' . $current_btn . '">';
			$output .= $current_btn;
			$output .= '</a>';
			$output .= '</div>';
			$current_btn++;

			if ( $current_btn > $skip_trigger && ! $skip ) {
				$current_btn = $total_pages - 1;
				$skip        = true;
			}
		}

		if ( $skip ) {
			$output .= '...';
			$output .= '<div class="o-posts-grid-pag-btn">';
			$output .= '<a href="' . $url . 'page/' . $current_btn . '">';
			$output .= $total_pages;
			$output .= '</a>';
			$output .= '</div>';
		}

		if ( $page_number < $total_pages ) {
			$output .= '<div class="o-posts-grid-pag-btn">';
			$output .= '<a href="' . $url . 'page/' . ( $page_number + 1 ) . '">';
			$output .= __( 'Next', 'otter-blocks' );
			$output .= '</a>';
			$output .= '</div>';
		}

		$output .= '</div>';

		return $output;
	}
}
