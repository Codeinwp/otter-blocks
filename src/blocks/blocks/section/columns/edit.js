/**
 * External dependencies
 */
import classnames from 'classnames';
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { times } from 'lodash';

import {
	Button,
	Dashicon,
	Placeholder,
	Tooltip
} from '@wordpress/components';

import { useViewportMatch } from '@wordpress/compose';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	__experimentalBlockVariationPicker as VariationPicker,
	InnerBlocks
} from '@wordpress/block-editor';

import {
	createBlock,
	createBlocksFromInnerBlocksTemplate
} from '@wordpress/blocks';

import {
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
import { blockInit } from '../../../helpers/block-utility.js';
import Library from '../../../components/template-library/index.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId,
	name
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const { updateBlockAttributes, replaceInnerBlocks } = useDispatch( 'core/block-editor' );

	const {
		sectionBlock,
		isViewportAvailable,
		isPreviewDesktop,
		isPreviewTablet,
		isPreviewMobile,
		children,
		variations,
		defaultVariation
	} = useSelect( select => {
		const {
			getBlock
		} = select( 'core/block-editor' );

		const {
			getBlockVariations,
			getBlockType,
			getDefaultBlockVariation
		} = select( 'core/blocks' );

		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const sectionBlock = getBlock( clientId );

		return {
			sectionBlock,
			children: sectionBlock.innerBlocks,
			isViewportAvailable: __experimentalGetPreviewDeviceType ? true : false,
			isPreviewDesktop: __experimentalGetPreviewDeviceType ? 'Desktop' === __experimentalGetPreviewDeviceType() : false,
			isPreviewTablet: __experimentalGetPreviewDeviceType ? 'Tablet' === __experimentalGetPreviewDeviceType() : false,
			isPreviewMobile: __experimentalGetPreviewDeviceType ? 'Mobile' === __experimentalGetPreviewDeviceType() : false,
			blockType: getBlockType( name ),
			defaultVariation: getDefaultBlockVariation( name, 'block' ),
			variations: getBlockVariations( name, 'block' ).filter( ({ isDefault }) => ! isDefault )
		};
	}, []);

	// +-------------------------------- COLUMNS MANIPULATION --------------------------------+
	const {
		insertBlock,
		removeBlock
	} = useDispatch( 'core/block-editor' );

	const changeColumnsNumbers = ( newColumnsNumber ) => {
		if ( attributes.columns < newColumnsNumber ) {
			times(  newColumnsNumber - attributes.columns, () => {
				const columnBlock = createBlock( 'themeisle-blocks/advanced-column' );
				if ( columnBlock ) {
					insertBlock( columnBlock, ( children?.length ) || 0, clientId, false );
				}
			});
		} else if ( attributes.columns > newColumnsNumber ) {
			children.slice( newColumnsNumber ).forEach( column => removeBlock( column.clientId, false ) );
		}
	};

	const updateColumnsWidth = ( columns, layout ) => {
		( sectionBlock.innerBlocks ).map( ( innerBlock, i ) => {
			updateBlockAttributes( innerBlock.clientId, {
				columnWidth: layouts[columns][layout][i]
			});
		});
	};

	useEffect( () => {
		if ( attributes.columns !== children.length ) {
			setAttributes({
				columns: children.length
			});
		}
	}, [ children ]);

	// +-------------------------------- SCREEN SIZE --------------------------------+

	const isLarger = useViewportMatch( 'large', '>=' );

	const isLarge = useViewportMatch( 'large', '<=' );

	const isSmall = useViewportMatch( 'small', '>=' );

	const isSmaller = useViewportMatch( 'small', '<=' );

	let isDesktop = isLarger && ! isLarge && isSmall && ! isSmaller;

	let isTablet = ! isLarger && ! isLarge && isSmall && ! isSmaller;

	let isMobile = ! isLarger && ! isLarge && ! isSmall && ! isSmaller;

	if ( isViewportAvailable && ! isMobile ) {
		isDesktop = isPreviewDesktop;
		isTablet = isPreviewTablet;
		isMobile = isPreviewMobile;
	}

	// +-------------------------------- DIVIDER SIZE --------------------------------+

	const [ dividerViewType, setDividerViewType ] = useState( 'top' );

	const getValueBasedOnScreenSize = ({ mobile, tablet, desktop }) => {
		return ( isMobile && mobile ) || ( isTablet && tablet ) || ( isDesktop && desktop ) || undefined;
	};

	const getDividerTopWidth = getValueBasedOnScreenSize({
		mobile: attributes.dividerTopWidthMobile,
		tablet: attributes.dividerTopWidthTablet,
		desktop: attributes.dividerTopWidth
	});

	const getDividerBottomWidth = getValueBasedOnScreenSize({
		mobile: attributes.dividerBottomWidthMobile,
		tablet: attributes.dividerBottomWidthTablet,
		desktop: attributes.dividerBottomWidth
	});

	const getDividerTopHeight = getValueBasedOnScreenSize({
		mobile: attributes.dividerTopHeightMobile,
		tablet: attributes.dividerTopHeightTablet,
		desktop: attributes.dividerTopHeight
	});

	const getDividerBottomHeight = getValueBasedOnScreenSize({
		mobile: attributes.dividerBottomHeightMobile,
		tablet: attributes.dividerBottomHeightTablet,
		desktop: attributes.dividerBottomHeight
	});

	// +-------------------------------- STYLING --------------------------------+

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
	} else if ( isTablet ) {
		stylesheet = {
			paddingTop: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingTopTablet }px`,
			paddingRight: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingRightTablet }px`,
			paddingBottom: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingBottomTablet }px`,
			paddingLeft: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingLeftTablet }px`,
			marginTop: 'linked' === attributes.marginTypeTablet ? `${ attributes.marginTablet }px` : `${ attributes.marginTopTablet }px`,
			marginBottom: 'linked' === attributes.marginTypeTablet ? `${ attributes.marginTablet }px` : `${ attributes.marginBottomTablet }px`,
			minHeight: 'custom' === attributes.columnsHeight ? `${ attributes.columnsHeightCustomTablet }px` : attributes.columnsHeight
		};
	} else if ( isMobile ) {
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

	// +-------------------------------- Template Library --------------------------------+
	const [ isLibraryOpen, setIsLibraryOpen ] = useState( false );

	if ( ! attributes.columns ) {
		return (
			<Placeholder
				label={ __( 'Section', 'otter-blocks' )  }
				instructions={ __( 'Select a layout to start with, or make one yourself.', 'otter-blocks' ) }
				className="otter-section-layout-picker"
			>
				<VariationPicker
					variations={ variations }
					onSelect={ ( nextVariation = defaultVariation ) => {
						if ( nextVariation ) {
							replaceInnerBlocks(
								clientId,
								createBlocksFromInnerBlocksTemplate(
									nextVariation.innerBlocks
								),
								true
							);
							setAttributes( nextVariation.attributes );
						}
					} }
					allowSkip
				/>
				<Tooltip text={ __( 'Open Template Library', 'otter-blocks' ) } >
					<Button
						isPrimary
						isLarge
						className="wp-block-themeisle-template-library"
						onClick={ () => setIsLibraryOpen( true ) }
					>
						<Dashicon icon="category"/>
						{ __( 'Template Library', 'otter-blocks' ) }
					</Button>

					{ isLibraryOpen && (
						<Library
							clientId={ clientId }
							close={ () => setIsLibraryOpen( false ) }
						/>
					) }
				</Tooltip>
			</Placeholder>
		);
	}

	return (
		<div>
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
				changeColumnsNumbers={ changeColumnsNumbers }
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
						orientation="horizontal"
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
		</div>
	);
};

export default Edit;
