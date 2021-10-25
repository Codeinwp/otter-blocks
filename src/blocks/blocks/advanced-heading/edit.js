/**
 * External dependencies
 */
import classnames from 'classnames';
import hexToRgba from 'hex-rgba';
import GoogleFontLoader from 'react-google-font-loader';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { createBlock } from '@wordpress/blocks';

import { RichText } from '@wordpress/block-editor';

import { useViewportMatch } from '@wordpress/compose';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { blockInit } from '../../helpers/block-utility.js';
import defaultAttributes from './attributes.js';
import Controls from './controls.js';
import Inspector from './inspector.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId,
	mergeBlocks,
	insertBlocksAfter,
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

	const changeFontFamily = value => {
		if ( ! value ) {
			setAttributes({
				fontFamily: value,
				fontVariant: value
			});
		} else {
			setAttributes({
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

	const changeFontVariant = value => {
		setAttributes({ fontVariant: value });
	};

	const changeFontStyle = value => {
		setAttributes({ fontStyle: value });
	};

	const changeTextTransform = value => {
		setAttributes({ textTransform: value });
	};

	const changeLineHeight = value => {
		setAttributes({ lineHeight: value });
	};

	const changeLetterSpacing = value => {
		setAttributes({ letterSpacing: value });
	};

	let fontSizeStyle, stylesheet, textShadowStyle;

	if ( isDesktop ) {
		fontSizeStyle = {
			fontSize: `${ attributes.fontSize }px`
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
			fontSize: `${ attributes.fontSizeTablet }px`
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
			fontSize: `${ attributes.fontSizeMobile }px`
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

	const style = {
		color: attributes.headingColor,
		...fontSizeStyle,
		fontFamily: attributes.fontFamily,
		fontWeight: 'regular' === attributes.fontVariant ? 'normal' : attributes.fontVariant,
		fontStyle: attributes.fontStyle,
		textTransform: attributes.textTransform,
		lineHeight: 3 < attributes.lineHeight ? attributes.lineHeight + 'px' : attributes.lineHeight,
		letterSpacing: attributes.letterSpacing && `${ attributes.letterSpacing }px`,
		...stylesheet,
		...textShadowStyle
	};

	return (
		<Fragment>
			<style>
				{ `.${ attributes.id } mark, .${ attributes.id } .highlight {
						color: ${ attributes.highlightColor };
						background: ${ attributes.highlightBackground };
					}` }
			</style>

			{ attributes.fontFamily && (
				<GoogleFontLoader fonts={ [ {
					font: attributes.fontFamily,
					weights: attributes.fontVariant && [ `${ attributes.fontVariant + ( 'italic' === attributes.fontStyle ? ':i' : '' ) }` ]
				} ] } />
			) }

			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
				changeFontFamily={ changeFontFamily }
				changeFontVariant={ changeFontVariant }
				changeFontStyle={ changeFontStyle }
				changeTextTransform={ changeTextTransform }
				changeLineHeight={ changeLineHeight }
				changeLetterSpacing={ changeLetterSpacing }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				changeFontFamily={ changeFontFamily }
				changeFontVariant={ changeFontVariant }
				changeFontStyle={ changeFontStyle }
				changeTextTransform={ changeTextTransform }
				changeLineHeight={ changeLineHeight }
				changeLetterSpacing={ changeLetterSpacing }
			/>

			<RichText
				identifier="content"
				className={ classnames(
					attributes.id,
					className
				) }
				value={ attributes.content }
				placeholder={ __( 'Write heading…', 'otter-blocks' ) }
				tagName={ attributes.tag }
				formattingControls={ [ 'bold', 'italic', 'link', 'strikethrough', 'highlight' ] }
				allowedFormats={ [ 'core/bold', 'core/italic', 'core/link', 'core/strikethrough', 'themeisle-blocks/highlight' ] }
				onMerge={ mergeBlocks }
				unstableOnSplit={
					insertBlocksAfter ?
						( before, after, ...blocks ) => {
							setAttributes({ content: before });
							insertBlocksAfter([
								...blocks,
								createBlock( 'core/paragraph', { content: after })
							]);
						} :
						undefined
				}
				onRemove={ () => onReplace([]) }
				style={ style }
				onChange={ changeContent }
			/>
		</Fragment>
	);
};

export default Edit;
