import { registerPlugin } from '@wordpress/plugins';
import { PluginMoreMenuItem } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { code as icon } from '@wordpress/icons';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { Button, PanelBody } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import Panel from './panel';
import blockIcon from '../blocks/icon';
import { StateControls } from '../states';
import { AnimationControls } from '../animations';
import './style.css';

// Shared open state — simple pub/sub so both the plugin and the filter can toggle.
let _isOpen = false;
const _listeners = new Set();
function setOpen( val ) {
	_isOpen = val;
	_listeners.forEach( ( fn ) => fn( val ) );
}
function useClassEditorOpen() {
	const [ isOpen, setIsOpen ] = useState( _isOpen );
	useEffect( () => {
		const handler = ( v ) => setIsOpen( v );
		_listeners.add( handler );
		return () => _listeners.delete( handler );
	}, [] );
	return [ isOpen, setOpen ];
}

// Plugin — Options menu item + floating panel
const ClassEditorPlugin = () => {
	const [ isOpen, toggle ] = useClassEditorOpen();
	return (
		<>
			<PluginMoreMenuItem icon={ icon } onClick={ () => toggle( ! isOpen ) }>
				{ __( 'Atomic Wind', 'otter-blocks' ) }
			</PluginMoreMenuItem>
			{ isOpen && <Panel onClose={ () => toggle( false ) } /> }
		</>
	);
};

registerPlugin( 'atomic-wind-class-editor', { render: ClassEditorPlugin } );

// Filter — toggle button at the top of InspectorControls for all atomic-wind blocks
const withClassEditorToggle = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( ! props.name.startsWith( 'atomic-wind/' ) ) {
			return <BlockEdit { ...props } />;
		}

		const [ isOpen, toggle ] = useClassEditorOpen();
		const { attributes, setAttributes } = props;

		return (
			<>
				<InspectorControls>
					<div className="aw-ce-inspector-toggle">
						<Button
							icon={ blockIcon }
							onClick={ () => toggle( ! isOpen ) }
							className={ `aw-ce-inspector-btn${ isOpen ? ' is-active' : '' }` }
						>
							{ __( 'Atomic Wind', 'otter-blocks' ) }
						</Button>
					</div>
				</InspectorControls>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody
						title={ __( 'State & Visibility', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<StateControls attributes={ attributes } setAttributes={ setAttributes } />
					</PanelBody>
					<PanelBody
						title={ __( 'Animation', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<AnimationControls attributes={ attributes } setAttributes={ setAttributes } />
					</PanelBody>
				</InspectorControls>
			</>
		);
	};
}, 'withClassEditorToggle' );

addFilter(
	'editor.BlockEdit',
	'atomic-wind/class-editor-toggle',
	withClassEditorToggle,
	-100
);
