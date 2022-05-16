<?php

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Form Utils
 *
 * @since 2.0.3
 */
class Form_Utils {

	/**
	 * Generate a random email address.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public static function generate_test_email() {

		$words = array(
			'alfa',
			'bravo',
			'charlie',
			'delta',
			'echo',
			'foxtrot',
			'golf',
			'one',
			'two',
			'three',
			'four',
			'five',
			'six',
			'seven',
			'eight',
			'nine',
			'ten',
		);

		return 'Otter-Form-successfully-connected.delete-on-confirmation' . '.' . $words[ rand( 0, count( $words ) ) ] . '.' . $words[ rand( 0, count( $words ) ) ] . '.' . $words[ rand( 2, count( $words ) ) - 1 ] . '@otter-blocks.com';
	}
}
