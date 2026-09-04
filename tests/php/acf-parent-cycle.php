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

define( 'OTTER_TEST_ACF_GET_FIELD_STUB', true );
