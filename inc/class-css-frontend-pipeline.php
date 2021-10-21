<?php

/**
 * CSS Frontend Loader.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

class CSS_Frontend_Loader {

	protected $cssFilesName = array(
		'about-author',
		'accordion',
		'add-to-cart-button',
		'advanced-heading',
		'business-hours',
		'button-group',
		'circle-counter',
		'countdown',
		'font-awesome-icons',
		'form',
		'google-maps',
		'icon-list',
		'leaflet-map',
		'lottie',
		'plugin-card',
		'popup',
		'posts',
		'progress-bar',
		'review',
		'review-comparision',
		'section',
		'sharing-icons',
		'slider',
		'structural',
		'tabs',
		'woo-comparision'
	);

	protected $blockSlugs = array(
		'about-author',
		'accordion',
		'add-to-cart-button',
		'advanced-heading',
		'business-hours',
		'button-group',
		'circle-counter',
		'countdown',
		'font-awesome-icons',
		'form',
		'google-maps',
		'icon-list',
		'leaflet-map',
		'lottie',
		'plugin-card',
		'popup',
		'posts-grid',
		'progress-bar',
		'review',
		'review-comparision',
		'section',
		'sharing-icons',
		'slider',
		'structural',
		'tabs',
		'woo-comparision'
	);

	protected $post = null;
	protected $root_path = '';
	protected $blocks_paths = array();

	public function __construct( $post, $root_path )
	{
		$this->post = $post;
		$this->root_path = $root_path;
		$pairs = array_combine( $this->blockSlugs, $this->cssFilesName );
		$used_blocks = $this->get_used_blocks($pairs);
		$this->blocks_paths = $this->get_css_files($used_blocks);
	}

	private function get_used_blocks( $pairs )
	{
		return array_filter(
			$pairs,
			function( $block_slug ) {
				return has_block( 'themeisle-blocks/' . $block_slug, $this->post );
			},
			ARRAY_FILTER_USE_KEY
		);
	}

	private function get_css_files( $used_blocks ) {
		array_walk(
			$used_blocks,
			function( $cssFileBlockName ) {
				return "/build/blocks/{$cssFileBlockName}.css";
			}
		);
		return array_filter(
			$used_blocks,
			function( $cssFilePath ) {
				return file_exists( $this->root_path . $cssFilePath );
			}
		);
	}

	public function load() {
		// TODO: load the files
	}
}
