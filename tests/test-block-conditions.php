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
	 * The block conditions instance.
	 *
	 * @var Block_Conditions
	 */
	protected $block_conditions;

	/**
	 * The test user ID.
	 *
	 * @var int
	 */
	protected $user_id;

	/**
	 * The test post ID.
	 *
	 * @var int
	 */
	protected $post_id;

	/**
	 * Set up the test.
	 */
	public function set_up() {
		parent::set_up();
		$this->block_conditions            = new Block_Conditions();
		$this->otter_pro_blocks_conditions = new \ThemeIsle\OtterPro\Plugins\Block_Conditions();
		$this->user_id                     = wp_create_user( 'test_user_deletion', 'userlogin', 'test@userrecover.com' );

		$this->block_conditions->init();

		/**
		 * Create a test post.
		 */
		$this->post_id       = $this->factory()->post->create();
		$this->category_slug = 'test-category';
		$this->category_id   = $this->factory()->category->create(
			array(
				'name' => 'Test Category',
				'slug' => $this->category_slug,
			)
		);

		wp_update_post(
			array(
				'ID'            => $this->post_id,
				'post_author'   => $this->user_id,
				'post_type'     => 'post',
				'post_category' => array( $this->category_id ),
			)
		);

		// Add some meta values to the post.
		update_post_meta( $this->post_id, 'test_meta', 'test' );

		// Add some meta to the user.
		update_user_meta( $this->user_id, 'test_meta', 'test' );

		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );
	}

	public function tear_down()
	{
		wp_delete_user( $this->user_id, true );
		wp_delete_post( $this->post_id, true );
		wp_delete_term( $this->category_id, 'category' );
		parent::tear_down();
	}

	/**
	 * Test logged-in user when user is logged in.
	 */
	public function test_logged_in_user_on_login() {
		wp_set_current_user( $this->user_id );

		$condition = array(
			'type' => 'loggedInUser',
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test logged-in user when user is not logged in.
	 */
	public function test_logged_in_user_on_logout() {

		$condition = array(
			'type' => 'loggedInUser',
		);

		wp_set_current_user( 0 );

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}

	/**
	 * Test logged-out user when user is logged in.
	 */
	public function test_logged_out_user_on_login() {
		wp_set_current_user( $this->user_id );

		$condition = array(
			'type' => 'loggedOutUser',
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}

	/**
	 * Test logged-out user when user is not logged in.
	 */
	public function test_logged_out_user_on_logout() {

		$condition = array(
			'type' => 'loggedOutUser',
		);

		wp_set_current_user( 0 );

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test user roles when user has the role.
	 */
	public function test_user_roles_has_role() {
		wp_set_current_user( $this->user_id );
		$user = wp_get_current_user();
		$user->set_role( 'administrator' );

		$condition = array(
			'type'  => 'userRoles',
			'roles' => array( 'administrator' ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test user roles when user does not have the role.
	 */
	public function test_user_roles_does_not_have_role() {
		wp_set_current_user( $this->user_id );
		$user = wp_get_current_user();
		$user->set_role( 'administrator' );

		$condition = array(
			'type'  => 'userRoles',
			'roles' => array( 'editor' ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}

	/**
	 * Test the post type condition.
	 */
	public function test_post_type() {

		$condition = array(
			'type'       => 'postType',
			'post_types' => array( 'post' ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test the post type condition on invalid post type.
	 */
	public function test_post_type_on_invalid() {

		$condition = array(
			'type'       => 'postType',
			'post_types' => array( 'test' ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}

	/**
	 * Test the post category condition.
	 */
	public function test_post_category() {

		$condition = array(
			'type'       => 'postCategory',
			'categories' => array( $this->category_slug ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertTrue( $result );
	}

	/**
	 * Test the post category condition on invalid category.
	 */
	public function test_post_category_on_invalid() {

		$condition = array(
			'type'       => 'postCategory',
			'categories' => array( 'invalid' ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );

		$this->assertFalse( $result );
	}

	/**
	 * Test logged in user meta.
	 */
	public function test_logged_in_user_meta() {
		wp_set_current_user( $this->user_id );

		$condition = array(
			'type'         => 'loggedInUserMeta',
			'meta_key'     => 'test_meta',
			'meta_compare' => 'is_true',
		);

		$result = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertTrue( $result );
	}

	/**
	 * Test logged in user meta.
	 */
	public function test_logged_in_user_meta_invalid() {
		wp_set_current_user( $this->user_id );

		$condition = array(
			'type'         => 'loggedInUserMeta',
			'meta_key'     => 'test_',
			'meta_compare' => 'is_true',
		);

		$result = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertFalse( $result );
	}

	/**
	 * Test post meta.
	 */
	public function test_post_meta() {
		wp_set_current_user( $this->user_id );

		$condition = array(
			'type'         => 'postMeta',
			'meta_key'     => 'test_meta',
			'meta_compare' => 'is_true',
		);

		$result = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertTrue( $result );
	}

	/**
	 * Test post meta.
	 */
	public function test_post_meta_invalid() {
		wp_set_current_user( $this->user_id );

		$condition = array(
			'type'         => 'postMeta',
			'meta_key'     => 'test_',
			'meta_compare' => 'is_true',
		);

		$result = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertFalse( $result );
	}

	/**
	 * Test data range.
	 */
	public function test_date_range() {

		$condition = array(
			'type'       => 'dateRange',
			'start_date' => '2020-01-01',
			'end_date'   => '2030-12-31',
		);

		$result = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertTrue( $result );
	}

	/**
	 * Test data range.
	 */
	public function test_date_range_invalid() {

		$condition = array(
			'type'       => 'dateRange',
			'start_date' => '2020-01-01',
			'end_date'   => '2020-12-31',
		);

		$result = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertFalse( $result );
	}

	/**
	 * Test the date reccuring condition.
	 */
	public function test_date_recurring() {
		$condition = array(
			'type' => 'dateRecurring',
			'days' => array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ),
		);

		$result = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertTrue( $result );
	}

	/**
	 * Test multiple conditions.
	 */
	public function test_multiple_conditions() {

		$this->go_to( get_permalink( $this->post_id ) );
		wp_set_current_user( $this->user_id );

		$collection = array(
			array(
				array(
					'type' => 'loggedInUser',
				),
				array(
					'type'       => 'postType',
					'post_types' => array( 'post' ),
				),
			)
		);

		$result = $this->block_conditions->evaluate_condition_collection( $collection );

		$this->assertTrue( $result );
	}


	/**
	 * Test multiple conditions.
	 */
	public function test_multiple_conditions__with_one_invalid() {
		$this->go_to( get_permalink( $this->post_id ) );
		wp_set_current_user( 0 );

		$collection = array(
			array(
				array(
					'type' => 'loggedInUser',
				),
				array(
					'type'       => 'postType',
					'post_types' => array( 'post' ),
				),
			),
		);

		$result = $this->block_conditions->evaluate_condition_collection( $collection );

		$this->assertFalse( $result );
	}

	/**
	 * Test multiple conditions.
	 */
	public function test_multiple_conditions_with_all_invalid() {
		$this->go_to( get_permalink( $this->post_id ) );
		wp_set_current_user( 0 );

		$collection = array(
			array(
				array(
					'type' => 'loggedInUser',
				),
				array(
					'type'       => 'postType',
					'post_types' => array( 'test_17' ),
				),
			),
		);

		$result = $this->block_conditions->evaluate_condition_collection( $collection );

		$this->assertFalse( $result );
	}

	/**
	 * Test OR collection.
	 */
	public function test_or_collection() {
		$this->go_to( get_permalink( $this->post_id ) );

		$collection = array(
			array(
				array(
					'type'       => 'postType',
					'post_types' => array( 'post' ),
				),
			),
			array(
				array(
					'type'       => 'postType',
					'post_types' => array( 'test_17' ),
				),
			),
		);

		$result = $this->block_conditions->evaluate_condition_collection( $collection );

		$this->assertTrue( $result );
	}

	/**
	 * Test OR collection. All invalid
	 */
	public function test_or_collection_invalid() {
		$this->go_to( get_permalink( $this->post_id ) );

		$collection = array(
			array(
				array(
					'type'       => 'postType',
					'post_types' => array( 'post_42' ),
				),
			),
			array(
				array(
					'type'       => 'postType',
					'post_types' => array( 'test_17' ),
				),
			),
		);

		$result = $this->block_conditions->evaluate_condition_collection( $collection );

		$this->assertFalse( $result );
	}

	public function test_hide_css_desktop_condition() {
		$condition = array(
			'type'         => 'test',
			'screen_sizes' => array(
				'desktop',
			),
		);

		$content = '<p class="test">Test</p>';

		$result = $this->block_conditions->should_add_hide_css_class( $condition, $content );
		
		$this->assertEquals( '<p class="o-hide-on-desktop test">Test</p>', $result );
	}

	public function test_hide_css_tablet_condition() {
		$condition = array(
			'type'         => 'test',
			'screen_sizes' => array(
				'tablet',
			),
		);

		$content = '<p class="test">Test</p>';

		$result = $this->block_conditions->should_add_hide_css_class( $condition, $content );
		
		$this->assertEquals( '<p class="o-hide-on-tablet test">Test</p>', $result );
	}

	public function test_hide_css_mobile_condition() {
		$condition = array(
			'type'         => 'test',
			'screen_sizes' => array(
				'mobile',
			),
		);

		$content = '<p class="test">Test</p>';

		$result = $this->block_conditions->should_add_hide_css_class( $condition, $content );
		
		$this->assertEquals( '<p class="o-hide-on-mobile test">Test</p>', $result );
	}

	public function test_hide_css_all_condition() {
		$condition = array(
			'type'         => 'test',
			'screen_sizes' => array(
				'desktop',
				'tablet',
				'mobile'
			),
		);

		$content = '<p class="test">Test</p>';

		$result = $this->block_conditions->should_add_hide_css_class( $condition, $content );
		
		$this->assertEquals( '<p class="o-hide-on-mobile o-hide-on-tablet o-hide-on-desktop test">Test</p>', $result );
	}

	public function test_get_css_hide_condition() {
		$collection = array(
			array(
				array(
					'type'       => 'postType',
					'post_types' => array( 'post_42' ),
				),
			),
			array(
				array(
					'type'       => 'test',
					'screen_sizes' => array(
						'desktop',
						'tablet',
						'mobile'
					),
				),
			),
		);

		$result = $this->block_conditions->get_hide_css_condition( $collection );
		
		// Check if screen_sizes exists.
		$this->assertArrayHasKey( 'screen_sizes', $result );

		// Check if screen_sizes is an array.
		$this->assertIsArray( $result['screen_sizes'] );

		// Check if screen_sizes has the correct values.
		$this->assertEqualsCanonicalizing( array( 'desktop', 'tablet', 'mobile' ), $result['screen_sizes'] );
	}

	public function test_get_css_hide_condition_no_hide() {
		$collection = array(
			array(
				array(
					'type'       => 'postType',
					'post_types' => array( 'post_42' ),
				),
			),
		);

		$result = $this->block_conditions->get_hide_css_condition( $collection );
		
		$this->assertFalse( $result );
	}
}
