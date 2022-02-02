<?php
/**
 * Grid block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

use ThemeIsle\GutenbergBlocks\Base_Block;

/**
 * Class Posts_Grid_Block
 */
class Posts_Grid_Block extends Base_Block {

	/**
	 * Every block needs a slug, so we need to define one and assign it to the `$this->block_slug` property
	 */
	protected function set_block_slug() {
		$this->block_slug = 'posts-grid';
	}

	/**
	 * Set the attributes required on the server side.
	 */
	protected function set_attributes() {
		$this->attributes = array(
			'id'                   => array(
				'type'    => 'string',
			),
			'style'                => array(
				'type'    => 'string',
				'default' => 'grid',
			),
			'columns'              => array(
				'type'    => 'number',
				'default' => 3,
			),
			'template'             => array(
				'type'    => 'object',
				'default' => array(
					'category',
					'title',
					'meta',
					'description',
				),
			),
			'categories'           => array(
				'type'  => 'array',
				'items' => array(
					'type' => 'object',
				),
			),
			'postsToShow'          => array(
				'type'    => 'number',
				'default' => 5,
			),
			'order'                => array(
				'type'    => 'string',
				'default' => 'desc',
			),
			'orderBy'              => array(
				'type'    => 'string',
				'default' => 'date',
			),
			'offset'               => array(
				'type'    => 'number',
				'default' => 0,
			),
			'imageSize'            => array(
				'type'    => 'string',
				'default' => 'full',
			),
			'imageBoxShadow'       => array(
				'type'    => 'boolean',
				'default' => true,
			),
			'displayFeaturedImage' => array(
				'type'    => 'boolean',
				'default' => true,
			),
			'displayCategory'      => array(
				'type'    => 'boolean',
				'default' => true,
			),
			'displayTitle'         => array(
				'type'    => 'boolean',
				'default' => true,
			),
			'titleTag'             => array(
				'type'    => 'string',
				'default' => 'h5',
			),
			'displayMeta'          => array(
				'type'    => 'boolean',
				'default' => true,
			),
			'displayDescription'   => array(
				'type'    => 'boolean',
				'default' => true,
			),
			'excerptLength'        => array(
				'type'    => 'number',
				'default' => '200',
			),
			'displayDate'          => array(
				'type'    => 'boolean',
				'default' => true,
			),
			'displayAuthor'        => array(
				'type'    => 'boolean',
				'default' => true,
			),
			'displayComments'      => array(
				'type'    => 'boolean',
				'default' => true,
			),
			'displayPostCategory'  => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'displayReadMoreLink'  => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'enableCustomFontSize' => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'customFontSize'       => array(
				'type' => 'number',
			),
			'borderRadius'         => array(
				'type' => 'number',
			),
			'cropImage'            => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'textAlign'            => array(
				'type' => 'string',
			),
			'verticalAlign'        => array(
				'type' => 'string',
			),
		);
	}

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Blocks attrs.
	 * @return mixed|string
	 */
	protected function render( $attributes ) {
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

		$recent_posts = isset( $attributes['postTypes'] ) ? array_merge( ...array_map( $get_custom_post_types_posts, $attributes['postTypes'] ) ) : wp_get_recent_posts(
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
						esc_html( get_the_title( $id ) ) // This does nothing?
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

						if ( isset( $attributes['displayPostCategory'] ) && $attributes['displayPostCategory'] && isset( $category[0] ) ) {
							$list_items_markup .= sprintf(
								' - %1$s',
								$category[0]->cat_name
							);
						}

						$list_items_markup .= '</p>';
					}
				}

