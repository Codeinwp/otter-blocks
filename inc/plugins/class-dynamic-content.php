<?php
/**
 * Dynamic Content.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

/**
 * Class Dynamic_Content
 */
class Dynamic_Content {

	/**
	 * The main instance var.
	 *
	 * @var Dynamic_Content|null
	 */
	protected static $instance = null;

	/**
	 * Magic Tag pattern, without delimiters; its first group is the query.
	 */
	const MAGIC_TAG_REGEX = '{(otterDynamic\?[^"\'<>}]*)}';

	/**
	 * Literal representations of dynamic marker prefixes.
	 *
	 * @var array<string, string>
	 */
	private static $literal_marker_escapes = array(
		'{otterDynamic?'   => '&#123;otterDynamic?',
		'otterDynamicLink' => 'otterDynamicLin&#107;',
		'otter/v1/dynamic' => 'otter/v1/dynami&#99;',
		'<o-dynamic'       => '&lt;o-dynamic',
	);

	/**
	 * Exception keys of the postContent tags currently being rendered.
	 *
	 * @var array<string, true>
	 */
	private static $rendering_content = array();

	/**
	 * Initialize the class
	 */
	public function init() {
		add_filter( 'render_block', array( $this, 'escape_visitor_block_magic_tags' ), 9, 2 );
		add_filter( 'render_block', array( $this, 'apply_dynamic_content' ) );
		add_filter( 'render_block', array( $this, 'apply_dynamic_magic_tags' ) );
		add_filter( 'render_block', array( $this, 'apply_dynamic_link' ) );
		add_filter( 'render_block', array( $this, 'apply_dynamic_link_button' ) );
		add_filter( 'render_block', array( $this, 'apply_dynamic_images' ) );
		add_filter( 'otter_apply_dynamic_image', array( $this, 'apply_dynamic_css_images' ) );
		add_filter( 'get_comment_text', array( $this, 'escape_comment_magic_tags' ) );
		add_filter( 'get_comment_excerpt', array( $this, 'escape_comment_magic_tags' ) );
		add_filter( 'get_comment_author', array( $this, 'escape_comment_magic_tags' ) );
		add_filter( 'get_comment_author_url', array( $this, 'escape_comment_magic_tags' ) );
		add_filter( 'block_core_breadcrumbs_items', array( $this, 'escape_breadcrumb_magic_tags' ) );
		add_filter( 'get_search_form', array( $this, 'escape_search_form_magic_tags' ) );
		add_filter( 'wp_generate_tag_cloud_data', array( $this, 'escape_tag_cloud_magic_tags' ) );
		add_filter( 'wp_setup_nav_menu_item', array( $this, 'escape_taxonomy_menu_magic_tags' ) );
		add_filter( 'list_cats', array( $this, 'escape_comment_magic_tags' ) );
		foreach ( array( 'get_avatar', 'the_author', 'get_the_author_display_name', 'get_the_author_description', 'get_the_author_user_description', 'comment_form_field_author', 'comment_form_field_email', 'comment_form_field_url', 'comment_form_logged_in' ) as $hook ) {
			add_filter( $hook, array( $this, 'escape_comment_magic_tags' ) );
		}
	}

	/**
	 * Protect rendered visitor values before the generic Magic Tag filters run.
	 *
	 * @param string                                                                     $content Rendered markup.
	 * @param array{blockName: string|null, attrs?: array{id?: string, idBase?: string}} $block Parsed block.
	 * @return string
	 */
	public function escape_visitor_block_magic_tags( $content, $block ) {
		if ( 'core/term-description' === $block['blockName'] ) {
			return $this->escape_comment_magic_tags( $content );
		}

		$patterns = array(
			'core/avatar'      => '/(<a\b[^>]*\saria-label=")([^"]*)(")/',
			'core/search'      => '/(<input\b(?=[^>]*\stype="(?:search|text)")(?=[^>]*\sname="s")[^>]*\svalue=")([^"]*)(")/',
			'core/query-title' => '/(>)([^<]*)(<)/',
			'core/post-terms'  => '/(<a\b[^>]*>)([^<]*)(<\/a>)/',
			'core/term-name'   => '/(>)([^<]*)(<)/',
		);
		if ( 'core/legacy-widget' === $block['blockName'] ) {
			$widget = isset( $block['attrs']['idBase'] ) ? $block['attrs']['idBase'] : '';
			if ( isset( $block['attrs']['id'] ) ) {
				$widget = $block['attrs']['id'];
			}
			if ( 'search' === _get_widget_id_base( $widget ) ) {
				// A null form filter makes core use its unfiltered fallback markup.
				$patterns['core/legacy-widget'] = '/(<form\b)(.*?)(<\/form>)/is';
			}
		}
		if ( ! isset( $patterns[ $block['blockName'] ] ) ) {
			return $content;
		}

		return preg_replace_callback(
			$patterns[ $block['blockName'] ],
			function ( $matches ) {
				return $matches[1] . $this->escape_comment_magic_tags( $matches[2] ) . $matches[3];
			},
			$content
		);
	}

	/**
	 * Preserve native search-form sentinels while protecting rendered markup.
	 *
	 * @param string|false|null $form Rendered form or a filter sentinel.
	 * @return string|false|null
	 */
	public function escape_search_form_magic_tags( $form ) {
		return is_string( $form ) ? $this->escape_comment_magic_tags( $form ) : $form;
	}

