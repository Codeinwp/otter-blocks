/**
 * External dependencies.
 */
import deepmerge from 'deepmerge';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import Edit from './value-edit.js';

const applyProContent = options => {
	const proOptions = {
		'posts': {
			label: __( 'Posts', 'otter-blocks' ),
			options: [
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
				},
				{
					label: __( 'Advanced Custom Field', 'otter-blocks' ),
					value: 'acf'
				}
			]
		},
		'author': {
			label: __( 'Author', 'otter-blocks' ),
			options: [
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
					label: __( 'Logged-in User Meta', 'otter-blocks' ),
					value: 'loggedInUserMeta'
				}
			]
		}
	};

	Object.keys( options ).forEach( i => {
		options[i].options = options[i].options.filter( o => undefined === o.isDisabled );

		if ( ! Boolean( options[ i ].options.length ) ) {
			delete options[ i ];
		}
	});

	options = deepmerge( options, proOptions );

	return options;
};

const applySettingsPanel = options => {
	const hasSettingsPanel = [
		'postDate',
		'postTime',
		'postTerms',
		'postMeta',
		'acf',
		'authorMeta',
		'loggedInUserMeta'
	];

	options.push( ...hasSettingsPanel );

	return options;
};

const DynamicContent = (
	el,
	attributes,
	changeAttributes
) => {
	return (
		<Edit
			attributes={ attributes }
			changeAttributes={ changeAttributes }
		/>
	);
};

if ( ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
	addFilter( 'otter.dynamicContent.text.options', 'themeisle-gutenberg/dynamic-content/text-list', applyProContent );
	addFilter( 'otter.dynamicContent.text.hasSettingsPanel', 'themeisle-gutenberg/dynamic-content/text-settings-panel', applySettingsPanel );
}

addFilter( 'otter.dynamicContent.text.controls', 'themeisle-gutenberg/dynamic-content/text-controls', DynamicContent );