				if ( 'description' === $element ) {
					if ( ( isset( $attributes['displayDescription'] ) && $attributes['displayDescription'] ) || ( isset( $attributes['displayReadMoreLink'] ) && $attributes['displayReadMoreLink'] ) ) {
						$list_items_markup .= '<div class="wp-block-themeisle-blocks-posts-grid-post-description">';

						if ( ( isset( $attributes['excerptLength'] ) && $attributes['excerptLength'] > 0 ) && ( isset( $attributes['displayDescription'] ) && $attributes['displayDescription'] ) ) {
							$list_items_markup .= sprintf(
								'<p>%1$s</p>',
								$this->get_excerpt_by_id( $id, $attributes['excerptLength'] )
							);
						}

						if ( isset( $attributes['displayReadMoreLink'] ) && $attributes['displayReadMoreLink'] ) {
							$list_items_markup .= sprintf(
								'<a class="o-posts-read-more" href="%1$s">%2$s</a>',
								esc_url( get_the_permalink( $id ) ),
								__( 'Read More', 'otter-blocks' )
							);
						}

						$list_items_markup .= '</div>';

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

		if ( isset( $attributes['cropImage'] ) && true === $attributes['cropImage'] ) {
			$class .= ' o-crop-img';
		}

		$wrapper_attributes = get_block_wrapper_attributes();

		$block_content = sprintf(
			'<div %1$s id="%2$s">%3$s<div class="%4$s">%5$s</div> </div>',
			$wrapper_attributes,
			isset( $attributes['id'] ) ? $attributes['id'] : '',
			isset( $attributes['enableFeaturedPost'] ) && $attributes['enableFeaturedPost'] ? $this->render_featured_post( $this->get_featured_post( $attributes['featuredPost'], $recent_posts ), $attributes ) : '',
			trim( $class ),
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
	protected function get_excerpt_by_id( $post_id, $excerpt_length = 200 ) {
		$excerpt = get_the_excerpt( $post_id );

		if ( mb_strlen( $excerpt ) > $excerpt_length ) {
			$excerpt = mb_substr( $excerpt, 0, $excerpt_length ) . '…';
		}

		return $excerpt;
	}

	/**
	 * Render the featured post
	 *
	 * @param WP_Post $post Post.
	 *
	 * @return string
	 */
	protected function render_featured_post( $post = null, $attributes ) {

		if( !isset( $post ) ) {
			return '';
		}

		$html = '';

		$id        = $post['ID'];
		$size      = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'medium';
		$thumbnail = wp_get_attachment_image( get_post_thumbnail_id( $id ), $size );
		$category  = get_the_category( $id );

		if( isset( $thumbnail ) ) {
			$html .= sprintf(
				'<div class="wp-block-themeisle-blocks-posts-grid-post-image"><a href="%1$s">%2$s</a></div>',
				esc_url( get_the_permalink( $id ) ),
				$thumbnail
			);
		}

		$html .= '<div class="wp-block-themeisle-blocks-posts-grid-post-body' . ( $thumbnail && $attributes['displayFeaturedImage'] ? '' : ' is-full' ) . '">';

		foreach ( $attributes['template'] as $element ) {

			if ( 'title' === $element ) {
				if ( isset( $attributes['displayTitle'] ) && $attributes['displayTitle'] ) {
					$html .= sprintf(
						'<%1$s class="wp-block-themeisle-blocks-posts-grid-post-title"><a href="%2$s">%3$s</a></%1$s>',
						esc_attr( $attributes['titleTag'] ),
						esc_url( get_the_permalink( $id ) ),
						esc_html( get_the_title( $id ) )
					);
				}
			}

			if ( 'meta' === $element ) {
				if ( ( isset( $attributes['displayMeta'] ) && $attributes['displayMeta'] ) && ( ( isset( $attributes['displayDate'] ) && $attributes['displayDate'] ) || ( isset( $attributes['displayAuthor'] ) && $attributes['displayAuthor'] ) ) ) {
					$html .= '<p class="wp-block-themeisle-blocks-posts-grid-post-meta">';

					if ( isset( $attributes['displayDate'] ) && $attributes['displayDate'] ) {
						$html .= sprintf(
							'%1$s <time datetime="%2$s">%3$s</time> ',
							__( 'on', 'otter-blocks' ),
							esc_attr( get_the_date( 'c', $id ) ),
							esc_html( get_the_date( get_option( 'date_format' ), $id ) )
						);
					}

					if ( isset( $attributes['displayAuthor'] ) && $attributes['displayAuthor'] ) {
						$html .= sprintf(
							'%1$s %2$s',
							__( 'by', 'otter-blocks' ),
							get_the_author_meta( 'display_name', get_post_field( 'post_author', $id ) )
						);
					}

					if ( isset( $attributes['displayPostCategory'] ) && $attributes['displayPostCategory'] && isset( $category[0] ) ) {
						$html .= sprintf(
							' - %1$s',
							$category[0]->cat_name
						);
					}

					$html .= '</p>';
				}
			}

			if ( 'description' === $element ) {
				if ( ( isset( $attributes['displayDescription'] ) && $attributes['displayDescription'] ) || ( isset( $attributes['displayReadMoreLink'] ) && $attributes['displayReadMoreLink'] ) ) {
					$html .= '<div class="wp-block-themeisle-blocks-posts-grid-post-description">';

					if ( ( isset( $attributes['excerptLength'] ) && $attributes['excerptLength'] > 0 ) && ( isset( $attributes['displayDescription'] ) && $attributes['displayDescription'] ) ) {
						$html .= sprintf(
							'<p>%1$s</p>',
							$this->get_excerpt_by_id( $id, $attributes['excerptLength'] )
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
		}
		$html .= '</div>';
		return sprintf( '<div class="o-featured-post">%1$s</div>', $html );
	}

	/**
	 * Render the featured post
	 *
	 * @param WP_Post $post Post.
	 *
	 * @return WP_Post|null
	 */
	protected function get_featured_post( $featured_post_type , $recent_posts = null ) {

		if( ! isset( $featured_post_type ) && ! isset( $recent_posts ) && 0 < count($recent_posts)) {
			return null;
		}

		if( 'latest' === $featured_post_type ) {
			$latest =  $recent_posts[0];
			foreach ( $recent_posts as $post ) {
				if( $latest['post_date'] < $post['post_date'] ) {
					$latest = $post;
				}
			}
			return $latest;
		}

		foreach ( $recent_posts as $post ) {
			if( strval( $post['ID'] ) === $featured_post_type ) {
				return $post;
			}
		}
	}
}