	/**
	 * Protect tag-cloud text and accessibility labels without changing term data.
	 *
	 * @param array<array{name: string, aria_label: string}> $items Tag-cloud display data.
	 * @return array<array{name: string, aria_label: string}>
	 */
	public function escape_tag_cloud_magic_tags( $items ) {
		foreach ( $items as $index => $item ) {
			$items[ $index ]['name']       = $this->escape_comment_magic_tags( $item['name'] );
			$items[ $index ]['aria_label'] = $this->escape_comment_magic_tags( $item['aria_label'] );
		}

		return $items;
	}

	/**
	 * Keep inherited taxonomy menu labels literal while preserving authored labels.
	 *
	 * @param \WP_Post|\WP_Term|\stdClass $item Decorated menu item.
	 * @return \WP_Post|\WP_Term|\stdClass
	 */
	public function escape_taxonomy_menu_magic_tags( $item ) {
		if ( isset( $item->type, $item->title ) && 'taxonomy' === $item->type && ( ! isset( $item->post_title ) || '' === $item->post_title ) ) {
			$item->title = $this->escape_comment_magic_tags( $item->title );
		}

		return $item;
	}

	/**
	 * Keep breadcrumb labels literal without changing their links or allowed markup.
	 *
	 * @param array<array{label: string, url?: string, allow_html?: bool}> $items Breadcrumb items.
	 * @return array<array{label: string, url?: string, allow_html?: bool}>
	 */
	public function escape_breadcrumb_magic_tags( $items ) {
		foreach ( $items as $index => $item ) {
			$items[ $index ]['label'] = $this->escape_comment_magic_tags( $item['label'] );
		}

		return $items;
	}

	/**
	 * Keep visitor and resolved dynamic markers literal across nested block renders.
	 *
	 * @param string $content Untrusted field or markup being displayed.
	 * @return string
	 */
	public function escape_comment_magic_tags( $content ) {
		return str_replace(
			array_keys( self::$literal_marker_escapes ),
			array_values( self::$literal_marker_escapes ),
			$content
		);
	}

	/**
	 * Generate a placeholder that neither authored nor resolved content can predict.
	 *
	 * @param string $prefix Placeholder prefix.
	 * @return string
	 */
	private static function unguessable_placeholder( $prefix ) {
		return $prefix . wp_generate_password( 32, false );
	}

	/**
	 * Replace literals with unguessable placeholders, recording the text each one restores.
	 *
	 * @param string                $value   Text to protect.
	 * @param array<string, string> $escapes Literal => text restored in its place.
	 * @param array<string, string> $markers Placeholder => restored text, extended in place.
	 * @return string
	 */
	private function protect_literals( $value, $escapes, &$markers ) {
		foreach ( $escapes as $literal => $restored ) {
			if ( false === strpos( $value, $literal ) ) {
				continue;
			}
			$marker             = self::unguessable_placeholder( 'otter-literal-' );
			$value              = str_replace( $literal, $marker, $value );
			$markers[ $marker ] = $restored;
		}
		return $value;
	}

	/**
	 * Hide the live dynamic markers in a value so a later escape keeps them.
	 *
	 * @param string                $value   Text to protect.
	 * @param array<string, string> $markers Placeholder => restored text, extended in place.
	 * @return string
	 */
	private function protect_markers( $value, &$markers ) {
		$prefixes = array_keys( self::$literal_marker_escapes );
		return $this->protect_literals( $value, array_combine( $prefixes, $prefixes ), $markers );
	}

	/**
	 * Escape markers that only form once resolved values, delimited by $seam, join their neighbors.
	 *
	 * @param string $content Markup whose resolved values hold no live marker.
	 * @param string $seam    Delimiter placed around each resolved value.
	 * @return string
	 */
	private function escape_assembled_markers( $content, $seam ) {
		$markers = array();
		$content = str_replace( $seam, '', $this->protect_markers( $content, $markers ) );
		return strtr( $this->escape_comment_magic_tags( $content ), $markers );
	}

	/**
	 * Filter post content for dynamic content.
	 *
	 * @param string $content Post content.
	 *
	 * @return string
	 */
	public function apply_dynamic_content( $content ) {
		if ( false === strpos( $content, '<o-dynamic' ) ) {
			return $content;
		}

		$matches = array();
		$num     = self::parse_dynamic_content_query( $content, $matches );

		if ( isset( $num ) && 0 === $num ) {
			return $content;
		}

		$seam = self::unguessable_placeholder( 'otter-seam-' );
		foreach ( $matches as $match ) {
			$replacement       = $this->apply_data( $match );
			$string_to_replace = $match[0];
			$position          = strstr( $content, $string_to_replace, true );

			if ( false === $position ) {
				continue;
			}

			$position = strlen( $position );
			if ( is_array( $replacement ) ) {
				$re      = '/#otterDynamicLink[^"\'<>]*/';
				$matches = array();
				$num     = preg_match_all( $re, $content, $matches, PREG_SET_ORDER, 0 );

				if ( isset( $matches[0] ) ) {
					$link = $this->apply_link_button( $matches[0] );
				}
				$_content = array_fill( 0, count( $replacement ), $content );
				$content  = '';
				foreach ( $replacement as $key => $value ) {
					$updated_content = substr_replace( $_content[ $key ], $seam . $value . $seam, $position, strlen( $string_to_replace ) );
					if ( isset( $link ) && is_array( $link ) && isset( $link[ $key ] ) ) {
						$updated_content = str_replace( $matches[0], $seam . $link[ $key ] . $seam, $updated_content );
					}
					$content .= $updated_content;
				}
			} else {
				$content = substr_replace( $content, $seam . $replacement . $seam, $position, strlen( $string_to_replace ) );
			}
		}

		return $this->escape_assembled_markers( $content, $seam );
	}

