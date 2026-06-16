/**
 * External dependencies
 */
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

import { createBlock, rawHandler } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import Inspector from './inspector.js';
import PromptPlaceholder from '../../components/prompt';
import { parseFormPromptResponseToBlocks, tryParseResponse } from '../../helpers/prompt';
import { useDispatch, useSelect, dispatch, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { insertBlockBelow, pullOtterPatterns } from '../../helpers/block-utility';

function formatNameBlock( name ) {
	const namePart = name.split( '/' )[1];
	return namePart.split( ' ' ).map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) ).join( ' ' );
}

/**
 * Allowlist the prompt preset id so an arbitrary string can never reach the tracking wire.
 *
 * @param {string|undefined} promptID The preset id in scope.
 * @return {string} A known preset slug, or 'other'.
 */
const allowedPromptID = ( promptID ) => {
	return [ 'form', 'textTransformation', 'patternsPicker' ].includes( promptID ) ? promptID : 'other';
};

/**
 * AI Block
 * @param {import('./types').ContentGeneratorProps} props
 */
const ContentGenerator = ({
	attributes,
	setAttributes,
	clientId,
	name
}) => {

	const blockProps = useBlockProps();

	const [ prompt, setPrompt ] = useState( '' );

	// Dedup key for the AI outcome tracking sets (never sent as a value).
	const trackingKey = attributes?.id ?? clientId;

	const hasAccepted = useRef( false );
	const hasOutput = useRef( false );
	const attributesRef = useRef( attributes );
	attributesRef.current = attributes;

	const {
		removeBlock,
		replaceInnerBlocks,
		selectBlock,
		replaceBlocks
	} = useDispatch( 'core/block-editor' );

	/**
	 * On success callback
	 *
	 * @type {import('../../components/prompt').PromptOnSuccess}
	 */
	const onPreview = ( result ) => {
		if ( 'form' === attributes.promptID ) {

			const formFields = parseFormPromptResponseToBlocks( result );

			const form = createBlock( 'themeisle-blocks/form', {}, formFields );

			replaceInnerBlocks( clientId, [ form ]);
		}

		if ( 'textTransformation' === attributes.promptID ) {
			const blocks = rawHandler({
				HTML: result
			});

			replaceInnerBlocks( clientId, blocks );
		}

		if ( 'patternsPicker' === attributes.promptID ) {
			const r = tryParseResponse( result ) ?? {};
			const content = pullOtterPatterns()
				.filter( pattern => {
					return r?.slugs?.some( test => pattern.name.endsWith( test ) );
				})
				.map( pattern => pattern?.content )
				.filter( Boolean )
				.join( '\n' );

			if ( ! content ) {
				dispatch( 'core/notices' )?.createNotice(
					'info',
					__( 'No patterns found for your query.', 'otter-blocks' ),
					{
						type: 'snackbar',
						isDismissible: true,
						id: 'o-no-patterns'
					}
				);
			}

			const blocks = rawHandler({
				HTML: content
			});

			replaceInnerBlocks( clientId, blocks );
		}
	};

	const { hasInnerBlocks, getBlock, getBlocks } = useSelect(
		select => {

			const { getBlock, getBlocks } = select( 'core/block-editor' );

			return {
				hasInnerBlocks: getBlocks?.( clientId ).length,
				getBlocks,
				getBlock
			};
		},
		[ clientId ]
	);

	/**
	 * Create a copy of the block and its inner blocks.
	 *
	 * When destroying the block, the original inner blocks are also destroyed, thus we need to make a copy of them when transferring them to another block.
	 *
	 * @param {import('../../helpers/blocks.js').BlockProps<unknown>} block The block to copy.
	 * @return {import('../../helpers/blocks.js').BlockProps<unknown>|void} The copied block.
	 */
	const makeBlockCopy = ( block ) => {
		if ( undefined === block ) {
			return;
		}
		return createBlock( block.name, block.attributes, block?.innerBlocks?.filter( b => b?.name && b?.attributes )?.map( makeBlockCopy ) );
	};

	/**
	 * Replace the block with the blocks generated from the prompt response
	 */
	const replaceBlock = () => {
		const blocks = getBlocks( clientId );
		const blocksToInsert = blocks.map( makeBlockCopy ).filter( Boolean );

		if ( attributes.replaceTargetBlock?.clientId ) {
			replaceBlocks( attributes.replaceTargetBlock?.clientId, blocksToInsert );
			removeBlock( clientId );
		} else {
			replaceBlocks( clientId, blocksToInsert );
		}

		// Track that the AI generation was kept, only after the replace actually ran.
		hasAccepted.current = true;
		window.oTrk?.set( `ai-outcome-${ trackingKey }`, { feature: 'ai-generation', featureComponent: `outcome-${ allowedPromptID( attributes?.promptID ) }`, featureValue: 'replace' });
	};

	/**
	 * Insert the blocks generated from the prompt response below the current block
	 */
	const insertContentIntoPage = () => {
		const blocks = getBlocks( clientId );

		// insertBlockBelow no-ops when the parent is template-locked, so mirror that check here and only
		// treat this as a kept 'insert' when the insertion can actually happen.
		const blockEditor = select( 'core/block-editor' );
		const rootClientId = blockEditor?.getBlockRootClientId( clientId );
		const canInsert = ! blockEditor?.getTemplateLock( rootClientId );

		insertBlockBelow( clientId, blocks.map( makeBlockCopy ) );

		if ( ! canInsert ) {
			return;
		}

		// Track that the AI generation was kept, only after a real insertion happened.
		hasAccepted.current = true;
		window.oTrk?.set( `ai-outcome-${ trackingKey }`, { feature: 'ai-generation', featureComponent: `outcome-${ allowedPromptID( attributes?.promptID ) }`, featureValue: 'insert' });
	};

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

	const PRESETS = {
		form: {
			title: __( 'AI Form generator', 'otter-blocks' ),
			placeholder: __( 'Start describing what form you need…', 'otter-blocks' ),
			actions: ( props ) => {
				return (
					<Fragment>
						<Button
							variant="primary"
							onClick={replaceBlock}
							disabled={'loading' === props.status}
						>
							{__( 'Replace', 'otter-blocks' )}
						</Button>
						<Button
							variant="secondary"
							onClick={insertContentIntoPage}
							disabled={'loading' === props.status}
						>
							{__( 'Insert below', 'otter-blocks' )}
						</Button>
					</Fragment>
				);
			}
		},
		textTransformation: {
			title: __( 'AI Content generator', 'otter-blocks' ),
			placeholder: __( 'Start describing what content you need…', 'otter-blocks' ),
			actions: ( props ) => {
				return (
					<Fragment>
						<Button
							variant="primary"
							onClick={replaceBlock}
							disabled={'loading' === props.status}
						>
							{__( 'Replace', 'otter-blocks' )}
						</Button>
						<Button
							variant="secondary"
							onClick={insertContentIntoPage}
							disabled={'loading' === props.status}
						>
							{__( 'Insert below', 'otter-blocks' )}
						</Button>
					</Fragment>
				);
			}
		},
		patternsPicker: {
			title: __( 'Smart Otter Patterns Picker', 'otter-blocks' ),
			placeholder: __( 'Describe what kind of page do you want.', 'otter-blocks' ),
			actions: ( props ) => {
				return (
					<Fragment>
						<Button
							variant="primary"
							onClick={replaceBlock}
							disabled={'loading' === props.status}
						>
							{__( 'Replace', 'otter-blocks' )}
						</Button>
						<Button
							variant="secondary"
							onClick={insertContentIntoPage}
							disabled={'loading' === props.status}
						>
							{__( 'Insert below', 'otter-blocks' )}
						</Button>
					</Fragment>
				);
			}
		}
	};

	useEffect( () => {
		if ( ! Boolean( attributes.replaceTargetBlock ) ) {
			return;
		}

		// Cleanup the replaceTargetBlock attribute if the block is not found.
		const targetBlock = getBlock?.( attributes.replaceTargetBlock );
		if ( targetBlock && attributes.replaceTargetBlock?.name !== targetBlock.name ) {
			setAttributes({
				replaceTargetBlock: undefined
			});
		}
	}, [ attributes.replaceTargetBlock ]);

	// Record a 'discard' only when an unaccepted generation's block was actually removed. A block still
	// present in the store means the editor is just tearing down (navigation/close), not a real discard.
	useEffect( () => {
		return () => {
			if ( hasAccepted.current || ! hasOutput.current ) {
				return;
			}

			const blockEditor = select( 'core/block-editor' );

			if ( ! blockEditor || blockEditor.getBlock( clientId ) ) {
				return;
			}

			window.oTrk?.set( `ai-outcome-${ trackingKey }`, { feature: 'ai-generation', featureComponent: `outcome-${ allowedPromptID( attributesRef.current?.promptID ) }`, featureValue: 'discard' });
		};
	}, []);

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				{
					attributes.promptID === undefined ? (
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
						/>
					) : (
						<PromptPlaceholder
							promptID={attributes.promptID}
							trackingKey={trackingKey}
							hasAcceptedRef={hasAccepted}
							hasOutputRef={hasOutput}
							title={PRESETS?.[attributes.promptID]?.title}
							value={prompt}
							onValueChange={setPrompt}
							onPreview={onPreview}
							actionButtons={PRESETS?.[attributes.promptID]?.actions}
							onClose={() => removeBlock( clientId )}
							promptPlaceholder={PRESETS?.[attributes.promptID]?.placeholder}
							resultHistory={attributes.resultHistory}
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

// INFO: those are function for changing the content of an existing block.
// const [ showDropdown, setShowDropdown ] = useState( false );
// const [ containerClientId, setContainerClientId ] = useState( '' );
//
// const canReplaceBlock = useSelect( select => {
// 	const { getBlocks } = select( 'core/block-editor' );
//
// 	return ( getBlocks?.() ?? []).some( block => block.clientId === attributes.blockToReplace );
// }, [ clientId, attributes.blockToReplace ]);
//
// const replaceTargetBlock = () => {
//
// 	const blocksToAdd = getBlocks?.( containerId )?.map( block => {
// 		return createBlock( block.name, block.attributes, block.innerBlocks );
// 	}) ?? [];
//
// 	if ( ! blocksToAdd.length ) {
// 		return;
// 	}
//
// 	replaceInnerBlocks( attributes.blockToReplace, blocksToAdd );
// };
//
// const appendToTargetBlock = () => {
// 	const blocksToAdd = getBlocks?.( containerId )?.map( block => {
// 		return createBlock( block.name, block.attributes, block.innerBlocks );
// 	}) ?? [];
//
// 	const targetBlock = getBlock( attributes.blockToReplace );
//
// 	if ( ! blocksToAdd.length ) {
// 		return;
// 	}
//
// 	insertBlocks( blocksToAdd, targetBlock.innerBlocks?.length ?? 0, attributes.blockToReplace );
// };
