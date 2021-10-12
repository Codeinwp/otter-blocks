<?php
/**
 * Card block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

use ThemeIsle\GutenbergBlocks\Base_Block;

/**
 * Class Plugin_Card_Block
 */
class Plugin_Card_Block extends Base_Block {

	/**
	 * Every block needs a slug, so we need to define one and assign it to the `$this->block_slug` property
	 *
	 * @return mixed
	 */
	protected function set_block_slug() {
		$this->block_slug = 'plugin-cards';
	}

	/**
	 * Set the attributes required on the server side.
	 *
	 * @return mixed
	 */
	protected function set_attributes() {
		$this->attributes = array(
			'slug'      => array(
				'type' => 'string',
			),
			'className' => array(
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
		if ( empty( $attributes['slug'] ) ) {
			return;
		}

		$results = $this->search( $attributes['slug'] );

		if ( ! is_wp_error( $results['data'] ) ) {
			$results = $results['data'];

			$icon = '';
			if ( isset( $results->icons['svg'] ) ) {
				$icon = $results->icons['svg'];
			}
			if ( isset( $results->icons['2x'] ) ) {
				$icon = $results->icons['2x'];
			}
			if ( isset( $results->icons['1x'] ) ) {
				$icon = $results->icons['1x'];
			}
			if ( isset( $results->icons['default'] ) ) {
				$icon = $results->icons['default'];
			}

			$class = 'wp-block-themeisle-blocks-plugin-cards';

			if ( isset( $attributes['className'] ) ) {
				$class .= ' ' . esc_attr( $attributes['className'] );
			}

			$markup = '<div class="' . esc_attr( $class ) . '">
				<div class="wp-block-themeisle-blocks-plugin-cards-wrapper">
					<div class="wp-block-themeisle-blocks-plugin-cards-header">
						<div class="wp-block-themeisle-blocks-plugin-cards-main">
							<div class="wp-block-themeisle-blocks-plugin-cards-logo">
								<img src="' . esc_url( $icon ) . '" alt="' . esc_attr( $results->name ) . '" title="' . esc_attr( $results->name ) . '"/>
							</div>
							<div class="wp-block-themeisle-blocks-plugin-cards-info">
								<h4>' . esc_html( $results->name ) . '</h4>
								<h5>' . $results->author . '</h5>
							</div>
							<div class="wp-block-themeisle-blocks-plugin-cards-ratings">
								' . $this->get_ratings( $results->rating ) . '
							</div>
						</div>
					</div>
					<div class="wp-block-themeisle-blocks-plugin-cards-details">
						<div class="wp-block-themeisle-blocks-plugin-cards-description">' . esc_html( $results->short_description ) . '</div>
						<div class="wp-block-themeisle-blocks-plugin-cards-stats">
							<h5>' . __( 'Plugin Stats', 'otter-blocks' ) . '</h5>
							<div class="wp-block-themeisle-blocks-plugin-cards-stats-list">
								<div class="wp-block-themeisle-blocks-plugin-cards-stat">
									<span class="wp-block-themeisle-blocks-plugin-cards-text-large">' . number_format( $results->active_installs ) . '+</span>
									' . __( 'active installs', 'otter-blocks' ) . '
								</div>
								<div class="wp-block-themeisle-blocks-plugin-cards-stat">
									<span class="wp-block-themeisle-blocks-plugin-cards-text-large">' . floatval( $results->version ) . '+</span>
									' . __( 'version', 'otter-blocks' ) . '
								</div>
								<div class="wp-block-themeisle-blocks-plugin-cards-stat">
									<span class="wp-block-themeisle-blocks-plugin-cards-text-large">' . floatval( $results->tested ) . '+</span>
									' . __( 'tested up to', 'otter-blocks' ) . '
								</div>
							</div>
						</div>
					</div>
					<div class="wp-block-themeisle-blocks-plugin-cards-download">
						<a href="' . esc_url( $results->download_link ) . '">' . __( 'Download', 'otter-blocks' ) . '</a>
					</div>
				</div>
			</div>';

			return $markup;
		}

	}

	/**
	 * Search WordPress Plugin
	 *
	 * Search WordPress plugin using WordPress.org API.
	 *
	 * @param mixed $request Rest request.
	 *
	 * @return mixed
	 */
	protected function search( $request ) {
		$return = array(
			'success' => false,
			'data'    => esc_html__( 'Something went wrong', 'otter-blocks' ),
		);

		$slug = $request;

		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

		$request = array(
			'per_page' => 12,
			'slug'     => $slug,
			'fields'   => array(
				'active_installs'   => true,
				'added'             => false,
				'donate_link'       => false,
				'downloadlink'      => true,
				'homepage'          => true,
				'icons'             => true,
				'last_updated'      => false,
				'requires'          => true,
				'requires_php'      => false,
				'screenshots'       => false,
				'short_description' => true,
				'slug'              => false,
				'sections'          => false,
				'requires'          => false,
				'rating'            => true,
				'ratings'           => false,
			),
		);

		$results = plugins_api( 'plugin_information', $request );

		if ( is_wp_error( $request ) ) {
			$return['data'] = 'error';

			return $return;
		}

		$return['success'] = true;

		// Get data from API.
		$return['data'] = $results;

		return $return;
	}

	/**
	 * Get Rating Stars
	 *
	 * Get 0-5 star rating from rating score.
	 *
	 * @param string $rating Rating value.
	 *
	 * @return mixed|string
	 */
	protected function get_ratings( $rating ) {
		$rating      = round( $rating / 10, 0 ) / 2;
		$full_stars  = floor( $rating );
		$half_stars  = ceil( $rating - $full_stars );
		$empty_stars = 5 - $full_stars - $half_stars;
		$output      = str_repeat( '<span class="star-full"></span>', $full_stars );
		$output     .= str_repeat( '<span class="star-half"></span>', $half_stars );
		$output     .= str_repeat( '<span class="star-empty"></span>', $empty_stars );

		return $output;
	}
}
