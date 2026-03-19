<?php
/**
 * Atomic Wind Blocks module.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

/**
 * Atomic Wind Blocks
 *
 * Registers the 5 primitive Atomic Wind blocks and all supporting subsystems
 * (Tailwind CSS pipeline, animations, states, query, class editor).
 */
class Atomic_Wind_Blocks {

	/**
	 * Initialize the module.
	 *
	 * @return void
	 */
	public function instance() {
		// die();
		$this->run();
	}

	/**
	 * Run the module if the option is enabled.
	 *
	 * @return void
	 */
	public function run() {
		if ( ! get_option( 'themeisle_blocks_settings_atomic_wind_blocks', false ) ) {
			return;
		}

		$this->register_blocks();

		add_action( 'enqueue_block_assets', array( $this, 'enqueue_tailwind_generator' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_base_css' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_icons_data' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_action( 'wp_head', array( $this, 'output_cached_css' ), 5 );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_animations' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_states' ) );
		add_filter( 'render_block', array( $this, 'render_query_loop' ), 5, 2 );
		add_filter( 'render_block', array( $this, 'render_post_fields' ), 20, 2 );
		add_filter( 'render_block', array( $this, 'render_animation_attrs' ), 10, 2 );
		add_filter( 'render_block', array( $this, 'render_state_attrs' ), 10, 2 );
		add_filter( 'block_categories_all', array( $this, 'register_category' ) );
	}

	/**
	 * Get the path to the plugin root.
	 *
	 * @return string
	 */
	private function base_path() {
		return OTTER_BLOCKS_PATH;
	}

	/**
	 * Get the build directory path.
	 *
	 * @return string
	 */
	private function build_path() {
		return $this->base_path() . '/build/atomic-wind';
	}

	/**
	 * Get a plugins_url relative to the otter-blocks root.
	 *
	 * @param string $path Relative path.
	 * @return string
	 */
	private function plugin_url( $path ) {
		return plugins_url( $path, $this->base_path() . '/otter-blocks.php' );
	}

	/**
	 * Register all Atomic Wind block types from the build directory.
	 *
	 * @return void
	 */
	private function register_blocks() {
		$build_dir = $this->build_path() . '/blocks';

		if ( ! is_dir( $build_dir ) ) {
			return;
		}

		foreach ( scandir( $build_dir ) as $block ) {
			if ( '.' === $block || '..' === $block ) {
				continue;
			}

			$block_path = $build_dir . '/' . $block;

			if ( is_dir( $block_path ) && file_exists( $block_path . '/block.json' ) ) {
				register_block_type( $block_path );
			}
		}
	}