	/**
	 * Get the Dynamic Content regex.
	 *
	 * @return string
	 */
	public static function dynamic_content_regex() {
		// Todo: Improve this Regex, it can't go on for like this. Soon it will be longer than the available space in the universe!!!
		return '/<o-dynamic(?:\s+(?:data-type=["\'](?P<type>[^"\'<>]+)["\']|data-id=["\'](?P<id>[^"\'<>]+)["\']|data-before=["\'](?P<before>[^"\'<>]+)["\']|data-after=["\'](?P<after>[^"\'<>]+)["\']|data-length=["\'](?P<length>[^"\'<>]+)["\']|data-date-type=["\'](?P<dateType>[^"\'<>]+)["\']|data-date-format=["\'](?P<dateFormat>[^"\'<>]+)["\']|data-date-custom=["\'](?P<dateCustom>[^"\'<>]+)["\']|data-time-type=["\'](?P<timeType>[^"\'<>]+)["\']|data-time-format=["\'](?P<timeFormat>[^"\'<>]+)["\']|data-time-custom=["\'](?P<timeCustom>[^"\'<>]+)["\']|data-term-type=["\'](?P<termType>[^"\'<>]+)["\']|data-term-separator=["\'](?P<termSeparator>[^"\'<>]+)["\']|data-meta-key=["\'](?P<metaKey>[^"\'<>]+)["\']|data-parameter=["\'](?P<parameter>[^"\'<>]+)["\']|data-format=["\'](?P<format>[^"\'<>]+)["\']|data-context=["\'](?P<context>[^"\'<>]+)["\']|data-taxonomy=["\'](?P<taxonomy>[^"\'<>]+)["\']|data-hide-prefix=["\'](?P<hidePrefix>[^"\'<>]+)["\']|[a-zA-Z-]+=["\'][^"\'<>]+["\']))*\s*>(?<default>[^ $].*?)<\s*\/\s*o-dynamic>/';
	}

	/**
	 * Parse dynamic content query.
	 *
	 * @param string $content The content to parse.
	 * @param array  $matches The matches.
	 * @return mixed
	 */
	public static function parse_dynamic_content_query( $content, &$matches ) {
		$re = self::dynamic_content_regex();
		return preg_match_all( $re, $content, $matches, PREG_SET_ORDER, 0 );
	}

	/**
	 * Filter post content for Magic Tags.
	 *
	 * @param string $content Post content.
	 *
	 * @return string
	 */
	public function apply_dynamic_magic_tags( $content ) {
		if ( false === strpos( $content, '{otterDynamic?' ) ) {
			return $content;
		}

		// A whole start tag (quoted values may hold ">") or a text Magic Tag, in one pass so resolved values are never re-scanned.
		$re   = '/(?P<tag><[a-zA-Z\/!][^>"\']*(?:(?:"[^"]*"|\'[^\']*\')[^>"\']*)*>)|' . self::MAGIC_TAG_REGEX . '/';
		$seam = self::unguessable_placeholder( 'otter-seam-' );

		$content = preg_replace_callback(
			$re,
			function ( $matches ) use ( $seam ) {
				$value = $this->apply_magic_tags_in_markup( $matches );
				return isset( $matches[2] ) ? $seam . $value . $seam : $value;
			},
			$content
		);

		return $this->escape_assembled_markers( $content, $seam );
	}

