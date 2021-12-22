/**
 * External dependencies
 */
import classnames from 'classnames';

import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import { ResizableBox } from '@wordpress/components';

import { useViewportMatch } from '@wordpress/compose';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useRef,
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
		isPreviewDesktop,
		isPreviewTablet,
		isPreviewMobile
	} = useSelect( select => {
		const {
			getAdjacentBlockClientId,
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' );
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
			isPreviewDesktop: 'Desktop' === __experimentalGetPreviewDeviceType(),
			isPreviewTablet: 'Tablet' === __experimentalGetPreviewDeviceType(),
			isPreviewMobile: 'Mobile' === __experimentalGetPreviewDeviceType()
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
		if ( 1 < parentBlock.innerBlocks.length ) {
			if ( ! adjacentBlockClientId ) {
				const blockId = parentBlock.innerBlocks.findIndex( e => e.clientId === clientId );
				const previousBlock = parentBlock.innerBlocks[ blockId - 1 ];
				nextBlock.current = previousBlock.clientId;
				nextBlockWidth.current = previousBlock.attributes.columnWidth;
			}
		}
	}, []);

	useEffect( () => {
		if ( 1 < parentBlock.innerBlocks.length ) {
			if ( ! adjacentBlockClientId ) {
				const blockId = parentBlock.innerBlocks.findIndex( e => e.clientId === clientId );
				const previousBlock = parentBlock.innerBlocks[ blockId - 1 ];
				nextBlockWidth.current = previousBlock.attributes.columnWidth;
				nextBlock.current = previousBlock.clientId;
				currentBlockWidth.current = attributes.columnWidth;
			} else {
				nextBlockWidth.current = adjacentBlock.attributes.columnWidth;
				nextBlock.current = adjacentBlockClientId;
				currentBlockWidth.current = attributes.columnWidth;
			}
		}
	}, [ isSelected, attributes.columnWidth, parentBlock.innerBlocks.length ]);

	const currentBlockWidth = useRef( attributes.columnWidth );
	const nextBlock = useRef( adjacentBlockClientId && adjacentBlockClientId );
	const nextBlockWidth = useRef( adjacentBlock && adjacentBlock.attributes.columnWidth );

	const [ currentWidth, setCurrentWidth ] = useState( 0 );
	const [ nextWidth, setNextWidth ] = useState( 0 );
	const [ hasSelected, setSelected ] = useState( false );
	const [ responsiveSize, setResponsiveSize ] = useState( attributes.columnWidth );

	const resizerRef = useRef();

	let isDesktop = isLarger && ! isLarge && isSmall && ! isSmaller;

	let isTablet = ! isLarger && ! isLarge && isSmall && ! isSmaller;

	let isMobile = ! isLarger && ! isLarge && ! isSmall && ! isSmaller;

	if ( ! isMobile ) {
		isDesktop = isPreviewDesktop;
		isTablet = isPreviewTablet;
		isMobile = isPreviewMobile;
	}

	useEffect( () => {
		if ( isDesktop ) {
			resizerRef.current.updateSize({ width: `${ attributes.columnWidth }%` });
		}
	}, [ isDesktop, attributes.columnWidth ]);

	useEffect( () => {
		if ( isTablet || isMobile ) {
			const columns = parentBlock.attributes.columns;
			let layout = parentBlock.attributes.layoutTablet || 'equal';

			if ( isMobile ) {
				layout = parentBlock.attributes.layoutMobile || 'equal';
			}

			const index = parentBlock.innerBlocks.findIndex( i => i.clientId === clientId );
			setResponsiveSize( `${ layouts[columns][layout][index] }%` );
		}
	}, [ isTablet, isMobile, parentBlock.attributes.columns, parentBlock.attributes.layoutTablet, parentBlock.attributes.layoutMobile ]);

	if ( attributes.columnWidth === undefined ) {
		const index = parentBlock.innerBlocks.findIndex( i => i.clientId === clientId );
		const columns = parentBlock.attributes.columns;
		const layout = parentBlock.attributes.layout;
		updateBlockAttributes( clientId, {
			columnWidth: layouts[columns][layout][index]
		});
	}

	const onResizeStart = () => {
		const handle = document.querySelector( `.wp-themeisle-block-advanced-column-resize-container-${ clientId } .components-resizable-box__handle` );
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
		setSelected( true );
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
		setSelected( false );
	};

	const Tag = attributes.columnsHTMLTag;

	let stylesheet, background, borderStyle, borderRadiusStyle, boxShadowStyle;

	if ( isDesktop ) {
		stylesheet = {
			paddingTop: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingTop }px`,
			paddingRight: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingRight }px`,
			paddingBottom: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingBottom }px`,
			paddingLeft: 'linked' === attributes.paddingType ? `${ attributes.padding }px` : `${ attributes.paddingLeft }px`,
			marginTop: 'linked' === attributes.marginType ? `${ attributes.margin }px` : `${ attributes.marginTop }px`,
			marginRight: 'linked' === attributes.marginType ? `${ attributes.margin }px` : `${ attributes.marginRight }px`,
			marginBottom: 'linked' === attributes.marginType ? `${ attributes.margin }px` : `${ attributes.marginBottom }px`,
			marginLeft: 'linked' === attributes.marginType ? `${ attributes.margin }px` : `${ attributes.marginLeft }px`
		};
	}

	if ( isTablet ) {
		stylesheet = {
			paddingTop: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingTopTablet }px`,
			paddingRight: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingRightTablet }px`,
			paddingBottom: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingBottomTablet }px`,
			paddingLeft: 'linked' === attributes.paddingTypeTablet ? `${ attributes.paddingTablet }px` : `${ attributes.paddingLeftTablet }px`,
			marginTop: 'linked' === attributes.marginTypeTablet ? `${ attributes.marginTablet }px` : `${ attributes.marginTopTablet }px`,
			marginRight: 'linked' === attributes.marginTypeTablet ? `${ attributes.marginTablet }px` : `${ attributes.marginRightTablet }px`,
			marginBottom: 'linked' === attributes.marginTypeTablet ? `${ attributes.marginTablet }px` : `${ attributes.marginBottomTablet }px`,
			marginLeft: 'linked' === attributes.marginTypeTablet ? `${ attributes.marginTablet }px` : `${ attributes.marginLeftTablet }px`
		};
	}

	if ( isMobile ) {
		stylesheet = {
			paddingTop: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingTopMobile }px`,
			paddingRight: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingRightMobile }px`,
			paddingBottom: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingBottomMobile }px`,
			paddingLeft: 'linked' === attributes.paddingTypeMobile ? `${ attributes.paddingMobile }px` : `${ attributes.paddingLeftMobile }px`,
			marginTop: 'linked' === attributes.marginTypeMobile ? `${ attributes.marginMobile }px` : `${ attributes.marginTopMobile }px`,
			marginRight: 'linked' === attributes.marginTypeMobile ? `${ attributes.marginMobile }px` : `${ attributes.marginRightMobile }px`,
			marginBottom: 'linked' === attributes.marginTypeMobile ? `${ attributes.marginMobile }px` : `${ attributes.marginBottomMobile }px`,
			marginLeft: 'linked' === attributes.marginTypeMobile ? `${ attributes.marginMobile }px` : `${ attributes.marginLeftMobile }px`
		};
	}

	if ( 'color' === attributes.backgroundType ) {
		background = {
			backgroundColor: attributes.backgroundColor
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
			backgroundImage: attributes.backgroundGradient
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

	const blockProps = useBlockProps({
		id: attributes.id,
		style
	});

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				parentBlock={ parentBlock }
				updateBlockAttributes={ updateBlockAttributes }
				currentBlockWidth={ currentBlockWidth }
				nextBlock={ nextBlock }
				nextBlockWidth={ nextBlockWidth }
			/>

			<ResizableBox
				ref={ resizerRef }
				className={ classnames(
					`wp-themeisle-block-advanced-column-resize-container wp-themeisle-block-advanced-column-resize-container-${ clientId }`,
					{
						'is-selected': hasSelected
					}
				) }
				enable={ {
					right: adjacentBlockClientId ? true : false
				} }
				handleWrapperClass="wp-themeisle-block-advanced-column-resize-container-handle"
				onResizeStart={ onResizeStart }
				onResize={ onResize }
				onResizeStop={ onResizeStop }
				minWidth="10%"

				{ ... ( isDesktop && 1 < parentBlock.attributes.columns ) ? {
					maxWidth: `${ ( Number( attributes.columnWidth ) + Number( nextBlockWidth.current ) ) - 10 }%`
				} : {} }

				{ ... ( isTablet || isMobile ) ? {
					size: {
						width: responsiveSize
					}
				} : {} }
			>
				<Tag { ...blockProps }>
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
