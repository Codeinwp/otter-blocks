/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

// @ts-ignore
import {
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment } from '@wordpress/element';

import {
	addFilter,
	applyFilters
} from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './editor.scss';
import { useInspectorSlot } from '../../components/inspector-slot-fill/index.js';
import { useSelect } from '@wordpress/data';
import { openOtterSidebarMenu } from '../../helpers/block-utility';

const FeaturePanel = ({ props }) => {

	// Function that refresh the inspector slot when a store is updated. This is used for the preferences store.
	const _ = useSelect( ( select ) => {
		select( 'core/preferences' );
	}, []);

	return (
		<ToolsPanel
			label={ __( 'Block Tools' ) }
			className="o-block-tools"
		>
			{ applyFilters( 'otter.blockTools', '', props ) }
			<ToolsPanelItem
				hasValue={ () => false }
				label={ __( 'Manage Default Tools', 'otter-blocks' ) }
				onSelect={ openOtterSidebarMenu }
				isShownByDefault={ false }
			/>
		</ToolsPanel>
	);
};

const withConditions = createHigherOrderComponent( BlockEdit => {
	return props => {
		const Inspector = useInspectorSlot( props.name );

		return (
			<Fragment>
				<BlockEdit { ...props } />

				{ props.isSelected && (
					<Inspector>
						<FeaturePanel props={ props } />
					</Inspector>
				) }
			</Fragment>
		);
	};
}, 'withConditions' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/otter-tools-inspector', withConditions );
