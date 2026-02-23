<?php
/**
 * Empty theme functions
 */

if ( ! function_exists( 'emptytheme_setup' ) ) {
	function emptytheme_setup() {
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	}
}
add_action( 'after_setup_theme', 'emptytheme_setup' );
