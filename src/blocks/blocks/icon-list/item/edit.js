/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

import {
	BlockControls,
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import { ToolbarButton } from '@wordpress/components';

import { createBlock } from '@wordpress/blocks';

import { dispatch, select, useDispatch, useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import { formatListBullets } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import themeIsleIcons from './../../../helpers/themeisle-icons.js';
import { blockInit } from '../../../helpers/block-utility.js';
import BlockAppender from '../../../components/block-appender-button';
import { getSubListAttributes } from '../sublist.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Icon List Item component
 * @param {import('./types').IconListItemProps} props
 * @return
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	isSelected,
	onReplace,
	onRemove,
	mergeBlocks
}) => {

	const [ isURL, setIsUrl ] = useState( false );

	const { insertBlock } = useDispatch( 'core/block-editor' );

	const {
		hasParent,
		parentAttributes,
		innerBlockCount
	} = useSelect( select => {
		const {
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );

		const parentClientId = getBlockRootClientId( clientId );
		const parentBlock = getBlock( parentClientId );

		return {
			hasParent: parentBlock ? true : false,
			parentAttributes: parentBlock ? parentBlock.attributes : {},
			innerBlockCount: getBlock( clientId )?.innerBlocks.length ?? 0
		};
	}, []);

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	useEffect( () => {
		setAttributes({
			library: attributes.library || parentAttributes.defaultLibrary,
			icon: attributes.icon || parentAttributes.defaultIcon,
			iconPrefix: attributes.iconPrefix || parentAttributes.defaultPrefix,

			// The alt belongs to the image: inherit it only while the icon itself is inherited, so a cleared (decorative) item alt stays cleared.
			iconAlt: attributes.icon ? attributes.iconAlt : parentAttributes.defaultIconAlt
		});
	}, [ hasParent, parentAttributes, attributes ]);

	useEffect( () => {
		if ( 'image' === attributes.library ) {
			try {
				const imageURL = new URL( attributes.icon );

				if (  'http:' === imageURL?.protocol || 'https:' === imageURL?.protocol ) {
					setIsUrl( true );
				}
			} catch ( _ ) {
				setIsUrl( false );
			}
		}
	}, [ attributes.library, attributes.icon ]);

	useEffect( () => {
		if ( attributes.content === undefined ) {
			// The direct parent list, so items added inside a sub-list are numbered within it.
			const parentClientId = select( 'core/block-editor' ).getBlockRootClientId( clientId );
			const parentBlock = select( 'core/block-editor' ).getBlock( parentClientId );

			// translators: %d: the number of List item blocks.
			setAttributes({ content: sprintf( __( 'List item %d', 'otter-blocks' ), parentBlock.innerBlocks.length ) });
		}
	}, []);

	const Icon = themeIsleIcons.icons[ attributes.icon ];

	const iconClassName = `${ attributes.iconPrefix || parentAttributes.defaultPrefix } fa-${ attributes.icon || parentAttributes.defaultIcon }`;

	const hasSubList = 0 < innerBlockCount;

	const addSubList = () => {
		insertBlock( createBlock( 'themeisle-blocks/icon-list', getSubListAttributes( parentAttributes ) ), innerBlockCount, clientId );
	};

	// Backspace merging into the previous item would drop this item's sub-list,
	// because core only merges attributes. Move it over beforehand instead.
	const handleMerge = ( forward ) => {
		if ( ! forward && hasSubList ) {
			const { getBlock, getBlockRootClientId, getPreviousBlockClientId } = select( 'core/block-editor' );
			const previousClientId = getPreviousBlockClientId( clientId );

			if ( previousClientId ) {
				const innerClientIds = getBlock( clientId ).innerBlocks.map( ( { clientId: innerId } ) => innerId );
				dispatch( 'core/block-editor' ).moveBlocksToPosition( innerClientIds, clientId, previousClientId );

				// Cancel the merge when a lock kept the sub-list from moving, so it is not deleted with the item.
				const moved = innerClientIds.every( ( innerId ) => previousClientId === getBlockRootClientId( innerId ) );

				if ( ! moved ) {
					return;
				}
			}
		}

		mergeBlocks( forward );
	};

	const inlineStyles = {
		'--content-color': attributes.contentColor ?? parentAttributes.defaultContentColor,
		'--icon-color': attributes.iconColor ?? parentAttributes.defaultIconColor
	};

	const blockProps = useBlockProps({
		style: inlineStyles,
		className: hasSubList ? 'has-sublist' : undefined
	});

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<BlockControls group="block">
				{ ! hasSubList && (
					<ToolbarButton
						icon={ formatListBullets }
						label={ __( 'Add Sub-list', 'otter-blocks' ) }
						onClick={ addSubList }
					/>
				) }
			</BlockControls>

			<div { ...blockProps }>
				{ 'image' === attributes.library && isURL ? (
					<img src={ attributes.icon } alt={ attributes.iconAlt || '' } />
				) : (
					'themeisle-icons' === attributes.library && attributes.icon && Icon !== undefined ? (
						<Icon
							className={ classnames(
								{ 'wp-block-themeisle-blocks-icon-list-item-icon': ! attributes.iconColor },
								{ 'wp-block-themeisle-blocks-icon-list-item-icon-custom': attributes.iconColor }
							) }
						/>
					) : (
						<i
							className={ classnames(
								iconClassName,
								{ 'wp-block-themeisle-blocks-icon-list-item-icon': ! attributes.iconColor },
								{ 'wp-block-themeisle-blocks-icon-list-item-icon-custom': attributes.iconColor }
							) }
						></i>
					)
				) }

				<RichText
					identifier="content"
					tagName="p"
					className={ classnames(
						{ 'wp-block-themeisle-blocks-icon-list-item-content': ! attributes.contentColor },
						{ 'wp-block-themeisle-blocks-icon-list-item-content-custom': attributes.contentColor }
					) }
					value={ attributes.content }
					onChange={ ( content ) => setAttributes({ content }) }
					onMerge={ mergeBlocks ? handleMerge : undefined }
					onReplace={ onReplace }
					onRemove={ onRemove }
				/>

				<InnerBlocks
					allowedBlocks={ [ 'themeisle-blocks/icon-list' ] }
					renderAppender={ false }
				/>

				{ isSelected && ! hasSubList && (
					<BlockAppender
						buttonText={ __( 'Add Sub-list', 'otter-blocks' ) }
						variant="link"
						allowedBlock="themeisle-blocks/icon-list"
						attributes={ getSubListAttributes( parentAttributes ) }
						clientId={ clientId }
					/>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
