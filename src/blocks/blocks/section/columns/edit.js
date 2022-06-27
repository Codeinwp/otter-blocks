/**
 * External dependencies
 */
import classnames from 'classnames';
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	times,
	isEmpty
} from 'lodash';

import {
	createBlock,
	createBlocksFromInnerBlocksTemplate
} from '@wordpress/blocks';

import {
	__experimentalBlockVariationPicker as VariationPicker,
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

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
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import layouts from '../layouts.js';
import Controls from './controls.js';
import Inspector from './inspector.js';
import Separators from '../components/separators/index.js';
import {
	blockInit,
	getDefaultValueByField
} from '../../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

/**
 *
 * @param {import('./types').SectionProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
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

		return {
			sectionBlock: getBlock( clientId ),
			children: getBlock( clientId )?.innerBlocks || [],
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

			if ( 6 >= children.length ) {
				updateColumnsWidth( children.length, 'equal' );
			} else if ( 6 < children.length ) {
				updateColumnsWidth( 6, 'equal' );
			} else if ( 1 >= children.length ) {
				updateColumnsWidth( 1, 'equal' );
			}

			setAttributes({
				columns: children.length
			});
		}
	}, [ children ]);

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

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
			paddingTop: getValue( 'padding' ) && getValue( 'padding' ).top,
			paddingRight: getValue( 'padding' ) && getValue( 'padding' ).right,
			paddingBottom: getValue( 'padding' ) && getValue( 'padding' ).bottom,
			paddingLeft: getValue( 'padding' ) && getValue( 'padding' ).left,
			marginTop: getValue( 'margin' ) && getValue( 'margin' ).top,
			marginBottom: getValue( 'margin' ) && getValue( 'margin' ).bottom,
			minHeight: 'custom' === attributes.columnsHeight ? `${ attributes.columnsHeightCustom }px` : attributes.columnsHeight
		};
	}

	if ( isTablet ) {
		stylesheet = {
			paddingTop: getValue( 'paddingTablet' )?.top,
			paddingRight: getValue( 'paddingTablet' )?.right,
			paddingBottom: getValue( 'paddingTablet' )?.bottom,
			paddingLeft: getValue( 'paddingTablet' )?.left,
			marginTop: getValue( 'marginTablet' )?.top,
			marginBottom: getValue( 'marginTablet' )?.bottom,
			minHeight: 'custom' === attributes.columnsHeight ? `${ attributes.columnsHeightCustomTablet }px` : attributes.columnsHeight
		};
	}

	if ( isMobile ) {
		stylesheet = {
			paddingTop: getValue( 'paddingMobile' )?.top,
			paddingRight: getValue( 'paddingMobile' )?.right,
			paddingBottom: getValue( 'paddingMobile' )?.bottom,
			paddingLeft: getValue( 'paddingMobile' )?.left,
			marginTop: getValue( 'marginMobile' )?.top,
			marginBottom: getValue( 'marginMobile' )?.bottom,
			minHeight: 'custom' === attributes.columnsHeight ? `${ attributes.columnsHeightCustomMobile }px` : attributes.columnsHeight
		};
	}

	if ( 'color' === attributes.backgroundType ) {
		background = {
			backgroundColor: attributes.backgroundColor
		};
	}

	if ( 'image' === attributes.backgroundType ) {
		background = {
			backgroundImage: `url( '${ attributes.backgroundImage?.url }' )`,
			backgroundAttachment: attributes.backgroundAttachment,
			backgroundPosition: `${ Math.round( attributes.backgroundPosition?.x * 100 ) }% ${ Math.round( attributes.backgroundPosition?.y * 100 ) }%`,
			backgroundRepeat: attributes.backgroundRepeat,
			backgroundSize: attributes.backgroundSize
		};
	}

	if ( 'gradient' === attributes.backgroundType ) {
		background = {
			backgroundImage: attributes.backgroundGradient
		};
	}

	if ( attributes.border && ! isEmpty( attributes.border ) ) {
		borderStyle = {
			borderTopWidth: attributes.border.top,
			borderRightWidth: attributes.border.right,
			borderBottomWidth: attributes.border.bottom,
			borderLeftWidth: attributes.border.left,
			borderStyle: 'solid',
			borderColor: attributes.borderColor
		};
	}

	if ( attributes.borderRadius && ! isEmpty( attributes.borderRadius ) ) {
		borderRadiusStyle = {
			borderTopLeftRadius: attributes.borderRadius.top,
			borderTopRightRadius: attributes.borderRadius.right,
			borderBottomRightRadius: attributes.borderRadius.bottom,
			borderBottomLeftRadius: attributes.borderRadius.left
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
			backgroundImage: `url( '${ attributes.backgroundOverlayImage?.url }' )`,
			backgroundAttachment: attributes.backgroundOverlayAttachment,
			backgroundPosition: `${ Math.round( attributes.backgroundOverlayPosition?.x * 100 ) }% ${ Math.round( attributes.backgroundOverlayPosition?.y * 100 ) }%`,
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
		`has-${ attributes.columns }-columns`,
		`has-desktop-${ attributes.layout }-layout`,
		`has-tablet-${ attributes.layoutTablet }-layout`,
		`has-mobile-${ attributes.layoutMobile }-layout`,
		`has-vertical-${ attributes.verticalAlign }`,
		`has-horizontal-${ attributes.horizontalAlign }`,
		{ 'has-reverse-columns-tablet': ( attributes.reverseColumnsTablet && ! attributes.hideTablet && 'collapsedRows' === attributes.layoutTablet ) },
		{ 'has-reverse-columns-mobile': ( attributes.reverseColumnsMobile && ! attributes.hideMobile && 'collapsedRows' === attributes.layoutMobile ) },
		{ 'has-viewport-desktop': isDesktop },
		{ 'has-viewport-tablet': isTablet },
		{ 'has-viewport-mobile': isMobile }
	);

	const blockProps = attributes.columns ? useBlockProps({
		id: attributes.id,
		className: classes,
		style
	}) : useBlockProps();

	if ( ! attributes.columns ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					label={ __( 'Section', 'otter-blocks' )  }
					instructions={ __( 'Select a layout to start with, or make one yourself.', 'otter-blocks' ) }
					className="o-section-layout-picker"
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
				</Placeholder>
			</div>
		);
	}

	return (
		<Fragment>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				getValue={ getValue }
				updateColumnsWidth={ updateColumnsWidth }
				dividerViewType={ dividerViewType }
				setDividerViewType={ setDividerViewType }
				changeColumnsNumbers={ changeColumnsNumbers }
			/>

			<Tag { ...blockProps }>
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
		</Fragment>
	);
};

export default Edit;
