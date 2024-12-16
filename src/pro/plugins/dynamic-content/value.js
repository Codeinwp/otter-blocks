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
			label: __( 'Posts', 'otter-pro' ),
			options: [
				{
					label: __( 'Post Date', 'otter-pro' ),
					value: 'postDate'
				},
				{
					label: __( 'Post Time', 'otter-pro' ),
					value: 'postTime'
				},
				{
					label: __( 'Post Terms', 'otter-pro' ),
					value: 'postTerms'
				},
				{
					label: __( 'Post Custom Field', 'otter-pro' ),
					value: 'postMeta'
				},
				{
					label: __( 'Advanced Custom Field', 'otter-pro' ),
					value: 'acf'
				}
			]
		},
		'author': {
			label: __( 'Author', 'otter-pro' ),
			options: [
				{
					label: __( 'Author Meta', 'otter-pro' ),
					value: 'authorMeta'
				}
			]
		},
		'loggedInUser': {
			label: __( 'Logged-in User', 'otter-pro' ),
			options: [
				{
					label: __( 'Logged-in User Meta', 'otter-pro' ),
					value: 'loggedInUserMeta'
				}
			]
		},
		'misc': {
			label: __( 'Miscellaneous', 'otter-pro' ),
			options: [
				{
					label: __( 'URL Parameter', 'otter-pro' ),
					value: 'queryString'
				},
				{
					label: __( 'Country', 'otter-pro' ),
					value: 'country'
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
		'loggedInUserMeta',
		'queryString'
	];

	if ( ! Boolean( window.otterPro.hasIPHubAPI ) ) {
		hasSettingsPanel.push( 'country' );
	}

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
