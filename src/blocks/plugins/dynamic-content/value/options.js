/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

const options = {
	'posts': {
		label: __( 'Posts', 'otter-blocks' ),
		options: [
			{
				label: __( 'Post ID', 'otter-blocks' ),
				value: 'postID'
			},
			{
				label: __( 'Post Title', 'otter-blocks' ),
				value: 'postTitle'
			},
			{
				label: __( 'Post Content', 'otter-blocks' ),
				value: 'postContent'
			},
			{
				label: __( 'Post Excerpt', 'otter-blocks' ),
				value: 'postExcerpt'
			},
			{
				label: __( 'Post Date', 'otter-blocks' ),
				value: 'postDate',
				isDisabled: ! Boolean( window.themeisleGutenberg.isProActive )
			},
			{
				label: __( 'Post Time', 'otter-blocks' ),
				value: 'postTime',
				isDisabled: ! Boolean( window.themeisleGutenberg.isProActive )
			},
			{
				label: __( 'Post Terms', 'otter-blocks' ),
				value: 'postTerms',
				isDisabled: ! Boolean( window.themeisleGutenberg.isProActive )
			},
			{
				label: __( 'Post Custom Field', 'otter-blocks' ),
				value: 'postMeta',
				isDisabled: ! Boolean( window.themeisleGutenberg.isProActive )
			},
			{
				label: __( 'Advanced Custom Fields', 'otter-blocks' ),
				value: 'acf',
				isDisabled: ! Boolean( window.themeisleGutenberg.isProActive )
			},
			{
				label: __( 'Post Type', 'otter-blocks' ),
				value: 'postType'
			},
			{
				label: __( 'Post Status', 'otter-blocks' ),
				value: 'postStatus'
			}
		]
	},
	'site': {
		label: __( 'Site', 'otter-blocks' ),
		options: [
			{
				label: __( 'Site Title', 'otter-blocks' ),
				value: 'siteTitle'
			},
			{
				label: __( 'Site Tagline', 'otter-blocks' ),
				value: 'siteTagline'
			}
		]
	},
	'author': {
		label: __( 'Author', 'otter-blocks' ),
		options: [
			{
				label: __( 'Author Name', 'otter-blocks' ),
				value: 'authorName'
			},
			{
				label: __( 'Author Description', 'otter-blocks' ),
				value: 'authorDescription'
			},
			{
				label: __( 'Author Meta', 'otter-blocks' ),
				value: 'authorMeta',
				isDisabled: ! Boolean( window.themeisleGutenberg.isProActive )
			}
		]
	},
	'loggedInUser': {
		label: __( 'Logged-in User', 'otter-blocks' ),
		options: [
			{
				label: __( 'Logged-in User Name', 'otter-blocks' ),
				value: 'loggedInUserName'
			},
			{
				label: __( 'Logged-in User Description', 'otter-blocks' ),
				value: 'loggedInUserDescription'
			},
			{
				label: __( 'Logged-in User Email', 'otter-blocks' ),
				value: 'loggedInUserEmail'
			},
			{
				label: __( 'Logged-in User Meta', 'otter-blocks' ),
				value: 'loggedInUserMeta',
				isDisabled: ! Boolean( window.themeisleGutenberg.isProActive )
			}
		]
	},
	'misc': {
		label: __( 'Miscellaneous', 'otter-blocks' ),
		options: [
			{
				label: __( 'Archive Title', 'otter-blocks' ),
				value: 'archiveTitle'
			},
			{
				label: __( 'Archive Description', 'otter-blocks' ),
				value: 'archiveDescription'
			},
			{
				label: __( 'Current Date', 'otter-blocks' ),
				value: 'date'
			},
			{
				label: __( 'Current Time', 'otter-blocks' ),
				value: 'time'
			}
		]
	}
};

export default options;
