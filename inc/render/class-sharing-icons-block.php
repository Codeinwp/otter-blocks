<?php
/**
 * Icons block.
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

use ThemeIsle\GutenbergBlocks\CSS\Blocks\Sharing_Icons_CSS;

/**
 * Class Sharing_Icons_Block
 */
class Sharing_Icons_Block {

	/**
	 * Return attributes for social media services.
	 *
	 * @return array
	 */
	public static function get_social_profiles() {
		if ( get_post()->post_type === 'neve_custom_layout' ) {
			$current_url = home_url( add_query_arg( null, null ) );

			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
			$id_from_url = function_exists( 'wpcom_vip_url_to_postid' ) ? wpcom_vip_url_to_postid( $current_url ) : url_to_postid( $current_url );
			$current_id  = $id_from_url > 0 ? $id_from_url : get_the_ID();
		} else {
			$current_id = get_the_ID();
		}

		$social_attributes = array(
			'facebook'  => array(
				'label' => esc_html__( 'Facebook', 'otter-blocks' ),
				'icon'  => 'facebook-f',
				'url'   => 'https://www.facebook.com/sharer/sharer.php?u=' . esc_url( get_the_permalink( $current_id ) ) . '&title=' . esc_attr( get_the_title( $current_id ) ),
			),

			'twitter'   => array(
				'label' => esc_html__( 'Twitter', 'otter-blocks' ),
				'icon'  => 'twitter',
				'url'   => 'http://twitter.com/share?url=' . esc_url( get_the_permalink( $current_id ) ) . '&text=' . esc_attr( get_the_title( $current_id ) ),
			),

			'linkedin'  => array(
				'label' => esc_html__( 'Linkedin', 'otter-blocks' ),
				'icon'  => 'linkedin-in',
				'url'   => 'https://www.linkedin.com/shareArticle?mini=true&url=' . esc_url( get_the_permalink( $current_id ) ) . '&title=' . esc_attr( get_the_title( $current_id ) ),
			),

			'pinterest' => array(
				'label' => esc_html__( 'Pinterest', 'otter-blocks' ),
				'icon'  => 'pinterest-p',
				'url'   => 'https://pinterest.com/pin/create/button/?url=' . esc_url( get_the_permalink( $current_id ) ) . '&description=' . esc_attr( get_the_title( $current_id ) ),
			),

			'tumblr'    => array(
				'label' => esc_html__( 'Tumblr', 'otter-blocks' ),
				'icon'  => 'tumblr',
				'url'   => 'https://tumblr.com/share/link?url=' . esc_url( get_the_permalink( $current_id ) ) . '&name=' . esc_attr( get_the_title( $current_id ) ),
			),

			'reddit'    => array(
				'label' => esc_html__( 'Reddit', 'otter-blocks' ),
				'icon'  => 'reddit-alien',
				'url'   => 'https://www.reddit.com/submit?url=' . esc_url( get_the_permalink( $current_id ) ),
			),
		);

		return $social_attributes;
	}

	/**
	 * Checks if an icon is active and should be visible
	 *
	 * @param array $icon Icon to check.
	 *
	 * @return bool
	 */
	private function is_active( $icon ) {
		return ( ( isset( $icon['active'] ) && true === filter_var( $icon['active'], FILTER_VALIDATE_BOOLEAN ) ) || 1 == $icon );
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
	public function render( $attributes ) {
		$social_attributes = $this->get_social_profiles();

		$class = '';

		if ( isset( $attributes['align'] ) ) {
			$class .= ' align' . esc_attr( $attributes['align'] );
		}

		$wrapper_attributes = get_block_wrapper_attributes( isset( $attributes['id'] ) ? [ 'id' => $attributes['id'] ] : [] );

		$html = '<div ' . $wrapper_attributes . '><div class="social-icons-wrap">';
		foreach ( $social_attributes as $key => $icon ) {
			if ( 'className' !== $key && $this->is_active( $attributes[ $key ] ) ) {
				$html .= '<a class="social-icon is-' . esc_html( $key ) . '" href="' . esc_url( $icon['url'] ) . '" target="_blank">';
				$html .= '<i class="fab fa-' . esc_html( $icon['icon'] ) . '"></i><span class="v-line"></span>';
				if ( strpos( $wrapper_attributes, 'is-style-icons' ) === false ) {
					$html .= esc_html( $icon['label'] );
				}
				$html .= '</a>';
			}
		}
		$html .= '</div></div>';

		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			$css = new Sharing_Icons_CSS();
			$css = $css->render_css(
				array(
					'attrs' => $attributes,
				)
			);

			if ( ! empty( $css ) ) {
				$html .= '<style type="text/css">' . $css . '</style>';
			}
		}

		return $html;
	}
}
