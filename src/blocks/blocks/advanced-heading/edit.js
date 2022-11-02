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

import { useViewportMatch } from '@wordpress/compose';

import { useSelect } from '@wordpress/data';

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
import { boxValues, _px } from '../../helpers/helper-functions';
import { makeBox } from '../../plugins/copy-paste/utils';

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
	const {
		isViewportAvailable,
		isPreviewDesktop,
		isPreviewTablet,
		isPreviewMobile
	} = useSelect( select => {
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return {
			isViewportAvailable: __experimentalGetPreviewDeviceType ? true : false,
			isPreviewDesktop: __experimentalGetPreviewDeviceType ? 'Desktop' === __experimentalGetPreviewDeviceType() : false,
			isPreviewTablet: __experimentalGetPreviewDeviceType ? 'Tablet' === __experimentalGetPreviewDeviceType() : false,
			isPreviewMobile: __experimentalGetPreviewDeviceType ? 'Mobile' === __experimentalGetPreviewDeviceType() : false
		};
	}, []);

	const isLarger = useViewportMatch( 'large', '>=' );

	const isLarge = useViewportMatch( 'large', '<=' );

	const isSmall = useViewportMatch( 'small', '>=' );

	const isSmaller = useViewportMatch( 'small', '<=' );

	useEffect( () => {
		googleFontsLoader.attach( );
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	let isDesktop = isLarger && ! isLarge && isSmall && ! isSmaller;

	let isTablet = ! isLarger && ! isLarge && isSmall && ! isSmaller;

	let isMobile = ! isLarger && ! isLarge && ! isSmall && ! isSmaller;

	if ( isViewportAvailable && ! isMobile ) {
		isDesktop = isPreviewDesktop;
		isTablet = isPreviewTablet;
		isMobile = isPreviewMobile;
	}

	const changeContent = value => {
		setAttributes({ content: value });
	};


	const oldPaddingDesktop = 'unlinked' === attributes.paddingType ? ({
		top: attributes.paddingTop ?? '0px',
		bottom: attributes.paddingBottom ?? '0px',
		right: attributes.paddingRight ?? '0px',
		left: attributes.paddingLeft ?? '0px'
	}) : ( isFinite( attributes.padding ) ? makeBox( _px( attributes.padding ) ) : makeBox( '0px' ) );

	const oldPaddingTablet = 'unlinked' === attributes.paddingTypeTablet ? ({
		top: attributes.paddingTopTablet ?? '0px',
		bottom: attributes.paddingBottomTablet ?? '0px',
		right: attributes.paddingRightTablet ?? '0px',
		left: attributes.paddingLeftTablet ?? '0px'
	}) : ( isFinite( attributes.paddingTablet ) ? makeBox( _px( attributes.paddingTablet ) ) : undefined );

	const oldPaddingMobile = 'unlinked' === attributes.paddingTypeMobile ?  ({
		top: attributes.paddingTopMobile ?? '0px',
		bottom: attributes.paddingBottomMobile ?? '0px',
		right: attributes.paddingRightMobile ?? '0px',
		left: attributes.paddingLeftMobile ?? '0px'
	}) : ( isFinite( attributes.paddingMobile ) ? makeBox( _px( attributes.paddingMobile ) ) : undefined );

	const oldMarginDesktop = undefined === attributes.marginType ?  ({
		top: attributes.marginTop ?? '0px',
		bottom: attributes.marginBottom ?? '0px'
	}) : ( isFinite( attributes.margin ) ? makeBox( _px( attributes.margin ) ) : undefined );

	const oldMarginTablet = undefined === attributes.marginTypeTablet ? ({
		top: attributes.marginTopTablet ?? '0px',
		bottom: attributes.marginBottomTablet ?? '0px'
	}) : ( isFinite( attributes.marginTablet ) ? makeBox( _px( attributes.marginTablet ) ) : undefined ) ;

	const oldMarginMobile = undefined === attributes.marginTypeMobile ?  ({
		top: attributes.marginTopMobile ?? '0px',
		bottom: attributes.marginBottomMobile ?? '0px'
	}) : ( isFinite( attributes.marginMobile ) ? makeBox( _px( attributes.marginMobile ) ) : undefined );

	const renderBox = box => isObjectLike( box ) ? boxValues( box ) : undefined;

	const inlineStyle = {
		'--padding': isObjectLike( attributes.padding ) ? boxValues( attributes.padding ) : renderBox( oldPaddingDesktop ),
		'--padding-tablet': isObjectLike( attributes.paddingTablet ) ?  boxValues( merge( attributes.padding ?? {}, attributes.paddingTablet ) ) : renderBox( oldPaddingTablet ),
		'--padding-mobile': isObjectLike( attributes.paddingMobile ) ?  boxValues( merge( attributes.padding ?? {}, attributes.paddingTablet  ?? {}, attributes.paddingMobile ) ) : renderBox( oldPaddingMobile ),
		'--margin': isObjectLike( attributes.margin ) ?  boxValues( attributes.margin ) : renderBox( oldMarginDesktop ),
		'--margin-tablet': isObjectLike( attributes.marginTablet ) ?  boxValues( merge( attributes.margin ?? {}, attributes.marginTablet ) ) : renderBox( oldMarginTablet ),
		'--margin-mobile': isObjectLike( attributes.marginMobile ) ?  boxValues( merge( attributes.margin ?? {}, attributes.marginTablet  ?? {}, attributes.marginMobile ) ) : renderBox( oldMarginMobile ),
		'--text-align': attributes.align,
		'--text-align-tablet': attributes.alignTablet,
		'--text-align-mobile': attributes.alignMobile,
		'--font-size': attributes.fontSize,
		'--font-size-tablet': attributes.fontSizeTablet,
		'--font-size-mobile': attributes.fontSizeMobile
	};

	let fontSizeStyle, stylesheet, textShadowStyle;

	if ( attributes.textShadow ) {
		textShadowStyle = {
			textShadow: `${ attributes.textShadowHorizontal }px ${ attributes.textShadowVertical }px ${ attributes.textShadowBlur }px ${  hexToRgba( ( attributes.textShadowColor ? attributes.textShadowColor : '#000000' ), 0 <= attributes.textShadowColorOpacity ? attributes.textShadowColorOpacity || 0.00001  : 1 ) }`
		};
	}

	const style = omitBy({
		color: attributes.headingColor,
		fontFamily: attributes.fontFamily || undefined,
		fontWeight: 'regular' === attributes.fontVariant ? 'normal' : attributes.fontVariant,
		fontStyle: attributes.fontStyle || undefined,
		textTransform: attributes.textTransform || undefined,
		lineHeight: ( 3 < attributes.lineHeight ? attributes.lineHeight + 'px' : attributes.lineHeight ) || undefined,
		letterSpacing: _px( attributes.letterSpacing ),
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
				{ `#block-${ clientId } mark, #block-${ clientId } .highlight {
						color: ${ attributes.highlightColor };
						background: ${ attributes.highlightBackground };
					}` }
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