	/**
	 * Enqueue the Tailwind CSS generator in the editor.
	 *
	 * @return void
	 */
	public function enqueue_tailwind_generator() {
		if ( ! is_admin() ) {
			return;
		}

		$asset_file = $this->build_path() . '/tailwind-generator.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'atomic-wind-tailwind-generator',
			$this->plugin_url( 'build/atomic-wind/tailwind-generator.js' ),
			$asset['dependencies'],
			$asset['version']
		);
	}

	/**
	 * Enqueue base CSS that zeroes out margins for all atomic-wind blocks.
	 *
	 * @return void
	 */
	public function enqueue_base_css() {
		wp_register_style( 'atomic-wind-base', false );
		wp_enqueue_style( 'atomic-wind-base' );
		$css = '[class*="wp-block-atomic-wind-"]{margin:0;max-width:unset;}[class*="wp-block-atomic-wind-"] p{margin:0;}';
		if ( is_admin() ) {
			$css .= '.editor-styles-wrapper .wp-block[class*="wp-block-atomic-wind-"]{margin:0;max-width:unset;}.editor-styles-wrapper [class*="wp-block-atomic-wind-"] p{margin:0;}';
		}
		wp_add_inline_style( 'atomic-wind-base', $css );
	}

	/**
	 * Inject window.atomicWindIcons data for the icon block editor UI.
	 *
	 * @return void
	 */
	public function enqueue_icons_data() {
		$icons = array_map(
			fn( $f ) => basename( $f, '.svg' ),
			glob( $this->base_path() . '/assets/atomic-wind/icons/*.svg' ) ?: array()
		);

		wp_add_inline_script(
			'wp-blocks',
			'window.atomicWindIcons = ' . wp_json_encode(
				array(
					'icons'     => $icons,
					'assetsUrl' => $this->plugin_url( 'assets/atomic-wind/icons/' ),
				)
			) . ';' .
			'window.atomicWindEditor = ' . wp_json_encode(
				array(
					'restUrl' => rest_url( 'otter/v1/atomic-wind' ),
					'nonce'   => wp_create_nonce( 'wp_rest' ),
				)
			) . ';',
			'before'
		);
	}

	/**
	 * Enqueue the unified editor script and styles (animations, states, query, class editor).
	 *
	 * @return void
	 */
	public function enqueue_editor_assets() {
		$asset_file = $this->build_path() . '/editor.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'atomic-wind-editor',
			$this->plugin_url( 'build/atomic-wind/editor.js' ),
			array_merge( $asset['dependencies'], array( 'wp-blocks', 'wp-hooks' ) ),
			$asset['version']
		);

		wp_enqueue_style(
			'atomic-wind-editor',
			$this->plugin_url( 'build/atomic-wind/style-editor.css' ),
			array(),
			$asset['version']
		);
	}

	/**
	 * Output cached Tailwind CSS or enqueue the generator + style-builder.
	 *
	 * @return void
	 */
	public function output_cached_css() {
		global $post;


		if ( ! $post ) {
			return;
		}

		$cached_css = get_post_meta( $post->ID, '_atomic_wind_css', true );

		if ( $cached_css ) {
			echo '<style id="atomic-wind-tailwind">' . $cached_css . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			return;
		}

		$generator_asset = $this->build_path() . '/tailwind-generator.asset.php';

		if ( ! file_exists( $generator_asset ) ) {
			return;
		}

		$gen = include $generator_asset;
		wp_enqueue_script(
			'atomic-wind-tailwind-generator',
			$this->plugin_url( 'build/atomic-wind/tailwind-generator.js' ),
			$gen['dependencies'],
			$gen['version']
		);

		if ( is_user_logged_in() && current_user_can( 'edit_post', $post->ID ) ) {
			$builder_asset = $this->build_path() . '/style-builder.asset.php';

			if ( file_exists( $builder_asset ) ) {
				$sb = include $builder_asset;
				wp_enqueue_script(
					'atomic-wind-style-builder',
					$this->plugin_url( 'build/atomic-wind/style-builder.js' ),
					$sb['dependencies'],
					$sb['version']
				);

				wp_localize_script( 'atomic-wind-style-builder', 'atomicWindStyleBuilder', array(
					'postId'  => $post->ID,
					'restUrl' => rest_url( 'otter/v1/atomic-wind' ),
					'nonce'   => wp_create_nonce( 'wp_rest' ),
				) );
			}
		}
	}

	/**
	 * Register REST API route for saving generated CSS.
	 *
	 * @return void
	 */
	public function register_rest_routes() {
		register_rest_route( 'otter/v1', '/atomic-wind/style', array(
			'methods'             => 'POST',
			'callback'            => function ( \WP_REST_Request $request ) {
				$post_id = absint( $request->get_param( 'postId' ) );
				$css     = $request->get_param( 'css' );

				$success = update_post_meta( $post_id, '_atomic_wind_css', wp_slash( $css ) );

				return new \WP_REST_Response( array( 'success' => $success ), 200 );
			},
			'permission_callback' => function ( \WP_REST_Request $request ) {
				$post_id = absint( $request->get_param( 'postId' ) );

				return current_user_can( 'edit_post', $post_id );
			},
			'args'                => array(
				'css'    => array(
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => function ( $value ) {
						return wp_strip_all_tags( $value );
					},
				),
				'postId' => array(
					'type'     => 'integer',
					'required' => true,
				),
			),
		) );
	}

	/**
	 * Enqueue animations frontend CSS and JS.
	 *
	 * @return void
	 */
	public function enqueue_frontend_animations() {
		$asset_file = $this->build_path() . '/animations-frontend.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_style(
			'atomic-wind-animations',
			$this->plugin_url( 'build/atomic-wind/style-animations-frontend.css' ),
			array(),
			$asset['version']
		);

		wp_enqueue_script(
			'atomic-wind-animations-frontend',
			$this->plugin_url( 'build/atomic-wind/animations-frontend.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}

	/**
	 * Enqueue states frontend JS.
	 *
	 * @return void
	 */
	public function enqueue_frontend_states() {
		$asset_file = $this->build_path() . '/states-frontend.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'atomic-wind-states-frontend',
			$this->plugin_url( 'build/atomic-wind/states-frontend.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}

	/**
	 * Render query loop for box blocks with queryPostType.
	 *
	 * @param string $block_content Block content.
	 * @param array  $block         Block data.
	 * @return string
	 */
	public function render_query_loop( $block_content, $block ) {
		if ( ( $block['blockName'] ?? '' ) !== 'atomic-wind/box' ) {
			return $block_content;
		}

		$post_type = $block['attrs']['queryPostType'] ?? '';
		if ( ! $post_type ) {
			return $block_content;
		}

		global $post;
		$saved_post = $post;

		$args = array(
			'post_type'      => sanitize_key( $post_type ),
			'posts_per_page' => absint( $block['attrs']['queryCount'] ?? 3 ),
			'orderby'        => sanitize_key( $block['attrs']['queryOrderBy'] ?? 'date' ),
			'order'          => strtoupper( $block['attrs']['queryOrder'] ?? 'DESC' ) === 'ASC' ? 'ASC' : 'DESC',
			'no_found_rows'  => true,
		);

		$taxonomy_filter = $block['attrs']['queryTaxonomy'] ?? '';
		if ( $taxonomy_filter && str_contains( $taxonomy_filter, ':' ) ) {
			$parts = explode( ':', $taxonomy_filter, 2 );
			$tax   = sanitize_key( $parts[0] );
			$term  = sanitize_key( $parts[1] );
			if ( $tax && $term ) {
				$args['tax_query'] = array( array( 'taxonomy' => $tax, 'field' => 'slug', 'terms' => array( $term ) ) ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			}
		}

		if ( ! empty( $block['attrs']['queryExcludeCurrent'] ) && $saved_post ) {
			$args['post__not_in'] = array( $saved_post->ID );
		}

		$sticky = $block['attrs']['querySticky'] ?? '';
		if ( 'exclude' === $sticky ) {
			$args['ignore_sticky_posts'] = true;
		} elseif ( 'only' === $sticky ) {
			$sticky_ids = get_option( 'sticky_posts' );
			if ( ! empty( $sticky_ids ) ) {
				$args['post__in']            = $sticky_ids;
				$args['ignore_sticky_posts'] = true;
			} else {
				return '';
			}
		}

		$query = new \WP_Query( $args );

		if ( ! $query->have_posts() ) {
			wp_reset_postdata();
			$post = $saved_post; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			return '';
		}

		preg_match( '/^\s*(<[^>]+>)/s', $block_content, $open_match );
		preg_match( '/(<\/[a-zA-Z0-9]+>)\s*$/s', $block_content, $close_match );
		$opening_tag = $open_match[1] ?? '';
		$closing_tag = $close_match[1] ?? '';

		$loop_output = '';
		$GLOBALS['atomic_wind_in_query'] = true;

		while ( $query->have_posts() ) {
			$query->the_post();
			foreach ( $block['innerBlocks'] as $inner_block ) {
				$loop_output .= render_block( $inner_block );
			}
		}

		unset( $GLOBALS['atomic_wind_in_query'] );
		wp_reset_postdata();
		$post = $saved_post; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		return $opening_tag . $loop_output . $closing_tag;
	}

	/**
	 * Replace block content with post field data inside query loops.
	 *
	 * @param string $block_content Block content.
	 * @param array  $block         Block data.
	 * @return string
	 */
	public function render_post_fields( $block_content, $block ) {
		if ( ! str_starts_with( $block['blockName'] ?? '', 'atomic-wind/' ) ) {
			return $block_content;
		}

		$post_field = $block['attrs']['postField'] ?? '';
		if ( ! $post_field || empty( $GLOBALS['atomic_wind_in_query'] ) ) {
			return $block_content;
		}

		$block_name = $block['blockName'];

		if ( 'atomic-wind/text' === $block_name ) {
			$value = '';
			switch ( $post_field ) {
				case 'title':
					$value = get_the_title();
					break;
			case 'excerpt':
				$length = absint( $block['attrs']['excerptLength'] ?? 25 );
				$raw    = get_the_excerpt();
				$value  = wp_trim_words( wp_strip_all_tags( $raw ), $length, '&hellip;' );
				break;
				case 'date':
					$value = get_the_date();
					break;
				case 'author':
					$value = get_the_author();
					break;
				case 'categories':
					$cats = get_the_category();
					if ( $cats ) {
						$value = implode( ', ', wp_list_pluck( $cats, 'name' ) );
					}
					break;
				case 'tags':
					$tags = get_the_tags();
					if ( $tags ) {
						$value = implode( ', ', wp_list_pluck( $tags, 'name' ) );
					}
					break;
				case 'modified_date':
					$value = get_the_modified_date();
					break;
			case 'comment_count':
				$value = (string) get_comments_number();
				break;
			case 'reading_time':
				$content    = get_the_content();
				$word_count = str_word_count( wp_strip_all_tags( $content ) );
				$minutes    = max( 1, (int) ceil( $word_count / 200 ) );
				/* translators: %d: number of minutes */
				$value = sprintf( _n( '%d min read', '%d min read', $minutes, 'otter-blocks' ), $minutes );
				break;
			case 'custom_field':
				$meta_key = sanitize_text_field( $block['attrs']['customFieldKey'] ?? '' );
				if ( $meta_key ) {
					$value = '';
					if ( function_exists( 'get_field' ) ) {
						$acf = get_field( $meta_key, get_the_ID() );
						if ( is_string( $acf ) ) {
							$value = $acf;
						}
					}
					if ( ! $value ) {
						$raw = get_post_meta( get_the_ID(), $meta_key, true );
						if ( is_string( $raw ) ) {
							$value = $raw;
						}
					}
				}
				break;
			}
			if ( $value ) {
				$escaped       = esc_html( $value );
				$block_content = preg_replace_callback(
					'/^\s*(<[^>]+>).*(<\/[a-zA-Z0-9]+>)\s*$/s',
					function ( $m ) use ( $escaped ) {
						return $m[1] . $escaped . $m[2];
					},
					$block_content
				);
			}
		} elseif ( 'atomic-wind/link' === $block_name ) {
			$url = '';
			switch ( $post_field ) {
				case 'permalink':
					$url = get_the_permalink();
					break;
				case 'author_posts_url':
					$url = get_author_posts_url( get_the_author_meta( 'ID' ) );
					break;
			case 'category_link':
				$cats = get_the_category();
				if ( $cats && ! empty( $cats[0] ) ) {
					$url = get_category_link( $cats[0]->term_id );
				}
				break;
			case 'tag_link':
				$tags = get_the_tags();
				if ( $tags && ! empty( $tags[0] ) ) {
					$url = get_tag_link( $tags[0]->term_id );
				}
				break;
			case 'date_archive':
				$url = get_month_link( get_the_date( 'Y' ), get_the_date( 'n' ) );
				break;
			case 'author_archive':
				$url = get_author_posts_url( get_the_author_meta( 'ID' ) );
				break;
			}
			if ( $url ) {
				$href = 'href="' . esc_url( $url ) . '"';
				if ( str_contains( $block_content, 'href="' ) ) {
					$block_content = preg_replace( '/href="[^"]*"/', $href, $block_content );
				} else {
					$block_content = preg_replace( '/^(\s*<a\b)/', '$1 ' . $href, $block_content );
				}
			}
		} elseif ( 'atomic-wind/image' === $block_name ) {
			if ( 'featured_image' === $post_field ) {
				$thumb_id = get_post_thumbnail_id();
				if ( ! $thumb_id ) {
					return '';
				}
				$src = wp_get_attachment_image_url( $thumb_id, 'large' );
				$alt = get_post_meta( $thumb_id, '_wp_attachment_image_alt', true );
				if ( ! $alt ) {
					$alt = get_the_title();
				}
				$block_content = preg_replace( '/src="[^"]*"/', 'src="' . esc_url( $src ) . '"', $block_content );
				$block_content = preg_replace( '/alt="[^"]*"/', 'alt="' . esc_attr( $alt ) . '"', $block_content );
			} elseif ( 'author_avatar' === $post_field ) {
				$avatar_url = get_avatar_url( get_the_author_meta( 'ID' ), array( 'size' => 96 ) );
				if ( $avatar_url ) {
					$alt           = get_the_author();
					$block_content = preg_replace( '/src="[^"]*"/', 'src="' . esc_url( $avatar_url ) . '"', $block_content );
					$block_content = preg_replace( '/alt="[^"]*"/', 'alt="' . esc_attr( $alt ) . '"', $block_content );
				}
			}
		}

		return $block_content;
	}

	/**
	 * Inject data-animation attributes into server-rendered blocks.
	 *
	 * @param string $block_content Block content.
	 * @param array  $block         Block data.
	 * @return string
	 */
	public function render_animation_attrs( $block_content, $block ) {
		if ( ! str_starts_with( $block['blockName'] ?? '', 'atomic-wind/' ) ) {
			return $block_content;
		}

		$animation = $block['attrs']['animation'] ?? '';

		if ( ! $animation || str_contains( $block_content, 'data-animation' ) ) {
			return $block_content;
		}

		$attrs = ' data-animation="' . esc_attr( $animation ) . '"';

		$delay = $block['attrs']['animationDelay'] ?? '';
		if ( $delay && '0' !== $delay ) {
			$attrs .= ' data-animation-delay="' . esc_attr( $delay ) . '"';
		}

		return preg_replace( '/^(<[a-zA-Z][a-zA-Z0-9]*)\b/', '$1' . $attrs, $block_content, 1 );
	}

	/**
	 * Inject data-show-if / data-hide-if attributes into server-rendered blocks.
	 *
	 * @param string $block_content Block content.
	 * @param array  $block         Block data.
	 * @return string
	 */
	public function render_state_attrs( $block_content, $block ) {
		if ( ! str_starts_with( $block['blockName'] ?? '', 'atomic-wind/' ) ) {
			return $block_content;
		}

		$attrs   = '';
		$show_if = $block['attrs']['showIf'] ?? '';
		if ( $show_if ) {
			$attrs .= ' data-show-if="' . esc_attr( $show_if ) . '"';
		}
		$hide_if = $block['attrs']['hideIf'] ?? '';
		if ( $hide_if ) {
			$attrs .= ' data-hide-if="' . esc_attr( $hide_if ) . '"';
		}

		if ( ! $attrs || str_contains( $block_content, 'data-show-if' ) || str_contains( $block_content, 'data-hide-if' ) ) {
			return $block_content;
		}

		return preg_replace( '/^(<[a-zA-Z][a-zA-Z0-9]*)\b/', '$1' . $attrs, $block_content, 1 );
	}

	/**
	 * Prepend the atomic-wind block category.
	 *
	 * @param array $categories Existing categories.
	 * @return array
	 */
	public function register_category( $categories ) {
		array_unshift( $categories, array(
			'slug'  => 'atomic-wind',
			'title' => __( 'Atomic Wind', 'otter-blocks' ),
		) );

		return $categories;
	}
}
