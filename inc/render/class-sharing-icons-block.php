<?php
/**
 * Icons block.
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class Sharing_Icons_Block
 */
class Sharing_Icons_Block {

	/**
	 * Return attributes for social media services.
	 *
	 * @return array
	 */
	public function get_social_profiles() {
		$social_attributes = array(
			'facebook'  => array(
				'label' => esc_html__( 'Facebook', 'otter-blocks' ),
				'icon'  => 'facebook-f',
				'url'   => 'https://www.facebook.com/sharer/sharer.php?u=' . esc_url( get_the_permalink() ) . '&title=' . esc_attr( get_the_title() ),
			),

			'twitter'   => array(
				'label' => esc_html__( 'Twitter', 'otter-blocks' ),
				'icon'  => 'twitter',
				'url'   => 'http://twitter.com/share?url=' . esc_url( get_the_permalink() ) . '&text=' . esc_attr( get_the_title() ),
			),

			'linkedin'  => array(
				'label' => esc_html__( 'Linkedin', 'otter-blocks' ),
				'icon'  => 'linkedin-in',
				'url'   => 'https://www.linkedin.com/shareArticle?mini=true&url=' . esc_url( get_the_permalink() ) . '&title=' . esc_attr( get_the_title() ),
			),

			'pinterest' => array(
				'label' => esc_html__( 'Pinterest', 'otter-blocks' ),
				'icon'  => 'pinterest-p',
				'url'   => 'https://pinterest.com/pin/create/button/?url=' . esc_url( get_the_permalink() ) . '&description=' . esc_attr( get_the_title() ),
			),

			'tumblr'    => array(
				'label' => esc_html__( 'Tumblr', 'otter-blocks' ),
				'icon'  => 'tumblr',
				'url'   => 'https://tumblr.com/share/link?url=' . esc_url( get_the_permalink() ) . '&name=' . esc_attr( get_the_title() ),
			),

			'reddit'    => array(
				'label' => esc_html__( 'Reddit', 'otter-blocks' ),
				'icon'  => 'reddit-alien',
				'url'   => 'https://www.reddit.com/submit?url=' . esc_url( get_the_permalink() ),
			),
		);

		return $social_attributes;
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

		$wrapper_attributes = get_block_wrapper_attributes();

		$html = '<div ' . $wrapper_attributes . '>';
		foreach ( $social_attributes as $key => $icon ) {
			if ( 'className' !== $key && 1 == $attributes[ $key ] ) {
				$html .= '<a class="social-icon is-' . esc_html( $key ) . '" href="' . esc_url( $icon['url'] ) . '" target="_blank">';
				$html .= '<i class="fab fa-' . esc_html( $icon['icon'] ) . '"></i>';
				if ( strpos( $wrapper_attributes, 'is-style-icons' ) === false ) {
					$html .= esc_html( $icon['label'] );
				}
				$html .= '</a>';
			}
		}
		$html .= '</div>';
		return $html;
	}
}
