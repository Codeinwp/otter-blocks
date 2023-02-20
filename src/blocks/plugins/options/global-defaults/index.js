/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { getBlockTypes } from '@wordpress/blocks';

import {
	Placeholder,
	Spinner
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockItem from './block-item.js';

const GlobalDefaults = ({
	isAPILoaded,
	globalControls,
	setSelectedBlock
}) => {
	const { hiddenBlocks } = useSelect( select => {
		return {
			hiddenBlocks: select( 'core/edit-post' ).getPreference( 'hiddenBlockTypes' )
		};
	});

	const blocks = getBlockTypes().filter( i => 'themeisle-blocks' === i.category && ( globalControls.find( o => o.name === i.name ) || ( undefined === i.parent && undefined == i.ancestor && ( undefined === i.supports.inserter || true === i.supports.inserter ) ) ) );

	if ( ! isAPILoaded ) {
		return (
			<Placeholder>
				<Spinner />
			</Placeholder>
		);
	}

	return (
		<Fragment>
			<p className="padding-20">{ __( 'Manage site-wide block defaults and visibility for Otter Blocks.', 'otter-blocks' ) }</p>

			{ blocks.map( block => {
				const hasSettings = globalControls.find( i => i.name === block.name );

				return (
					<BlockItem
						key={ block.name }
						block={ block }
						hasSettings={ hasSettings }
						hiddenBlocks={ hiddenBlocks }
						setSelectedBlock={ setSelectedBlock }
					/>
				);
			}) }
		</Fragment>
	);
};

export default GlobalDefaults;
