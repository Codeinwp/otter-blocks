<?php
/**
 * CSS generator.
 *
 * $default_queries = array(
 *     'desktop' => '@media ( min-width: 960px )',
 *     'mobile'  => '@media ( max-width: 960px )'
 * );
 *
 * $css = new CSS_Utility( $block, $default_queries );
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
 *          'hasSync'     => 'spacing', // If global sync is available, add the used CSS variable.
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
 *  'media'      => 'desktop', // Media query selector.
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
	 * Variable to hold media queries.
	 *
	 * @var array
	 */
	public $media_queries = array();

	/**
	 * Variable to hold media items.
	 *
	 * @var array
	 */
	public $media_items = array();

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
	 * @param array $media_queries Media queries array.
	 */
	public function __construct( $block, $media_queries = array() ) {
		$this->block         = $block;
		$this->media_queries = $media_queries;
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
	 * Filter media queries.
	 *
	 * @access public
	 * @since 2.1.0
	 * @param string $query Media Query.
	 */
	public function get_media_query( $query ) {
		if ( isset( $this->media_queries[ $query ] ) && 'global' !== $this->media_queries[ $query ] ) {
			return $this->media_queries[ $query ];
		}

		return $query;
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

		$params['query'] = $this->get_media_query( $params['query'] );

		if ( ! isset( $this->css_array[ $params['query'] ] ) ) {
			$this->css_array[ $params['query'] ] = array();
		}

		$params['properties'] = $this->filter_out_media_queries( $params['selector'], $params['properties'] );

		if ( ! isset( $this->css_array[ $params['query'] ][ $params['selector'] ] ) ) {
			$this->css_array[ $params['query'] ][ $params['selector'] ] = $params['properties'];
		} else {
			$this->css_array[ $params['query'] ][ $params['selector'] ] = array_merge(
				$this->css_array[ $params['query'] ][ $params['selector'] ],
				$params['properties']
			);
		}
	}

	/**
	 * Filter out media query items.
	 *
	 * @access public
	 * @since 2.1.0
	 * @param string $selector CSS selector.
	 * @param array  $properties CSS properties.
	 */
	public function filter_out_media_queries( $selector, $properties ) {
		$query_items = array_filter(
			$properties,
			function( $ar ) {
				return isset( $ar['media'] );
			}
		);

		if ( 0 !== count( $query_items ) ) {
			if ( ! isset( $this->media_items[ $selector ] ) ) {
				$this->media_items[ $selector ] = $query_items;
			} else {
				$this->media_items[ $selector ] = array_merge( $this->media_items, $query_items );
			}
		}

		$properties = array_diff_key( $properties, array_flip( array_keys( $query_items ) ) );

		return $properties;
	}

	/**
	 * Process media items pre-generation.
	 *
	 * @access public
	 * @since 2.1.0
	 */
	public function process_media_items() {
		foreach ( $this->media_items as $selector => $items ) {
			foreach ( $items as $item ) {
				$media_query = $this->get_media_query( $item['media'] );

				if ( ! isset( $this->css_array[ $media_query ] ) ) {
					$this->css_array[ $media_query ] = array();
				}

				if ( ! isset( $this->css_array[ $media_query ][ $selector ] ) ) {
					$this->css_array[ $media_query ][ $selector ] = array();
				}

				array_push( $this->css_array[ $media_query ][ $selector ], $item );
			}
		}
	}

	/**
	 * Generate CSS from provided values.
	 *
	 * @access public
	 * @since 1.6.0
	 */
	public function generate() {
		$this->process_media_items();

		$style = '';

		$attrs = $this->block['attrs'];

		if ( ! isset( $this->block_id ) ) {
			if ( isset( $attrs['id'] ) ) {
				$this->block_id = $attrs['id'];
			}
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

					// If the item supports global default, check if the global default is active.
					if ( isset( $property['property'] ) && isset( $property['value'] ) && isset( $property['hasSync'] ) && ! empty( $property['hasSync'] ) && ( isset( $attrs['isSynced'] ) && in_array( $property['value'], $attrs['isSynced'] ) ) ) {
						$item_style .= $property['property'] . ': var( --' . $property['hasSync'] . ( isset( $property['default'] ) ? ', ' . $property['default'] : '' ) . ' );';
						continue;
					}

					// If the item contains a condition, check if it is true or bail out.
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
					if ( ! ( ! isset( $attrs['id'] ) && ! empty( $selector ) ) ) {
						$selector = strpos( $selector, '[id]' ) !== false ? str_replace( '[id]', '#' . $this->block_id, $selector ) : '#' . $this->block_id . $selector;
					}

					$style .= $selector . ' {' . $item_style . '}';
				}
			}

			$style .= ( 'global' !== $media_query ) ? '}' : '';
		}

		return $style;
	}

	/**
	 * Get the CSS string for padding, margin that comes from BoxControl.
	 *
	 * @param array $box The box.
	 * @param array $box_default The default box.
	 * @return string
	 */
	public static function box_values( $box, $box_default = array() ) {
		return self::render_box(
			array_merge(
				array(
					'left'   => '0px',
					'right'  => '0px',
					'top'    => '0px',
					'bottom' => '0px',
				),
				$box_default,
				$box
			)
		);
	}

	/**
	 * Make a string into a box type.
	 *
	 * @param string $value The value.
	 *
	 * @return array|string[]
	 */
	public static function make_box( $value = '0px' ) {
		return array(
			'left'   => $value,
			'right'  => $value,
			'top'    => $value,
			'bottom' => $value,
		);
	}

	/**
	 * Merge tge gives views to a single box value.
	 *
	 * @param mixed ...$views The values from other viewports.
	 *
	 * @return array|string[]
	 */
	public static function merge_views( ...$views ) {
		$result = self::make_box();

		$valid = array_filter(
			$views,
			function( $view ) {
				return isset( $view ) && is_array( $view );
			} 
		);

		foreach ( $valid as $arr ) {
			if ( isset( $arr['top'] ) ) {
				$result['top'] = $arr['top'];
			}
			if ( isset( $arr['bottom'] ) ) {
				$result['bottom'] = $arr['bottom'];
			}
			if ( isset( $arr['right'] ) ) {
				$result['right'] = $arr['right'];
			}
			if ( isset( $arr['left'] ) ) {
				$result['left'] = $arr['left'];
			}
		}

		return $result;
	}

	/**
	 * Convert a defined box to a CSS string value.
	 *
	 * @param array $box The box value.
	 *
	 * @return string
	 */
	public static function render_box( $box ) {

		if ( ! isset( $box ) || ! is_array( $box ) || count( $box ) === 0 ) {
			return '';
		}

		return $box['top'] . ' ' . $box['right'] . ' ' . $box['bottom'] . ' ' . $box['left'];
	}
}
