<?php
/**
 * Class CSS
 *
 * @package gutenberg-blocks
 */
use \ThemeIsle\GutenbergBlocks\Plugins;
use PHPUnit\Framework\TestCase;
use ThemeIsle\GutenbergBlocks\Plugins\Dynamic_Content;
use Yoast\PHPUnitPolyfills\Polyfills\AssertEqualsCanonicalizing;
use Yoast\PHPUnitPolyfills\Polyfills\AssertNotEqualsCanonicalizing;

/**
 * Dynamic Content Test Case.
 */
class TestDynamicContent extends TestCase
{
	/**
	 * Test the Post ID query.
	 */
	public function test_post_id() {

		$post_id_query = '<p><o-dynamic data-type="postID">Post ID</o-dynamic></p>';
		$result        = Dynamic_Content::parse_dynamic_content_query( $post_id_query );

		$this->assertEquals( 'postID', $result['type'] );
	}

	/**
	 * Test the Post Type query.
	 */
	public function test_post_type() {
		$post_type_query = '<p><o-dynamic data-type="postType">Post Type</o-dynamic></p>';
		$result          = Dynamic_Content::parse_dynamic_content_query( $post_type_query );

		$this->assertEquals( 'postType', $result['type'] );
	}

	/**
	 * Test the Post Title query.
	 */
	public function test_post_title() {
		$post_title_query = '<p><o-dynamic data-type="postTitle">Post Title</o-dynamic></p>';
		$result           = Dynamic_Content::parse_dynamic_content_query( $post_title_query );

		$this->assertEquals( 'postTitle', $result['type'] );
	}

	/**
	 * Test the Post Status query.
	 */
	public function test_post_status() {
		$post_status_query = '<p><o-dynamic data-type="postStatus">Post Status</o-dynamic></p>';
		$result            = Dynamic_Content::parse_dynamic_content_query( $post_status_query );

		$this->assertEquals( 'postStatus', $result['type'] );
	}

	/**
	 * Test the Post Content query.
	 */
	public function test_post_content() {
		$post_content_query = '<p><o-dynamic data-type="postContent">Post Content</o-dynamic></p>';
		$result             = Dynamic_Content::parse_dynamic_content_query( $post_content_query );

		$this->assertEquals( 'postContent', $result['type'] );
	}

	/**
	 * Test the Post Excerpt query.
	 */
	public function test_post_excerpt() {
		$post_excerpt_query = '<p><o-dynamic data-type="postExcerpt" data-length="500" data-before="before" data-after="after">Advanced Custom Fields</o-dynamic></p>';
		$result             = Dynamic_Content::parse_dynamic_content_query( $post_excerpt_query );

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
		$result          = Dynamic_Content::parse_dynamic_content_query( $post_date_query );

		$this->assertEquals( 'postDate', $result['type'] );
	}

	/**
	 * Test the Post Time query.
	 */
	public function test_post_time() {
		$post_time_query = '<p><o-dynamic data-type="postTime" data-time-type="modified" data-time-format="custom" data-time-custom="H:i">Post Time</o-dynamic></p>';
		$result          = Dynamic_Content::parse_dynamic_content_query( $post_time_query );

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
		$result           = Dynamic_Content::parse_dynamic_content_query( $post_terms_query );

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
		$result          = Dynamic_Content::parse_dynamic_content_query( $post_meta_query );

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
		$result    = Dynamic_Content::parse_dynamic_content_query( $acf_query );

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
		$result           = Dynamic_Content::parse_dynamic_content_query( $site_title_query );

		$this->assertEquals( 'siteTitle', $result['type'] );
	}

	/**
	 * Test the Site Tagline query.
	 */
	public function test_site_tagline() {
		$site_tagline_query = '<p><o-dynamic data-type="siteTagline">Site Tagline</o-dynamic></p>';
		$result             = Dynamic_Content::parse_dynamic_content_query( $site_tagline_query );

		$this->assertEquals( 'siteTagline', $result['type'] );
	}

	/**
	 * Test the Author Name query.
	 */
	public function test_author_name() {
		$author_name_query = '<p><o-dynamic data-type="authorName">Author Name</o-dynamic></p>';
		$result            = Dynamic_Content::parse_dynamic_content_query( $author_name_query );

		$this->assertEquals( 'authorName', $result['type'] );
	}

	/**
	 * Test the Author Description query.
	 */
	public function test_author_description() {
		$author_description_query = '<p><o-dynamic data-type="authorDescription">Author Description</o-dynamic></p>';
		$result                   = Dynamic_Content::parse_dynamic_content_query( $author_description_query );

		$this->assertEquals( 'authorDescription', $result['type'] );
	}

