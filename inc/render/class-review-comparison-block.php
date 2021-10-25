<?php
/**
 * Review block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

use ThemeIsle\GutenbergBlocks\Main;
use ThemeIsle\GutenbergBlocks\Base_Block;

/**
 * Class Review_Comparison_Block
 */
class Review_Comparison_Block extends Base_Block {

	/**
	 * Every block needs a slug, so we need to define one and assign it to the `$this->block_slug` property
	 *
	 * @return mixed
	 */
	protected function set_block_slug() {
		$this->block_slug = 'review-comparison';
	}

	/**
	 * Set the attributes required on the server side.
	 *
	 * @return mixed
	 */
	protected function set_attributes() {
		$this->attributes = array(
			'id'          => array(
				'type' => 'string',
			),
			'className'   => array(
				'type' => 'string',
			),
			'reviews'     => array(
				'type'    => 'array',
				'default' => array(),
			),
			'buttonColor' => array(
				'type' => 'string',
			),
			'buttonText'  => array(
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
		if ( ! 'valid' === apply_filters( 'product_neve_license_status', false ) || ! isset( $attributes['reviews'] ) ) {
			return;
		}

		$ids = array_map( array( $this, 'extract_id' ), $attributes['reviews'] );

		$table_images      = '';
		$table_title       = '';
		$table_price       = '';
		$table_ratings     = '';
		$table_description = '';
		$table_features    = '';
		$table_links       = '';

		foreach ( $attributes['reviews'] as $review ) {
			$id   = explode( '-', $review );
			$post = get_post( $id[0] );

			if ( is_null( $post ) || ! has_blocks( $post->post_content ) ) {
				continue;
			}

			$post_blocks = parse_blocks( $post->post_content );

			$block = [];

			foreach ( $post_blocks as $post_block ) {
				if ( 'themeisle-blocks/review' === $post_block['blockName'] && substr( $post_block['attrs']['id'], -8 ) === $id[1] ) {
					$block = $post_block;
					break;
				}
			}

			if ( isset( $block['attrs']['product'] ) && intval( $block['attrs']['product'] ) >= 0 && class_exists( 'WooCommerce' ) ) {
				$product = wc_get_product( $block['attrs']['product'] );

				if ( ! $product ) {
					continue;
				}

				$block['attrs']['title']       = $product->get_name();
				$block['attrs']['description'] = $product->get_short_description();
				$block['attrs']['price']       = $product->get_regular_price() ? $product->get_regular_price() : $product->get_price();
				$block['attrs']['currency']    = get_woocommerce_currency();

				if ( ! empty( $product->get_sale_price() ) && $block['attrs']['price'] !== $product->get_sale_price() ) {
					$block['attrs']['discounted'] = $product->get_sale_price();
				}

				$block['attrs']['image'] = array(
					'url' => wp_get_attachment_image_url( $product->get_image_id(), '' ),
					'alt' => get_post_meta( $product->get_image_id(), '_wp_attachment_image_alt', true ),
				);

				$block['attrs']['links'] = array(
					array(
						'label'       => __( 'Buy Now', 'otter-blocks' ),
						'href'        => method_exists( $product, 'get_product_url' ) ? $product->get_product_url() : $product->get_permalink(),
						'isSponsored' => method_exists( $product, 'get_product_url' ),
					),
				);
			}

			$features = array(
				array(
					'title'  => __( 'Stability', 'otter-blocks' ),
					'rating' => 9,
				),
				array(
					'title'  => __( 'Ease of Use', 'otter-blocks' ),
					'rating' => 4,
				),
				array(
					'title'  => __( 'Look & Feel', 'otter-blocks' ),
					'rating' => 9,
				),
				array(
					'title'  => __( 'Price', 'otter-blocks' ),
					'rating' => 7,
				),
			);

			if ( isset( $block['attrs']['features'] ) ) {
				$features = $block['attrs']['features'];
			}

			$table_images .= '<td>';
			if ( isset( $block['attrs']['image'] ) ) {
				$table_images .= '<img src="' . $block['attrs']['image']['url'] . '">';
			}
			$table_images .= '</td>';

			$table_title .= '<td>';
			if ( isset( $block['attrs']['image'] ) ) {
				$table_title .= '<a href="' . get_the_permalink( $id[0] ) . '" target="_blank">';
				$table_title .= $block['attrs']['title'] ? $block['attrs']['title'] : __( 'Untitled review', 'otter-blocks' );
				$table_title .= '</a>';
			}
			$table_title .= '</td>';

			$table_price .= '<td>';
			if ( isset( $block['attrs']['price'] ) ) {
				$currency = Main::get_currency( isset( $block['attrs']['currency'] ) ? $block['attrs']['currency'] : 'USD' );

				if ( isset( $block['attrs']['discounted'] ) ) {
					$table_price .= '<del>' . $currency . $block['attrs']['price'] . '</del> ' . $currency . $block['attrs']['discounted'];
				} else {
					$table_price .= $currency . $block['attrs']['price'];
				}
			} else {
				$table_price .= '-';
			}
			$table_price .= '</td>';

			$table_ratings .= '<td><div class="otter-review-comparison__ratings">' . $this->get_stars( $this->get_overall_ratings( $features ) ) . '</div></td>';

			$table_description .= '<td>';
			if ( isset( $block['attrs']['description'] ) ) {
				$table_description .= $block['attrs']['description'];
			}
			$table_description .= '</td>';

			$table_features .= '<td>';
			foreach ( $features as $feature ) {
				$table_features .= '<div class="otter-review-comparison__rating_container">';
				$table_features .= '	<div class="otter-review-comparison__rating_title">' . $feature['title'] . '</div>';
				$table_features .= '	<div class="otter-review-comparison__ratings">' . $this->get_stars( $feature['rating'] / 2 ) . '</div>';
				$table_features .= '</div>';
			}
			$table_features .= '</td>';

			$links = array(
				array(
					'label'       => __( 'Buy on Amazon', 'otter-blocks' ),
					'href'        => '',
					'isSponsored' => false,
				),
				array(
					'label'       => __( 'Buy on eBay', 'otter-blocks' ),
					'href'        => '',
					'isSponsored' => false,
				),
			);

			if ( isset( $block['attrs']['links'] ) ) {
				$links = $block['attrs']['links'];
			}

			$table_links .= '<td>';
			if ( 0 < count( $links ) ) {
				$table_links .= '<div class="otter-review-comparison__buttons wp-block-button">';
				foreach ( $links as $link ) {
					$rel          = ( isset( $link['isSponsored'] ) && true === $link['isSponsored'] ) ? 'sponsored' : 'nofollow';
					$table_links .= '	<a href="' . esc_url( $link['href'] ) . '" rel="' . $rel . '" class="wp-block-button__link" target="_blank">' . esc_html( $link['label'] ) . '</a>';
				}
				$table_links .= '</div>';
			}
			$table_links .= '</td>';
		}

		$id    = isset( $attributes['id'] ) ? $attributes['id'] : 'wp-block-themeisle-blocks-review-comparison-' . wp_rand( 10, 100 );
		$class = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$class = 'wp-block-themeisle-blocks-review-comparison ' . esc_attr( $class );

		$html  = '<table id="' . esc_attr( $id ) . '" class="' . trim( $class ) . '">';
		$html .= '	<thead>';
		$html .= '		<tr>';
		$html .= '			<th></th>';
		$html .= $table_images;
		$html .= '		</tr>';
		$html .= '	</thead>';

		$html .= '	<tbody>';
		$html .= '		<tr>';
		$html .= '			<th>' . __( 'Name', 'otter-blocks' ) . '</th>';
		$html .= $table_title;
		$html .= '		</tr>';

		$html .= '		<tr>';
		$html .= '			<th>' . __( 'Price', 'otter-blocks' ) . '</th>';
		$html .= $table_price;
		$html .= '		</tr>';

		$html .= '		<tr>';
		$html .= '			<th>' . __( 'Rating', 'otter-blocks' ) . '</th>';
		$html .= $table_ratings;
		$html .= '		</tr>';

		$html .= '		<tr>';
		$html .= '			<th>' . __( 'Description', 'otter-blocks' ) . '</th>';
		$html .= $table_description;
		$html .= '		</tr>';

		$html .= '		<tr>';
		$html .= '			<th>' . __( 'Statistics', 'otter-blocks' ) . '</th>';
		$html .= $table_features;
		$html .= '		</tr>';

		$html .= '		<tr>';
		$html .= '			<th>' . __( 'Buy this product', 'otter-blocks' ) . '</th>';
		$html .= $table_links;
		$html .= '		</tr>';
		$html .= '	</tbody>';
		$html .= '</table>';

		return $html;
	}

	/**
	 * Extract post ID.
	 *
	 * Extract post ID from reviews attribute.
	 *
	 * @param array $id Review ID.
	 *
	 * @return int
	 */
	public function extract_id( $id ) {
		$id = explode( '-', $id );
		$id = $id[0];
		return $id;
	}

	/**
	 * Get overall ratings
	 *
	 * @param array $features An array of features.
	 *
	 * @return int
	 */
	protected function get_overall_ratings( $features ) {
		if ( count( $features ) <= 0 ) {
			return 0;
		}

		$rating = array_reduce(
			$features,
			function( $carry, $feature ) {
				$carry += $feature['rating'];
				return $carry;
			},
			0
		);

		$rating = round( $rating / count( $features ) ) / 2;

		return $rating;
	}

	/**
	 * Get ratings stars
	 *
	 * @param array $ratings Ratings.
	 *
	 * @return string
	 */
	protected function get_stars( $ratings = 0 ) {
		$stars = '';

		for ( $i = 0; $i < 5; $i++ ) {
			$class = '';

			if ( $ratings <= 1.5 && $i < $ratings ) {
				$class = 'low';
			} elseif ( $ratings > 1.5 && $ratings <= 3.5 && $i < $ratings ) {
				$class = 'medium';
			} elseif ( $ratings > 3.5 && $ratings <= 5 && $i < $ratings ) {
				$class = 'high';
			}

			if ( $i < $ratings && ( $ratings < $i + 1 ) ) {
				$stars .= '<svg xmlns="http://www.w3.org/2000/svg" class="' . esc_attr( $class ) . '" viewbox="0 0 24 24"><path d="M9.518 8.783a.25.25 0 00.188-.137l2.069-4.192a.25.25 0 01.448 0l2.07 4.192a.25.25 0 00.187.137l4.626.672a.25.25 0 01.139.427l-3.347 3.262a.25.25 0 00-.072.222l.79 4.607a.25.25 0 01-.363.264l-4.137-2.176a.25.25 0 00-.233 0l-4.138 2.175a.25.25 0 01-.362-.263l.79-4.607a.25.25 0 00-.072-.222L4.753 9.882a.25.25 0 01.14-.427l4.625-.672zM12 14.533c.28 0 .559.067.814.2l1.895.997-.362-2.11a1.75 1.75 0 01.504-1.55l1.533-1.495-2.12-.308a1.75 1.75 0 01-1.317-.957L12 7.39v7.143z" /></svg>';
			} else {
				$stars .= '<svg xmlns="http://www.w3.org/2000/svg" class="' . esc_attr( $class ) . '" viewbox="0 0 24 24"><path d="M11.776 4.454a.25.25 0 01.448 0l2.069 4.192a.25.25 0 00.188.137l4.626.672a.25.25 0 01.139.426l-3.348 3.263a.25.25 0 00-.072.222l.79 4.607a.25.25 0 01-.362.263l-4.138-2.175a.25.25 0 00-.232 0l-4.138 2.175a.25.25 0 01-.363-.263l.79-4.607a.25.25 0 00-.071-.222L4.754 9.881a.25.25 0 01.139-.426l4.626-.672a.25.25 0 00.188-.137l2.069-4.192z" /></svg>';
			}
		}

		return $stars;
	}
}
