/**
 * External dependencies
 */
import classnames from 'classnames';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button, Disabled, Dropdown, ResizableBox, SelectControl } from '@wordpress/components';

import {
	__experimentalBlockVariationPicker as VariationPicker,
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

import { createBlock, createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import PromptPlaceholder from '../../components/prompt';
import { parseFormPromptResponseToBlocks } from '../../helpers/prompt';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { chevronDown, Icon } from '@wordpress/icons';
import { insertBlockBelow } from '../../helpers/block-utility';

const { attributes: defaultAttributes } = metadata;

const PRESETS = {
	form: {
		title: __( 'AI Form generator', 'otter-blocks' )
	}
};

function formatNameBlock( name ) {
	const namePart = name.split( '/' )[1];
	return namePart.split( ' ' ).map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) ).join( ' ' );
}

/**
 * Progress Bar Block
 * @param {import('./types').ContentGeneratorProps} props
 */
const ContentGenerator = ({
	attributes,
	setAttributes,
	isSelected,
	clientId,
	toggleSelection,
	name
}) => {

	const blockProps = useBlockProps();

	const [ prompt, setPrompt ] = useState( '' );
	const [ promptActions, setPromptActions ] = useState({});
	const [ showDropdown, setShowDropdown ] = useState( false );

	const [ containerCliendId, setContainerCliendId ] = useState( '' );

	const {
		insertBlock,
		removeBlock,
		replaceInnerBlocks,
		selectBlock,
		moveBlockToPosition,
		insertBlocks
	} = useDispatch( 'core/block-editor' );

	/**
	 * On success callback
	 *
	 * @type {import('../../components/prompt').PromptOnSuccess}
	 */
	const onPreview = ( result ) => {
		if ( 'form' === attributes.generationType ) {

			const formFields = parseFormPromptResponseToBlocks( result );

			const form = createBlock( 'themeisle-blocks/form', {}, formFields );

			console.log( form );

			replaceInnerBlocks( clientId, [ form ]);
		}
	};

	const { hasInnerBlocks, containerId, getBlocks, getBlock, getBlockOrder, getBlockRootClientId } = useSelect(
		select => {

			const { getBlocks, getBlock, getBlockRootClientId, getBlockOrder } = select( 'core/block-editor' );

			const blocks = getBlocks?.( clientId ) ?? [];

			return {
				hasInnerBlocks: getBlocks?.( clientId ).length,
				containerId: blocks[0]?.clientId,
				getBlocks,
				getBlock,
				getBlockRootClientId,
				getBlockOrder
			};
		},
		[ clientId ]
	);

	const canReplaceBlock = useSelect( select => {
		const { getBlocks } = select( 'core/block-editor' );

		return ( getBlocks?.() ?? []).some( block => block.clientId === attributes.blockToReplace );
	}, [ clientId, attributes.blockToReplace ]);

	const replaceTargetBlock = () => {

		const blocksToAdd = getBlocks?.( containerId )?.map( block => {
			return createBlock( block.name, block.attributes, block.innerBlocks );
		}) ?? [];

		if ( ! blocksToAdd.length ) {
			return;
		}

		replaceInnerBlocks( attributes.blockToReplace, blocksToAdd );
	};

	const appendToTargetBlock = () => {
		const blocksToAdd = getBlocks?.( containerId )?.map( block => {
			return createBlock( block.name, block.attributes, block.innerBlocks );
		}) ?? [];

		const targetBlock = getBlock( attributes.blockToReplace );

		if ( ! blocksToAdd.length ) {
			return;
		}

		insertBlocks( blocksToAdd, targetBlock.innerBlocks?.length ?? 0, attributes.blockToReplace );
	};

	const insertNewBlockFromContainer = () => {
		const containerBlock = getBlock( containerId );
		const copy = createBlock(
			containerBlock.name,
			containerBlock.attributes,
			containerBlock.innerBlocks?.map( block => {
				return createBlock( block.name, block.attributes, block.innerBlocks );
			})
		);

		insertBlockBelow( clientId, copy );
	};

	const showActionsButton = isSelected && hasInnerBlocks;

	const { blockType, defaultVariation, variations } = useSelect(
		select => {
			const {
				getBlockVariations,
				getBlockType,
				getDefaultBlockVariation
			} = select( 'core/blocks' );

			return {
				blockType: getBlockType( name ),
				defaultVariation: getDefaultBlockVariation( name, 'block' ),
				variations: getBlockVariations( name, 'block' )
			};
		},
		[ name ]
	);

	const FormActions = (
		<Fragment>
			<Button
				variant="secondary"
				onClick={ insertNewBlockFromContainer }
			>
				{ __( 'Insert Form below', 'otter-blocks' ) }
			</Button>

			{
				canReplaceBlock && (
					<Dropdown
						renderToggle={
							({ isOpen, onToggle }) => (
								<Button
									variant="secondary"
									onClick={ () => onToggle( ! isOpen ) }
								>
									{ __( 'Remix', 'otter-blocks' )  }
									<Icon icon={chevronDown} />
								</Button>
							)
						}
						renderContent={

							({ isOpen }) => (
								<Fragment>
									{
										isOpen ? (
											<Fragment>
												<Button
													variant="tertiary"
													onClick={ replaceTargetBlock }
												>
													{ __( 'Replace current Form', 'otter-blocks' )  }
												</Button>
												<Button
													variant="tertiary"
													onClick={ appendToTargetBlock }
												>
													{ __( 'Append generated fields', 'otter-blocks' )  }
												</Button>
											</Fragment>
										) : ''
									}

								</Fragment>
							)
						}
					/>
				)
			}


		</Fragment>
	);

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>

				{
					attributes.generationType === undefined ? (
						<VariationPicker
							icon={ get( blockType, [ 'icon', 'src' ]) }
							label={ get( blockType, [ 'title' ]) }
							variations={ variations }
							onSelect={ ( nextVariation = defaultVariation ) => {
								if ( nextVariation ) {
									setAttributes( nextVariation.attributes );
								}
								selectBlock( clientId );
							} }
							allowSkip
						/>
					) : (
						<PromptPlaceholder
							promptName={attributes.generationType}
							title={PRESETS?.[attributes.generationType]?.title}
							mainActionLabel={ '' }
							value={prompt}
							onValueChange={setPrompt}
							onMainAction={ replaceTargetBlock }
							onPreview={onPreview}
							actionButtons={FormActions}
							onClose={() => removeBlock( clientId )}
						>
							{
								hasInnerBlocks ? (
									<Disabled>
										<InnerBlocks renderAppender={false}/>
									</Disabled>
								) : ''
							}
						</PromptPlaceholder>
					)
				}
			</div>
		</Fragment>
	);
};

export default ContentGenerator;
