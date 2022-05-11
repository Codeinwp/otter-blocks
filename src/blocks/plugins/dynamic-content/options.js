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
				label: __( 'Post Excerpt', 'otter-blocks' ),
				value: 'postExcerpt'
			},
			{
				label: __( 'Post Date', 'otter-blocks' ),
				value: 'postDate'
			},
			{
				label: __( 'Post Time', 'otter-blocks' ),
				value: 'postTime'
			},
			{
				label: __( 'Post Terms', 'otter-blocks' ),
				value: 'postTerms'
			},
			{
				label: __( 'Post Custom Field', 'otter-blocks' ),
				value: 'postMeta'
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
				value: 'authorMeta'
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
				value: 'loggedInUserMeta'
			}
		]
	}
};

export default options;
