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
	useEffect,
	useState
} from '@wordpress/element';

import {
	dispatch,
	select,
	useSelect
} from '@wordpress/data';


import { hasBlockSupport } from '@wordpress/blocks';


import './editor.scss';
import classnames from 'classnames';


const updateBlockAttributes = dispatch( 'core/block-editor' ).updateBlockAttributes;
const getBlock = select( 'core/block-editor' ).getBlock;

const Edit = ({
	attributes,
	children,
	isSelected,
	clientId
}) => {

	const isContainer = attributes.className?.includes( 'o-sticky-container' );
	const position = attributes.className?.includes( 'o-sticky-pos-bottom' ) ? 'o-sticky-pos-bottom' : 'o-sticky-pos-top';
	const isSticky = attributes.className?.includes( 'o-sticky' );
	const [ parentClientId, setParentClientId ] = useState( '' );

	const { parent, parents } = useSelect( ( select ) => {
		const {
			getBlockParents,
			getBlocksByClientId
		} = select( 'core/block-editor' );

		const parents = getBlocksByClientId( getBlockParents( clientId ) );
		const parent = parents?.filter( block => block?.attributes?.className?.includes( 'o-sticky-container' ) )?.pop();

		return {
			parent,
			parents
		};
	}, []);

	useEffect( () => {

		if ( parentClientId ) {
			const parentDom = document.querySelector( `#block-${parentClientId} > .o-sticky-highlight ` );
			console.log( parentDom, isSelected );
			parentDom?.classList?.toggle( 'active', isSelected );
			parentDom?.querySelector( '.o-sticky-badge' )?.classList?.toggle( 'active', isSelected );
		}
		console.log({isSelected});

	}, [ isSelected, parentClientId ]);

	useEffect( () => {
		if ( parent ) {
			setParentClientId( parent.clientId );
		}
	}, [ parent ]);

	const addCSSClass = ( block, cssClass, removeCondition ) => {
		if ( block && hasBlockSupport( block, 'customClassName', true ) ) {
			const attr = block.attributes;
			const classes = block?.attributes?.className?.split( ' ' );
			const isSticky = classes?.includes( 'o-sticky' ) || false;
			const className = classes?.filter( c => cssClass !== c && ( ! removeCondition || ! c.includes( removeCondition ) ) ) || [];

			if ( isSticky && cssClass ) {
				className.push( cssClass );
			}

			// debugger;

			if ( 'o-sticky-container' === cssClass ) {
				className.push( 'o-sticky-container' );
			}

			attr.className = className.join( ' ' );
			attr.hasCustomCSS = true;
			updateBlockAttributes( block.clientId, attr );
		}
	};

	const getOffsetValue = () => {
		return parseInt( attributes?.className
			?.split( ' ' )
			?.filter( c => c?.includes( 'o-sticky-offset' ) )
			?.reduce( ( acc, c ) =>{
				return c?.split( '-' )?.pop();
			}, 40 ) );
	};

	const setOffsetValue = value => {
		addCSSClass( `o-sticky-offset-${ value }`, 'o-sticky-offset' );
	};

	const countStickyComponents = ( parentClientId ) => {
		const parentDOM = document.querySelector( `#block-${parentClientId}` );
		return parentDOM.querySelectorAll( '.o-sticky:not(.o-sticky-container)' ).length;
	};

	const selectParent = ( newParentId ) => {
		parents.forEach( block => {
			if ( newParentId !== block.clientId && 1 === countStickyComponents( block.clientId ) ) {
				addCSSClass( block, undefined, 'o-sticky' );
			}
		});

		if ( parent ) {
			const parentDom = document.querySelector( `#block-${parentClientId} > .o-sticky-highlight ` );
			parentDom?.classList?.remove( 'active' );
			parentDom?.querySelector( '.o-sticky-badge' )?.classList?.remove( 'active' );
		}
		addCSSClass( getBlock( newParentId ), 'o-sticky-container' );
		setParentClientId( newParentId );
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
							{
								0 < parents?.length && (
									<SelectControl
										label={ __( 'Parent Container', 'otter-blocks' ) }
										value={ parent?.clientId }
										options={
											parents.map( p => ({ label: p.name, value: p.clientId }) )
										}
										onChange={ selectParent }
									/>
								)
							}

							<SelectControl
								label={ __( 'Position', 'otter-blocks' ) }
								value={ position }
								options={[
									{ label: __( 'Top', 'otter-blocks' ), value: 'o-sticky-pos-top' },
									{ label: __( 'Bottom', 'otter-blocks' ), value: 'o-sticky-pos-bottom' }
								]}
								onChange={ value => addCSSClass( getBlock( clientId ), value ) }
							/>

							<RangeControl
								label={ __( 'Distance from screen', 'otter-blocks' ) }
								value={ getOffsetValue( ) }
								min={0}
								max={80}
								onChange={ setOffsetValue }
							/>
						</PanelBody>
					</InspectorControls>
				)
			}

			{
				( isSticky || isContainer ) ? (
					<div className={classnames( 'o-sticky-highlight', { 'o-container': isContainer }, {'active': isSelected})}>
						<div className={classnames( 'o-sticky-badge', {'active': isSelected})}>
							{
								isContainer ? __( 'Sticky Container' ) : __( 'Sticky Element' )
							}
						</div>
						{children}
					</div>
				) : (
					children
				)
			}

		</Fragment>
	);
};

export default Edit;
