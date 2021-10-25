<?php
/**
 * CSS generator.
 *
 * $css = new CSS_Utility( $block );
 *
 * $css->add_item( array(
 *  'global'     => 'global', // Put your media query selector here. It's global by default.
 *  'selector'   => ' .wp-block', // ID of the Block will be prefixed to your selector. If you want to target the root, drop this property. You can also use the keyword [id] if you want to add some prefix to your ID, see AMP CSS in Circular Counter Block.
 *  'properties' => array(
 *      array(
 *          'property'    => 'margin',
 *          'value'       => 'spacing',
 *          'unit'        => 'px',
 *          'default'     => 20,
 *          'format'      => function( $value, $attrs ) {
 *              return $value / 2;
 *          },
 *          'condition'   => function( $attrs ) {
 *              return true;
 *          },
 *      ),
 *      array(
 *          'property'       => 'margin',
 *          'pattern'        => '20px marginLeftRight',
 *          'pattern_values' => array(
 *              'marginLeftRight' => array(
 *                  'value'   => 'marginLeftRight',
 *                  'unit'    => 'px',
 *                  'default' => 20,
 *                  'format'  => function( $value, $attrs ) {
 *                      return $value / 2;
 *                  },
 *              ),
 *          ),
 *          'condition'      => function( $attrs ) {
 *              return true;
 *          },
 *      ),
 *  ),
 * ) );
 *
 * $style = $css->generate();
 *
 * Inspired by https://github.com/kirki-framework/wp-css-generator
 *
 * @package ThemeIsle\GutenbergBlocks\CSS
 */

namespace ThemeIsle\GutenbergBlocks\CSS;

/**
 * Class Block_Frontend
 */
class CSS_Utility {

	/**
	 * Variable to hold block array.
	 *
	 * @var array
	 */
	public $block = array();

	/**
	 * Variable to hold CSS array.
	 *
	 * @var array
	 */
	public $css_array = array();

	/**
	 * Variable to hold custom block ID.
	 *
	 * @var string
	 */
	public $block_id;

	/**
	 * Constructor
	 *
	 * @access public
	 * @param array $block Block object.
	 */
	public function __construct( $block ) {
		$this->block = $block;
	}

	/**
	 * Define custom Block ID.
	 *
	 * @access public
	 * @since 1.7.0
	 * @param string $id Block ID.
	 */
	public function set_id( $id ) {
		$this->block_id = $id;
	}

	/**
	 * Add a style to CSS array.
	 *
	 * @access public
	 * @since 1.6.0
	 * @param array $params CSS object parameters.
	 */
	public function add_item( $params ) {
		$params = wp_parse_args(
			$params,
			array(
				'query'      => 'global',
				'selector'   => '',
				'properties' => '',
			)
		);

		if ( ! isset( $this->css_array[ $params['query'] ] ) ) {
			$this->css_array[ $params['query'] ] = array();
		}

		if ( ! isset( $this->css_array[ $params['query'] ][ $params['selector'] ] ) ) {
			$this->css_array[ $params['query'] ][ $params['selector'] ] = array();
		}

		$this->css_array[ $params['query'] ][ $params['selector'] ] = $params['properties'];
	}

	/**
	 * Generate CSS from provided values.
	 *
	 * @access public
	 * @since 1.6.0
	 */
	public function generate() {
		$style = '';

		$attrs = $this->block['attrs'];

		if ( ! isset( $this->block_id ) ) {
			if ( ! isset( $attrs['id'] ) ) {
				return $style;
			}

			$this->block_id = $attrs['id'];
		}

		foreach ( $this->css_array as $media_query => $css_items ) {
			$style .= ( 'global' !== $media_query ) ? $media_query . '{' : '';

			foreach ( $css_items as $selector => $properties ) {
				$item_style = '';

				foreach ( $properties as $property ) {
					$property = wp_parse_args(
						$property,
						array(
							'unit' => '',
						)
					);

					if ( isset( $property['condition'] ) && is_callable( $property['condition'] ) && ! $property['condition']( $attrs ) ) {
						continue;
					}

					if ( isset( $property['property'] ) && ( ( isset( $property['value'] ) && isset( $attrs[ $property['value'] ] ) ) || isset( $property['default'] ) ) ) {
						$value = ( ( isset( $property['value'] ) && isset( $attrs[ $property['value'] ] ) ) ? $attrs[ $property['value'] ] : $property['default'] );

						if ( isset( $property['format'] ) && is_callable( $property['format'] ) ) {
							$value = $property['format']( $value, $attrs );
						}

						$value       = $value . $property['unit'];
						$item_style .= $property['property'] . ': ' . $value . ';';
					}

					if ( isset( $property['property'] ) && ( isset( $property['pattern'] ) && isset( $property['pattern_values'] ) ) ) {
						$pattern = $property['pattern'];

						foreach ( $property['pattern_values'] as $value_key => $pattern_value ) {
							$pattern_value = wp_parse_args(
								$pattern_value,
								array(
									'unit' => '',
								)
							);

							if ( ( ( isset( $pattern_value['value'] ) && isset( $attrs[ $pattern_value['value'] ] ) ) || isset( $pattern_value['default'] ) ) ) {
								$value = ( ( isset( $pattern_value['value'] ) && isset( $attrs[ $pattern_value['value'] ] ) ) ? $attrs[ $pattern_value['value'] ] : $pattern_value['default'] );

								if ( isset( $pattern_value['format'] ) && is_callable( $pattern_value['format'] ) ) {
									$value = $pattern_value['format']( $value, $attrs );
								}

								$value   = $value . $pattern_value['unit'];
								$pattern = preg_replace( '/\b' . $value_key . '\b/', $value, $pattern );
							}
						}

						$item_style .= $property['property'] . ': ' . $pattern . ';';
					}
				}

				if ( '' !== $item_style ) {
					$selector = strpos( $selector, '[id]' ) !== false ? str_replace( '[id]', '#' . $this->block_id, $selector ) : '#' . $this->block_id . $selector;
					$style   .= $selector . ' {' . $item_style . '}';
				}
			}

			$style .= ( 'global' !== $media_query ) ? '}' : '';
		}

		return $style;
	}
}