	/**
	 * Test the Author Meta query.
	 */
	public function test_author_meta() {
		$author_meta_query = '<p><o-dynamic data-type="authorMeta" data-meta-key="display_name">Author Meta</o-dynamic></p>';
		$result            = Dynamic_Content::parse_dynamic_content_query( $author_meta_query );

		$this->assertEquals( 'authorMeta', $result['type'] );
		$this->assertEquals( 'display_name', $result['metaKey'] );
	}

	/**
	 * Test the Logged In User Name query.
	 */
	public function test_logged_in_user_name() {
		$logged_in_user_name_query = '<p><o-dynamic data-type="loggedInUserName">Logged In User Name</o-dynamic></p>';
		$result                    = Dynamic_Content::parse_dynamic_content_query( $logged_in_user_name_query );

		$this->assertEquals( 'loggedInUserName', $result['type'] );
	}

	/**
	 * Test the Logged In User Description query.
	 */
	public function test_logged_in_user_description() {
		$logged_in_user_description_query = '<p><o-dynamic data-type="loggedInUserDescription">Logged In User Description</o-dynamic></p>';
		$result                           = Dynamic_Content::parse_dynamic_content_query( $logged_in_user_description_query );

		$this->assertEquals( 'loggedInUserDescription', $result['type'] );
	}

	/**
	 * Test for the Logged In User Email query.
	 */
	public function test_logged_in_user_email() {
		$logged_in_user_email_query = '<p><o-dynamic data-type="loggedInUserEmail">Logged In User Email</o-dynamic></p>';
		$result                     = Dynamic_Content::parse_dynamic_content_query( $logged_in_user_email_query );

		$this->assertEquals( 'loggedInUserEmail', $result['type'] );
	}

	/**
	 * Test the Logged In User Meta query.
	 */
	public function test_logged_in_user_meta() {
		$logged_in_user_meta_query = '<p><o-dynamic data-type="loggedInUserMeta" data-meta-key="description">Logged In User Meta</o-dynamic></p>';
		$result                    = Dynamic_Content::parse_dynamic_content_query( $logged_in_user_meta_query );

		$this->assertEquals( 'loggedInUserMeta', $result['type'] );
		$this->assertEquals( 'description', $result['metaKey'] );
	}

	/**
	 * Test the Archive Title query.
	 */
	public function test_archive_title() {
		$archive_title_query = '<p><o-dynamic data-type="archiveTitle">Archive Title</o-dynamic></p>';
		$result              = Dynamic_Content::parse_dynamic_content_query( $archive_title_query );

		$this->assertEquals( 'archiveTitle', $result['type'] );
	}

	/**
	 * Test the Archive Description query.
	 */
	public function test_archive_description() {
		$archive_description_query = '<p><o-dynamic data-type="archiveDescription">Archive Description</o-dynamic></p>';
		$result                    = Dynamic_Content::parse_dynamic_content_query( $archive_description_query );

		$this->assertEquals( 'archiveDescription', $result['type'] );
	}

	/**
	 * Test the Date query.
	 */
	public function test_date() {
		$date_query = '<p><o-dynamic data-type="date" data-date-format="custom" data-date-custom="l, F j, Y">Date</o-dynamic></p>';
		$result     = Dynamic_Content::parse_dynamic_content_query( $date_query );

		$this->assertEquals( 'date', $result['type'] );
		$this->assertEquals( 'custom', $result['dateFormat'] );
		$this->assertEquals( 'l, F j, Y', $result['dateCustom'] );
	}

	/**
	 * Test the Time query.
	 */
	public function test_time() {
		$time_query = '<p><o-dynamic data-type="time" data-time-format="custom" data-time-custom="H:i">Time</o-dynamic></p>';
		$result     = Dynamic_Content::parse_dynamic_content_query( $time_query );

		$this->assertEquals( 'time', $result['type'] );
		$this->assertEquals( 'custom', $result['timeFormat'] );
		$this->assertEquals( 'H:i', $result['timeCustom'] );
	}

	/**
	 * Test the Query String query.
	 */
	public function test_query_string() {
		$query_string_query = '<p><o-dynamic data-type="queryString" data-format="capitalize" data-parameter="action">Query String</o-dynamic></p>';
		$result             = Dynamic_Content::parse_dynamic_content_query( $query_string_query );

		$this->assertEquals( 'queryString', $result['type'] );
		$this->assertEquals( 'capitalize', $result['format'] );
		$this->assertEquals( 'action', $result['parameter'] );
	}

	/**
	 * Test the Country query.
	 */
	public function test_country() {
		$country_query = '<p><o-dynamic data-type="country">Country</o-dynamic></p>';
		$result        = Dynamic_Content::parse_dynamic_content_query( $country_query );

		$this->assertEquals( 'country', $result['type'] );
	}
}
