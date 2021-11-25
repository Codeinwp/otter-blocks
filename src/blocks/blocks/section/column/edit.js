/**
 * External dependencies
 */
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies
 */
import { isEmpty } from 'lodash';

import { ResizableBox } from '@wordpress/components';

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
import Inspector from './inspector.js';
import { blockInit } from '../../../helpers/block-utility.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	isSelected,
	clientId,
	toggleSelection
}) => {
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	const {
		adjacentBlockClientId,
		adjacentBlock,
		parentClientId,
		parentBlock,
		hasInnerBlocks,
		isViewportAvailable,
		isPreviewDesktop,
		isPreviewTablet,
		isPreviewMobile
	} = useSelect( select => {
		const {
			getAdjacentBlockClientId,
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const block = getBlock( clientId );
		const adjacentBlockClientId = getAdjacentBlockClientId( clientId );
		const adjacentBlock = getBlock( adjacentBlockClientId );
		const parentClientId = getBlockRootClientId( clientId );
		const parentBlock = getBlock( parentClientId );
		const hasInnerBlocks = !! ( block && block.innerBlocks.length );

		return {
			adjacentBlockClientId,
			adjacentBlock,
			parentClientId,
			parentBlock,
			hasInnerBlocks,
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

	useEffect( () => {
		updateWidth();
	}, [ attributes.columnWidth ]);


	const [ currentWidth, setCurrentWidth ] = useState( 0 );
	const [ nextWidth, setNextWidth ] = useState( 0 );

	let isDesktop = isLarger && ! isLarge && isSmall && ! isSmaller;

	let isTablet = ! isLarger && ! isLarge && isSmall && ! isSmaller;

	let isMobile = ! isLarger && ! isLarge && ! isSmall && ! isSmaller;

	if ( isViewportAvailable && ! isMobile ) {
		isDesktop = isPreviewDesktop;
		isTablet = isPreviewTablet;
		isMobile = isPreviewMobile;
	}

	if ( attributes.columnWidth === undefined ) {
		( parentBlock.innerBlocks ).map( ( innerBlock, i ) => {
			if ( clientId === innerBlock.clientId ) {
				const columns = parentBlock.attributes.columns;
				const layout = parentBlock.attributes.layout;
				updateBlockAttributes( clientId, {
					columnWidth: layouts[columns][layout][i]
				});
			}
		});
	}

	const updateWidth = () => {
		const columnContainer = document.getElementById( `block-${ clientId }` );

		if ( null !== columnContainer ) {
			if ( isDesktop ) {
				columnContainer.style.flexBasis = `${ attributes.columnWidth }%`;
			} else {
				columnContainer.style.flexBasis = '';
			}
		}
	};

	const onResizeStart = () => {
		const handle = document.querySelector( `#block-${ clientId } .wp-themeisle-block-advanced-column-resize-container-handle .components-resizable-box__handle` );
		const handleTooltipLeft = document.createElement( 'div' );
		const handleTooltipRight = document.createElement( 'div' );

		handleTooltipLeft.setAttribute( 'class', 'resizable-tooltip resizable-tooltip-left' );
		handleTooltipLeft.innerHTML = `${ parseFloat( attributes.columnWidth ).toFixed( 0 ) }%`;
		handle.appendChild( handleTooltipLeft );
		handleTooltipRight.setAttribute( 'class', 'resizable-tooltip resizable-tooltip-right' );
		handleTooltipRight.innerHTML = `${ parseFloat( adjacentBlock.attributes.columnWidth ).toFixed( 0 ) }%`;
		handle.appendChild( handleTooltipRight );

		setCurrentWidth( attributes.columnWidth );
		setNextWidth( adjacentBlock.attributes.columnWidth );
		toggleSelection( false );
	};

	const onResize = ( event, direction, elt, delta ) => {
		const parent = document.getElementById( `block-${ parentClientId }` );
		const parentWidth = parent.getBoundingClientRect().width;
		const changedWidth = ( delta.width / parentWidth ) * 100;
		const width = parseFloat( currentWidth ) + changedWidth;
		const nextColumnWidth = nextWidth - changedWidth;
		const handleTooltipLeft = document.querySelector( '.resizable-tooltip-left' );
		const handleTooltipRight = document.querySelector( '.resizable-tooltip-right' );

		if ( 10 <= width && 10 <= nextColumnWidth ) {
			handleTooltipLeft.innerHTML = `${ width.toFixed( 0 ) }%`;
			handleTooltipRight.innerHTML = `${ nextColumnWidth.toFixed( 0 ) }%`;

			setAttributes({ columnWidth: width.toFixed( 2 ) });
			updateBlockAttributes( adjacentBlockClientId, {
				columnWidth: nextColumnWidth.toFixed( 2 )
			});
		}
	};

	const onResizeStop = () => {
		const handleTooltipLeft = document.querySelector( '.resizable-tooltip-left' );
		const handleTooltipRight = document.querySelector( '.resizable-tooltip-right' );

		handleTooltipLeft.parentNode.removeChild( handleTooltipLeft );
		handleTooltipRight.parentNode.removeChild( handleTooltipRight );
		toggleSelection( true );
	};

	const Tag = attributes.columnsHTMLTag;

	let stylesheet, background, borderStyle, borderRadiusStyle, boxShadowStyle;

	if ( isDesktop ) {
		stylesheet = {
			paddingTop: attributes.padding && attributes.padding.top,
			paddingRight: attributes.padding && attributes.padding.right,
			paddingBottom: attributes.padding && attributes.padding.bottom,
			paddingLeft: attributes.padding && attributes.padding.left,
			marginTop: attributes.margin && attributes.margin.top,
			marginRight: attributes.margin && attributes.margin.right,
			marginBottom: attributes.margin && attributes.margin.bottom,
			marginLeft: attributes.margin && attributes.margin.left
		};
	}

	if ( isTablet ) {
		stylesheet = {
			paddingTop: attributes.paddingTablet && attributes.paddingTablet.top,
			paddingRight: attributes.paddingTablet && attributes.paddingTablet.right,
			paddingBottom: attributes.paddingTablet && attributes.paddingTablet.bottom,
			paddingLeft: attributes.paddingTablet && attributes.paddingTablet.left,
			marginTop: attributes.marginTablet && attributes.marginTablet.top,
			marginRight: attributes.marginTablet && attributes.marginTablet.right,
			marginBottom: attributes.marginTablet && attributes.marginTablet.bottom,
			marginLeft: attributes.marginTablet && attributes.marginTablet.left
		};
	}

	if ( isMobile ) {
		stylesheet = {
			paddingTop: attributes.paddingMobile && attributes.paddingMobile.top,
			paddingRight: attributes.paddingMobile && attributes.paddingMobile.right,
			paddingBottom: attributes.paddingMobile && attributes.paddingMobile.bottom,
			paddingLeft: attributes.paddingMobile && attributes.paddingMobile.left,
			marginTop: attributes.marginMobile && attributes.marginMobile.top,
			marginRight: attributes.marginMobile && attributes.marginMobile.right,
			marginBottom: attributes.marginMobile && attributes.marginMobile.bottom,
			marginLeft: attributes.marginMobile && attributes.marginMobile.left
		};
	}

	if ( 'color' === attributes.backgroundType ) {
		background = {
			background: attributes.backgroundColor
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
			background: attributes.backgroundGradient
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

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				isSelected={ isSelected }
				clientId={ clientId }
				adjacentBlock={ adjacentBlock }
				parentBlock={ parentBlock }
				updateBlockAttributes={ updateBlockAttributes }
				adjacentBlockClientId={ adjacentBlockClientId }
			/>

			<ResizableBox
				className="block-library-spacer__resize-container wp-themeisle-block-advanced-column-resize-container"
				enable={ {
					right: adjacentBlockClientId ? true : false
				} }
				handleWrapperClass="wp-themeisle-block-advanced-column-resize-container-handle"
				onResizeStart={ onResizeStart }
				onResize={ onResize }
				onResizeStop={ onResizeStop }
			>
				<Tag
					className={ className }
					id={ attributes.id }
					style={ style }
				>
					<InnerBlocks
						templateLock={ false }
						renderAppender={ ! hasInnerBlocks && InnerBlocks.ButtonBlockAppender }
					/>
				</Tag>
			</ResizableBox>
		</Fragment>
	);
};

export default Edit;
