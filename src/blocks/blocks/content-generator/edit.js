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

import { Button, Disabled, Placeholder, TextareaControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Inspector from './inspector.js';
import PreviewBoundary from './preview-boundary.js';
import PromptPlaceholder from '../../components/prompt';
import { aiGeneration as icon } from '../../helpers/icons.js';
import { parseFormPromptResponseToBlocks } from '../../helpers/prompt';
import AIContentModal from '../../plugins/ai-content/modal';

/**
 * The synthetic action used to drive the generation modal from the AI Block. It
 * reuses the block-generation path (`availability: 'any'`) but in create mode,
 * so there is no source block to transform — the result replaces the AI Block.
 */
const CREATE_ACTION = {
	id: 'otter-create-section',
	title: __( 'AI Content generator', 'otter-blocks' ),
	prompt: '',
	enabled: true,
	custom: false,
	availability: 'any',
	type: 'prompt'
};

/**
 * Starter prompts shown in the block, since the first interaction happens here
 * (the modal auto-generates once opened).
 */
const PROMPT_CHIPS = [
	{ label: __( 'Hero', 'otter-blocks' ), prompt: __( 'A bold hero section with a headline, short subheading and two call-to-action buttons.', 'otter-blocks' ) },
	{ label: __( 'Features', 'otter-blocks' ), prompt: __( 'A features section with three columns, each with an icon, title and short description.', 'otter-blocks' ) },
	{ label: __( 'Pricing', 'otter-blocks' ), prompt: __( 'A pricing section with three plans and a highlighted recommended plan.', 'otter-blocks' ) },
	{ label: __( 'Testimonials', 'otter-blocks' ), prompt: __( 'A testimonials section with three customer quotes and names.', 'otter-blocks' ) },
	{ label: __( 'Call to action', 'otter-blocks' ), prompt: __( 'A call-to-action section with a short persuasive headline and a single button.', 'otter-blocks' ) }
];

/**
 * AI Block — Content Generator.
 *
 * For free-form content it launches the AI generation modal (prompt → preview →
 * Done), which replaces this block with the generated section. The "form" prompt
 * keeps its inline preview path since it maps a structured payload to a Form.
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
	const [ scope, setScope ] = useState( 'section' );
	const [ isModalOpen, setModalOpen ] = useState( false );

	const {
		removeBlock,
		replaceInnerBlocks,
		replaceBlocks
	} = useDispatch( 'core/block-editor' );

	const { hasInnerBlocks, getBlocks } = useSelect(
		select => {
			const { getBlocks } = select( 'core/block-editor' );

			return {
				hasInnerBlocks: getBlocks?.( clientId ).length,
				getBlocks
			};
		},
		[ clientId ]
	);

	// The "form" prompt returns a structured `{ fields: [...] }` JSON payload that
	// maps to Form field blocks, so it uses the embedded-prompt path (onPreview)
	// instead of the free-form generation modal.
	const isFormPrompt = 'form' === attributes.promptID;

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
	 * Replace the block with the blocks generated from the form prompt response.
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

	// Form path keeps the inline prompt + preview experience.
	if ( isFormPrompt ) {
		return (
			<Fragment>
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>

				<div { ...blockProps }>
					<PromptPlaceholder
						promptID={ attributes.promptID }
						title={ __( 'AI Form generator', 'otter-blocks' ) }
						value={ prompt }
						resultHistory={ attributes.resultHistory }
						onValueChange={ setPrompt }
						onPreview={ onPreview }
						actionButtons={ actionButtons }
						onClose={ () => removeBlock( clientId ) }
						promptPlaceholder={ __( 'Start describing what form you need…', 'otter-blocks' ) }
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
	}

	// Content path: a compact launcher that opens the generation modal. The modal
	// generates, previews and (on Done) replaces this block with the result.
	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<Placeholder
					icon={ icon }
					label={ __( 'AI Content generator', 'otter-blocks' ) }
					instructions={ __( 'Describe a section and Otter AI will build it with your blocks & theme styles.', 'otter-blocks' ) }
					className="o-ai-create-card"
				>
					<div className="o-ai-create-card__scope">
						<Button
							variant={ 'section' === scope ? 'primary' : 'secondary' }
							isSmall
							onClick={ () => setScope( 'section' ) }
						>
							{ __( 'Section', 'otter-blocks' ) }
						</Button>
						<Button
							variant={ 'page' === scope ? 'primary' : 'secondary' }
							isSmall
							onClick={ () => setScope( 'page' ) }
						>
							{ __( 'Full page', 'otter-blocks' ) }
						</Button>
					</div>

					<TextareaControl
						value={ prompt }
						onChange={ setPrompt }
						placeholder={ __( 'e.g. A hero section for a dental clinic with a heading and two buttons', 'otter-blocks' ) }
						rows={ 2 }
						__nextHasNoMarginBottom
					/>

					<div className="o-ai-create-card__chips">
						{ PROMPT_CHIPS.map( ( chipItem ) => (
							<Button
								key={ chipItem.label }
								variant="tertiary"
								isSmall
								onClick={ () => setPrompt( chipItem.prompt ) }
							>
								{ chipItem.label }
							</Button>
						) ) }
					</div>

					<div className="o-ai-create-card__actions">
						<Button
							variant="primary"
							disabled={ ! prompt.trim() }
							onClick={ () => setModalOpen( true ) }
						>
							{ __( 'Generate', 'otter-blocks' ) }
						</Button>
						<Button
							variant="tertiary"
							onClick={ () => removeBlock( clientId ) }
						>
							{ __( 'Cancel', 'otter-blocks' ) }
						</Button>
					</div>
				</Placeholder>
			</div>

			{ isModalOpen && (
				<AIContentModal
					isOpen={ isModalOpen }
					mode="create"
					autoGenerate
					initialScope={ scope }
					onClose={ () => setModalOpen( false ) }
					actions={ [ CREATE_ACTION ] }
					initialActionId={ CREATE_ACTION.id }
					initialPrompt={ prompt }
					selectedBlocks={ [] }
					isMultipleSelection={ false }
					singleClientId={ clientId }
					selectedClientIds={ [ clientId ] }
				/>
			) }
		</Fragment>
	);
};

export default ContentGenerator;
