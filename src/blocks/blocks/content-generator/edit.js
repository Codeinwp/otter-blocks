/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import { Fragment, useState } from '@wordpress/element';

import { createBlock } from '@wordpress/blocks';

import { useDispatch, useSelect } from '@wordpress/data';

import { __ } from '@wordpress/i18n';

import { Button, Disabled } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Inspector from './inspector.js';
import PreviewBoundary from './preview-boundary.js';
import PromptPlaceholder from '../../components/prompt';
import { sendBlockGenerationPrompt } from '../../helpers/prompt';
import { generateBlocksFromTask } from '../../plugins/ai-content/block-generation';
import { aiDebug, aiDebugEnd, aiDebugStart } from '../../plugins/ai-content/debug';

/**
 * AI Block — Content Generator.
 *
 * Turns a free-form task into validated Gutenberg blocks through the block
 * generation pipeline (catalog → generate → validate → repair), then previews
 * them as inner blocks so they can be inserted or used to replace the block.
 *
 * @param {import('./types').ContentGeneratorProps} props
 */
const ContentGenerator = ({
	attributes,
	setAttributes,
	clientId
}) => {

	const blockProps = useBlockProps();

	const [ prompt, setPrompt ] = useState( '' );

	const {
		removeBlock,
		replaceInnerBlocks,
		replaceBlocks
	} = useDispatch( 'core/block-editor' );

	const { hasInnerBlocks, getBlocks, blockTypes } = useSelect(
		select => {
			const { getBlocks } = select( 'core/block-editor' );

			return {
				hasInnerBlocks: getBlocks?.( clientId ).length,
				getBlocks,
				blockTypes: select( 'core/blocks' )?.getBlockTypes?.() ?? []
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
	 * Replace the block with the blocks generated from the prompt response.
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
	};

	/**
	 * Run the block generation pipeline and preview the result as inner blocks.
	 *
	 * @param {string} task The user task describing the desired content.
	 * @return {Promise<{result: string, usedToken: number}|{error: string}>} The pipeline outcome.
	 */
	const onGenerateBlocks = async( task ) => {
		let usedToken = 0;
		let requestCount = 0;

		aiDebugStart( 'Content Generator run' );
		aiDebug( 'Task received', { task, availableBlockTypes: blockTypes.length });

		const requestCompletion = async( instruction ) => {
			requestCount++;
			// Model/provider is resolved server-side (WP AI Client connector, or the
			// legacy OpenAI key); the frontend doesn't know which, so don't label it.
			aiDebug( `AI request #${ requestCount }`, { chars: instruction.length });

			const response = await sendBlockGenerationPrompt( instruction );

			if ( ! response.ok ) {
				aiDebug( `AI request #${ requestCount } errored`, response.error );
				throw new Error( response.error.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) );
			}

			const content = response.content;

			if ( ! content ) {
				aiDebug( `AI request #${ requestCount } returned empty content` );
				throw new Error( __( 'Empty response from the AI service. Please try again.', 'otter-blocks' ) );
			}

			usedToken += response.usedTokens ?? 0;
			aiDebug( `AI request #${ requestCount } ok`, { tokens: response.usedTokens ?? 0 });

			return content;
		};

		try {
			const generation = await generateBlocksFromTask({
				task,
				blockTypes,
				requestCompletion
			});

			if ( ! generation.blocks.length ) {
				aiDebug( 'No valid blocks produced' );
				aiDebugEnd();
				return { error: __( 'Could not generate valid blocks. Please try a simpler prompt.', 'otter-blocks' ) };
			}

			aiDebug( 'Inserting blocks into editor', generation.blocks.map( block => block.name ) );
			replaceInnerBlocks( clientId, generation.blocks );

			const result = generation.rationale.length
				? generation.rationale.join( '\n' )
				: __( 'Generated content is ready.', 'otter-blocks' );

			aiDebug( 'Done', { tokens: usedToken, dropped: generation.diagnostics.droppedRoots.length });
			aiDebugEnd();
			return { result, usedToken };
		} catch ( e ) {
			aiDebug( 'Run failed', e?.message );
			aiDebugEnd();
			return { error: e?.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) };
		}
	};

	const actionButtons = ( props ) => (
		<Button
			variant="primary"
			onClick={ replaceBlock }
			disabled={ 'loading' === props.status }
		>
			{ __( 'Done', 'otter-blocks' ) }
		</Button>
	);

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<PromptPlaceholder
					promptID={ attributes.promptID }
					title={ __( 'AI Content generator', 'otter-blocks' ) }
					value={ prompt }
					resultHistory={ attributes.resultHistory }
					onValueChange={ setPrompt }
					onGenerateBlocks={ onGenerateBlocks }
					actionButtons={ actionButtons }
					onClose={ () => removeBlock( clientId ) }
					promptPlaceholder={ __( 'Start describing what content you need…', 'otter-blocks' ) }
				>
					{
						hasInnerBlocks ? (
							<PreviewBoundary>
								<Disabled>
									<InnerBlocks renderAppender={ false } />
								</Disabled>
							</PreviewBoundary>
						) : ''
					}
				</PromptPlaceholder>
			</div>
		</Fragment>
	);
};

export default ContentGenerator;
