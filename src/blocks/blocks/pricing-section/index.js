/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	registerBlockVariation,
	parse
} from '@wordpress/blocks';

import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { pricingIcon } from '../../helpers/icons.js';

import pricing from './pricing.json';

const { getBlockType } = select( 'core/blocks' );

const registerPricingVariation = () => {

	const checker = setInterval(
		() => {
			if ( undefined === getBlockType( 'themeisle-blocks/advanced-columns' ) ) {
				return registerPricingVariation();
			}

			const content = parse( pricing.content );

			registerBlockVariation( 'themeisle-blocks/advanced-columns', {
				name: 'themeisle-blocks/section-pricing',
				title: __( 'Pricing Section', 'otter-blocks' ),
				icon: pricingIcon,
				scope: 'inserter',
				attributes: content[0].attributes,
				innerBlocks: content[0].innerBlocks,
				example: {
					attributes: content[0].attributes,
					innerBlocks: content[0].innerBlocks
				}
			});

			clearInterval( checker );
		},
		2_000
	);
};

registerPricingVariation();
