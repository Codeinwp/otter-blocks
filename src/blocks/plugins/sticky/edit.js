/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

import {
	dispatch,
	useDispatch,
	useSelect
} from '@wordpress/data';


import { hasBlockSupport } from '@wordpress/blocks';


import './editor.scss';
import classnames from 'classnames';


const updateBlockAttributes = dispatch( 'core/block-editor' ).updateBlockAttributes;

const Edit = ({
	attributes,
	children
}) => {

	const { block, isSticky, classes, isContainer, position } = useSelect( ( select ) => {
		const {
			getSelectedBlock
		} = select( 'core/block-editor' );

		const block = getSelectedBlock();
		const classes = block?.attributes?.className?.split( ' ' );
		const isSticky = classes?.includes( 'o-is-sticky' ) || false;
		const position = classes?.includes( 'o-sticky-bottom' ) ? 'o-sticky-bottom' : 'o-sticky-top';
		const isContainer = classes?.includes( 'o-is-sticky-container' ) || false;

		return {
			block,
			isSticky,
			isContainer,
			position,
			classes
		};
	});


	const addCSSClass = ( cssClass ) => {
		if ( hasBlockSupport( block, 'customClassName', true ) ) {
			const attr = block.attributes;
			const className = classes?.filter( c => cssClass !== c ) || [];

			if ( isSticky ) {
				className.push( cssClass );
			}
			attr.className = className.join( ' ' );
			attr.hasCustomCSS = true;
			updateBlockAttributes( block.clientId, attr );
		}
	};

	/*
		TODO: Make the values from the Inspector to be classes
		E.g:
			Position -> 'o-sticky-pos-top'
			Top Offset -> 'o-sticky-offset-top-40' where 40 will be value (it will be extracted by the frontend script)

		And element with the classe like this 'o-is-sticky o-sticky-pos-bottom o-sticky-bottom-30', it will be a sticky element with 30px distance from the bottom of the window viewport
	*/

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody
					title={ __( 'Sticky', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'Position', 'otter-blocks' ) }
						value={ position }
						options={[
							{ label: __( 'Top', 'otter-blocks' ), value: 'o-sticky-top' },
							{ label: __( 'Bottom', 'otter-blocks' ), value: 'o-sticky-bottom' }
						]}
						onChange={ value => addCSSClass( value )}
					/>
				</PanelBody>
			</InspectorControls>
			<div className={classnames( 'o-sticky-highlight', { 'o-container': isContainer })}>
				<div className="o-sticky-badge">
					{
						isContainer ? __( 'Sticky Container' ) : __( 'Sticky Element' )
					}
				</div>
				{children}
			</div>
		</Fragment>
	);
};

export default Edit;
