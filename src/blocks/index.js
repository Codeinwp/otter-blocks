/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { updateCategory } from '@wordpress/blocks';

import { Icon } from '@wordpress/components';

import { dispatch, select } from '@wordpress/data';

import domReady from '@wordpress/dom-ready';

import { createRoot } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import './editor.scss';
import {
	otterIcon,
	otterIconColored as icon
} from './helpers/icons.js';
import { setUtm } from './helpers/helper-functions.js';
import { GlobalStateMemory } from './helpers/block-utility';

updateCategory( 'themeisle-blocks', { icon });
updateCategory( 'themeisle-woocommerce-blocks', { icon });

const PoweredBy = () => {
	return (
		<div className="o-is-powered">{ __( 'Powered by Otter', 'otter-blocks' ) } { <Icon icon={ otterIcon } /> }</div>
	);
};

addFilter( 'otter.poweredBy', 'themeisle-gutenberg/powered-by-notice', PoweredBy );

if ( Boolean( window.themeisleGutenberg.should_show_upsell ) ) {
	const { createNotice } = dispatch( 'core/notices' );
	createNotice(
		'info',
		__( 'Enjoying Otter Blocks? Enhance your site building experience with Otter Pro.', 'otter-blocks' ),
		{
			isDismissible: true,
			onDismiss: async() => {
				let settings;
				let notificiations = {};

				await window.wp.api.loadPromise.then( () => {
					settings = new window.wp.api.models.Settings();
				});

				settings.fetch().then( response => {
					if ( 0 < response.themeisle_blocks_settings_notifications.length ) {
						notificiations = response.themeisle_blocks_settings_notifications;
					}
				});

				notificiations['editor_upsell'] = true;

				const model = new window.wp.api.models.Settings({
					// eslint-disable-next-line camelcase
					themeisle_blocks_settings_notifications: notificiations
				});

				await model.save().then( () => {
					createNotice(
						'info',
						__( 'No problem! Enjoy using Otter!', 'otter-blocks' ),
						{
							isDismissible: true,
							type: 'snackbar'
						}
					);
				});
			},
			actions: [
				{
					label: __( 'Tell me more!', 'otter-blocks' ),
					variant: 'link',
					noDefaultClasses: true,
					onClick: () => window.open( setUtm( window.themeisleGutenberg.upgradeLink, 'tellmemore' ), '_blank' )
				}
			]
		}
	);
}

/**
 * Hide blocks in inserter based on the `themeisle_disabled_blocks` setting.
 */
const hideBlocksInInserter = () => {

	/**
	 * Since some variations are based on core blocks, they need to be unregistered and registered again with an empty scope.
	 */

	const variationsMap = {
		'themeisle-gutenberg/masonry': 'core/gallery',
		'themeisle-gutenberg/live-search': 'core/search'
	};

	/**
	 * Check if the block is a variation.
	 * @param blockSlug The block slug.
	 * @returns {boolean} True if the block is a variation.
	 */
	const isVariation = ( blockSlug ) => {
		return variationsMap.hasOwnProperty( blockSlug );
	};

	const hiddenBlocks = select( 'core/preferences' )?.get( 'core/edit-post', 'hiddenBlockTypes' ) || [];

	hiddenBlocks.forEach( blockName => {
		if ( isVariation( blockName ) ) {
			const parentBlockName = variationsMap[blockName];
			const blockVariations = wp?.blocks?.getBlockVariations( parentBlockName );
			const blockRegistration = blockVariations.find( block => block.name === blockName );

			if ( ! blockRegistration ) {
				return;
			}

			wp?.blocks?.unregisterBlockVariation( parentBlockName, blockName );
			blockRegistration.scope = [];
			wp?.blocks?.registerBlockVariation( parentBlockName, blockRegistration );
		}
	});
};

domReady( () => {

	setTimeout( () => {
		hideBlocksInInserter();
	}, 500 );

	if ( document.querySelector( 'svg.o-icon-gradient' ) ) {
		return;
	}

	const gradient = document.createElement( 'DIV' );
	gradient.setAttribute( 'style', 'height: 0; width: 0; overflow: hidden;' );
	gradient.setAttribute( 'aria-hidden', 'true' );
	document.querySelector( 'body' ).appendChild( gradient );

	const root = createRoot( gradient );

	root.render(
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className="o-icon-gradient"
			height="0"
			width="0"
			style={ { opacity: 0 } }
		>
			<defs>
				<linearGradient id="o-icon-fill">
					<stop offset="0%" stopColor="#ED6F57" stopOpacity="1" />
					<stop offset="100%" stopColor="#F22B6C" stopOpacity="1" />
				</linearGradient>
			</defs>
		</svg>
	);
});

window.otterStateMemory = new GlobalStateMemory();
