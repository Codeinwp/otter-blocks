<?php
/**
 * Class CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Registration;
use ThemeIsle\GutenbergBlocks\Plugins\Block_Conditions;
use Yoast\PHPUnitPolyfills\Polyfills\AssertEqualsCanonicalizing;
use Yoast\PHPUnitPolyfills\Polyfills\AssertNotEqualsCanonicalizing;

/**
 * Dynamic Content Test Case.
 */
class TestWooConditions extends WP_UnitTestCase
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

		$this->category_id_1 = wp_insert_term( 'test-category-1', 'product_cat' );
		$this->category_id_2 = wp_insert_term( 'test-category-2', 'product_cat' );

		$this->tag_id_1 = wp_insert_term( 'test-tag-1', 'product_tag' );
		$this->tag_id_2 = wp_insert_term( 'test-tag-2', 'product_tag' );

		/**
		 * Crete two new WooCommerce product.
		 */
		$this->product_id_1 = wp_insert_post(
			array(
				'post_title'   => 'Test Product 1',
				'post_content' => 'Test Product 1 Description',
				'post_status'  => 'publish',
				'post_type'    => 'product',
			)
		);

		$this->product_id_2 = wp_insert_post(
			array(
				'post_title'   => 'Test Product 2',
				'post_content' => 'Test Product 2 Description',
				'post_status'  => 'publish',
				'post_type'    => 'product',
			)
		);

		// Add the categories and tags to the products.
		wp_set_object_terms( $this->product_id_1, $this->category_id_1, 'product_cat' );
		wp_set_object_terms( $this->product_id_1, $this->tag_id_1, 'product_tag' );

		wp_set_object_terms( $this->product_id_2, $this->category_id_2, 'product_cat' );
		wp_set_object_terms( $this->product_id_2, $this->tag_id_2, 'product_tag' );
	}

	public function tear_down()
	{
		wp_delete_user( $this->user_id, true );
		wp_delete_post( $this->post_id, true );
		wp_delete_term( $this->category_id_1, 'product_cat' );
		wp_delete_term( $this->category_id_2, 'product_cat' );
		wp_delete_term( $this->tag_id_1, 'product_tag' );
		wp_delete_term( $this->tag_id_2, 'product_tag' );
		wp_delete_post( $this->product_id_1, true );
		wp_delete_post( $this->product_id_2, true );

		parent::tear_down();
	}

	/**
	 * Test Woo Category condition.
	 */
	public function test_woo_category() {
		global $product;

		$condition = array(
			'type'       => 'wooCategory',
			'categories' => array( $this->category_id_1['term_id'] ),
		);

		$product = wc_get_product( $this->product_id_1 );
		$result  = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertTrue( $result );

		$product = wc_get_product( $this->product_id_2 );
		$result  = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertFalse( $result );
	}

	/**
	 * Test Woo Tag condition.
	 */
	public function test_woo_tag() {
		global $product;

		$condition = array(
			'type' => 'wooTag',
			'tags' => array( $this->tag_id_1['term_id'] ),
		);

		$product = wc_get_product( $this->product_id_1 );
		$result  = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertTrue( $result );

		$product = wc_get_product( $this->product_id_2 );
		$result  = $this->otter_pro_blocks_conditions->evaluate_condition( true, $condition, true );

		$this->assertFalse( $result );

		$condition['visibility'] = false;
		$result = $this->block_conditions->evaluate_condition( $condition );
		$this->assertTrue( $result );
	}

	/**
	 * Test Condition without type.
	 */
	public function test_condition_without_type() {
		$condition = array(
			'categories' => array( $this->category_id_1['term_id'] ),
		);

		$result = $this->block_conditions->evaluate_condition( $condition );
		$this->assertTrue( $result );
	}
}
