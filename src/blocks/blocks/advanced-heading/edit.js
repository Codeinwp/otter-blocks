/**
 * External dependencies
 */
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { omitBy } from 'lodash';

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
import { _px } from '../../helpers/helper-functions';

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

	const oldPaddingDesktop = ({
		top: attributes.paddingTop ?? '0px',
		bottom: attributes.paddingBottom ?? '0px',
		right: attributes.paddingRight ?? '0px',
		left: attributes.paddingLeft ?? '0px'
	});

	const oldPaddingTablet = ({
		top: attributes.paddingTopTablet ?? '0px',
		bottom: attributes.paddingBottomTablet ?? '0px',
		right: attributes.paddingRightTablet ?? '0px',
		left: attributes.paddingLeftTablet ?? '0px'
	});

	const oldPaddingMobile = ({
		top: attributes.paddingTopMobile ?? '0px',
		bottom: attributes.paddingBottomMobile ?? '0px',
		right: attributes.paddingRightMobile ?? '0px',
		left: attributes.paddingLeftMobile ?? '0px'
	});

	const oldMarginDesktop = ({
		top: attributes.marginTop ?? '0px',
		bottom: attributes.marginBottom ?? '0px'
	});

	const oldMarginTablet = ({
		top: attributes.marginTopTablet ?? '0px',
		bottom: attributes.marginBottomTablet ?? '0px'
	});

	const oldMarginMobile = ({
		top: attributes.marginTopMobile ?? '0px',
		bottom: attributes.marginBottomMobile ?? '0px'
	});

	const inlineStyle = {
		'--padding': attributes.padding ?  boxValues( merge( oldPaddingDesktop, attributes.padding ) ) : undefined,
		'--padding-tablet': attributes.paddingTablet ?  boxValues( merge( oldPaddingTablet, attributes.padding ?? {}, attributes.paddingTablet ) ) : undefined,
		'--padding-mobile': attributes.paddingMobile ?  boxValues( merge( oldPaddingMobile, attributes.padding ?? {}, attributes.paddingTablet  ?? {}, attributes.paddingMobile ) ) : undefined,
		'--margin': attributes.margin ?  boxValues( merge( oldMarginDesktop, attributes.margin ) ) : undefined,
		'--margin-tablet': attributes.marginTablet ?  boxValues( merge( oldMarginTablet, attributes.margin ?? {}, attributes.marginTablet ) ) : undefined,
		'--margin-mobile': attributes.marginMobile ?  boxValues( merge( oldMarginMobile, attributes.margin ?? {}, attributes.marginTablet  ?? {}, attributes.marginMobile ) ) : undefined,
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
