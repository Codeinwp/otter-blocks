/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import { Fragment, useRef, useState } from '@wordpress/element';

import { createBlock } from '@wordpress/blocks';

import { useDispatch, useSelect } from '@wordpress/data';

import { __, sprintf } from '@wordpress/i18n';

import { Button, Disabled } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Inspector from './inspector.js';
import PreviewBoundary from './preview-boundary.js';
import GenerationPlanView from './generation-plan.js';
import PromptPlaceholder from '../../components/prompt';
import { parseFormPromptResponseToBlocks, sendBlockGenerationPrompt } from '../../helpers/prompt';
import { generateBlocksFromTask } from '../../plugins/ai-content/block-generation';

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

	// Plan + per-section progress, surfaced as the page builds section by section.
	const [ plan, setPlan ] = useState( null );
	const [ sections, setSections ] = useState( [] );

	// Monotonic id so callbacks from a superseded run (regenerate / close) are ignored,
	// and an accumulator so each finished root can be inserted progressively.
	const generationIdRef = useRef( 0 );
	const accumulatedRef = useRef( [] );

	const {
		removeBlock,
		replaceInnerBlocks,
		replaceBlocks,
		__unstableMarkNextChangeAsNotPersistent
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
	/**
	 * Derive a readable section title from an outline root.
	 *
	 * @param {import('../../plugins/ai-content/block-generation').StructureNode} root  The outline root.
	 * @param {number}                                                            index The root index, used for a fallback label.
	 * @return {string} The section title.
	 */
	const sectionTitle = ( root, index ) => {
		if ( root?.notes ) {
			return root.notes.length > 60 ? `${ root.notes.slice( 0, 59 ).trimEnd() }…` : root.notes;
		}
		const name = ( root?.name ?? '' ).replace( /^[a-z-]+\//, '' ).replace( /-/g, ' ' );

		// translators: %d: section number
		return name || sprintf( __( 'Section %d', 'otter-blocks' ), index + 1 );
	};

	/**
	 * Progressively insert the accumulated blocks without polluting the undo stack —
	 * the only persistent change is the user's final "Done".
	 */
	const previewAccumulated = () => {
		__unstableMarkNextChangeAsNotPersistent?.();
		replaceInnerBlocks( clientId, accumulatedRef.current.map( makeBlockCopy ).filter( Boolean ) );
	};

	const onGenerateBlocks = async( task ) => {
		let usedToken = 0;

		// Start a fresh run: invalidate prior callbacks and clear any previous preview.
		const generationId = ++generationIdRef.current;
		const isStale = () => generationId !== generationIdRef.current;
		accumulatedRef.current = [];
		setPlan( null );
		setSections( [] );
		previewAccumulated();

		const requestCompletion = async( instruction ) => {
			const response = await sendBlockGenerationPrompt( instruction );

			if ( ! response.ok ) {
				throw new Error( response.error.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) );
			}

			const { content } = response;

			if ( ! content ) {
				throw new Error( __( 'Empty response from the AI service. Please try again.', 'otter-blocks' ) );
			}

			usedToken += response.usedTokens ?? 0;

			return content;
		};

		const onPlanReady = ( generationPlan ) => {
			if ( isStale() ) {
				return;
			}

			setPlan( generationPlan );
			setSections(
				( generationPlan.roots ?? [] ).map( ( root, index ) => ({
					title: sectionTitle( root, index ),
					status: 0 === index ? 'building' : 'pending'
				}) )
			);
		};

		const onRootComplete = ({ rootIndex, totalRoots, blocks: rootBlocks }) => {
			if ( isStale() ) {
				return;
			}

			if ( rootBlocks.length ) {
				accumulatedRef.current = [ ...accumulatedRef.current, ...rootBlocks ];
				previewAccumulated();
			}

			setSections( ( current ) => current.map( ( section, index ) => {
				if ( index === rootIndex ) {
					return { ...section, status: rootBlocks.length ? 'done' : 'failed' };
				}
				if ( index === rootIndex + 1 && rootIndex + 1 < totalRoots ) {
					return { ...section, status: 'building' };
				}
				return section;
			}) );
		};

		try {
			const generation = await generateBlocksFromTask({
				task,
				blockTypes,
				requestCompletion,
				onPlanReady,
				onRootComplete
			});

			if ( isStale() ) {
				return { error: __( 'Generation was superseded.', 'otter-blocks' ) };
			}

			if ( ! generation.blocks.length ) {
				return { error: __( 'Could not generate valid blocks. Please try a simpler prompt.', 'otter-blocks' ) };
			}

			const result = generation.rationale.length
				? generation.rationale.join( '\n' )
				: __( 'Generated content is ready.', 'otter-blocks' );

			return { result, usedToken };
		} catch ( e ) {
			return { error: e?.message ?? __( 'Something went wrong. Please try again.', 'otter-blocks' ) };
		}
	};

	// The "form" prompt returns a structured `{ fields: [...] }` JSON payload that
	// maps to Form field blocks, so it uses the embedded-prompt path (onPreview)
	// instead of the free-form block generation pipeline.
	const isFormPrompt = 'form' === attributes.promptID;

	/**
	 * Build a Form block from a form-prompt JSON response and preview it as inner blocks.
	 *
	 * @param {string} result The raw prompt response.
	 */
	const onPreview = ( result ) => {
		const formFields = parseFormPromptResponseToBlocks( result );
		const form = createBlock( 'themeisle-blocks/form', {}, formFields );

		replaceInnerBlocks( clientId, [ form ]);
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

	// Title and placeholder copy adapt to the prompt the block was inserted with.
	const presets = {
		form: {
			title: __( 'AI Form generator', 'otter-blocks' ),
			placeholder: __( 'Start describing what form you need…', 'otter-blocks' )
		},
		textTransformation: {
			title: __( 'AI Content generator', 'otter-blocks' ),
			placeholder: __( 'Start describing what content you need…', 'otter-blocks' )
		}
	};
	const preset = presets[ attributes.promptID ] ?? presets.textTransformation;

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<PromptPlaceholder
					promptID={ attributes.promptID }
					title={ preset.title }
					value={ prompt }
					resultHistory={ attributes.resultHistory }
					onValueChange={ setPrompt }
					onGenerateBlocks={ isFormPrompt ? undefined : onGenerateBlocks }
					onPreview={ isFormPrompt ? onPreview : undefined }
					actionButtons={ actionButtons }
					onClose={ () => removeBlock( clientId ) }
					promptPlaceholder={ preset.placeholder }
					progressContent={ ! isFormPrompt && plan ? (
						<GenerationPlanView plan={ plan } sections={ sections } />
					) : undefined }
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
