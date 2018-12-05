<?php

/**
 * Test class for the intergeo.
 *
 * @package     OtterBlocks
 * @subpackage  Tests
 * @copyright   Copyright (c) 2017, Marius Cristea
 * @license     http://opensource.org/licenses/gpl-2.0.php GNU Public License
 * @since       2.0.0
 */
class Test_Plugin extends WP_Ajax_UnitTestCase {
	/**
	 * Test SDK loading.
	 */
	public function test_generic() {
		$this->assertTrue( defined( "OTTER_BLOCKS_URL" ) );
	}
}