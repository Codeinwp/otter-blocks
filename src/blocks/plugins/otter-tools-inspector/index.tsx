/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

// @ts-ignore
import { __experimentalToolsPanel as ToolsPanel } from '@wordpress/components';

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

// @ts-ignore
const shouldAppear = Object.keys( window.themeisleGutenberg?.hasModule ).some( ( i: string ) => Boolean( window.themeisleGutenberg?.hasModule[ i ]) );

const withConditions = createHigherOrderComponent( BlockEdit => {
	return props => {
		const Inspector = useInspectorSlot( props.name );

		return (
			<Fragment>
				<BlockEdit { ...props } />

				{ ( props.isSelected && shouldAppear ) && (
					<Inspector>
						<ToolsPanel
							label={ __( 'Block Tools' ) }
							className="o-block-tools"
						>
							{ applyFilters( 'otter.blockTools', '', props ) }
						</ToolsPanel>
					</Inspector>
				) }
			</Fragment>
		);
	};
}, 'withConditions' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/otter-tools-inspector', withConditions );
