/**
 * External dependencies
 */
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies
 */
import { isEmpty, merge, pickBy } from 'lodash';

import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import { useViewportMatch } from '@wordpress/compose';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useRef
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import layouts from '../layouts.js';
import Inspector from './inspector.js';
import {
	blockInit,
	getDefaultValueByField
} from '../../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Section Column component
 * @param {import('./types').SectionColumnProps} props
 * @returns
 */
const Edit = ({
	name,
	attributes,
	setAttributes,
	isSelected,
	clientId
}) => {
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	const {
		adjacentBlockClientId,
		adjacentBlock,
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

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	let isDesktop = isLarger && ! isLarge && isSmall && ! isSmaller;

	let isTablet = ! isLarger && ! isLarge && isSmall && ! isSmaller;

	let isMobile = ! isLarger && ! isLarge && ! isSmall && ! isSmaller;

	if ( isViewportAvailable && ! isMobile ) {
		isDesktop = isPreviewDesktop;
		isTablet = isPreviewTablet;
		isMobile = isPreviewMobile;
	}

	if ( attributes.columnWidth === undefined ) {
		const index = parentBlock.innerBlocks.findIndex( i => i.clientId === clientId );
		const columns = parentBlock.attributes.columns;
		const layout = parentBlock.attributes.layout;
		updateBlockAttributes( clientId, {
			columnWidth: layouts[columns][layout][index]
		});
	}

	const Tag = attributes.columnsHTMLTag;

	let background, borderStyle, borderRadiusStyle, boxShadowStyle;


	let	stylesheet = {
		paddingTop: getValue( 'padding' )?.top,
		paddingRight: getValue( 'padding' )?.right,
		paddingBottom: getValue( 'padding' )?.bottom,
		paddingLeft: getValue( 'padding' )?.left,
		marginTop: getValue( 'margin' )?.top,
		marginRight: getValue( 'margin' )?.right,
		marginBottom: getValue( 'margin' )?.bottom,
		marginLeft: getValue( 'margin' )?.left
	};


	if ( isTablet ) {
		const tabletStyle = pickBy({
			paddingTop: getValue( 'paddingTablet' )?.top,
			paddingRight: getValue( 'paddingTablet' )?.right,
			paddingBottom: getValue( 'paddingTablet' )?.bottom,
			paddingLeft: getValue( 'paddingTablet' )?.left,
			marginTop: getValue( 'marginTablet' )?.top,
			marginRight: getValue( 'marginTablet' )?.right,
			marginBottom: getValue( 'marginTablet' )?.bottom,
			marginLeft: getValue( 'marginTablet' )?.left
		}, ( value ) => value );
		stylesheet = merge( stylesheet, tabletStyle );
	}

	if ( isMobile ) {
		const mobileStyle = pickBy({
			paddingTop: getValue( 'paddingMobile' )?.top,
			paddingRight: getValue( 'paddingMobile' )?.right,
			paddingBottom: getValue( 'paddingMobile' )?.bottom,
			paddingLeft: getValue( 'paddingMobile' )?.left,
			marginTop: getValue( 'marginMobile' )?.top,
			marginRight: getValue( 'marginMobile' )?.right,
			marginBottom: getValue( 'marginMobile' )?.bottom,
			marginLeft: getValue( 'marginMobile' )?.left
		}, ( value ) => value );
		stylesheet = merge( stylesheet, mobileStyle );
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
		flexBasis: `${ attributes.columnWidth }%`,
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
				getValue={ getValue }
				parentBlock={ parentBlock }
				updateBlockAttributes={ updateBlockAttributes }
				currentBlockWidth={ currentBlockWidth }
				nextBlock={ nextBlock }
				nextBlockWidth={ nextBlockWidth }
			/>

			<Tag { ...blockProps }>
				<InnerBlocks
					templateLock={ false }
					renderAppender={ ! hasInnerBlocks && InnerBlocks.ButtonBlockAppender }
				/>
			</Tag>
		</Fragment>
	);
};

export default Edit;