	/**
	 * Resolve a text Magic Tag, or resolve and sanitize complete attribute values.
	 *
	 * @param array<int|string, string> $matches Start tag in `tag`, or the text Magic Tag query in `2`.
	 *
	 * @return string|string[]|void
	 */
	public function apply_magic_tags_in_markup( $matches ) {
		if ( isset( $matches[2] ) ) {
			return $this->apply_magic_tags( array( 1 => $matches[2] ) );
		}

		if ( false === strpos( $matches['tag'], '{otterDynamic?' ) || ! preg_match( '/^<([a-zA-Z][^\s\/>]*)/', $matches['tag'], $tag ) ) {
			return $matches['tag'];
		}

		$literal_markers  = array();
		$escaped_prefixes = array_values( self::$literal_marker_escapes );
		$escaped_literals = array();
		foreach ( $escaped_prefixes as $prefix ) {
			$escaped_literals[ $prefix ]                               = $prefix;
			$escaped_literals[ wp_kses_normalize_entities( $prefix ) ] = $prefix;
		}
		$markup = $this->protect_literals( $matches['tag'], $escaped_literals, $literal_markers );

		$closing_tag = '</' . $tag[1] . '>';
		$processor   = new \WP_HTML_Tag_Processor( $markup . $closing_tag );
		if ( ! $processor->next_tag() ) {
			return $matches['tag'];
		}

		foreach ( (array) $processor->get_attribute_names_with_prefix( '' ) as $attribute ) {
			$value = $processor->get_attribute( $attribute );
			if ( ! is_string( $value ) || false === strpos( $value, '{otterDynamic?' ) ) {
				continue;
			}

			if ( 0 === strpos( $attribute, 'on' ) || 'srcdoc' === $attribute ) {
				$processor->remove_attribute( $attribute );
				continue;
			}

			$value = preg_replace_callback(
				'/({otterDynamic\?[^}]*})|otterDynamicLink|otter\/v1\/dynamic/',
				function ( $token ) use ( &$literal_markers ) {
					return isset( $token[1] ) ? $token[0] : $this->protect_markers( $token[0], $literal_markers );
				},
				$value
			);

			$value = preg_replace_callback(
				'/{(otterDynamic\?[^}]*)}/',
				function ( $token ) use ( &$literal_markers ) {
					$value = html_entity_decode( (string) $this->apply_magic_tags( $token ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
					return $this->protect_literals( $value, self::$literal_marker_escapes, $literal_markers );
				},
				$value
			);
			$value = $this->protect_literals( $value, self::$literal_marker_escapes, $literal_markers );

			// SVG links still follow xlink:href, which core's URI list omits; it may hold a bare relative reference.
			if ( 'xlink:href' === $attribute ) {
				$value = wp_kses_bad_protocol( $value, wp_allowed_protocols() );
			} elseif ( in_array( $attribute, wp_kses_uri_attributes(), true ) ) {
				$value = esc_url_raw( $value );
			} elseif ( 'style' === $attribute ) {
				$value = safecss_filter_attr( $value );
			}

			$processor->set_attribute( $attribute, $value );
		}

		$markup = substr( $processor->get_updated_html(), 0, -strlen( $closing_tag ) );
		$markup = str_replace( '{otterDynamic?', self::$literal_marker_escapes['{otterDynamic?'], $markup );
		return strtr( $markup, $literal_markers );
	}

	/**
	 * Apply dynamic data for Magic Tags.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string|void
	 */
	public function apply_magic_tags( $data ) {
		if ( ! isset( $data[1] ) ) {
			return;
		}

		$data = explode( 'otterDynamic', $data[1] );
		$data = self::query_string_to_array( $data[1] );

		if ( ! isset( $data['default'] ) ) {
			$data['default'] = '';
		}

		$data = $this->apply_data( $data, true );

		return $data;
	}

	/**
	 * Filter post content for dynamic link.
	 *
	 * @param string   $content Post content.
	 * @param int|null $key Optional key for multiple dynamic links in the same content.
	 *
	 * @return string
	 */
	public function apply_dynamic_link( $content, $key = null ) {
		if ( false === strpos( $content, '<o-dynamic-link' ) ) {
			return $content;
		}

		$re = '/<o-dynamic-link(?:\s+(?:data-type=["\'](?P<type>[^"\'<>]+)["\']|data-target=["\'](?P<target>[^"\'<>]+)["\']|data-meta-key=["\'](?P<metaKey>[^"\'<>]+)["\']|data-context=["\'](?P<context>[^"\'<>]+)["\']|[a-zA-Z-]+=["\'][^"\'<>]+["\']))*\s*>(?<text>[^ $].*?)<\s*\/\s*o-dynamic-link>/';

		$matches = array();
		$num     = preg_match_all( $re, $content, $matches, PREG_SET_ORDER, 0 );
		if ( isset( $num ) && 0 === $num ) {
			return $content;
		}

		$resolved    = array();
		$clone_count = 1;
		foreach ( $matches as $match ) {
			$value      = $this->apply_link( $match, $key );
			$resolved[] = $value;
			if ( is_array( $value ) ) {
				$clone_count = max( $clone_count, count( $value ) );
			}
		}

		// Replace the content for multiple dynamic links in the same content.
		if ( $clone_count > 1 ) {
			$output = '';
			for ( $i = 0; $i < $clone_count; $i++ ) {
				$clone = $content;
				foreach ( $matches as $j => $match ) {
					$value       = $resolved[ $j ];
					$replacement = is_array( $value )
						? ( isset( $value[ $i ] ) ? $value[ $i ] : '' )
						: $value;
					$pos         = strpos( $clone, $match[0] );
					if ( false !== $pos ) {
						$clone = substr_replace( $clone, $replacement, $pos, strlen( $match[0] ) );
					}
				}
				$output .= $clone;
			}
			return $output;
		}

		// Replace the content for single dynamic link in the content.
		$index = 0;
		return preg_replace_callback(
			$re,
			function ( $data ) use ( &$resolved, &$index ) {
				$value = isset( $resolved[ $index ] ) ? $resolved[ $index ] : $data[0];
				$index++;
				return is_string( $value ) ? $value : $data[0];
			},
			$content
		);
	}

	/**
	 * Filter post content for dynamic link buttons.
	 *
	 * @param string $content Post content.
	 *
	 * @return string
	 */
	public function apply_dynamic_link_button( $content ) {
		if ( false === strpos( $content, '#otterDynamicLink' ) ) {
			return $content;
		}

		$re = '/#otterDynamicLink[^"\'<>]*/';

		return preg_replace_callback( $re, array( $this, 'apply_link_button' ), $content );
	}

	/**
	 * Resolve dynamic image URLs for CSS, which does not decode HTML entities.
	 *
	 * @param string $content CSS image URL.
	 *
	 * @return string
	 */
	public function apply_dynamic_css_images( $content ) {
		return $this->apply_dynamic_images( $content, false );
	}

	/**
	 * Filter post content for dynamic images.
	 *
	 * @param string $content        Post content.
	 * @param bool   $escape_markers Whether resolved URLs keep dynamic markers literal for later block renders.
	 *
	 * @return string
	 */
	public function apply_dynamic_images( $content, $escape_markers = true ) {
		if ( false === strpos( $content, 'otter/v1/dynamic' ) ) {
			return $content;
		}

		$rest_url = get_rest_url( null, 'otter/v1' );
		$rest_url = preg_replace( '/([^A-Za-z0-9\s_-])/', '\\\\$1', $rest_url );

		$re      = '/' . $rest_url . '\/dynamic[^"\'<>]*/';
		$matches = array();
		$num     = preg_match_all( $re, $content, $matches, PREG_SET_ORDER, 0 );
		if ( isset( $num ) && 0 === $num ) {
			return $content;
		}

		$resolved    = array();
		$clone_count = 1;
		foreach ( $matches as $match ) {
			$value = $this->apply_images( $match );
			if ( $escape_markers && is_array( $value ) ) {
				$value = array_map( array( $this, 'escape_comment_magic_tags' ), $value );
			} elseif ( $escape_markers && is_string( $value ) ) {
				$value = $this->escape_comment_magic_tags( $value );
			}
			$resolved[] = $value;
			if ( is_array( $value ) ) {
				$clone_count = max( $clone_count, count( $value ) );
			}
		}

		// Replace the content for multiple dynamic images in the same content.
		if ( $clone_count > 1 ) {
			$output = '';
			for ( $i = 0; $i < $clone_count; $i++ ) {
				$clone = $content;
				foreach ( $matches as $j => $match ) {
					$value       = $resolved[ $j ];
					$replacement = is_array( $value )
						? ( isset( $value[ $i ] ) ? $value[ $i ] : '' )
						: $value;
					$pos         = strpos( $clone, $match[0] );
					if ( false !== $pos ) {
						$clone = substr_replace( $clone, $replacement, $pos, strlen( $match[0] ) );
					}
				}
				$output .= $clone;
			}
			return $output;
		}

		// Replace the content for single dynamic image in the content.
		$index = 0;
		return preg_replace_callback(
			$re,
			function ( $data ) use ( &$resolved, &$index ) {
				$value = isset( $resolved[ $index ] ) ? $resolved[ $index ] : $data[0];
				$index++;
				return is_string( $value ) ? $value : $data[0];
			},
			$content
		);
	}

	/**
	 * Apply dynamic data.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string|list<string>|false|void
	 */
	public function apply_images( $data ) {
		if ( ! isset( $data[0] ) ) {
			return;
		}

		$data  = self::query_string_to_array( $data[0] );
		$value = $this->get_image( $data );

		return $value;
	}

	/**
	 * Apply dynamic image.
	 *
	 * @param array<string, int|string|null> $data Query array.
	 *
	 * @return string|list<string>|false
	 */
	public function get_image( $data ) {
		$value = OTTER_BLOCKS_URL . 'assets/images/placeholder.jpg';

		$id = ( ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || ( isset( $data['context'] ) && 'query' === $data['context'] ) ) ? (int) get_the_ID() : get_queried_object_id();

		if ( isset( $data['context'] ) && ( 'query' === $data['context'] || ( is_singular() && $data['context'] !== $id ) ) ) {
			$data['context'] = $id;
		}

		if ( empty( $data['context'] ) ) {
			$data['context'] = (int) get_the_ID();
		}

		if ( isset( $data['fallback'] ) && ! empty( $data['fallback'] ) ) {
			$value = esc_url( $data['fallback'] );
		}

		if ( ! isset( $data['type'] ) && empty( $data['type'] ) ) {
			return $value;
		}

		$server = \ThemeIsle\GutenbergBlocks\Server\Dynamic_Content_Server::instance();
		if ( ! in_array( $data['type'], array( 'logo', 'loggedInUser' ), true ) && ! $server->check_permission( (int) $data['context'] ) ) {
			return $value;
		}

		if ( 'product' === $data['type'] && ! empty( $data['id'] ) && ! $server->check_permission( (int) $data['id'] ) ) {
			return $value;
		}

		if ( 'featuredImage' === $data['type'] ) {
			$image = get_the_post_thumbnail_url( $data['context'] );

			if ( $image ) {
				$value = $image;
			}
		}

		if ( 'author' === $data['type'] ) {
			$author = get_post_field( 'post_author', $data['context'] );
			$value  = get_avatar_url( $author );
		}

		if ( 'loggedInUser' === $data['type'] ) {
			$user = get_current_user_id();

			if ( true === boolval( $user ) ) {
				$value = get_avatar_url( $user );
			}
		}

		if ( 'logo' === $data['type'] ) {
			$custom_logo_id = get_theme_mod( 'custom_logo' );

			if ( $custom_logo_id ) {
				$value = wp_get_attachment_image_url( $custom_logo_id, 'full' );
			}
		}

		$value = apply_filters( 'otter_blocks_evaluate_dynamic_content_media_content', $value, $data );

		return $value;
	}

	/**
	 * Apply dynamic data.
	 *
	 * @param array<int|string, int|string|null> $data Dynamic request.
	 * @param bool                               $magic_tags Is a request for Magic Tags.
	 *
	 * @return int|string|list<string>|false
	 */
	public function apply_data( $data, $magic_tags = false ) {
		$value = $this->get_data( $data, $magic_tags );

		if ( is_string( $value ) ) {
			$value = $this->escape_comment_magic_tags( $value );
		}

		if ( is_array( $value ) ) {
			$updated_value = array();
			foreach ( $value as $key => $val ) {
				$_value = $this->apply_formatting( $val, $data );
				
				if ( isset( $data['default'] ) && false !== strpos( $data['default'], '<o-dynamic-link' ) ) {
					$link = $this->apply_dynamic_link( $data['default'], $key );
					if ( ! empty( $link ) ) {
						$_value = preg_replace( '/(<a.*?>).*?(<\/a>)/', '$1' . $_value . '$2', $link );
					}
				}

				$updated_value[] = $_value;
			}
			return $updated_value;
		}

		if ( isset( $data['before'] ) || isset( $data['after'] ) ) {
			$value = $this->apply_formatting( $value, $data );
		}

		if ( isset( $data['default'] ) && false !== strpos( $data['default'], '<o-dynamic-link' ) ) {
			$link = $this->apply_dynamic_link( $data['default'] );
			return preg_replace( '/(<a.*?>).*?(<\/a>)/', '$1' . $value . '$2', $link );
		}

		return $value;
	}

	/**
	 * Apply formatting.
	 *
	 * @param string $value Dynamic value.
	 * @param array  $data Dynamic request.
	 *
	 * @return string
	 */
	public function apply_formatting( $value, $data ) {
		$markers = array();
		if ( isset( $data['before'] ) ) {
			$value = $this->protect_markers( esc_html( $data['before'] ), $markers ) . $value;
		}

		if ( isset( $data['after'] ) ) {
			$value = $value . $this->protect_markers( esc_html( $data['after'] ), $markers );
		}

		return strtr( $this->escape_comment_magic_tags( $value ), $markers );
	}

	/**
	 * Get dynamic data.
	 *
	 * @param array $data Dynamic request.
	 * @param bool  $magic_tags Is a request for Magic Tags.
	 *
	 * @return string|string[]
	 */
	public function get_data( $data, $magic_tags ) {
		if ( ! ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || true === $magic_tags ) {
			if ( isset( $data['context'] ) && 'query' === $data['context'] ) {
				$data['context'] = get_the_ID();
			} else {
				/*
				* We use the queried object ID to make sure when posts are displayed inside other posts
				* the displayed post is being used as a source for the dynamic tags. Eg. Custom Layouts inside Neve.
				*/
				$data['context'] = get_queried_object_id();
			}
		} else {
			$data['default'] = '';
		}

		if ( ! isset( $data['type'] ) && isset( $data['default'] ) ) {
			return esc_html( $data['default'] );
		}

		if ( 'postID' === $data['type'] ) {
			return $data['context'];
		}

		if ( 'postTitle' === $data['type'] ) {
			return get_the_title( $data['context'] );
		}

		if ( 'postContent' === $data['type'] ) {
			return $this->get_content( $data );
		}

		if ( 'postExcerpt' === $data['type'] ) {
			return $this->get_excerpt( $data );
		}

		if ( 'postType' === $data['type'] ) {
			return get_post_type( $data['context'] );
		}

		if ( 'postStatus' === $data['type'] ) {
			return get_post_status( $data['context'] );
		}

		if ( 'siteTitle' === $data['type'] ) {
			return get_bloginfo( 'name' );
		}

		if ( 'siteTagline' === $data['type'] ) {
			return get_bloginfo( 'description' );
		}

		if ( 'authorName' === $data['type'] ) {
			return get_the_author_meta( 'display_name', intval( get_post_field( 'post_author', $data['context'] ) ) );
		}

		if ( 'authorDescription' === $data['type'] ) {
			return get_the_author_meta( 'description', intval( get_post_field( 'post_author', $data['context'] ) ) );
		}

		if ( 'loggedInUserName' === $data['type'] ) {
			return $this->get_loggedin_name( $data );
		}

		if ( 'loggedInUserDescription' === $data['type'] ) {
			return $this->get_loggedin_description( $data );
		}

		if ( 'loggedInUserEmail' === $data['type'] ) {
			return $this->get_loggedin_email( $data );
		}

		if ( 'archiveTitle' === $data['type'] ) {
			return $this->get_archive_title( $data );
		}

		if ( 'archiveDescription' === $data['type'] ) {
			return $this->get_archive_description( $data );
		}

		if ( 'date' === $data['type'] ) {
			return $this->get_current_date( $data );
		}

		if ( 'time' === $data['type'] ) {
			return $this->get_current_time( $data );
		}

		return apply_filters( 'otter_blocks_evaluate_dynamic_content_text', $data['default'], $data );
	}

	/**
	 * Get Content.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_content( $data ) {
		$data = $this->mark_exceptions( $data );
		$key  = $this->get_exception_key( $data );

		if ( isset( $data[ $key ] ) || isset( self::$rendering_content[ $key ] ) ) {
			return '';
		}

		// Static: nested tags are resolved by the hooked instance, not necessarily this one.
		self::$rendering_content[ $key ] = true;

		try {
			$content = get_the_content( null, false, $data['context'] );
			$content = apply_filters( 'the_content', str_replace( ']]>', ']]&gt;', $content ) );
		} finally {
			unset( self::$rendering_content[ $key ] );
		}

		return wp_kses_post( $content );
	}

	/**
	 * Get Excerpt.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_excerpt( $data ) {
		$post    = get_post( $data['context'] );
		$excerpt = $post->post_excerpt; // Here we don't use get_the_excerpt() function as it causes an infinite loop.

		if ( empty( $excerpt ) ) {
			$data = $this->mark_exceptions( $data );
			$key  = $this->get_exception_key( $data, $post->ID );

			if ( ! isset( $data[ $key ] ) ) {
				remove_filter( 'render_block', array( $this, 'apply_dynamic_content' ), 10 );
				$excerpt = wp_trim_excerpt( '', $post );
				add_filter( 'render_block', array( $this, 'apply_dynamic_content' ), 10 );
			}
		}

		if ( isset( $data['length'] ) && ! empty( $data['length'] ) ) {
			$excerpt = substr( $excerpt, 0, intval( $data['length'] ) ) . '…';
		}

		if ( empty( $excerpt ) ) {
			return $data['default'];
		}

		return sanitize_text_field( $excerpt );
	}

	/**
	 * Get Logged-in User Name.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_loggedin_name( $data ) {
		$user_id = get_current_user_id();
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$user    = get_userdata( $user_id );

		if ( false === $user ) {
			$display_name = $default;
		} else {
			$display_name = $user->display_name;
		}

		return esc_html( $display_name );
	}

	/**
	 * Get Logged-in User Description.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_loggedin_description( $data ) {
		$user_id = get_current_user_id();
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$user    = get_userdata( $user_id );

		if ( false === $user ) {
			$description = $default;
		} else {
			$description = $user->description;
		}

		return esc_html( $description );
	}

	/**
	 * Get Logged-in User Email.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_loggedin_email( $data ) {
		$user    = wp_get_current_user();
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$email   = $user->user_email;

		if ( empty( $email ) ) {
			$email = $default;
		}

		return esc_html( $email );
	}

	/**
	 * Get Archive Title.
	 *
	 * @param array<string, mixed> $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_archive_title( $data ) {
		$hide_prefix = isset( $data['hidePrefix'] ) && in_array( $data['hidePrefix'], array( 'true', '1' ), true );

		if ( $hide_prefix ) {
			add_filter( 'get_the_archive_title_prefix', '__return_empty_string' );
		}

		$title = get_the_archive_title();

		if ( $hide_prefix ) {
			remove_filter( 'get_the_archive_title_prefix', '__return_empty_string' );
		}

		return $title;
	}

	/**
	 * Get Archive Description.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_archive_description( $data ) {
		$description = get_the_archive_description();

		if ( empty( $description ) ) {
			$description = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		}

		return wp_strip_all_tags( $description );
	}

	/**
	 * Get Current Date.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_current_date( $data ) {
		$format = get_option( 'date_format' );

		if ( isset( $data['dateFormat'] ) && ! empty( $data['dateFormat'] ) && 'default' !== $data['dateFormat'] && 'custom' !== $data['dateFormat'] ) {
			$format = esc_html( $data['dateFormat'] );
		}

		if ( isset( $data['dateCustom'] ) && ! empty( $data['dateCustom'] ) && isset( $data['dateFormat'] ) && 'custom' === $data['dateFormat'] ) {
			$format = esc_html( $data['dateCustom'] );
		}

		$date = gmdate( $format );

		return $date;
	}

	/**
	 * Get Current Date.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_current_time( $data ) {
		$format = get_option( 'time_format' );

		if ( isset( $data['timeFormat'] ) && ! empty( $data['timeFormat'] ) && 'default' !== $data['timeFormat'] && 'custom' !== $data['timeFormat'] ) {
			$format = esc_html( $data['timeFormat'] );
		}

		if ( isset( $data['timeCustom'] ) && ! empty( $data['timeCustom'] ) && isset( $data['timeFormat'] ) && 'custom' === $data['timeFormat'] ) {
			$format = esc_html( $data['timeCustom'] );
		}

		$time = gmdate( $format );

		return $time;
	}

	/**
	 * Convert Query String to Array.
	 *
	 * @param string $qry URL.
	 *
	 * @return array|bool
	 */
	public static function query_string_to_array( $qry ) {
		$result = array();

		if ( strpos( $qry, '=' ) ) {
			if ( strpos( $qry, '?' ) !== false ) {
				$qry = str_replace( array( '&#038;', '&amp;' ), '&', $qry );
				$q   = wp_parse_url( $qry );
				$qry = isset( $q['query'] ) ? $q['query'] : $q['fragment'];
			}
		} else {
			return false;
		}

		foreach ( explode( '&', $qry ) as $couple ) {
			list ( $key, $val ) = array_pad( explode( '=', $couple ), 2, null );
			$result[ $key ]     = $val;
		}

		return $result;
	}

	/**
	 * Apply dynamic data.
	 *
	 * @param array    $data Dynamic request.
	 * @param int|null $key Optional key for multiple dynamic links in the same content.
	 *
	 * @return string|string[]
	 */
	public function apply_link( $data, $key = null ) {
		$link = $this->get_link( $data );

		if ( empty( $link ) ) {
			$link = get_site_url();
		}

		$attrs = '';

		if ( isset( $data['target'] ) && '_blank' === $data['target'] ) {
			$attrs = 'target="_blank"';
		}

		if ( is_array( $link ) ) {
			$value = array();
			foreach ( $link as $link_item ) {
				$value[] = sprintf(
					'<a href="%s" %s>%s</a>',
					$this->esc_resolved_url( $link_item ),
					$attrs,
					wp_kses_post( $data['text'] )
				);
			}

			if ( null !== $key ) {
				return isset( $value[ $key ] ) ? $value[ $key ] : '';
			}

			return $value;
		}
		$value = sprintf(
			'<a href="%s" %s>%s</a>',
			$this->esc_resolved_url( $link ),
			$attrs,
			wp_kses_post( $data['text'] )
		);

		return $value;
	}

	/**
	 * Apply dynamic data for Buttons.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string|string[]|void
	 */
	public function apply_link_button( $data ) {
		if ( ! isset( $data[0] ) ) {
			return;
		}

		$data = explode( '#otterDynamicLink', $data[0] );
		$data = self::query_string_to_array( $data[1] );

		$link = $this->get_link( $data );

		if ( empty( $link ) ) {
			$link = get_site_url();
		}

		if ( is_array( $link ) ) {
			return array_map( array( $this, 'esc_resolved_url' ), $link );
		}

		return $this->esc_resolved_url( $link );
	}

	/**
	 * Escape a resolved URL, keeping its dynamic markers literal while it still decodes to the same URL.
	 *
	 * @param string $url Resolved URL.
	 * @return string
	 */
	private function esc_resolved_url( $url ) {
		return $this->escape_comment_magic_tags( esc_url( $url ) );
	}

	/**
	 * Apply dynamic data.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string|string[]|void
	 */
	public function get_link( $data ) {
		if ( ! isset( $data['type'] ) ) {
			return;
		}

		if ( isset( $data['context'] ) && 'query' === $data['context'] ) {
			$data['context'] = get_the_ID();
		} else {
			$data['context'] = get_queried_object_id();
		}

		if ( 'postURL' === $data['type'] ) {
			return get_the_permalink( $data['context'] );
		}

		if ( 'siteURL' === $data['type'] ) {
			return get_site_url();
		}

		if ( 'featuredImageURL' === $data['type'] ) {
			return wp_get_attachment_url( get_post_thumbnail_id( $data['context'] ) );
		}

		if ( 'authorURL' === $data['type'] ) {
			return get_author_posts_url( intval( get_post_field( 'post_author', $data['context'] ) ) );
		}

		if ( 'authorWebsite' === $data['type'] ) {
			return get_the_author_meta( 'url', intval( get_post_field( 'post_author', $data['context'] ) ) );
		}

		return apply_filters( 'otter_blocks_evaluate_dynamic_content_link', '', $data );
	}

	/**
	 * Mark the exceptions for Dynamic request.
	 *
	 * Features that are using complex functions like `get_content` (directly or indirectly) might not behave correctly in every situation.
	 * Based on the context, we decide if it is safe to use those functions..
	 *
	 * @param array $data Dynamic request.
	 * @return array Dynamic request with marked exceptions.
	 */
	public function mark_exceptions( $data ) {
		if ( 'postExcerpt' === $data['type'] || 'postContent' === $data['type'] ) {
			if (
				'valid' === apply_filters( 'product_neve_license_status', false ) &&
				class_exists( '\Neve_Pro\Modules\Custom_Layouts\Module' )
			) {
				$post = get_post( $data['context'] );
				if ( isset( $post ) && 'neve_custom_layouts' === $post->post_type ) {
					$key = $this->get_exception_key( $data, $post->ID );
					if ( $key ) {
						$data[ $key ] = true;
					}
				}
			}

			if ( 'postContent' === $data['type'] ) {

				// To do not trigger postContent action if the given content contains the postContent dynamic tag, because it will cause an infinite loop.
				$post = get_post( $data['context'] );
				if ( ! $post instanceof \WP_Post ) {
					return $data;
				}
				$content = get_the_content( null, false, $data['context'] );
				$matches = array();
				self::parse_dynamic_content_query( $content, $matches );
				if ( in_array( 'postContent', array_column( $matches, 'type' ), true ) ) {
					$key = $this->get_exception_key( $data, $post->ID );
					if ( $key ) {
						$data[ $key ] = true;
					}
				}
			}
		}

		if ( has_filter( 'otter_blocks_dynamic_content_exception' ) ) {

			/**
			 * Gather exceptions for Dynamic request from other plugins via hooks. Before merging the changes, we make sure that critical data is present.
			 */
			$data_exceptions = apply_filters( 'otter_blocks_dynamic_content_exception', $data );
			if (
				isset( $data_exceptions ) &&
				is_array( $data_exceptions )
			) {
				$merged = array_merge( $data, $data_exceptions );

				if ( isset( $merged['type'] ) && isset( $merged['context'] ) ) {
					$data = $merged;
				}
			}
		}

		return $data;
	}

	/**
	 * Get the exception key for Dynamic request.
	 *
	 * @param array   $data Dynamic request.
	 * @param numeric $post_id Post ID.
	 * @return string|null
	 */
	public function get_exception_key( $data, $post_id = null ) {
		if ( null == $post_id ) {
			$post = get_post( $data['context'] );
			if ( isset( $post ) ) {
				$post_id = $post->ID;
			}
		}

		return 'exception_dynamic_content_' . $data['type'] . '_' . $post_id;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.2.0
	 * @access public
	 * @return Dynamic_Content
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 1.2.0
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @since 1.2.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
