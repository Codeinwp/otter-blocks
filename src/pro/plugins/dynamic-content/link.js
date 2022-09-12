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
import Edit from './link-edit.js';

const applyProContent = options => {
	const proOptions = [
		{
			label: __( 'Post Custom Field', 'otter-blocks' ),
			value: 'postMetaURL'
		},
		{
			label: __( 'Advanced Custom Fields', 'otter-blocks' ),
			value: 'acfURL'
		}
	];

	options = deepmerge( options.filter( o => undefined === o.isDisabled ), proOptions );

	return options;
};

const applySettingsPanel = options => {
	const hasSettingsPanel = [
		'postMetaURL',
		'acfURL'
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
	addFilter( 'otter.dynamicContent.link.options', 'themeisle-gutenberg/dynamic-content/link-list', applyProContent );
	addFilter( 'otter.dynamicContent.link.hasSettingsPanel', 'themeisle-gutenberg/dynamic-content/link-settings-panel', applySettingsPanel );
}

addFilter( 'otter.dynamicContent.link.controls', 'themeisle-gutenberg/dynamic-content/link-controls', DynamicContent );
