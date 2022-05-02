<?php

namespace ThemeIsle\GutenbergBlocks\Integration;

/**
 * Form Utils
 * @since 2.0.3
 */
class Form_Utils
{
	/**
	 * Generate a random email address.
	 *
	 * @return string
	 * @since 2.0.3
	 */
	public static function generate_test_email() {
		srand(floor(time() / (60*60*24)));

		$words = array(
			'country',
			'work',
			'mega',
			'corporation',
			'enterprise',
			'factory',
			'trip',
			'agency',
			'business',
			'travel',
			'home',
			'state',
			'farm'
		);

		return 'delete-on-confirmation' . '.' . $words[ rand(0, count($words)) ] . '.' . $words[ rand(0, count($words)) ] . '.' . $words[ rand(0, count($words)) ] . '@otter-blocks.com';
	}
}
