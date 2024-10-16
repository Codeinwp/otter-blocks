/**
 * External dependencies
 */
import {
	closeSmall,
	external
} from '@wordpress/icons';
import classnames from 'classnames';
import { get, merge } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';


import {
	InnerBlocks,
	useBlockProps,
	__experimentalBlockVariationPicker as VariationPicker
} from '@wordpress/block-editor';

import { Button } from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import {
	createBlocksFromInnerBlocksTemplate
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import { blockInit, useCSSNode } from '../../helpers/block-utility';
import { boxValues, _cssBlock, stringToBox } from '../../helpers/helper-functions';
import { useDarkBackground } from '../../helpers/utility-hooks.js';
import { useDispatch, useSelect } from '@wordpress/data';

const { attributes: defaultAttributes } = metadata;

/**
 * Popup component
 * @param {import('./types').PopupPros} props
 * @return
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	className,
	name
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, []);

	const [ isEditing, setEditing ] = useState( false );

	const {
		replaceInnerBlocks,
		selectBlock
	} = useDispatch( 'core/block-editor' );

	const hasInnerBlocks = useSelect(
		select =>
			0 < select( 'core/block-editor' ).getBlocks( clientId ).length,
		[ clientId ]
	);

	const { blockType, defaultVariation, variations } = useSelect(
		select => {
			const {
				getBlockVariations,
				getBlockType,
				getDefaultBlockVariation
			} = select( 'core/blocks' );

			return {
				blockType: getBlockType( name ),
				defaultVariation: getDefaultBlockVariation( name, 'block' ),
				variations: getBlockVariations( name, 'block' )
			};
		},
		[ name ]
	);

	const height = 'custom' === attributes.heightMode ? {
		'--height': attributes.height,
		'--height-tablet': attributes.heightMobile,
		'--height-mobile': attributes.heightMobile
	} : { '--height': 'fit-content' };

	const inlineStyles = {
		'--min-width': attributes.minWidth ? attributes.minWidth + 'px' : '400px',
		'--max-width': attributes.maxWidth ? attributes.maxWidth + 'px' : undefined,
		'--background-color': attributes.backgroundColor,
		'--close-color': attributes.closeColor,
		'--overlay-color': attributes.overlayColor,
		'--overlay-opacity': attributes.overlayOpacity !== undefined ? attributes.overlayOpacity / 100 : 1,
		'--brd-width': boxValues( attributes.borderWidth ),
		'--brd-radius': boxValues( attributes.borderRadius ),
		'--brd-color': attributes.borderColor,
		'--brd-style': attributes.borderStyle,

		// Responsive
		'--width': ! Boolean( attributes.width ) && attributes.maxWidth ? attributes.maxWidth + 'px' : attributes.width,
		'--width-tablet': attributes.widthTablet,
		'--width-mobile': attributes.widthMobile,

		'--padding': attributes.padding ?  boxValues( merge( stringToBox( '20px' ), attributes.padding ) ) : undefined,
		'--padding-tablet': attributes.paddingTablet ?  boxValues( merge( stringToBox( '20px' ), attributes.padding ?? {}, attributes.paddingTablet ) ) : undefined,
		'--padding-mobile': attributes.paddingMobile ?  boxValues( merge( stringToBox( '20px' ), attributes.padding ?? {}, attributes.paddingTablet  ?? {}, attributes.paddingMobile ) ) : undefined,
		'--box-shadow': attributes.boxShadow.active && `${ attributes.boxShadow.horizontal }px ${ attributes.boxShadow.vertical }px ${ attributes.boxShadow.blur }px ${ attributes.boxShadow.spread }px ${ hexToRgba( attributes.boxShadow.color || '#FFFFFF', attributes.boxShadow.colorOpacity ) }`,

		...height
	};

	const [ cssNode, setNodeCSS ] = useCSSNode();

	useEffect( () => {
		setNodeCSS(
			[
				' .otter-popup__modal_content ' + _cssBlock([
					[ 'top', '30px', 'top' === attributes.verticalPosition ],
					[ 'bottom', '30px', 'bottom' === attributes.verticalPosition ],
					[ 'left', '30px', 'left' === attributes.horizontalPosition ],
					[ 'right', '30px', 'right' === attributes.horizontalPosition ]
				]),
				' .otter-popup__modal_content ' + _cssBlock([
					[ 'top', '15px', 'top' === attributes.verticalPositionTablet ],
					[ 'bottom', '15px', 'bottom' === attributes.verticalPositionTablet ],
					[ 'left', '15px', 'left' === attributes.horizontalPositionTablet ],
					[ 'right', '15px', 'right' === attributes.horizontalPositionTablet ]
				]),
				' .otter-popup__modal_content ' + _cssBlock([
					[ 'top', '10px', 'top' === attributes.verticalPositionMobile ],
					[ 'bottom', '10px', 'bottom' === attributes.verticalPositionMobile ],
					[ 'left', '10px', 'left' === attributes.horizontalPositionMobile ],
					[ 'right', '10px', 'right' === attributes.horizontalPositionMobile ]
				])
			],
			[
				'@media ( min-width: 960px )',
				'@media ( min-width: 600px ) and ( max-width: 960px )',
				'@media ( max-width: 600px )'
			]);
	},
	[
		attributes.horizontalPosition,
		attributes.verticalPosition,
		attributes.horizontalPositionTablet,
		attributes.verticalPositionTablet,
		attributes.horizontalPositionMobile,
		attributes.verticalPositionMobile
	]);

	useDarkBackground( attributes.backgroundColor, attributes, setAttributes );

	const blockProps = useBlockProps({
		id: attributes.id,
		style: inlineStyles,
		className: classnames( className, cssNode, { 'with-outside-button': 'outside' === attributes.closeButtonType })
	});

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				{
					hasInnerBlocks ? (
						<Fragment>
							<Button
								variant={ 'primary' }
								isPrimary
								icon={ external }
								onClick={ () => setEditing( true ) }
							>
								{ __( 'Edit Popup', 'otter-blocks' ) }
							</Button>

							{ isEditing && (
								<div className='otter-popup__modal_wrap'>
									<div
										role="presentation"
										className="otter-popup__modal_wrap_overlay"
										onClick={ () => setEditing( false ) }
									/>

									<div className="otter-popup__modal_content">
										{ attributes.showClose && (
											<div className="otter-popup__modal_header">
												<Button
													icon={ closeSmall }
													onClick={ () => setEditing( false ) }
												/>
											</div>
										) }

										<div className="otter-popup__modal_body">
											<InnerBlocks />
										</div>
									</div>
								</div>
							) }
						</Fragment>
					) : (
						<VariationPicker
							icon={ get( blockType, [ 'icon', 'src' ]) }
							label={ get( blockType, [ 'title' ]) }
							variations={ variations }
							onSelect={ ( nextVariation = defaultVariation ) => {
								if ( nextVariation ) {
									setAttributes( nextVariation.attributes );
									replaceInnerBlocks(
										clientId,
										createBlocksFromInnerBlocksTemplate(
											nextVariation.innerBlocks
										),
										true
									);
								}
								selectBlock( clientId );
							} }
							allowSkip
						/>
					)
				}

			</div>
		</Fragment>
	);
};

export default Edit;
