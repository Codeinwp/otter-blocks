/**
 * External dependencies
 */
import classnames from 'classnames';
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies
 */
import { times } from 'lodash';

import { useViewportMatch } from '@wordpress/compose';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import { InnerBlocks } from '@wordpress/block-editor';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import defaultAttributes from './attributes.js';
import layouts from '../layouts.js';
import Controls from './controls.js';
import Inspector from './inspector.js';
import BlockNavigatorControl from '../../../components/block-navigator-control/index.js';
import Separators from '../components/separators/index.js';
import Onboarding from '../components/onboarding/index.js';
import { blockInit } from '../../../helpers/block-utility.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId
}) => {
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	const {
		sectionBlock,
		isViewportAvailable,
		isPreviewDesktop,
		isPreviewTablet,
		isPreviewMobile
	} = useSelect( select => {
		const { getBlock } = select( 'core/block-editor' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const sectionBlock = getBlock( clientId );

		return {
			sectionBlock,
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

	const [ dividerViewType, setDividerViewType ] = useState( 'top' );

	let isDesktop = isLarger && ! isLarge && isSmall && ! isSmaller;

	let isTablet = ! isLarger && ! isLarge && isSmall && ! isSmaller;

	let isMobile = ! isLarger && ! isLarge && ! isSmall && ! isSmaller;

	if ( isViewportAvailable && ! isMobile ) {
		isDesktop = isPreviewDesktop;
		isTablet = isPreviewTablet;
		isMobile = isPreviewMobile;
	}

	const Tag = attributes.columnsHTMLTag;

	let stylesheet, background, overlayBackground, borderStyle, borderRadiusStyle, boxShadowStyle;

	if ( isDesktop ) {
		stylesheet = {
			paddingTop: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingTop }px`,
			paddingRight: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingRight }px`,
			paddingBottom: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingBottom }px`,
			paddingLeft: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingLeft }px`,
			marginTop: 'linked' === attributes.marginType ? `${ attributes.margin }px` : `${ attributes.marginTop }px`,
			marginBottom: 'linked' === attributes.marginType ? `${ attributes.margin }px` : `${ attributes.marginBottom }px`,
			minHeight: 'custom' === attributes.columnsHeight ? `${ attributes.columnsHeightCustom }px` : attributes.columnsHeight
		};
	}

	if ( isTablet ) {
		stylesheet = {
			paddingTop: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingTopTablet }px`,
			paddingRight: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingRightTablet }px`,
			paddingBottom: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingBottomTablet }px`,
			paddingLeft: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingLeftTablet }px`,
			marginTop: 'linked' === attributes.marginTypeTablet ? `${ attributes.marginTablet }px` : `${ attributes.marginTopTablet }px`,
			marginBottom: 'linked' === attributes.marginTypeTablet ? `${ attributes.marginTablet }px` : `${ attributes.marginBottomTablet }px`,
			minHeight: 'custom' === attributes.columnsHeight ? `${ attributes.columnsHeightCustomTablet }px` : attributes.columnsHeight
		};
	}

	if ( isMobile ) {
		stylesheet = {
			paddingTop: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingTopMobile }px`,
			paddingRight: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingRightMobile }px`,
			paddingBottom: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingBottomMobile }px`,
			paddingLeft: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingLeftMobile }px`,
			marginTop: 'linked' === attributes.marginTypeMobile ? `${ attributes.marginMobile }px` : `${ attributes.marginTopMobile }px`,
			marginBottom: 'linked' === attributes.marginTypeMobile ? `${ attributes.marginMobile }px` : `${ attributes.marginBottomMobile }px`,
			minHeight: 'custom' === attributes.columnsHeight ? `${ attributes.columnsHeightCustomMobile }px` : attributes.columnsHeight
		};
	}

	if ( 'color' === attributes.backgroundType ) {
		background = {
			background: attributes.backgroundColor
		};
	}

	if ( 'image' === attributes.backgroundType ) {
		background = {
			backgroundImage: `url( '${ attributes.backgroundImageURL }' )`,
			backgroundAttachment: attributes.backgroundAttachment,
			backgroundPosition: attributes.backgroundPosition,
			backgroundRepeat: attributes.backgroundRepeat,
			backgroundSize: attributes.backgroundSize
		};
	}

	if ( 'gradient' === attributes.backgroundType ) {
		background = {
			background: attributes.backgroundGradient
		};
	}

	if ( 'linked' === attributes.borderType ) {
		borderStyle = {
			borderWidth: `${ attributes.border }px`,
			borderStyle: 'solid',
			borderColor: attributes.borderColor
		};
	}

	if ( 'unlinked' === attributes.borderType ) {
		borderStyle = {
			borderTopWidth: `${ attributes.borderTop }px`,
			borderRightWidth: `${ attributes.borderRight }px`,
			borderBottomWidth: `${ attributes.borderBottom }px`,
			borderLeftWidth: `${ attributes.borderLeft }px`,
			borderStyle: 'solid',
			borderColor: attributes.borderColor
		};
	}

	if ( 'linked' === attributes.borderRadiusType ) {
		borderRadiusStyle = {
			borderRadius: `${ attributes.borderRadius }px`
		};
	}

	if ( 'unlinked' === attributes.borderRadiusType ) {
		borderRadiusStyle = {
			borderTopLeftRadius: `${ attributes.borderRadiusTop }px`,
			borderTopRightRadius: `${ attributes.borderRadiusRight }px`,
			borderBottomRightRadius: `${ attributes.borderRadiusBottom }px`,
			borderBottomLeftRadius: `${ attributes.borderRadiusLeft }px`
		};
	}

	if ( true === attributes.boxShadow ) {
		boxShadowStyle = {
			boxShadow: `${ attributes.boxShadowHorizontal }px ${ attributes.boxShadowVertical }px ${ attributes.boxShadowBlur }px ${ attributes.boxShadowSpread }px ${  hexToRgba( ( attributes.boxShadowColor ? attributes.boxShadowColor : '#000000' ), attributes.boxShadowColorOpacity ) }`
		};
	}

	const style = {
		...stylesheet,
		...background,
		...borderStyle,
		...borderRadiusStyle,
		...boxShadowStyle
	};

	if ( 'color' === attributes.backgroundOverlayType ) {
		overlayBackground = {
			background: attributes.backgroundOverlayColor,
			opacity: attributes.backgroundOverlayOpacity / 100
		};
	}

	if ( 'image' === attributes.backgroundOverlayType ) {
		overlayBackground = {
			backgroundImage: `url( '${ attributes.backgroundOverlayImageURL }' )`,
			backgroundAttachment: attributes.backgroundOverlayAttachment,
			backgroundPosition: attributes.backgroundOverlayPosition,
			backgroundRepeat: attributes.backgroundOverlayRepeat,
			backgroundSize: attributes.backgroundOverlaySize,
			opacity: attributes.backgroundOverlayOpacity / 100
		};
	}

	if ( 'gradient' === attributes.backgroundOverlayType ) {
		overlayBackground = {
			background: attributes.backgroundOverlayGradient,
			opacity: attributes.backgroundOverlayOpacity / 100
		};
	}

	const overlayStyle = {
		...overlayBackground,
		...borderRadiusStyle,
		mixBlendMode: attributes.backgroundOverlayBlend,
		filter: `blur( ${ attributes.backgroundOverlayFilterBlur / 10 }px ) brightness( ${ attributes.backgroundOverlayFilterBrightness / 10 } ) contrast( ${ attributes.backgroundOverlayFilterContrast / 10 } ) grayscale( ${ attributes.backgroundOverlayFilterGrayscale / 100 } ) hue-rotate( ${ attributes.backgroundOverlayFilterHue }deg ) saturate( ${ attributes.backgroundOverlayFilterSaturate / 10 } )`
	};

	let innerStyle = {};

	if ( attributes.columnsWidth ) {
		innerStyle = {
			maxWidth: attributes.columnsWidth + 'px'
		};
	}

	const classes = classnames(
		className,
		`has-${ attributes.columns }-columns`,
		`has-desktop-${ attributes.layout }-layout`,
		`has-tablet-${ attributes.layoutTablet }-layout`,
		`has-mobile-${ attributes.layoutMobile }-layout`,
		`has-${ attributes.columnsGap }-gap`,
		`has-vertical-${ attributes.verticalAlign }`,
		`has-horizontal-${ attributes.horizontalAlign }`,
		{ 'has-reverse-columns-tablet': ( attributes.reverseColumnsTablet && ! attributes.hideTablet && 'collapsedRows' === attributes.layoutTablet ) },
		{ 'has-reverse-columns-mobile': ( attributes.reverseColumnsMobile && ! attributes.hideMobile && 'collapsedRows' === attributes.layoutMobile ) },
		{ 'has-viewport-desktop': isDesktop },
		{ 'has-viewport-tablet': isTablet },
		{ 'has-viewport-mobile': isMobile }
	);

	const updateColumnsWidth = ( columns, layout ) => {
		( sectionBlock.innerBlocks ).map( ( innerBlock, i ) => {
			updateBlockAttributes( innerBlock.clientId, {
				columnWidth: layouts[columns][layout][i]
			});
		});
	};

	const setupColumns = ( columns, layout ) => {
		if ( 1 >= columns ) {
			setAttributes({
				columns,
				layout,
				layoutTablet: 'equal',
				layoutMobile: 'equal'
			});
		} else {
			setAttributes({
				columns,
				layout,
				layoutTablet: 'equal',
				layoutMobile: 'collapsedRows'
			});
		}
	};

	let getDividerTopWidth = () => {
		let value;

		if ( isDesktop ) {
			value = attributes.dividerTopWidth;
		}

		if ( isTablet ) {
			value = attributes.dividerTopWidthTablet;
		}

		if ( isMobile ) {
			value = attributes.dividerTopWidthMobile;
		}

		return value;
	};

	getDividerTopWidth = getDividerTopWidth();

	let getDividerBottomWidth = () => {
		let value;

		if ( isDesktop ) {
			value = attributes.dividerBottomWidth;
		}

		if ( isTablet ) {
			value = attributes.dividerBottomWidthTablet;
		}

		if ( isMobile ) {
			value = attributes.dividerBottomWidthMobile;
		}

		return value;
	};

	getDividerBottomWidth = getDividerBottomWidth();

	let getDividerTopHeight = () => {
		let value;

		if ( isDesktop ) {
			value = attributes.dividerTopHeight;
		}

		if ( isTablet ) {
			value = attributes.dividerTopHeightTablet;
		}

		if ( isMobile ) {
			value = attributes.dividerTopHeightMobile;
		}

		return value;
	};

	getDividerTopHeight = getDividerTopHeight();

	let getDividerBottomHeight = () => {
		let value;

		if ( isDesktop ) {
			value = attributes.dividerBottomHeight;
		}

		if ( isTablet ) {
			value = attributes.dividerBottomHeightTablet;
		}

		if ( isMobile ) {
			value = attributes.dividerBottomHeightMobile;
		}

		return value;
	};

	getDividerBottomHeight = getDividerBottomHeight();

	const getColumnsTemplate = columns => {
		return times( columns, i => [ 'themeisle-blocks/advanced-column', { columnWidth: layouts[columns][attributes.layout][i] } ]);
	};

	if ( ! attributes.columns ) {
		return (
			<Onboarding
				clientId={ clientId }
				setupColumns={ setupColumns }
			/>
		);
	}

	return (
		<Fragment>
			<BlockNavigatorControl clientId={ clientId } />

			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				updateColumnsWidth={ updateColumnsWidth }
				dividerViewType={ dividerViewType }
				setDividerViewType={ setDividerViewType }
			/>

			<Tag
				className={ classes }
				id={ attributes.id }
				style={ style }
			>
				<div
					className="wp-block-themeisle-blocks-advanced-columns-overlay"
					style={ overlayStyle }
				>
				</div>

				<Separators
					type="top"
					style={ attributes.dividerTopType }
					fill={ attributes.dividerTopColor }
					invert={ attributes.dividerTopInvert }
					width={ getDividerTopWidth }
					height={ getDividerTopHeight }
				/>

				<div
					className="innerblocks-wrap"
					style={ innerStyle }
				>
					<InnerBlocks
						allowedBlocks={ [ 'themeisle-blocks/advanced-column' ] }
						template={ getColumnsTemplate( attributes.columns ) }
						templateLock="all"
					/>
				</div>

				<Separators
					type="bottom"
					style={ attributes.dividerBottomType }
					fill={ attributes.dividerBottomColor }
					invert={ attributes.dividerBottomInvert }
					width={ getDividerBottomWidth }
					height={ getDividerBottomHeight }
				/>
			</Tag>
		</Fragment>
	);
};

export default Edit;
