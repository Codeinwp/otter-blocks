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

	const isContainer = attributes.className?.includes( 'o-sticky-container' );
	const position = attributes.className?.includes( 'o-sticky-pos-bottom' ) ? 'o-sticky-pos-bottom' : 'o-sticky-pos-top';

	const { block, isSticky, classes } = useSelect( ( select ) => {
		const {
			getSelectedBlock
		} = select( 'core/block-editor' );

		const block = getSelectedBlock();
		const classes = block?.attributes?.className?.split( ' ' );
		const isSticky = classes?.includes( 'o-sticky' ) || false;

		return {
			block,
			isSticky,
			classes
		};
	});


	const addCSSClass = ( cssClass, removeCondition ) => {
		if ( hasBlockSupport( block, 'customClassName', true ) ) {
			const attr = block.attributes;
			const className = classes?.filter( c => cssClass !== c || ( ! removeCondition || ! cssClass.includes( removeCondition ) ) ) || [];

			if ( isSticky ) {
				className.push( cssClass );
			}
			attr.className = className.join( ' ' );
			attr.hasCustomCSS = true;
			updateBlockAttributes( block.clientId, attr );
		}
	};

	const getOffsetValue = classes => {
		return parseInt( classes
			?.filter( c => c?.includes( 'o-sticky-offset' ) )
			?.reduce( ( acc, c ) =>{
				return c?.split( '-' )?.pop();
			}, 40 ) );
	};

	const setOffsetValue = value => {
		addCSSClass( `o-sticky-offset-${ value }`, 'o-sticky-offset' );
	};

	/*
		TODO: Make the values from the Inspector to be classes
		E.g:
			Position -> 'o-sticky-pos-top'
			Top Offset -> 'o-sticky-offset--40' where 40 will be value (it will be extracted by the frontend script)

		And element with the classe like this 'o-sticky o-sticky-pos-bottom o-sticky-pos-bottom-30', it will be a sticky element with 30px distance from the bottom of the window viewport
	*/

	return (
		<Fragment>
			{
				! isContainer && (
					<InspectorControls>
						<PanelBody
							title={ __( 'Sticky', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<SelectControl
								label={ __( 'Position', 'otter-blocks' ) }
								value={ position }
								options={[
									{ label: __( 'Top', 'otter-blocks' ), value: 'o-sticky-pos-top' },
									{ label: __( 'Bottom', 'otter-blocks' ), value: 'o-sticky-pos-bottom' }
								]}
								onChange={ addCSSClass }
							/>

							<RangeControl
								label={ __( 'Distance from screen', 'otter-blocks' ) }
								value={ getOffsetValue( classes ) }
								min={0}
								max={80}
								onChange={ setOffsetValue }
							/>
						</PanelBody>
					</InspectorControls>
				)
			}

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
