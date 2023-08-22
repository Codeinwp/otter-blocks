<?php
/**
 * Class CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Block_Conditions;
use Yoast\PHPUnitPolyfills\Polyfills\AssertEqualsCanonicalizing;
use Yoast\PHPUnitPolyfills\Polyfills\AssertNotEqualsCanonicalizing;

/**
 * Dynamic Content Test Case.
 */
class TestBlockConditions extends WP_UnitTestCase
{
	/**
	 * Test logged in user when user is logged in.
	 */
	public function test_logged_in_user_on_logging() {
		$user_id = wp_create_user( 'test_user_deletion', 'userlogin', 'test@userrecover.com' );
		wp_set_current_user( $user_id );

		$block_conditions = new Block_Conditions();

		$condition = array(
			'type' => 'logged_in',
		);

		$result = $block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test logged in user when user is not logged in.
	 */
	public function test_logged_in_user_on_logout() {
		$block_conditions = new Block_Conditions();

		$condition = array(
			'type' => 'logged_in',
		);

		wp_set_current_user( 0 );

		$result = $block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}
}
