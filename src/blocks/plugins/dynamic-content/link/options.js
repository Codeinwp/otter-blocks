/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

const options = [
	{
		label: __( 'Post URL', 'otter-blocks' ),
		value: 'postURL'
	},
	{
		label: __( 'Post Custom Field', 'otter-blocks' ),
		value: 'postMetaURL',
		isDisabled: ! Boolean( window.themeisleGutenberg.isProActive )
	},
	{
		label: __( 'Archive URL', 'otter-blocks' ),
		value: 'archiveURL'
	},
	{
		label: __( 'Site URL', 'otter-blocks' ),
		value: 'siteURL'
	},
	{
		label: __( 'Featured Image URL', 'otter-blocks' ),
		value: 'featuredImageURL'
	},
	{
		label: __( 'Author URL', 'otter-blocks' ),
		value: 'authorURL'
	},
	{
		label: __( 'Author Website', 'otter-blocks' ),
		value: 'authorWebsite'
	}
];

export default options;
