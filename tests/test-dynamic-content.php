<?php
/**
 * Class CSS
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\GutenbergBlocks\Plugins\Dynamic_Content;
use Yoast\PHPUnitPolyfills\Polyfills\AssertEqualsCanonicalizing;
use Yoast\PHPUnitPolyfills\Polyfills\AssertNotEqualsCanonicalizing;

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
}
