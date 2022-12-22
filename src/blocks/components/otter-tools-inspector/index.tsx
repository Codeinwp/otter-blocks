// @ts-nocheck

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	createSlotFill
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './editor.scss';
import { useInspectorSlot } from '../inspector-slot-fill/index.js';

const { Fill, Slot } = createSlotFill( 'OtterInspectorTools' );

const withConditions = createHigherOrderComponent( BlockEdit => {
	return props => {
		const Inspector = useInspectorSlot( props.name );

		return (
			<div>
				<BlockEdit { ...props } />

				{ props.isSelected && (
					<Inspector>
						<ToolsPanel
							label={ __( 'Block Tools' ) }
							className="o-block-tools"
						>
							<Slot>
								{ fills => {
									if ( ! fills.length ) {
										return null;
									}

									return fills;
								} }
							</Slot>
						</ToolsPanel>
					</Inspector>
				) }
			</div>
		);
	};
}, 'withConditions' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/otter-tools-inspector', withConditions );

const useOtterTools = ({
	hasValue,
	label,
	onDeselect
}) => ({ children }) => {

	return (
		<Fill>
			<ToolsPanelItem
				hasValue={ hasValue }
				label={ label }
				onDeselect={ onDeselect }
				isShownByDefault={ false }
			>
				{ children }
			</ToolsPanelItem>
		</Fill>
	);
};

export default useOtterTools;
