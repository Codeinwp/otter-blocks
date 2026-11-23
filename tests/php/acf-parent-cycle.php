<?php
/**
 * ACF function fixture for cyclic parent traversal tests.
 *
 * @package otter-blocks
 */

/**
 * Return a field from the test-controlled ACF map.
 *
 * @param int|string $selector Field selector.
 * @return array|false
 */
function acf_get_field( $selector ) {
	return isset( $GLOBALS['otter_test_acf_fields'][ $selector ] ) ? $GLOBALS['otter_test_acf_fields'][ $selector ] : false;
}

if ( ! function_exists( 'get_field_object' ) ) {
	/**
	 * Return a field object from the test-controlled ACF map.
	 *
	 * @param int|string $selector Field selector.
	 * @param mixed      $post_id  Unused.
	 * @param bool       $format   Unused.
	 * @return array|false
	 */
	function get_field_object( $selector, $post_id = false, $format = true ) {
		return isset( $GLOBALS['otter_test_acf_fields'][ $selector ] ) ? $GLOBALS['otter_test_acf_fields'][ $selector ] : false;
	}
}

if ( ! function_exists( 'get_field' ) ) {
	/**
	 * Return a field value from the test-controlled ACF map.
	 *
	 * @param int|string $selector Field selector.
	 * @param mixed      $post_id  Unused.
	 * @param bool       $format   Unused.
	 * @return mixed
	 */
	function get_field( $selector, $post_id = false, $format = true ) {
		return isset( $GLOBALS['otter_test_acf_fields'][ $selector ]['value'] ) ? $GLOBALS['otter_test_acf_fields'][ $selector ]['value'] : null;
	}
}

// Minimal marker so `class_exists( 'ACF' )`-gated branches run under tests; no behavior of its own.
if ( ! class_exists( 'ACF' ) ) {
	class ACF {} // phpcs:ignore Generic.Files.OneObjectStructurePerFile.MultipleFound
}

define( 'OTTER_TEST_ACF_GET_FIELD_STUB', true );
