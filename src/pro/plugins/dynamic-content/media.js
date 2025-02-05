/**
 * External dependencies.
 */
import deepmerge from 'deepmerge';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { TextControl } from '@wordpress/components';

import { addFilter } from '@wordpress/hooks';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import ACFImageSelect from '../../components/acf-image-select/index.js';

const { SelectProducts } = window.otterComponents;

const applyProContent = options => {
	const proOptions = [
		{
			type: 'postMeta',
			label: __( 'Post Meta', 'otter-pro' ),
			icon: window.themeisleGutenberg.assetsPath + '/icons/meta.svg'
		},
		{
			type: 'product',
			label: __( 'Woo Product', 'otter-pro' ),
			icon: window.themeisleGutenberg.assetsPath + '/icons/woo.svg',
			isAvailable: Boolean( window.otterPro.hasWooCommerce )
		},
		{
			type: 'acf',
			label: __( 'ACF Image', 'otter-pro' ),
			icon: window.themeisleGutenberg.assetsPath + '/icons/acf.svg',
			isAvailable: Boolean( window.otterPro.hasACF )
		}
	];

	options = options.filter( o => ! o?.isPro );

	options = deepmerge( options, proOptions );

	return options;
};

const DynamicContent = (
	el,
	attributes,
	changeAttributes
) => {
	return (
		<Fragment>
			{ 'postMeta' === attributes?.type && (
				<TextControl
					label={ __( 'Meta Key', 'otter-pro' ) }
					value={ attributes.meta || '' }
					onChange={ meta => changeAttributes({ meta }) }
				/>
			) }

			{ 'product' === attributes?.type && (
				<SelectProducts
					label={ __( 'Select Product', 'otter-pro' ) }
					value={ attributes.id || '' }
					onChange={ product => changeAttributes({ id: 0 === product ? undefined : product }) }
				/>
			) }

			{ 'acf' === attributes?.type && (
				<ACFImageSelect
					label={ __( 'Select Field', 'otter-pro' ) }
					value={ attributes.meta || '' }
					onChange={ meta => changeAttributes({ meta }) }
				/>
			) }
		</Fragment>
	);
};

if ( ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
	addFilter( 'otter.dynamicContent.media.options', 'themeisle-gutenberg/dynamic-content/media-list', applyProContent );
}

addFilter( 'otter.dynamicContent.media.controls', 'themeisle-gutenberg/dynamic-content/media-controls', DynamicContent );
