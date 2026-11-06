<?php
/**
 * Class CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Dynamic_Content;
use Yoast\PHPUnitPolyfills\Polyfills\AssertEqualsCanonicalizing;
use Yoast\PHPUnitPolyfills\Polyfills\AssertNotEqualsCanonicalizing;

if ( ! function_exists( 'acf_get_field' ) ) {
	require_once __DIR__ . '/php/acf-parent-cycle.php';
}

/**
 * Dynamic Content Test Case.
 */
class TestDynamicContent extends WP_UnitTestCase
{

	/**
	 * The block conditions instance.
	 *
	 * @var Dynamic_Content
	 */
	protected $dynamic_content;

	/**
	 * The block conditions instance.
	 *
	 * @var \ThemeIsle\OtterPro\Plugins\Dynamic_Content()
	 */
	protected $dynamic_content_pro;

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
		$this->dynamic_content     = new Dynamic_Content();
		$this->dynamic_content_pro = new \ThemeIsle\OtterPro\Plugins\Dynamic_Content();
		$this->user_id             = wp_create_user( 'test_user_deletion', 'userlogin', 'test@userrecover.com' );


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
				'post_title'    => 'Test',
				'post_content'  => 'Test',
				'post_status'   => 'publish',
				'post_excerpt'  => 'Test',
			)
		);

		// Add some meta values to the post.
		update_post_meta( $this->post_id, 'test_meta', 'test' );

		// Add some meta to the user.
		update_user_meta( $this->user_id, 'test_meta', 'test' );

		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );
	}

	/**
	 * Tear down the test.
	 */
	public function tear_down() {
		unset( $GLOBALS['otter_test_acf_fields'] );
		wp_delete_user( $this->user_id, true );
		wp_delete_post( $this->post_id, true );
		wp_delete_term( $this->category_id, 'category' );
		parent::tear_down();
	}

	/**
	 * Test the Post ID query.
	 */
	public function test_post_id() {

		$post_id_query = '<p><o-dynamic data-type="postID">Post ID</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $post_id_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'postID', $result['type'] );
	}

	/**
	 * Test the Post Type query.
	 */
	public function test_post_type() {
		$post_type_query = '<p><o-dynamic data-type="postType">Post Type</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $post_type_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'postType', $result['type'] );
	}

	/**
	 * Test the Post Title query.
	 */
	public function test_post_title() {
		$post_title_query = '<p><o-dynamic data-type="postTitle">Post Title</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $post_title_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'postTitle', $result['type'] );
	}

	/**
	 * Test the Post Status query.
	 */
	public function test_post_status() {
		$post_status_query = '<p><o-dynamic data-type="postStatus">Post Status</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $post_status_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'postStatus', $result['type'] );
	}

	/**
	 * Test the Post Content query.
	 */
	public function test_post_content() {
		$post_content_query = '<p><o-dynamic data-type="postContent">Post Content</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $post_content_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'postContent', $result['type'] );
	}

	/**
	 * Test the Post Excerpt query.
	 */
	public function test_post_excerpt() {
		$post_excerpt_query = '<p><o-dynamic data-type="postExcerpt" data-length="500" data-before="before" data-after="after">Advanced Custom Fields</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $post_excerpt_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'postExcerpt', $result['type'] );
		$this->assertEquals( '500', $result['length'] );
		$this->assertEquals( 'before', $result['before'] );
		$this->assertEquals( 'after', $result['after'] );
	}

	/**
	 * Test the Post Date query.
	 */
	public function test_post_date() {
		$post_date_query = '<p><o-dynamic data-type="postDate">Post Date</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $post_date_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'postDate', $result['type'] );
	}

	/**
	 * Test the Post Time query.
	 */
	public function test_post_time() {
		$post_time_query = '<p><o-dynamic data-type="postTime" data-time-type="modified" data-time-format="custom" data-time-custom="H:i">Post Time</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $post_time_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'postTime', $result['type'] );
		$this->assertEquals( 'modified', $result['timeType'] );
		$this->assertEquals( 'custom', $result['timeFormat'] );
		$this->assertEquals( 'H:i', $result['timeCustom'] );
	}

	/**
	 * Test the Post Terms query.
	 */
	public function test_post_terms() {
		$post_terms_query = '<p><o-dynamic data-type="postTerms" data-term-type="custom" data-taxonomy="categories" data-term-separator="-" data-before="before" data-after="after">Post Terms</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $post_terms_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'postTerms', $result['type'] );
		$this->assertEquals( 'custom', $result['termType'] );
		$this->assertEquals( 'categories', $result['taxonomy'] );
		$this->assertEquals( '-', $result['termSeparator'] );
		$this->assertEquals( 'before', $result['before'] );
		$this->assertEquals( 'after', $result['after'] );
	}

	/**
	 * Test the Post Meta query.
	 */
	public function test_post_meta() {
		$post_meta_query = '<p><o-dynamic data-type="postMeta" data-meta-key="test" data-before="before" data-after="after">Post Custom Field</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $post_meta_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'postMeta', $result['type'] );
		$this->assertEquals( 'test', $result['metaKey'] );
		$this->assertEquals( 'before', $result['before'] );
		$this->assertEquals( 'after', $result['after'] );
	}

	/**
	 * Test the Advanced Custom Fields query.
	 */
	public function test_acf() {
		$acf_query = '<p><o-dynamic data-type="acf" data-meta-key="field_646f643a407bf" data-before="before" data-after="after">Advanced Custom Fields</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $acf_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'acf', $result['type'] );
		$this->assertEquals( 'field_646f643a407bf', $result['metaKey'] );
		$this->assertEquals( 'before', $result['before'] );
		$this->assertEquals( 'after', $result['after'] );
	}

	/**
	 * Test the Site Title query.
	 */
	public function test_site_title() {
		$site_title_query = '<p><o-dynamic data-type="siteTitle">Site Title</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $site_title_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'siteTitle', $result['type'] );
	}

	/**
	 * Test the Site Tagline query.
	 */
	public function test_site_tagline() {
		$site_tagline_query = '<p><o-dynamic data-type="siteTagline">Site Tagline</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $site_tagline_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'siteTagline', $result['type'] );
	}

	/**
	 * Test the Author Name query.
	 */
	public function test_author_name() {
		$author_name_query = '<p><o-dynamic data-type="authorName">Author Name</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $author_name_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'authorName', $result['type'] );
	}

	/**
	 * Test the Author Description query.
	 */
	public function test_author_description() {
		$author_description_query = '<p><o-dynamic data-type="authorDescription">Author Description</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $author_description_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'authorDescription', $result['type'] );
	}

	/**
	 * Test the Author Meta query.
	 */
	public function test_author_meta() {
		$author_meta_query = '<p><o-dynamic data-type="authorMeta" data-meta-key="display_name">Author Meta</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $author_meta_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'authorMeta', $result['type'] );
		$this->assertEquals( 'display_name', $result['metaKey'] );
	}

	/**
	 * Test the Logged In User Name query.
	 */
	public function test_logged_in_user_name() {
		$logged_in_user_name_query = '<p><o-dynamic data-type="loggedInUserName">Logged In User Name</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $logged_in_user_name_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'loggedInUserName', $result['type'] );
	}

	/**
	 * Test the Logged In User Description query.
	 */
	public function test_logged_in_user_description() {
		$logged_in_user_description_query = '<p><o-dynamic data-type="loggedInUserDescription">Logged In User Description</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $logged_in_user_description_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'loggedInUserDescription', $result['type'] );
	}

	/**
	 * Test for the Logged In User Email query.
	 */
	public function test_logged_in_user_email() {
		$logged_in_user_email_query = '<p><o-dynamic data-type="loggedInUserEmail">Logged In User Email</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $logged_in_user_email_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'loggedInUserEmail', $result['type'] );
	}

	/**
	 * Test the Logged In User Meta query.
	 */
	public function test_logged_in_user_meta() {
		$logged_in_user_meta_query = '<p><o-dynamic data-type="loggedInUserMeta" data-meta-key="description">Logged In User Meta</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $logged_in_user_meta_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'loggedInUserMeta', $result['type'] );
		$this->assertEquals( 'description', $result['metaKey'] );
	}

	/**
	 * Test the Archive Title query.
	 */
	public function test_archive_title() {
		$archive_title_query = '<p><o-dynamic data-type="archiveTitle">Archive Title</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $archive_title_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'archiveTitle', $result['type'] );
	}

	/**
	 * Test the Archive Title query with the prefix removed.
	 */
	public function test_archive_title_hide_prefix() {
		$archive_title_query = '<p><o-dynamic data-type="archiveTitle" data-hide-prefix="1">Archive Title</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $archive_title_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'archiveTitle', $result['type'] );
		$this->assertEquals( '1', $result['hidePrefix'] );
	}

	/**
	 * Test the Archive Title evaluation on a category archive.
	 */
	public function test_archive_title_evaluation() {
		$this->go_to( get_term_link( $this->category_id, 'category' ) );

		// Default behaviour keeps the prefix.
		$with_prefix_query = '<p><o-dynamic data-type="archiveTitle">Archive Title</o-dynamic></p>';
		$with_prefix       = $this->dynamic_content->apply_dynamic_content( $with_prefix_query );
		$this->assertStringContainsString( 'Test Category', $with_prefix );
		$this->assertStringContainsString( 'Category:', $with_prefix );

		// Enabling the toggle strips the prefix and leaves only the term name.
		$no_prefix_query = '<p><o-dynamic data-type="archiveTitle" data-hide-prefix="1">Archive Title</o-dynamic></p>';
		$no_prefix       = $this->dynamic_content->apply_dynamic_content( $no_prefix_query );
		$this->assertEquals( '<p>Test Category</p>', $no_prefix );
		$this->assertStringNotContainsString( 'Category:', $no_prefix );
	}

	/**
	 * Test the Archive Description query.
	 */
	public function test_archive_description() {
		$archive_description_query = '<p><o-dynamic data-type="archiveDescription">Archive Description</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $archive_description_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'archiveDescription', $result['type'] );
	}

	/**
	 * Test the Date query.
	 */
	public function test_date() {
		$date_query = '<p><o-dynamic data-type="date" data-date-format="custom" data-date-custom="l, F j, Y">Date</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $date_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'date', $result['type'] );
		$this->assertEquals( 'custom', $result['dateFormat'] );
		$this->assertEquals( 'l, F j, Y', $result['dateCustom'] );
	}

	/**
	 * Test the Time query.
	 */
	public function test_time() {
		$time_query = '<p><o-dynamic data-type="time" data-time-format="custom" data-time-custom="H:i">Time</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $time_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'time', $result['type'] );
		$this->assertEquals( 'custom', $result['timeFormat'] );
		$this->assertEquals( 'H:i', $result['timeCustom'] );
	}

	/**
	 * Test the Query String query.
	 */
	public function test_query_string() {
		$query_string_query = '<p><o-dynamic data-type="queryString" data-format="capitalize" data-parameter="action">Query String</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $query_string_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'queryString', $result['type'] );
		$this->assertEquals( 'capitalize', $result['format'] );
		$this->assertEquals( 'action', $result['parameter'] );
	}

	/**
	 * Test the Country query.
	 */
	public function test_country() {
		$country_query = '<p><o-dynamic data-type="country">Country</o-dynamic></p>';

		$result = array();
		$num    = Dynamic_Content::parse_dynamic_content_query( $country_query, $result );
		$this->assertTrue( boolval( $num ) );
		$result = $result[0];

		$this->assertEquals( 'country', $result['type'] );
	}

	/**
	 * Test the Post Id evaluation.
	 */
	public function test_post_id_evaluation() {
		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );

		$post_id_query = '<p><o-dynamic data-type="postID">Post ID</o-dynamic></p>';
		$result        = $this->dynamic_content->apply_dynamic_content( $post_id_query );

		$this->assertEquals( '<p>' . $this->post_id . '</p>', $result );
	}

	/**
	 * Test the Post Type evaluation.
	 */
	public function test_post_type_evaluation() {
		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );

		$post_type_query = '<p><o-dynamic data-type="postType">Post Type</o-dynamic></p>';
		$result          = $this->dynamic_content->apply_dynamic_content( $post_type_query );

		$this->assertEquals( '<p>post</p>', $result );
	}

	/**
	 * Test the Post Title evaluation.
	 */
	public function test_post_title_evaluation() {
		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );

		$post_title_query = '<p><o-dynamic data-type="postTitle">Post Title</o-dynamic></p>';
		$result           = $this->dynamic_content->apply_dynamic_content( $post_title_query );

		$this->assertEquals( '<p>Test</p>', $result );
	}

	/**
	 * Test the Post Status evaluation.
	 */
	public function test_post_status_evaluation() {
		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );

		$post_status_query = '<p><o-dynamic data-type="postStatus">Post Status</o-dynamic></p>';
		$result            = $this->dynamic_content->apply_dynamic_content( $post_status_query );

		$this->assertEquals( '<p>publish</p>', $result );
	}

	/**
	 * Test the Post Content evaluation.
	 */
	public function test_post_content_evaluation() {
		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );

		$post_content_query = '<p><o-dynamic data-type="postContent">Post Content</o-dynamic></p>';
		$result             = $this->dynamic_content->apply_dynamic_content( $post_content_query );

		$this->assertStringContainsString( '<p>Test</p>', $result );
	}

	/**
	 * Test the Post Excerpt evaluation.
	 */
	public function test_post_excerpt_evaluation() {
		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );

		$post_excerpt_query = '<p><o-dynamic data-type="postExcerpt" data-length="500" data-before="before-" data-after="-after">Advanced Custom Fields</o-dynamic></p>';
		$result             = $this->dynamic_content->apply_dynamic_content( $post_excerpt_query );

		$this->assertEquals( '<p>before-Test…-after</p>', $result );
	}

	/**
	 * Test the Logger In User Name evaluation.
	 */
	public function test_logged_in_user_name_evaluation() {
		// Set the user as the current user.
		wp_set_current_user( $this->user_id );

		$logged_in_user_name_query = '<p><o-dynamic data-type="loggedInUserName">Logged In User Name</o-dynamic></p>';
		$result                    = $this->dynamic_content->apply_dynamic_content( $logged_in_user_name_query );

		$this->assertEquals( '<p>test_user_deletion</p>', $result );
	}

	/**
	 * Test the Logger In User Description evaluation.
	 */
	public function test_logged_in_user_description_evaluation() {
		// Set the user as the current user.
		wp_set_current_user( $this->user_id );

		$logged_in_user_description_query = '<p><o-dynamic data-type="loggedInUserDescription">Logged In User Description</o-dynamic></p>';
		$result                           = $this->dynamic_content->apply_dynamic_content( $logged_in_user_description_query );

		$this->assertEquals( '<p></p>', $result );
	}

	/**
	 * Test the Logger In User Email evaluation.
	 */
	public function test_logged_in_user_email_evaluation() {
		// Set the user as the current user.
		wp_set_current_user( $this->user_id );

		$logged_in_user_email_query = '<p><o-dynamic data-type="loggedInUserEmail">Logged In User Email</o-dynamic></p>';
		$result                     = $this->dynamic_content->apply_dynamic_content( $logged_in_user_email_query );

		$this->assertEquals( '<p>test@userrecover.com</p>', $result );
	}

	/**
	 * Test he Date evaluation.
	 */
	public function test_date_evaluation() {
		// Set the user as the current user.
		wp_set_current_user( $this->user_id );

		$date_query = '<p><o-dynamic data-type="date" data-date-format="custom" data-date-custom="l, F j, Y">Date</o-dynamic></p>';
		$result     = $this->dynamic_content->apply_dynamic_content( $date_query );

		$this->assertEquals( '<p>' . date( 'l, F j, Y' ) . '</p>', $result );
	}

	/**
	 * Test the Time evaluation.
	 */
	public function test_time_evaluation() {
		// Set the user as the current user.
		wp_set_current_user( $this->user_id );

		$time_query = '<p><o-dynamic data-type="time" data-time-format="custom" data-time-custom="H:i">Time</o-dynamic></p>';
		$result     = $this->dynamic_content->apply_dynamic_content( $time_query );

		$this->assertEquals( '<p>' . date( 'H:i' ) . '</p>', $result );
	}

	/**
	 * Test the Author Name evaluation.
	 */
	public function test_author_name_evaluation() {
		// Set the user as the current user.
		wp_set_current_user( $this->user_id );

		$author_name_query = '<p><o-dynamic data-type="authorName">Author Name</o-dynamic></p>';
		$result            = $this->dynamic_content->apply_dynamic_content( $author_name_query );

		$this->assertEquals( '<p>test_user_deletion</p>', $result );
	}

	/**
	 * Test the Author Description evaluation.
	 */
	public function test_author_description_evaluation() {
		// Set the user as the current user.
		wp_set_current_user( $this->user_id );

		$author_description_query = '<p><o-dynamic data-type="authorDescription">Author Description</o-dynamic></p>';
		$result                   = $this->dynamic_content->apply_dynamic_content( $author_description_query );

		$this->assertEquals( '<p></p>', $result );
	}
	
	/**
	 * Test multiple dynamic content queries.
	 */
	public function test_multiple_dynamic_content_queries() {
		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );

		$multiple_queries = '<p>This is <o-dynamic data-type="postID">Post ID</o-dynamic></p><p><o-dynamic data-type="postType">Post Type</o-dynamic></p>';
		$result           = $this->dynamic_content->apply_dynamic_content( $multiple_queries );

		$this->assertEquals( '<p>This is ' . $this->post_id . '</p><p>post</p>', $result );
	}

	/**
	 * Test multiple dynamic content queries on a very long content.
	 */
	public function test_multiple_dynamic_content_queries_on_long_content() {
		// Set the post as the current post.
		$this->go_to( get_permalink( $this->post_id ) );

		$padding          = str_repeat( ' ', 10000 );
		$multiple_queries = '<p>This is <o-dynamic data-type="postID">Post ID</o-dynamic>' . $padding . '</p><p><o-dynamic data-type="postType">Post Type</o-dynamic></p>';
		$long_content     = str_repeat( $multiple_queries, 100 );
		$result           = $this->dynamic_content->apply_dynamic_content( $long_content );

		$this->assertStringContainsString( '<p>This is ' . $this->post_id . $padding . '</p><p>post</p>', $result );
	}

	/**
	 * A fallback image path outside the uploads directory must be rejected
	 * (prevents reading arbitrary images elsewhere under wp-content).
	 */
	public function test_get_safe_fallback_path_rejects_outside_uploads() {
		$outside = trailingslashit( WP_CONTENT_DIR ) . 'otter-fallback-outside.png';
		copy( __DIR__ . '/assets/test-img.png', $outside );

		$result = \ThemeIsle\GutenbergBlocks\Server\Dynamic_Content_Server::get_safe_fallback_path( $outside );

		unlink( $outside );

		$this->assertEquals( '', $result );
	}

	/**
	 * A fallback image inside the uploads directory is still accepted (feature intact).
	 */
	public function test_get_safe_fallback_path_allows_inside_uploads() {
		$uploads = wp_get_upload_dir();
		$inside  = trailingslashit( $uploads['basedir'] ) . 'otter-fallback-inside.png';
		copy( __DIR__ . '/assets/test-img.png', $inside );

		$expected = realpath( $inside );
		$result   = \ThemeIsle\GutenbergBlocks\Server\Dynamic_Content_Server::get_safe_fallback_path( $inside );

		unlink( $inside );

		$this->assertEquals( $expected, $result );
	}

	/**
	 * A traversal path resolving outside wp-content is rejected.
	 */
	public function test_get_safe_fallback_path_rejects_traversal() {
		$result = \ThemeIsle\GutenbergBlocks\Server\Dynamic_Content_Server::get_safe_fallback_path( '/etc/passwd' );
		$this->assertEquals( '', $result );
	}

	/**
	 * A non-IP forwarded header must not be returned (it flows into an outbound URL).
	 */
	public function test_get_client_ip_rejects_non_ip_forwarded_header() {
		$_SERVER['HTTP_X_FORWARDED_FOR'] = 'evil.com/../../inject';
		$ip                              = \ThemeIsle\OtterPro\Plugins\Dynamic_Content::get_client_ip();
		unset( $_SERVER['HTTP_X_FORWARDED_FOR'] );

		$this->assertEquals( '', $ip );
	}

	/**
	 * A forwarded list yields the first valid client IP.
	 */
	public function test_get_client_ip_extracts_first_valid_ip_from_list() {
		$_SERVER['HTTP_X_FORWARDED_FOR'] = '203.0.113.7, 10.0.0.1';
		$ip                              = \ThemeIsle\OtterPro\Plugins\Dynamic_Content::get_client_ip();
		unset( $_SERVER['HTTP_X_FORWARDED_FOR'] );

		$this->assertEquals( '203.0.113.7', $ip );
	}

	/**
	 * Author meta must never expose the author's password hash.
	 */
	public function test_author_meta_does_not_leak_password_hash() {
		$password = get_the_author_meta( 'user_pass', $this->user_id );
		$this->assertNotEmpty( $password );

		$result = $this->dynamic_content_pro->evaluate_content(
			'fallback',
			array(
				'type'    => 'authorMeta',
				'context' => $this->post_id,
				'metaKey' => 'user_pass',
				'default' => 'fallback',
			)
		);

		$this->assertStringNotContainsString( $password, $result );
	}

	/**
	 * Author meta still returns allowed public fields.
	 */
	public function test_author_meta_returns_allowed_field() {
		$result = $this->dynamic_content_pro->evaluate_content(
			'fallback',
			array(
				'type'    => 'authorMeta',
				'context' => $this->post_id,
				'metaKey' => 'display_name',
				'default' => 'fallback',
			)
		);

		$this->assertEquals( 'test_user_deletion', $result );
	}

	/**
	 * Post meta must not expose protected (underscore-prefixed) keys.
	 */
	public function test_post_meta_does_not_leak_protected_key() {
		update_post_meta( $this->post_id, '_secret_key', 'super-secret-value' );

		$result = $this->dynamic_content_pro->evaluate_content(
			'fallback',
			array(
				'type'    => 'postMeta',
				'context' => $this->post_id,
				'metaKey' => '_secret_key',
				'default' => 'fallback',
			)
		);

		$this->assertStringNotContainsString( 'super-secret-value', $result );
	}

	/**
	 * Post meta still returns allowed public custom fields.
	 */
	public function test_post_meta_returns_allowed_key() {
		$result = $this->dynamic_content_pro->evaluate_content(
			'fallback',
			array(
				'type'    => 'postMeta',
				'context' => $this->post_id,
				'metaKey' => 'test_meta',
				'default' => 'fallback',
			)
		);

		$this->assertEquals( 'test', $result );
	}

	/**
	 * Logged-in user meta must not expose protected user secrets.
	 */
	public function test_logged_in_user_meta_does_not_leak_session_tokens() {
		wp_set_current_user( $this->user_id );
		update_user_meta( $this->user_id, 'session_tokens', 'secret-token-data' );

		$result = $this->dynamic_content_pro->evaluate_content(
			'fallback',
			array(
				'type'    => 'loggedInUserMeta',
				'metaKey' => 'session_tokens',
				'default' => 'fallback',
			)
		);

		$this->assertStringNotContainsString( 'secret-token-data', $result );
	}

	/**
	 * Invoke a private method on the PRO Dynamic_Content instance.
	 *
	 * @param string $method Method name.
	 * @param array  $args   Arguments.
	 * @return mixed
	 */
	private function invoke_pro_private( $method, $args ) {
		$reflection = new ReflectionMethod( \ThemeIsle\OtterPro\Plugins\Dynamic_Content::class, $method );
		$reflection->setAccessible( true );
		return $reflection->invokeArgs( $this->dynamic_content_pro, $args );
	}

	/**
	 * Sub-field values are collected across nested rows for a multi-segment path.
	 */
	public function test_collect_acf_sub_field_values_multi_segment_path() {
		$rows = array(
			array(
				'inner' => array(
					array( 'leaf' => 'alpha' ),
					array( 'leaf' => 'beta' ),
				),
			),
			array(
				'inner' => array(
					array( 'leaf' => 'gamma' ),
				),
			),
		);

		$values = $this->invoke_pro_private( 'collect_acf_sub_field_values', array( $rows, array( 'inner', 'leaf' ) ) );

		$this->assertEquals( array( 'alpha', 'beta', 'gamma' ), $values );
	}

	/**
	 * Non-string leaf values (ints, arrays, empty strings) are skipped.
	 */
	public function test_collect_acf_sub_field_values_skips_non_string_leaves() {
		$rows = array(
			array( 'field' => 'kept' ),
			array( 'field' => 42 ),
			array( 'field' => array( 'nested' => 'ignored' ) ),
			array( 'field' => '' ),
			array( 'other' => 'no match' ),
		);

		$values = $this->invoke_pro_private( 'collect_acf_sub_field_values', array( $rows, array( 'field' ) ) );

		$this->assertEquals( array( 'kept' ), $values );
	}

	/**
	 * An empty path returns an empty array (guard clause).
	 */
	public function test_collect_acf_sub_field_values_empty_path() {
		$rows = array( array( 'field' => 'value' ) );

		$values = $this->invoke_pro_private( 'collect_acf_sub_field_values', array( $rows, array() ) );

		$this->assertEquals( array(), $values );
	}

	/**
	 * Nested repeater recursion merges leaf values from all nested rows in order.
	 */
	public function test_collect_acf_sub_field_values_merges_nested_rows() {
		$rows = array(
			array(
				'nested' => array(
					array( 'leaf' => 'one' ),
					array( 'leaf' => 'two' ),
				),
			),
			array(
				// Intermediate value that is not an array is skipped.
				'nested' => 'not-an-array',
			),
			array(
				'nested' => array(
					array( 'leaf' => 'three' ),
					array( 'other' => 'skipped' ),
				),
			),
		);

		$values = $this->invoke_pro_private( 'collect_acf_sub_field_values', array( $rows, array( 'nested', 'leaf' ) ) );

		$this->assertEquals( array( 'one', 'two', 'three' ), $values );
	}

	/**
	 * Image sub-field collection keeps any non-empty value (arrays, ints, strings).
	 */
	public function test_collect_acf_sub_field_images_collects_across_rows() {
		$image_array = array(
			'ID'  => 12,
			'url' => 'https://example.com/a.png',
		);

		$rows = array(
			array( 'image' => $image_array ),
			array( 'image' => 34 ),
			array( 'image' => 'https://example.com/b.png' ),
			array( 'image' => 0 ), // Empty value skipped.
			array( 'other' => 'no match' ),
		);

		$values = $this->invoke_pro_private( 'collect_acf_sub_field_images', array( $rows, array( 'image' ) ) );

		$this->assertEquals( array( $image_array, 34, 'https://example.com/b.png' ), $values );
	}

	/**
	 * Image collection recurses through nested repeater rows and guards the empty path.
	 */
	public function test_collect_acf_sub_field_images_nested_recursion() {
		$rows = array(
			array(
				'gallery' => array(
					array( 'img' => 11 ),
					array( 'img' => 22 ),
				),
			),
			array(
				'gallery' => array(
					array( 'img' => 33 ),
				),
			),
		);

		$values = $this->invoke_pro_private( 'collect_acf_sub_field_images', array( $rows, array( 'gallery', 'img' ) ) );
		$this->assertEquals( array( 11, 22, 33 ), $values );

		$empty = $this->invoke_pro_private( 'collect_acf_sub_field_images', array( $rows, array() ) );
		$this->assertEquals( array(), $empty );
	}

	/**
	 * ACF parent relationships can be filtered into a cycle; value lookup must stop.
	 */
	public function test_acf_repeater_value_lookup_stops_at_parent_cycle() {
		if ( ! defined( 'OTTER_TEST_ACF_GET_FIELD_STUB' ) ) {
			$this->markTestSkipped( 'The ACF field lookup is controlled by an installed plugin.' );
		}

		$GLOBALS['otter_test_acf_fields'] = $this->cyclic_acf_fields();

		$result = $this->invoke_pro_private( 'get_acf_repeater_sub_field', array( 10, $this->post_id ) );

		$this->assertNull( $result );
	}

	/**
	 * Image lookup uses the same parent traversal and must stop at a cycle too.
	 */
	public function test_acf_repeater_image_lookup_stops_at_parent_cycle() {
		if ( ! defined( 'OTTER_TEST_ACF_GET_FIELD_STUB' ) ) {
			$this->markTestSkipped( 'The ACF field lookup is controlled by an installed plugin.' );
		}

		$GLOBALS['otter_test_acf_fields'] = $this->cyclic_acf_fields();

		$result = $this->invoke_pro_private( 'get_acf_repeater_sub_field_image', array( 10, $this->post_id ) );

		$this->assertSame( array(), $result );
	}

	/**
	 * Build two ACF field definitions whose parent IDs point at each other.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private function cyclic_acf_fields() {
		return array(
			10 => array(
				'key'    => 'field_10',
				'name'   => 'leaf',
				'parent' => 20,
				'type'   => 'text',
			),
			20 => array(
				'key'    => 'field_20',
				'name'   => 'rows',
				'parent' => 10,
				'type'   => 'repeater',
			),
		);
	}

	/**
	 * A javascript: URL inside an ACF image array is neutralized by esc_url.
	 */
	public function test_get_attachment_url_strips_javascript_scheme() {
		$result = $this->invoke_pro_private( 'get_attachment_url', array( array( 'url' => 'javascript:alert(1)' ) ) );

		$this->assertStringNotContainsString( 'javascript:', $result );
	}

	/**
	 * A plain string URL passes through escaped.
	 */
	public function test_get_attachment_url_passes_string_url() {
		$result = $this->invoke_pro_private( 'get_attachment_url', array( 'https://example.com/image.png' ) );

		$this->assertEquals( 'https://example.com/image.png', $result );
	}

	/**
	 * An integer attachment ID resolves to the attachment URL.
	 */
	public function test_get_attachment_url_resolves_attachment_id() {
		$attachment_id = $this->factory()->attachment->create_object(
			'test-image.png',
			$this->post_id,
			array(
				'post_mime_type' => 'image/png',
				'post_type'      => 'attachment',
			)
		);

		$result = $this->invoke_pro_private( 'get_attachment_url', array( $attachment_id ) );

		$this->assertNotEmpty( $result );
		$this->assertEquals( esc_url( wp_get_attachment_url( $attachment_id ) ), $result );

		wp_delete_attachment( $attachment_id, true );
	}

	/**
	 * HTTP_CLIENT_IP takes precedence over HTTP_X_FORWARDED_FOR and REMOTE_ADDR.
	 */
	public function test_get_client_ip_header_precedence() {
		$original_remote_addr = isset( $_SERVER['REMOTE_ADDR'] ) ? $_SERVER['REMOTE_ADDR'] : null;

		$_SERVER['HTTP_CLIENT_IP']       = '198.51.100.1';
		$_SERVER['HTTP_X_FORWARDED_FOR'] = '198.51.100.2';
		$_SERVER['REMOTE_ADDR']          = '198.51.100.3';

		$this->assertEquals( '198.51.100.1', \ThemeIsle\OtterPro\Plugins\Dynamic_Content::get_client_ip() );

		unset( $_SERVER['HTTP_CLIENT_IP'] );
		$this->assertEquals( '198.51.100.2', \ThemeIsle\OtterPro\Plugins\Dynamic_Content::get_client_ip() );

		unset( $_SERVER['HTTP_X_FORWARDED_FOR'] );
		$this->assertEquals( '198.51.100.3', \ThemeIsle\OtterPro\Plugins\Dynamic_Content::get_client_ip() );

		if ( null === $original_remote_addr ) {
			unset( $_SERVER['REMOTE_ADDR'] );
		} else {
			$_SERVER['REMOTE_ADDR'] = $original_remote_addr;
		}
	}

	/**
	 * A valid IPv6 address is accepted.
	 */
	public function test_get_client_ip_accepts_ipv6() {
		$_SERVER['HTTP_CLIENT_IP'] = '2001:db8::1';
		$ip                        = \ThemeIsle\OtterPro\Plugins\Dynamic_Content::get_client_ip();
		unset( $_SERVER['HTTP_CLIENT_IP'] );

		$this->assertEquals( '2001:db8::1', $ip );
	}

	/**
	 * Protected meta key edge cases: empty, sensitive user fields (case-insensitive), and public keys.
	 */
	public function test_is_protected_meta_key_edge_cases() {
		$this->assertTrue( \ThemeIsle\OtterPro\Plugins\Dynamic_Content::is_protected_meta_key( '' ) );
		$this->assertTrue( \ThemeIsle\OtterPro\Plugins\Dynamic_Content::is_protected_meta_key( 'user_activation_key' ) );
		$this->assertTrue( \ThemeIsle\OtterPro\Plugins\Dynamic_Content::is_protected_meta_key( 'USER_PASS' ) );
		$this->assertFalse( \ThemeIsle\OtterPro\Plugins\Dynamic_Content::is_protected_meta_key( 'test_meta' ) );
	}

	/**
	 * postContent must render the context post, not whatever post the loop
	 * globals happen to point at (issue #2929: the context ID was passed to
	 * get_the_content() as $more_link_text, so the post argument stayed null).
	 */
	public function test_post_content_uses_context_not_loop_globals() {
		$other_id = $this->factory()->post->create(
			array(
				'post_title'   => 'Other',
				'post_content' => 'Other post content',
				'post_status'  => 'publish',
			)
		);

		$this->go_to( get_permalink( $this->post_id ) );

		// A secondary loop (page builder, related-posts widget) that forgot wp_reset_postdata().
		$query = new WP_Query( array( 'p' => $other_id ) );
		while ( $query->have_posts() ) {
			$query->the_post();
		}

		$result = $this->dynamic_content->apply_dynamic_content( '<p><o-dynamic data-type="postContent">Post Content</o-dynamic></p>' );

		wp_reset_postdata();
		wp_delete_post( $other_id, true );

		$this->assertStringNotContainsString( 'Other post content', $result );
		$this->assertStringContainsString( 'Test', $result );
	}

	/**
	 * A clobbered $pages loop global (theme templates are included at global
	 * scope, so any template-level $pages variable overwrites it) must not
	 * surface "Undefined array key -1" from post-template.php nor swallow the
	 * content (issue #2929).
	 */
	public function test_post_content_survives_corrupted_pages_global() {
		$this->go_to( get_permalink( $this->post_id ) );

		// Fire the loop so did_action( 'the_post' ) is truthy, then corrupt the global.
		$query = new WP_Query( array( 'p' => $this->post_id ) );
		while ( $query->have_posts() ) {
			$query->the_post();
		}
		$GLOBALS['pages'] = array();

		$captured = array();
		set_error_handler(
			function ( $errno, $errstr ) use ( &$captured ) {
				$captured[] = $errstr;
				return true;
			}
		);

		$result = $this->dynamic_content->apply_dynamic_content( '<p><o-dynamic data-type="postContent">Post Content</o-dynamic></p>' );

		restore_error_handler();
		wp_reset_postdata();

		$page_warnings = array_filter(
			$captured,
			function ( $message ) {
				return false !== strpos( $message, 'Undefined' ) || false !== strpos( $message, 'preg_match' );
			}
		);

		$this->assertSame( array(), array_values( $page_warnings ) );
		$this->assertStringContainsString( 'Test', $result );
	}

	/**
	 * The infinite-loop guard in mark_exceptions() must inspect the context
	 * post. When the context post nests a postContent tag the guard has to fire
	 * even though the loop-global post is clean (issue #2929: the guard read the
	 * loop global, so the nested tag went undetected and recursed).
	 */
	public function test_post_content_guard_detects_nested_tag_in_context_post() {
		$nested_id = $this->factory()->post->create(
			array(
				'post_title'   => 'Nested',
				'post_content' => 'Before <o-dynamic data-type="postContent">Post Content</o-dynamic> after',
				'post_status'  => 'publish',
			)
		);

		$clean_id = $this->factory()->post->create(
			array(
				'post_title'   => 'Clean loop global',
				'post_content' => 'Clean loop global content',
				'post_status'  => 'publish',
			)
		);

		// Context = the nested post, loop global = the clean post.
		$this->go_to( get_permalink( $nested_id ) );

		$query = new WP_Query( array( 'p' => $clean_id ) );
		while ( $query->have_posts() ) {
			$query->the_post();
		}

		$data      = array(
			'type'    => 'postContent',
			'context' => $nested_id,
		);
		$marked    = $this->dynamic_content->mark_exceptions( $data );
		$guard_key = $this->dynamic_content->get_exception_key( $data, $nested_id );

		// Asserted before rendering on purpose: an unfired guard makes
		// apply_dynamic_content() recurse until the process dies, so this has to
		// fail fast rather than hang.
		$this->assertArrayHasKey( $guard_key, $marked );

		$result = $this->dynamic_content->apply_dynamic_content( '<p><o-dynamic data-type="postContent">Post Content</o-dynamic></p>' );

		wp_reset_postdata();
		wp_delete_post( $nested_id, true );
		wp_delete_post( $clean_id, true );

		// Guard fired: the tag resolves to an empty string instead of recursing.
		$this->assertSame( '<p></p>', $result );
		$this->assertStringNotContainsString( 'Clean loop global content', $result );
	}

	/**
	 * The mirror case: a nested postContent tag in the loop-global post must not
	 * blank out a clean context post (issue #2929).
	 */
	public function test_post_content_guard_ignores_nested_tag_in_loop_global() {
		$nested_id = $this->factory()->post->create(
			array(
				'post_title'   => 'Nested loop global',
				'post_content' => 'Before <o-dynamic data-type="postContent">Post Content</o-dynamic> after',
				'post_status'  => 'publish',
			)
		);

		// Context = the clean post from set_up(), loop global = the nested post.
		$this->go_to( get_permalink( $this->post_id ) );

		$query = new WP_Query( array( 'p' => $nested_id ) );
		while ( $query->have_posts() ) {
			$query->the_post();
		}

		$data      = array(
			'type'    => 'postContent',
			'context' => $this->post_id,
		);
		$marked    = $this->dynamic_content->mark_exceptions( $data );
		$guard_key = $this->dynamic_content->get_exception_key( $data, $this->post_id );

		$this->assertArrayNotHasKey( $guard_key, $marked );

		$result = $this->dynamic_content->apply_dynamic_content( '<p><o-dynamic data-type="postContent">Post Content</o-dynamic></p>' );

		wp_reset_postdata();
		wp_delete_post( $nested_id, true );

		// Guard did not fire: the context post's own content is still rendered.
		$this->assertStringContainsString( 'Test', $result );
	}


	/**
	 * A dynamic link token must not consume the quote closing its attribute, or a
	 * comment author name printed after it becomes markup.
	 */
	public function test_dynamic_link_button_keeps_attribute_boundary(): void {
		$double = '<a class="wp-block-latest-comments__comment-author" href="http://attacker.example/#otterDynamicLink">Eve" autofocus onfocus=alert(1) x</a>';
		$single = "<a href='http://attacker.example/#otterDynamicLink'>Eve' autofocus onfocus=alert(1) x</a>";

		$this->assertNoInjectedAttributes( $this->dynamic_content->apply_dynamic_link_button( $double ) );
		$this->assertNoInjectedAttributes( $this->dynamic_content->apply_dynamic_link_button( $single ) );

		$link = new WP_HTML_Tag_Processor( $this->dynamic_content->apply_dynamic_link_button( '<a href="#otterDynamicLink?type=siteURL&#038;context=query">Go</a>' ) );
		$link->next_tag();
		$this->assertSame( get_site_url(), $link->get_attribute( 'href' ) );
	}

	/**
	 * Resolved link values are URL-escaped, as the Pro post meta link returns raw meta.
	 */
	public function test_dynamic_link_button_escapes_resolved_url(): void {
		add_filter(
			'otter_blocks_evaluate_dynamic_content_link',
			function (): string {
				return 'javascript:alert(1)';
			}
		);

		$link = new WP_HTML_Tag_Processor( $this->dynamic_content->apply_dynamic_link_button( '<a href="#otterDynamicLink?type=postMetaURL&amp;metaKey=link">Go</a>' ) );
		$link->next_tag();

		$this->assertStringNotContainsString( 'javascript:', (string) $link->get_attribute( 'href' ) );
	}

	/**
	 * The dynamic image rewrite matches the REST URL itself, so a comment linking to
	 * it must not break out of its attribute either.
	 */
	public function test_dynamic_image_keeps_attribute_boundary(): void {
		$markup = '<a class="wp-block-latest-comments__comment-author" href="' . get_rest_url( null, 'otter/v1/dynamic' ) . '">Eve" autofocus onfocus=alert(1) x</a>';

		$this->assertNoInjectedAttributes( $this->dynamic_content->apply_dynamic_images( $markup ) );

		$this->set_permalink_structure( '/%postname%/' );
		try {
			$src   = get_rest_url( null, 'otter/v1' ) . '/dynamic/?type=author&amp;context=' . $this->post_id . '&amp;uid=abc';
			$image = new WP_HTML_Tag_Processor( $this->dynamic_content->apply_dynamic_images( '<img src="' . $src . '" alt="Hero">' ) );
		} finally {
			$this->set_permalink_structure( '' );
		}
		$image->next_tag();
		$this->assertSame( get_avatar_url( (int) get_post_field( 'post_author', $this->post_id ) ), $image->get_attribute( 'src' ) );
		$this->assertSame( 'Hero', $image->get_attribute( 'alt' ) );
	}

	/**
	 * A magic tag opened inside an attribute must not close on text after it.
	 */
	public function test_dynamic_magic_tag_keeps_attribute_boundary(): void {
		$markup = '<p title="x{otterDynamic">y=1}" autofocus onfocus=alert(1) x {otterDynamic?type=siteTitle}</p>';
		$result = $this->dynamic_content->apply_dynamic_magic_tags( $markup );

		$this->assertNoInjectedAttributes( $result );
		$this->assertStringContainsString( get_bloginfo( 'name' ), $result );
	}

	/**
	 * Link and image tokens keep meta keys with spaces, which the editor saves unencoded.
	 */
	public function test_dynamic_tokens_keep_spaced_meta_keys(): void {
		$keys    = array();
		$capture = function ( $value, array $data ) use ( &$keys ) {
			if ( isset( $data['metaKey'] ) ) {
				$keys[] = $data['metaKey'];
			}
			if ( isset( $data['meta'] ) ) {
				$keys[] = $data['meta'];
			}

			return $value;
		};
		add_filter( 'otter_blocks_evaluate_dynamic_content_link', $capture, 10, 2 );
		add_filter( 'otter_blocks_evaluate_dynamic_content_media_content', $capture, 10, 2 );

		$this->dynamic_content->apply_dynamic_link_button( '<a href="#otterDynamicLink?type=postMetaURL&amp;metaKey=my key">Go</a>' );

		$this->set_permalink_structure( '/%postname%/' );
		try {
			$this->dynamic_content->apply_dynamic_images( '<img src="' . get_rest_url( null, 'otter/v1' ) . '/dynamic/?type=postMeta&amp;meta=my key&amp;context=' . $this->post_id . '">' );
		} finally {
			$this->set_permalink_structure( '' );
		}

		$this->assertSame( array( 'my key', 'my key' ), $keys );
	}

	/**
	 * Repeater values clone the content and swap each link token in full, without leaving its attribute.
	 */
	public function test_dynamic_content_array_value_replaces_link_tokens(): void {
		add_filter(
			'otter_blocks_evaluate_dynamic_content_text',
			function (): array {
				return array( 'One', 'Two' );
			}
		);
		add_filter(
			'otter_blocks_evaluate_dynamic_content_link',
			function (): array {
				return array( 'https://one.example', 'https://two.example' );
			}
		);

		$result = $this->dynamic_content->apply_dynamic_content( "<a href='#otterDynamicLink?type=otterTestLink&amp;metaKey=my key'>Eve' autofocus onfocus=alert(1) x</a><o-dynamic data-type=\"otterTestList\">Value</o-dynamic>" );

		$processor = new WP_HTML_Tag_Processor( $result );
		foreach ( array( 'https://one.example', 'https://two.example' ) as $expected ) {
			$this->assertTrue( $processor->next_tag( 'a' ), $result );
			$this->assertSame( $expected, $processor->get_attribute( 'href' ) );
			$this->assertNull( $processor->get_attribute( 'onfocus' ), $result );
		}
		$this->assertStringContainsString( 'One', $result );
		$this->assertStringContainsString( 'Two', $result );
	}

	/**
	 * Every resolved repeater link is URL-escaped.
	 */
	public function test_dynamic_link_button_escapes_each_resolved_url(): void {
		add_filter(
			'otter_blocks_evaluate_dynamic_content_link',
			function (): array {
				return array( 'javascript:alert(1)', 'https://ok.example' );
			}
		);

		$this->assertSame(
			array( '', 'https://ok.example' ),
			$this->dynamic_content->apply_link_button( array( '#otterDynamicLink?type=otterTestLink' ) )
		);
	}

	/**
	 * A magic tag inside an attribute is attribute-escaped, as the values it resolves to are raw.
	 */
	public function test_dynamic_magic_tag_value_is_escaped_in_attribute(): void {
		$name      = 'Safe" autofocus onfocus=alert(1) x="';
		$author_id = self::factory()->user->create(
			array(
				'role'         => 'contributor',
				'display_name' => $name,
			)
		);
		$this->go_to( get_permalink( self::factory()->post->create( array( 'post_author' => $author_id ) ) ) );

		$result = $this->dynamic_content->apply_dynamic_magic_tags( "<p title=\"{otterDynamic?type=authorName}\" data-x='{otterDynamic?type=authorName}'>{otterDynamic?type=authorName}</p>" );

		$this->assertNoInjectedAttributes( $result );

		$processor = new WP_HTML_Tag_Processor( $result );
		$processor->next_tag();
		$this->assertSame( $name, $processor->get_attribute( 'title' ) );
		$this->assertSame( $name, $processor->get_attribute( 'data-x' ) );
		$this->assertStringContainsString( '>' . $name . '</p>', $result );
	}

	public function test_comment_magic_tag_does_not_create_script_link(): void {
		wp_set_current_user( 0 );
		update_option( 'comment_registration', 0 );
		update_option( 'require_name_email', 0 );
		wp_update_post( array( 'ID' => $this->post_id, 'comment_status' => 'open' ) );

		$comment = wp_handle_comment_submission(
			array(
				'comment_post_ID' => $this->post_id,
				'author'          => 'Visitor',
				'comment'         => '<a href="{otterDynamic?x=/?&default=javascript:alert(1)}">Comment link</a>',
			)
		);
		$this->assertInstanceOf( WP_Comment::class, $comment );
		$this->assertStringContainsString( '{otterDynamic?', $comment->comment_content );
		wp_set_comment_status( $comment->comment_ID, 'approve' );

		$block = new WP_Block(
			array( 'blockName' => 'core/comment-content', 'attrs' => array() ),
			array( 'commentId' => (int) $comment->comment_ID )
		);
		$result = do_blocks( '<!-- wp:group --><div class="wp-block-group">' . $block->render() . '</div><!-- /wp:group -->' );
		$processor = new WP_HTML_Tag_Processor( $result );
		$this->assertTrue( $processor->next_tag( 'a' ), $result );
		$this->assertNotSame( 'javascript:alert(1)', $processor->get_attribute( 'href' ), $result );
	}

	public function test_contributor_magic_tag_does_not_create_script_link(): void {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'contributor' ) ) );
		$post_id = self::factory()->post->create(
			array(
				'post_content' => '<!-- wp:paragraph --><p><a href="{otterDynamic?x=/?&default=javascript:alert(1)}">Post link</a></p><!-- /wp:paragraph -->',
			)
		);
		$content = get_post_field( 'post_content', $post_id );
		$this->assertStringContainsString( '{otterDynamic?', $content );
		$result = do_blocks( $content );
		$processor = new WP_HTML_Tag_Processor( $result );
		$this->assertTrue( $processor->next_tag( 'a' ), $result );
		$this->assertSame( '', (string) $processor->get_attribute( 'href' ), $result );
	}

	public function test_magic_tags_sanitize_every_uri_attribute(): void {
		add_filter( 'wp_kses_uri_attributes', function ( $attributes ) {
			$attributes[] = 'data-destination';
			return $attributes;
		} );

		foreach ( wp_kses_uri_attributes() as $attribute ) {
			$result = $this->dynamic_content->apply_dynamic_magic_tags( '<a ' . strtoupper( $attribute ) . '="java{otterDynamic?default=script}:alert(1)">Link</a>' );
			$processor = new WP_HTML_Tag_Processor( $result );
			$this->assertTrue( $processor->next_tag(), $result );
			$this->assertSame( '', (string) $processor->get_attribute( $attribute ), $result );
		}
	}

	public function test_magic_tags_preserve_safe_url_values(): void {
		add_filter( 'otter_blocks_evaluate_dynamic_content_text', function () { return 'https://example.org/path with spaces?a=1&b=2'; } );
		$result = $this->dynamic_content->apply_dynamic_magic_tags( '<a href="{otterDynamic?type=testURL}">Link</a>' );
		$processor = new WP_HTML_Tag_Processor( $result );
		$this->assertTrue( $processor->next_tag(), $result );
		$this->assertSame( 'https://example.org/path%20with%20spaces?a=1&b=2', $processor->get_attribute( 'href' ), $result );
	}

	public function test_magic_tags_quote_unquoted_attributes_and_preserve_literals(): void {
		$value = 'Value with spaces & "quotes" {otterDynamic?default=second-pass}';
		add_filter( 'otter_blocks_evaluate_dynamic_content_text', function () use ( $value ) { return $value; } );
		$result = $this->dynamic_content->apply_dynamic_magic_tags( '<p title={otterDynamic?type=testValue} data-static="&amp;amp;">{otterDynamic?type=testValue}</p>' );
		$processor = new WP_HTML_Tag_Processor( $result );
		$this->assertTrue( $processor->next_tag(), $result );
		$this->assertSame( $value, $processor->get_attribute( 'title' ), $result );
		$this->assertSame( '&amp;', $processor->get_attribute( 'data-static' ), $result );
		$this->assertSame( array( 'title', 'data-static' ), $processor->get_attribute_names_with_prefix( '' ) );
		$this->assertStringContainsString( '>' . $value . '</p>', html_entity_decode( $result ), $result );
	}

	public function test_magic_tags_sanitize_raw_text_element_attributes(): void {
		foreach ( array( 'iframe', 'script', 'style', 'textarea' ) as $tag ) {
			$result = $this->dynamic_content->apply_dynamic_magic_tags( '<' . $tag . ' src="{otterDynamic?default=javascript:alert(1)}" title="{otterDynamic?default=Title}">Unchanged</' . $tag . '>' );
			$processor = new WP_HTML_Tag_Processor( $result );
			$this->assertTrue( $processor->next_tag(), $result );
			$this->assertSame( '', (string) $processor->get_attribute( 'src' ), $result );
			$this->assertSame( 'Title', $processor->get_attribute( 'title' ), $result );
			$this->assertStringContainsString( '>Unchanged</' . $tag . '>', $result );
		}
	}

	public function test_magic_tags_sanitize_css_and_reject_executable_attributes(): void {
		$result = $this->dynamic_content->apply_dynamic_magic_tags( '<iframe style="color:{otterDynamic?default=red};background-image:url(java{otterDynamic?default=script}:alert(1))" onload="{otterDynamic?default=alert(1)}" srcdoc="{otterDynamic?default=content}"></iframe>' );
		$processor = new WP_HTML_Tag_Processor( $result );
		$this->assertTrue( $processor->next_tag(), $result );
		$this->assertSame( 'color:red', $processor->get_attribute( 'style' ), $result );
		$this->assertNull( $processor->get_attribute( 'onload' ), $result );
		$this->assertNull( $processor->get_attribute( 'srcdoc' ), $result );
	}

	public function test_stored_comment_magic_tags_remain_literal_in_nested_blocks(): void {
		$token = '{otterDynamic?type=postTitle}';
		$comment_id = self::factory()->comment->create(
			array(
				'comment_post_ID'  => $this->post_id,
				'comment_content'  => '<a href="' . $token . '">' . $token . '</a>',
				'comment_author'   => $token,
				'comment_approved' => 1,
			)
		);
		foreach ( array( get_comment_text( $comment_id ), get_comment_excerpt( $comment_id ), get_comment_author( $comment_id ) ) as $content ) {
			$markup = '<!-- wp:group --><div class="wp-block-group"><!-- wp:paragraph --><p>{otterDynamic?type=postTitle}</p><!-- /wp:paragraph -->' . $content . '</div><!-- /wp:group -->';
			$result = do_blocks( $markup );
			$this->assertStringContainsString( $token, html_entity_decode( $result ), $result );
			$this->assertStringContainsString( '>Test</p>', $result );
		}
	}

	public function test_encoded_comment_magic_tag_stays_literal_beside_dynamic_attribute(): void {
		$token = '{otterDynamic?type=postTitle}';
		$content = $this->dynamic_content->escape_comment_magic_tags( $token );
		$result = $this->dynamic_content->apply_dynamic_magic_tags( '<a href="' . $content . '" title="{otterDynamic?type=postTitle}">Link</a>' );
		$processor = new WP_HTML_Tag_Processor( $result );
		$this->assertTrue( $processor->next_tag(), $result );
		$this->assertSame( $token, $processor->get_attribute( 'href' ), $result );
		$this->assertSame( 'Test', $processor->get_attribute( 'title' ), $result );
	}

	public function test_literal_marker_collision_preserves_comment_and_existing_attribute(): void {
		$next_id = (int) wp_unique_id() + 1;
		$marker = 'otter-literal-magic-' . $next_id;
		$token = '{otterDynamic?type=postTitle}';
		$content = '&#123;otterDynamic?type=postTitle}';
		$result = $this->dynamic_content->apply_dynamic_magic_tags( '<a href="' . $content . '" data-marker="' . $marker . '" title="' . $token . '">Link</a>' );
		$processor = new WP_HTML_Tag_Processor( $result );
		$this->assertTrue( $processor->next_tag(), $result );
		$this->assertSame( $token, $processor->get_attribute( 'href' ), $result );
		$this->assertSame( $marker, $processor->get_attribute( 'data-marker' ), $result );
		$this->assertSame( 'Test', $processor->get_attribute( 'title' ), $result );
		$this->assertSame( (string) ( $next_id + 2 ), wp_unique_id() );
	}

	public function test_comment_avatar_magic_tags_remain_literal_in_nested_blocks(): void {
		wp_set_current_user( 0 );
		update_option( 'comment_registration', 0 );
		update_option( 'require_name_email', 0 );
		update_option( 'show_avatars', 1 );
		wp_update_post( array( 'ID' => $this->post_id, 'comment_status' => 'open' ) );
		$token = '{otterDynamic?type=postTitle}';
		$comment = wp_handle_comment_submission(
			array(
				'comment_post_ID' => $this->post_id,
				'author' => $token,
				'url' => 'https://example.org/',
				'comment' => 'Visitor comment',
			)
		);
		$this->assertInstanceOf( WP_Comment::class, $comment );
		$this->assertSame( $token, $comment->comment_author );
		foreach ( array( false, true ) as $is_link ) {
			$block = new WP_Block(
				array( 'blockName' => 'core/avatar', 'attrs' => array( 'isLink' => $is_link, 'linkTarget' => '_blank', 'className' => 'visitor-' . $token ) ),
				array( 'commentId' => (int) $comment->comment_ID )
			);
			$avatar = $block->render();
			$processor = new WP_HTML_Tag_Processor( $avatar );
			$this->assertTrue( $processor->next_tag( 'div' ), $avatar );
			$this->assertStringContainsString( 'visitor-Test', $processor->get_attribute( 'class' ), $avatar );
			$result = do_blocks( '<!-- wp:group --><div class="wp-block-group">' . $avatar . '<!-- wp:paragraph --><p>' . $token . '</p><!-- /wp:paragraph --></div><!-- /wp:group -->' );
			$processor = new WP_HTML_Tag_Processor( $result );
			if ( $is_link ) {
				$this->assertTrue( $processor->next_tag( 'a' ), $result );
				$this->assertStringContainsString( $token, $processor->get_attribute( 'aria-label' ), $result );
			}
			$this->assertTrue( $processor->next_tag( 'img' ), $result );
			$this->assertStringContainsString( $token, $processor->get_attribute( 'alt' ), $result );
			$this->assertStringContainsString( '>Test</p>', $result );
		}
		update_option( 'show_avatars', 0 );
		$processor = new WP_HTML_Tag_Processor( $block->render() );
		$this->assertFalse( $processor->next_tag( 'img' ) );
	}

	public function test_author_archive_magic_tags_remain_literal_in_nested_blocks(): void {
		require_once ABSPATH . 'wp-admin/includes/user.php';
		$token = '{otterDynamic?type=siteTitle}';
		wp_set_current_user( $this->user_id );
		$this->assertTrue( current_user_can( 'edit_user', $this->user_id ) );
		$this->assertFalse( current_user_can( 'edit_users' ) );
		$previous_post = $_POST;
		try {
			$_POST = array( 'display_name' => $token, 'nickname' => 'Visitor', 'email' => 'test@userrecover.com' );
			$this->assertSame( $this->user_id, edit_user( $this->user_id ) );
		} finally {
			$_POST = $previous_post;
		}
		$this->assertSame( $token, get_userdata( $this->user_id )->display_name );
		wp_set_current_user( 0 );
		$this->go_to( get_author_posts_url( $this->user_id ) );
		$this->assertTrue( is_author() );
		$GLOBALS['wp_query']->the_post();
		$result = do_blocks( '<!-- wp:group --><div class="wp-block-group"><!-- wp:query-title {"type":"archive"} /--><!-- wp:paragraph --><p>' . $token . '</p><!-- /wp:paragraph --></div><!-- /wp:group -->' );
		$this->assertStringContainsString( $token, html_entity_decode( $result ), $result );
		$this->assertStringContainsString( 'Author:', $result );
		$this->assertStringContainsString( '>' . get_bloginfo( 'name' ) . '</p>', $result );
	}

	public function test_profile_magic_tags_remain_literal_in_nested_blocks(): void {
		$token = '{otterDynamic?type=postTitle}';
		wp_update_user( array( 'ID' => $this->user_id, 'display_name' => $token, 'description' => $token ) );
		wp_set_current_user( $this->user_id );
		$markup = '<!-- wp:group --><div class="wp-block-group"><!-- wp:post-author {"showBio":true} /--><!-- wp:post-author-biography /--><!-- wp:paragraph --><p>' . $token . '</p><!-- /wp:paragraph --></div><!-- /wp:group -->';
		$result = do_blocks( $markup );
		$this->assertStringContainsString( $token, html_entity_decode( $result ), $result );
		$this->assertStringContainsString( 'wp-block-post-author__name">' . $token, html_entity_decode( $result ), $result );
		$this->assertStringContainsString( 'wp-block-post-author__bio">' . $token, html_entity_decode( $result ), $result );
		$this->assertStringContainsString( 'wp-block-post-author-biography">' . $token, html_entity_decode( $result ), $result );
		$this->assertStringContainsString( '>Test</p>', $result );

		foreach ( array( 'authorName', 'authorDescription', 'loggedInUserName', 'loggedInUserDescription' ) as $type ) {
			$result = do_blocks( '<!-- wp:group --><div class="wp-block-group"><!-- wp:paragraph --><p title="{otterDynamic?type=' . $type . '}">{otterDynamic?type=' . $type . '}</p><!-- /wp:paragraph --></div><!-- /wp:group -->' );
			$this->assertSame( 2, substr_count( html_entity_decode( $result ), $token ), $result );
			$this->assertStringNotContainsString( 'Test', $result );
		}
	}

	public function test_comment_form_identity_magic_tags_remain_literal_in_nested_blocks(): void {
		$token = '{otterDynamic?type=postTitle}';
		$email = $token . '@example.org';
		$this->assertSame( $email, sanitize_email( $email ) );
		wp_update_post( array( 'ID' => $this->post_id, 'comment_status' => 'open' ) );
		$_COOKIE[ 'comment_author_' . COOKIEHASH ] = $token;
		$_COOKIE[ 'comment_author_email_' . COOKIEHASH ] = $email;
		$_COOKIE[ 'comment_author_url_' . COOKIEHASH ] = 'https://example.org/' . $token;
		wp_update_user( array( 'ID' => $this->user_id, 'display_name' => $token ) );

		try {
			foreach ( array( 0, $this->user_id ) as $user_id ) {
				wp_set_current_user( $user_id );
				$result = do_blocks( '<!-- wp:group --><div class="wp-block-group"><!-- wp:post-comments-form /--><!-- wp:paragraph --><p>' . $token . '</p><!-- /wp:paragraph --></div><!-- /wp:group -->' );
				$this->assertStringContainsString( $token, html_entity_decode( $result ), $result );
				$this->assertStringContainsString( '>Test</p>', $result );
				$this->assertStringNotContainsString( 'value="Test"', $result );
				$this->assertStringNotContainsString( 'Logged in as Test', $result );
				if ( 0 === $user_id ) {
					$processor = new WP_HTML_Tag_Processor( $result );
					while ( $processor->next_tag( 'input' ) && 'email' !== $processor->get_attribute( 'name' ) ) {
					}
					$this->assertSame( $email, $processor->get_attribute( 'value' ), $result );
				}
			}
		} finally {
			unset( $_COOKIE[ 'comment_author_' . COOKIEHASH ], $_COOKIE[ 'comment_author_email_' . COOKIEHASH ], $_COOKIE[ 'comment_author_url_' . COOKIEHASH ] );
		}
	}

	/**
	 * @dataProvider provide_literal_search_queries
	 *
	 * @param string $query Visitor search text.
	 */
	public function test_search_magic_tags_remain_literal_in_nested_blocks( string $query ): void {
		$token = '{otterDynamic?type=siteTitle}';
		wp_set_current_user( 0 );
		$this->go_to( add_query_arg( 's', rawurlencode( $query ), home_url( '/' ) ) );
		$this->assertTrue( is_search() );
		$this->assertSame( $query, get_query_var( 's' ) );
		$search_attributes = wp_json_encode( array( 'placeholder' => $token, 'className' => 'trusted-' . $token, 'query' => array( 'visitor' => $token ) ) );
		$result = do_blocks( '<!-- wp:group --><div class="wp-block-group"><!-- wp:search ' . $search_attributes . ' /--><!-- wp:query-title {"type":"search","showSearchTerm":true} /--><!-- wp:paragraph --><p>' . $token . '</p><!-- /wp:paragraph --></div><!-- /wp:group -->' );
		$processor = new WP_HTML_Tag_Processor( $result );
		$this->assertTrue( $processor->next_tag( 'input' ), $result );
		$this->assertSame( $query, $processor->get_attribute( 'value' ), $result );
		$this->assertSame( get_bloginfo( 'name' ), $processor->get_attribute( 'placeholder' ), $result );
		$this->assertTrue( $processor->next_tag( 'input' ), $result );
		$this->assertSame( 'visitor', $processor->get_attribute( 'name' ), $result );
		$this->assertSame( get_bloginfo( 'name' ), $processor->get_attribute( 'value' ), $result );
		$this->assertStringContainsString( 'trusted-' . get_bloginfo( 'name' ), $result );
		$this->assertSame( substr_count( $query, $token ) + substr_count( html_entity_decode( $query ), $token ), substr_count( html_entity_decode( $result ), $token ), $result );
		$this->assertStringContainsString( '>' . get_bloginfo( 'name' ) . '</p>', $result );
		$this->assertSame( $query, get_query_var( 's' ) );
	}

	public function provide_literal_search_queries(): array {
		return array(
			'literal token' => array( '{otterDynamic?type=siteTitle}' ),
			'encoded prefix' => array( '&#123;otterDynamic?type=siteTitle}' ),
			'mixed prefixes' => array( '{otterDynamic?type=siteTitle} &#123;otterDynamic?type=siteTitle}' ),
		);
	}

	public function test_query_string_magic_tags_remain_literal_in_nested_blocks(): void {
		$token = '{otterDynamic?type=postTitle}';
		$this->configure_pro_dynamic_content_license( false );
		$this->assertFalse( has_filter( 'otter_blocks_evaluate_dynamic_content_text', array( $this->dynamic_content_pro, 'evaluate_content' ) ) );
		$this->configure_pro_dynamic_content_license( true );
		$this->go_to( add_query_arg( 'visitor', $token, get_permalink( $this->post_id ) ) );
		foreach ( array( 'default', 'capitalize' ) as $format ) {
			$result = do_blocks( '<!-- wp:group --><div class="wp-block-group"><!-- wp:paragraph --><p title="{otterDynamic?type=queryString&parameter=visitor&format=' . $format . '}">{otterDynamic?type=queryString&parameter=visitor&format=' . $format . '}</p><!-- /wp:paragraph --></div><!-- /wp:group -->' );
			$this->assertSame( 2, substr_count( html_entity_decode( $result ), $token ), $result );
			$this->assertStringNotContainsString( 'Test', $result );
		}
	}

	public function test_resolved_list_magic_tags_remain_literal_in_nested_blocks(): void {
		$token = '{otterDynamic?type=postTitle}';
		add_filter( 'otter_blocks_evaluate_dynamic_content_text', function () use ( $token ) { return array( $token, 'Other ' . $token ); } );
		$result = do_blocks( '<!-- wp:group --><div class="wp-block-group"><!-- wp:paragraph --><p><o-dynamic data-type="otterTestList">Value</o-dynamic></p><!-- /wp:paragraph --></div><!-- /wp:group -->' );
		$this->assertSame( 2, substr_count( html_entity_decode( $result ), $token ), $result );
		$this->assertStringContainsString( 'Other ' . $token, html_entity_decode( $result ), $result );
		$this->assertStringNotContainsString( 'Test', $result );
	}

	/**
	 * @dataProvider provide_dynamic_image_post_contexts
	 *
	 * @param array{post_status: string, post_password?: string, post_type?: string} $post_args Context post.
	 */
	public function test_archive_comment_dynamic_images_enforce_post_permissions( array $post_args ): void {
		$this->configure_pro_dynamic_content_license( true );
		update_option( 'comment_registration', 0 );
		update_option( 'require_name_email', 0 );
		wp_update_post( array( 'ID' => $this->post_id, 'comment_status' => 'open' ) );
		$subscriber_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		$editor_id = self::factory()->user->create( array( 'role' => 'editor' ) );
		$this->set_permalink_structure( '/%postname%/' );

		try {
			$context_id = self::factory()->post->create( $post_args );
			$secret_url = 'https://example.org/confidential-' . $context_id . '.png';
			update_post_meta( $context_id, 'confidential_image', $secret_url );
			$url = get_rest_url( null, 'otter/v1/dynamic/' ) . '?type=postMeta&context=' . $context_id . '&meta=confidential_image&uid=1';
			wp_set_current_user( 0 );
			$comment = wp_handle_comment_submission(
				array(
					'comment_post_ID' => $this->post_id,
					'author' => 'Visitor ' . $context_id,
					'url' => $url,
					'comment' => 'Visitor comment ' . $context_id,
				)
			);
			$this->assertInstanceOf( WP_Comment::class, $comment );
			$this->assertSame( $url, html_entity_decode( $comment->comment_author_url ) );
			wp_set_comment_status( $comment->comment_ID, 'approve' );
			$this->go_to( get_category_link( $this->category_id ) );
			$this->assertTrue( is_archive() );
			$block = new WP_Block(
				array(
					'blockName' => 'core/latest-comments',
					'attrs' => array( 'commentsToShow' => 100, 'displayAvatar' => false, 'displayExcerpt' => false ),
				)
			);
			foreach ( array( 0, $subscriber_id, $editor_id ) as $user_id ) {
				wp_set_current_user( $user_id );
				$result = do_blocks( '<!-- wp:group --><div class="wp-block-group">' . $block->render() . '</div><!-- /wp:group -->' );
				if ( $user_id === $editor_id ) {
					$this->assertStringContainsString( $secret_url, $result );
				} else {
					$this->assertStringNotContainsString( $secret_url, $result );
					$this->assertStringContainsString( 'assets/images/placeholder.jpg', $result );
				}
			}
			wp_update_post( array( 'ID' => $context_id, 'post_status' => 'publish', 'post_password' => '', 'post_type' => 'post' ) );
			wp_set_current_user( 0 );
			$this->assertStringContainsString( $secret_url, $block->render() );
		} finally {
			$this->set_permalink_structure( '' );
		}
	}

	public function provide_dynamic_image_post_contexts(): array {
		return array(
			'private' => array( array( 'post_status' => 'private' ) ),
			'draft' => array( array( 'post_status' => 'draft' ) ),
			'password protected' => array( array( 'post_status' => 'publish', 'post_password' => 'secret' ) ),
			'non-viewable' => array( array( 'post_status' => 'publish', 'post_type' => 'wp_block' ) ),
		);
	}

	/**
	 * @dataProvider provide_dynamic_image_widget_contexts
	 *
	 * @param string $context_query Serialized widget context.
	 */
	public function test_dynamic_widget_images_use_global_post_permissions( string $context_query ): void {
		$attachment_id = self::factory()->attachment->create_object( 'widget-image.png', $this->post_id, array( 'post_mime_type' => 'image/png' ) );
		set_post_thumbnail( $this->post_id, $attachment_id );
		$image_url = get_the_post_thumbnail_url( $this->post_id );
		$this->assertNotEmpty( $image_url );
		$editor_id = self::factory()->user->create( array( 'role' => 'editor' ) );
		foreach ( array( get_category_link( $this->category_id ), home_url( '/' ), get_author_posts_url( $this->user_id ) ) as $url ) {
			wp_set_current_user( 0 );
			wp_update_post( array( 'ID' => $this->post_id, 'post_status' => 'publish' ) );
			$this->go_to( $url );
			$this->assertFalse( is_singular() );
			$this->assertSame( $this->post_id, get_the_ID() );
			foreach ( array( 'featuredImage' => $image_url, 'author' => get_avatar_url( $this->user_id ) ) as $type => $expected_url ) {
				$query = get_rest_url( null, 'otter/v1/dynamic/' );
				$query .= ( false === strpos( $query, '?' ) ? '?' : '&' ) . 'type=' . $type . $context_query . '&uid=1';
				$markup = '<!-- wp:group --><div class="wp-block-group"><!-- wp:image --><figure class="wp-block-image"><img src="' . $query . '"/></figure><!-- /wp:image --></div><!-- /wp:group -->';
				$result = do_blocks( $markup );
				$this->assertStringContainsString( $expected_url, html_entity_decode( $result ), $result );
				wp_update_post( array( 'ID' => $this->post_id, 'post_status' => 'private' ) );
				$result = do_blocks( $markup );
				$this->assertStringNotContainsString( $expected_url, html_entity_decode( $result ), $result );
				$this->assertStringContainsString( 'assets/images/placeholder.jpg', $result );
				wp_set_current_user( $editor_id );
				$result = do_blocks( $markup );
				$this->assertStringContainsString( $expected_url, html_entity_decode( $result ), $result );
				wp_set_current_user( 0 );
				wp_update_post( array( 'ID' => $this->post_id, 'post_status' => 'publish' ) );
			}
		}
		wp_update_post( array( 'ID' => $this->post_id, 'post_status' => 'draft' ) );
		$this->go_to( get_category_link( $this->category_id ) );
		$this->assertFalse( get_the_ID() );
		$this->assertStringContainsString( 'assets/images/placeholder.jpg', do_blocks( $markup ) );
	}

	public function provide_dynamic_image_widget_contexts(): array {
		return array(
			'zero' => array( '&context=0' ),
			'empty' => array( '&context=' ),
			'null' => array( '&context' ),
			'missing' => array( '' ),
			'query' => array( '&context=query' ),
		);
	}

	public function test_dynamic_product_images_require_access_to_product_and_context(): void {
		$this->configure_pro_dynamic_content_license( true );
		$attachment_id = self::factory()->attachment->create_object( 'product-image.png', $this->post_id, array( 'post_mime_type' => 'image/png' ) );
		$image_url = wp_get_attachment_image_url( $attachment_id, 'full' );
		$this->assertNotEmpty( $image_url );
		$product = new WC_Product_Simple();
		$product->set_status( 'private' );
		$product->set_image_id( $attachment_id );
		$product_id = $product->save();
		$this->go_to( get_category_link( $this->category_id ) );
		$query = get_rest_url( null, 'otter/v1/dynamic/' );
		$query .= ( false === strpos( $query, '?' ) ? '?' : '&' ) . 'type=product&context=' . $this->post_id . '&id=' . $product_id . '&uid=1';
		wp_set_current_user( 0 );
		$result = $this->dynamic_content->apply_dynamic_images( '<img src="' . $query . '">' );
		$this->assertStringNotContainsString( $image_url, $result );
		$this->assertStringContainsString( 'assets/images/placeholder.jpg', $result );
		$fallback_result = $this->dynamic_content->apply_dynamic_images( '<img src="' . $query . '&fallback=https://example.org/safe-fallback.png">' );
		$this->assertStringContainsString( 'https://example.org/safe-fallback.png', $fallback_result );
		$this->assertStringNotContainsString( $image_url, $fallback_result );

		$administrator = get_userdata( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		foreach ( array( 'edit_products', 'edit_others_products', 'edit_private_products' ) as $capability ) {
			$administrator->add_cap( $capability );
		}
		wp_set_current_user( $administrator->ID );
		$this->assertTrue( current_user_can( 'edit_post', $product_id ) );
		$this->assertStringContainsString( $image_url, $this->dynamic_content->apply_dynamic_images( '<img src="' . $query . '">' ) );

		wp_update_post( array( 'ID' => $product_id, 'post_status' => 'publish' ) );
		wp_set_current_user( 0 );
		$this->assertSame( array( 'publish', true, false ), array( get_post_status( $product_id ), is_post_type_viewable( get_post_type( $product_id ) ), post_password_required( $product_id ) ) );
		$this->assertStringContainsString( $image_url, $this->dynamic_content->apply_dynamic_images( '<img src="' . $query . '">' ) );

		wp_update_post( array( 'ID' => $this->post_id, 'post_status' => 'private' ) );
		$this->assertStringNotContainsString( $image_url, $this->dynamic_content->apply_dynamic_images( '<img src="' . $query . '">' ) );
		wp_update_post( array( 'ID' => $this->post_id, 'post_status' => 'publish' ) );

		$attachment_id = self::factory()->attachment->create_object( 'site-logo.png', $this->post_id, array( 'post_mime_type' => 'image/png' ) );
		set_theme_mod( 'custom_logo', $attachment_id );
		$this->go_to( get_category_link( $this->category_id ) );
		wp_set_current_user( 0 );
		$this->assertSame( wp_get_attachment_image_url( $attachment_id, 'full' ), $this->dynamic_content->get_image( array( 'type' => 'logo', 'context' => '0' ) ) );
		set_theme_mod( 'custom_logo', 0 );
		$this->assertSame( OTTER_BLOCKS_URL . 'assets/images/placeholder.jpg', $this->dynamic_content->get_image( array( 'type' => 'logo', 'context' => '0' ) ) );
		wp_set_current_user( $this->user_id );
		$this->assertSame( get_avatar_url( $this->user_id ), $this->dynamic_content->get_image( array( 'type' => 'loggedInUser', 'context' => '0' ) ) );
		update_option( 'show_avatars', 0 );
		$this->assertSame( get_avatar_url( $this->user_id ), $this->dynamic_content->get_image( array( 'type' => 'loggedInUser', 'context' => '0' ) ) );

		$this->go_to( get_permalink( $this->post_id ) );
		$this->assertSame( get_avatar_url( $this->user_id ), $this->dynamic_content->get_image( array( 'type' => 'author', 'context' => '0' ) ) );
	}

	private function configure_pro_dynamic_content_license( bool $active ): void {
		if ( ! defined( 'OTTER_PRO_BASEFILE' ) ) {
			require_once dirname( __DIR__ ) . '/plugins/otter-pro/otter-pro.php';
		}
		$option_name = str_replace( '-', '_', strtolower( trim( basename( dirname( OTTER_PRO_BASEFILE ) ) ) ) ) . '_license_data';
		if ( $active ) {
			update_option( $option_name, (object) array( 'license' => 'valid' ) );
		} else {
			delete_option( $option_name );
		}
		$this->dynamic_content_pro->init();
	}

	/**
	 * Assert the first tag of the markup gained no attributes from the text after it.
	 *
	 * @param string $html Rewritten markup.
	 */
	private function assertNoInjectedAttributes( string $html ): void {
		$processor = new WP_HTML_Tag_Processor( $html );
		$processor->next_tag();

		$this->assertNull( $processor->get_attribute( 'onfocus' ), $html );
		$this->assertNull( $processor->get_attribute( 'autofocus' ), $html );
	}

	/**
	 * Nested postContent tags the parser accepts, beyond the double-quoted form.
	 *
	 * @return array<string, array{0: string}>
	 */
	public function provide_parser_valid_nested_post_content_tags(): array {
		return array(
			'single quotes'            => array( "<o-dynamic data-type='postContent'>Post Content</o-dynamic>" ),
			'mixed quotes'             => array( "<o-dynamic data-type=\"postContent'>Post Content</o-dynamic>" ),
			'after another attribute'  => array( "<o-dynamic data-context=\"query\" data-type='postContent'>Post Content</o-dynamic>" ),
		);
	}

	/**
	 * Any parser-valid nested postContent tag must fire the recursion guard.
	 *
	 * @dataProvider provide_parser_valid_nested_post_content_tags
	 *
	 * @param string $nested_tag Nested tag stored in the context post.
	 */
	public function test_post_content_guard_detects_parser_valid_nested_tag( string $nested_tag ): void {
		global $wpdb;

		$nested_id = $this->factory()->post->create(
			array(
				'post_title'  => 'Nested',
				'post_status' => 'publish',
			)
		);

		// Written directly: kses on save rewrites quotes unless the author has unfiltered_html.
		$wpdb->update( $wpdb->posts, array( 'post_content' => '<!-- wp:html -->' . $nested_tag . '<!-- /wp:html -->' ), array( 'ID' => $nested_id ) );
		clean_post_cache( $nested_id );

		$this->go_to( get_permalink( $nested_id ) );

		$data      = array(
			'type'    => 'postContent',
			'context' => $nested_id,
		);
		$marked    = $this->dynamic_content->mark_exceptions( $data );
		$guard_key = $this->dynamic_content->get_exception_key( $data, $nested_id );

		// Asserted before rendering: an unfired guard recurses until the process dies.
		$this->assertArrayHasKey( $guard_key, $marked );

		$result = $this->dynamic_content->apply_dynamic_content( '<p><o-dynamic data-type="postContent">Post Content</o-dynamic></p>' );

		wp_delete_post( $nested_id, true );

		$this->assertSame( '<p></p>', $result );
	}

	/**
	 * A postContent tag that only appears in rendered block output must not
	 * render the post inside itself.
	 */
	public function test_post_content_tag_added_at_render_time_does_not_recurse(): void {
		$post_id = $this->factory()->post->create(
			array(
				'post_title'   => 'Rendered tag',
				'post_content' => '<!-- wp:paragraph --><p>Rendered tag body</p><!-- /wp:paragraph -->',
				'post_status'  => 'publish',
			)
		);

		$renders = 0;
		$inject  = function ( string $block_content, array $block ) use ( &$renders ): string {
			if ( 'core/paragraph' !== $block['blockName'] || false === strpos( $block_content, 'Rendered tag body' ) ) {
				return $block_content;
			}

			++$renders;

			// Stops the unguarded recursion so the test fails instead of exhausting memory.
			if ( $renders > 5 ) {
				return $block_content;
			}

			return $block_content . '<p><o-dynamic data-type="postContent">Post Content</o-dynamic></p>';
		};
		add_filter( 'render_block', $inject, 9, 2 );

		$this->go_to( get_permalink( $post_id ) );

		$result = $this->dynamic_content->apply_dynamic_content( '<div><o-dynamic data-type="postContent">Post Content</o-dynamic></div>' );

		remove_filter( 'render_block', $inject, 9 );
		wp_delete_post( $post_id, true );

		$this->assertSame( 1, $renders );
		$this->assertSame( 1, substr_count( $result, 'Rendered tag body' ) );
		$this->assertStringNotContainsString( '<o-dynamic', $result );
	}

	/**
	 * The recursion guard must be released after each render, so sibling
	 * postContent tags for the same post all render.
	 */
	public function test_sibling_post_content_tags_each_render(): void {
		$post_id = $this->factory()->post->create(
			array(
				'post_title'   => 'Sibling tags',
				'post_content' => '<!-- wp:paragraph --><p>Sibling body</p><!-- /wp:paragraph -->',
				'post_status'  => 'publish',
			)
		);

		$this->go_to( get_permalink( $post_id ) );

		$tag    = '<div><o-dynamic data-type="postContent">Post Content</o-dynamic></div>';
		$result = $this->dynamic_content->apply_dynamic_content( $tag . $tag );

		wp_delete_post( $post_id, true );

		$this->assertSame( 2, substr_count( $result, 'Sibling body' ) );
	}
}
