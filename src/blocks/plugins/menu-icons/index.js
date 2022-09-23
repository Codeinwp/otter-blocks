/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { BlockControls } from '@wordpress/block-editor';

import {
	Spinner,
	ToolbarButton
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import {
	Fragment,
	lazy,
	Suspense
} from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './editor.scss';

const IconPickerControl = lazy( () => import( '../../components/icon-picker-control/toolbar.js' ) );

const withBlockControls = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( ( 'core/navigation-link' === props.name || 'core/navigation-submenu' === props.name ) && props.isSelected ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />

					<BlockControls>
						<Suspense fallback={ <ToolbarButton><Spinner /></ToolbarButton> }>
							<IconPickerControl
								label={ __( 'Menu Icon by Otter', 'otter-blocks' ) }
								classes={ props.attributes.className }
								setAttributes={ props.setAttributes }
							/>
						</Suspense>
					</BlockControls>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withInspectorControl' );

addFilter( 'editor.BlockEdit', 'themeisle-menu-icons/with-blocks-controls', withBlockControls );
