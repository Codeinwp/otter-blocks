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

	let fontSizeStyle, stylesheet, textShadowStyle;

	if ( isDesktop ) {
		fontSizeStyle = {
			fontSize: attributes.fontSize ? `${ attributes.fontSize }px` : undefined
		};

		stylesheet = {
			textAlign: attributes.align,
			paddingTop: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingTop }px`,
			paddingRight: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingRight }px`,
			paddingBottom: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingBottom }px`,
			paddingLeft: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingLeft }px`,
			marginTop: 'linked' === attributes.marginType ? `${ attributes.margin }px` : `${ attributes.marginTop }px`,
			marginBottom: 'linked' === attributes.marginType ? `${ attributes.margin }px` : `${ attributes.marginBottom }px`
		};
	}

	if ( isTablet ) {
		fontSizeStyle = {
			fontSize: attributes.fontSizeTablet ? `${ attributes.fontSizeTablet }px` : undefined
		};

		stylesheet = {
			textAlign: attributes.alignTablet,
			paddingTop: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingTopTablet }px`,
			paddingRight: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingRightTablet }px`,
			paddingBottom: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingBottomTablet }px`,
			paddingLeft: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingLeftTablet }px`,
			marginTop: 'linked' === attributes.marginTypeTablet ? `${ attributes.marginTablet }px` : `${ attributes.marginTopTablet }px`,
			marginBottom: 'linked' === attributes.marginTypeTablet ? `${ attributes.marginTablet }px` : `${ attributes.marginBottomTablet }px`
		};
	}

	if ( isMobile ) {
		fontSizeStyle = {
			fontSize: attributes.fontSizeMobile ? `${ attributes.fontSizeMobile }px` : undefined
		};

		stylesheet = {
			textAlign: attributes.alignMobile,
			paddingTop: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingTopMobile }px`,
			paddingRight: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingRightMobile }px`,
			paddingBottom: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingBottomMobile }px`,
			paddingLeft: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingLeftMobile }px`,
			marginTop: 'linked' === attributes.marginTypeMobile ? `${ attributes.marginMobile }px` : `${ attributes.marginTopMobile }px`,
			marginBottom: 'linked' === attributes.marginTypeMobile ? `${ attributes.marginMobile }px` : `${ attributes.marginBottomMobile }px`
		};
	}

	if ( attributes.textShadow ) {
		textShadowStyle = {
			textShadow: `${ attributes.textShadowHorizontal }px ${ attributes.textShadowVertical }px ${ attributes.textShadowBlur }px ${  hexToRgba( ( attributes.textShadowColor ? attributes.textShadowColor : '#000000' ), 0 <= attributes.textShadowColorOpacity ? attributes.textShadowColorOpacity || 0.00001  : 1 ) }`
		};
	}

	const style = omitBy({
		color: attributes.headingColor,
		...fontSizeStyle,
		fontFamily: attributes.fontFamily || undefined,
		fontWeight: 'regular' === attributes.fontVariant ? 'normal' : attributes.fontVariant,
		fontStyle: attributes.fontStyle || undefined,
		textTransform: attributes.textTransform || undefined,
		lineHeight: ( 3 < attributes.lineHeight ? attributes.lineHeight + 'px' : attributes.lineHeight ) || undefined,
		letterSpacing: attributes.letterSpacing && `${ attributes.letterSpacing }px`,
		...stylesheet,
		...textShadowStyle
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
