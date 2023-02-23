/**
 * External dependencies
 */
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { isObjectLike, omitBy } from 'lodash';

import {
	createBlock,
	getDefaultBlockName
} from '@wordpress/blocks';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../helpers/block-utility.js';
import Controls from './controls.js';
import Inspector from './inspector.js';
import googleFontsLoader from '../../helpers/google-fonts.js';
import { boxValues, _cssBlock, _px } from '../../helpers/helper-functions';
import { makeBox } from '../../plugins/copy-paste/utils';
import {
	useDarkBackground,
	useResponsiveAttributes
} from '../../helpers/utility-hooks.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Advanced Heading component
 * @param {import('./types').AdvancedHeadingProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	mergeBlocks,
	onReplace
}) => {

	useEffect( () => {
		googleFontsLoader.attach( );
		const unsubscribe = blockInit( clientId, defaultAttributes );
		console.log( 'Advanced Heading block init' );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	useDarkBackground( attributes.backgroundColor, attributes, setAttributes );

	const changeContent = value => {
		setAttributes({ content: value });
	};

	const { responsiveGetAttributes } = useResponsiveAttributes( setAttributes );

	const oldPaddingDesktop = 'unlinked' === attributes.paddingType ? ({
		top: _px( attributes.paddingTop ) ?? '0px',
		bottom: _px( attributes.paddingBottom ) ?? '0px',
		right: _px( attributes.paddingRight ) ?? '0px',
		left: _px( attributes.paddingLeft ) ?? '0px'
	}) : ( isFinite( attributes.padding ) ? makeBox( _px( attributes.padding ) ) : makeBox( '0px' ) );

	const oldPaddingTablet = 'unlinked' === attributes.paddingTypeTablet ? ({
		top: _px( attributes.paddingTopTablet ) ?? '0px',
		bottom: _px( attributes.paddingBottomTablet ) ?? '0px',
		right: _px( attributes.paddingRightTablet ) ?? '0px',
		left: _px( attributes.paddingLeftTablet ) ?? '0px'
	}) : ( isFinite( attributes.paddingTablet ) ? makeBox( _px( attributes.paddingTablet ) ) : undefined );

	const oldPaddingMobile = 'unlinked' === attributes.paddingTypeMobile ?  ({
		top: _px( attributes.paddingTopMobile ) ?? '0px',
		bottom: _px( attributes.paddingBottomMobile ) ?? '0px',
		right: _px( attributes.paddingRightMobile ) ?? '0px',
		left: _px( attributes.paddingLeftMobile ) ?? '0px'
	}) : ( isFinite( attributes.paddingMobile ) ? makeBox( _px( attributes.paddingMobile ) ) : undefined );

	const oldMarginDesktop = undefined === attributes.marginType ?  ({
		top: _px( attributes.marginTop ) ?? '0px',
		bottom: _px( attributes.marginBottom ) ?? '25px'
	}) : ( isFinite( attributes.margin ) ? makeBox( _px( attributes.margin ) ) : undefined );

	const oldMarginTablet = undefined === attributes.marginTypeTablet ? ({
		top: _px( attributes.marginTopTablet ) ?? '0px',
		bottom: _px( attributes.marginBottomTablet ) ?? '0px'
	}) : ( isFinite( attributes.marginTablet ) ? makeBox( _px( attributes.marginTablet ) ) : undefined ) ;

	const oldMarginMobile = undefined === attributes.marginTypeMobile ?  ({
		top: _px( attributes.marginTopMobile ) ?? '0px',
		bottom: _px( attributes.marginBottomMobile ) ?? '0px'
	}) : ( isFinite( attributes.marginMobile ) ? makeBox( _px( attributes.marginMobile ) ) : undefined );

	const renderBox = box => isObjectLike( box ) ? boxValues( box ) : undefined;

	const inlineStyle = {
		'--padding': isObjectLike( responsiveGetAttributes([
			attributes.padding,
			attributes.paddingTablet,
			attributes.paddingMobile
		]) ) ? boxValues( responsiveGetAttributes([
				attributes.padding,
				attributes.paddingTablet,
				attributes.paddingMobile
			]) ) : renderBox( oldPaddingDesktop ),
		'--padding-tablet': isObjectLike( attributes.paddingTablet ) ?  boxValues( attributes.paddingTablet ) : renderBox( oldPaddingTablet ),
		'--padding-mobile': isObjectLike( attributes.paddingMobile ) ?  boxValues( attributes.paddingMobile ) : renderBox( oldPaddingMobile ),
		'--margin': isObjectLike( responsiveGetAttributes([
			attributes.margin,
			attributes.marginTablet,
			attributes.marginMobile
		]) ) ?  boxValues( responsiveGetAttributes([
				attributes.margin,
				attributes.marginTablet,
				attributes.marginMobile
			]) ) : renderBox( oldMarginDesktop ),
		'--margin-tablet': isObjectLike( attributes.marginTablet ) ?  boxValues( attributes.marginTablet ) : renderBox( oldMarginTablet ),
		'--margin-mobile': isObjectLike( attributes.marginMobile ) ?  boxValues( attributes.marginMobile ) : renderBox( oldMarginMobile ),
		'--text-align': responsiveGetAttributes([
			attributes.align,
			attributes.alignTablet,
			attributes.alignMobile
		]),
		'--text-align-tablet': attributes.alignTablet,
		'--text-align-mobile': attributes.alignMobile
	};

	let textShadowStyle;

	if ( attributes.textShadow ) {
		textShadowStyle = {
			textShadow: `${ attributes.textShadowHorizontal }px ${ attributes.textShadowVertical }px ${ attributes.textShadowBlur }px ${  hexToRgba( ( attributes.textShadowColor ? attributes.textShadowColor : '#000000' ), 0 <= attributes.textShadowColorOpacity ? attributes.textShadowColorOpacity || 0.00001  : 1 ) }`
		};
	}

	const style = omitBy({
		fontSize: responsiveGetAttributes([
			attributes.fontSize,
			attributes.fontSizeTablet,
			attributes.fontSizeMobile
		]),
		color: attributes.headingColor,
		fontFamily: attributes.fontFamily || undefined,
		fontWeight: 'regular' === attributes.fontVariant ? 'normal' : attributes.fontVariant,
		fontStyle: attributes.fontStyle || undefined,
		textTransform: attributes.textTransform || undefined,
		lineHeight: ( 3 < attributes.lineHeight ? attributes.lineHeight + 'px' : attributes.lineHeight ) || undefined,
		letterSpacing: _px( attributes.letterSpacing ),
		background: attributes.backgroundColor,
		...textShadowStyle,
		...inlineStyle
	}, x => x?.includes?.( 'undefined' ) );


	const blockProps = useBlockProps({
		id: attributes.id,
		style
	});

	useEffect( () => {
		if ( attributes.fontFamily ) {
			googleFontsLoader.loadFontToBrowser( attributes.fontFamily, attributes.fontVariant );
		}
	}, [ attributes.fontFamily ]);

	return (
		<Fragment>
			<style>
				{
					`#block-${ clientId } mark, #block-${ clientId } .highlight ` + _cssBlock([
						[ 'color', attributes.highlightColor ],
						[ 'background', attributes.highlightBackground ]
					])
				}
				{
					`#block-${ clientId } a` + _cssBlock([
						[ 'color', attributes.linkColor  ]
					])
				}
				{
					`#block-${ clientId } a:hover` + _cssBlock([
						[ 'color', attributes.linkHoverColor  ]
					])
				}
			</style>

			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<RichText
				identifier="content"
				value={ attributes.content }
				placeholder={ __( 'Write heading…', 'otter-blocks' ) }
				tagName={ attributes.tag }
				allowedFormats={ [ 'core/bold', 'core/italic', 'core/link', 'core/strikethrough', 'themeisle-blocks/highlight', 'themeisle-blocks/count-animation', 'themeisle-blocks/typing-animation', 'themeisle-blocks/dynamic-value', 'themeisle-blocks/dynamic-link' ] }
				onMerge={ mergeBlocks }
				onSplit={ ( value, isOriginal ) => {
					let block;

					if ( isOriginal || value ) {
						block = createBlock( 'themeisle-blocks/advanced-heading', {
							...attributes,
							content: value
						});
					} else {
						block = createBlock(
							getDefaultBlockName() ?? 'themeisle-blocks/advanced-heading'
						);
					}

					if ( isOriginal ) {
						block.clientId = clientId;
					}

					return block;
				} }
				onReplace={ onReplace }
				onRemove={ () => onReplace([]) }
				onChange={ changeContent }
				{ ...blockProps }
			/>
		</Fragment>
	);
};

export default Edit;
