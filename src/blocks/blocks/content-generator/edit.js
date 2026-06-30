/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import { Fragment, useMemo, useState } from '@wordpress/element';

import { createBlock } from '@wordpress/blocks';

import { useDispatch, useSelect } from '@wordpress/data';

import { __ } from '@wordpress/i18n';

import { Button, Disabled, Placeholder, TextareaControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Inspector from './inspector.js';
import PreviewBoundary from './preview-boundary.js';
import PromptPlaceholder from '../../components/prompt';
import { aiGeneration as icon } from '../../helpers/icons.js';
import { parseFormPromptResponseToBlocks } from '../../helpers/prompt';
import AIContentModal from '../../plugins/ai-content/modal';
import EnableAtomicWind from '../../plugins/patterns-library/enableAtomicWind';
import useSettings from '../../helpers/use-settings';
import {
	DEFAULT_BUILTIN_ACTIONS,
	getEnabledActions,
	getToolbarActionsFromSettings,
	normalizeToolbarActions
} from '../../plugins/ai-content/actions';

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
	const [ includeColors, setIncludeColors ] = useState( true );
	const [ isModalOpen, setModalOpen ] = useState( false );
	const [ getOption, _, settingsStatus ] = useSettings();

	// The theme's editor palette — previewed in the card so the user can see what
	// would be sent, and toggle it off to let the model pick its own colors.
	const themeColors = useSelect(
		select => select( 'core/block-editor' )?.getSettings?.()?.colors ?? [],
		[]
	);

	// Generation is locked to Atomic Wind primitives, so the blocks must be
	// registered. When they aren't, the card is replaced by an enable gate.
	const isAtomicWindAvailable = useSelect(
		select => Boolean( select( 'core/blocks' )?.getBlockType?.( 'atomic-wind/box' ) ),
		[]
	);

	const toolbarActions = useMemo( () => {
		if ( 'loading' === settingsStatus ) {
			return getEnabledActions( DEFAULT_BUILTIN_ACTIONS );
		}

		return getEnabledActions(
			normalizeToolbarActions(
				getToolbarActionsFromSettings( getOption )
			)
		);
	}, [ getOption, settingsStatus ] );

	const {
		insertBlocks,
		removeBlock,
		replaceInnerBlocks,
		replaceBlocks
	} = useDispatch( 'core/block-editor' );

	const {
		hasInnerBlocks,
		getBlocks,
		getBlockRootClientId,
		getBlockIndex,
		getTemplateLock
	} = useSelect(
		select => {
			const {
				getBlocks,
				getBlockRootClientId,
				getBlockIndex,
				getTemplateLock
			} = select( 'core/block-editor' );

			return {
				hasInnerBlocks: getBlocks?.( clientId ).length,
				getBlocks,
				getBlockRootClientId,
				getBlockIndex,
				getTemplateLock
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

	const closeGenerationModal = () => {
		setModalOpen( false );
	};

	const discardGenerationModal = () => {
		setModalOpen( false );
		removeBlock( clientId );
	};

	const applyGeneratedBlocks = ( blocksToInsert ) => {
		setModalOpen( false );

		window.requestAnimationFrame( () => {
			const rootClientId = getBlockRootClientId( clientId );
			const index = getBlockIndex( clientId, rootClientId );

			if ( 0 > index || getTemplateLock( rootClientId ) ) {
				return;
			}

			insertBlocks( blocksToInsert, index, rootClientId );
			removeBlock( clientId, false );
		});
	};

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

	// Generation is locked to Atomic Wind primitives. When those blocks are
	// disabled there's nothing to build with, so swap the card for the same
	// enable gate the Design Library uses (one-click enable, then reload).
	if ( ! isAtomicWindAvailable ) {
		return (
			<Fragment>
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>

				<div { ...blockProps }>
					<EnableAtomicWind
						title={ __( 'Atomic Wind blocks are required', 'otter-blocks' ) }
						description={ __( 'The AI content generator builds with Otter\'s Atomic Wind blocks, which are currently disabled. Enable them to generate sections and pages.', 'otter-blocks' ) }
					/>
					<div className="o-ai-create-card__actions">
						<Button
							variant="tertiary"
							onClick={ () => removeBlock( clientId ) }
						>
							{ __( 'Cancel', 'otter-blocks' ) }
						</Button>
					</div>
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
					instructions={ 'page' === scope
						? __( 'Describe a page and Otter AI will build it with your blocks & theme styles.', 'otter-blocks' )
						: __( 'Describe a section and Otter AI will build it with your blocks & theme styles.', 'otter-blocks' ) }
					className="o-ai-create-card"
				>
					<div className="o-ai-create-card__scope" role="group" aria-label={ __( 'What to generate', 'otter-blocks' ) }>
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

					{ 0 < themeColors.length && (
						<div className="o-ai-create-card__colors">
							<div className="o-ai-create-card__colors-head">
								<div
									className={ `o-ai-create-card__swatches${ includeColors ? '' : ' is-off' }` }
									aria-hidden="true"
								>
									{ themeColors.slice( 0, 8 ).map( ( color ) => (
										<span
											key={ color.slug ?? color.color }
											className="o-ai-create-card__swatch"
											style={ { backgroundColor: color.color } }
											title={ color.name ?? color.slug }
										/>
									) ) }
								</div>
								<ToggleControl
									__nextHasNoMarginBottom
									className="o-ai-create-card__colors-toggle"
									label={ __( 'Use my theme colors', 'otter-blocks' ) }
									checked={ includeColors }
									onChange={ setIncludeColors }
								/>
							</div>
						</div>
					) }

					<div className="o-ai-create-card__actions">
						<Button
							variant="primary"
							disabled={ ! prompt.trim() }
							onClick={ () => setModalOpen( true ) }
						>
							{ 'page' === scope ? __( 'Generate page', 'otter-blocks' ) : __( 'Generate section', 'otter-blocks' ) }
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
					onClose={ closeGenerationModal }
					onDiscard={ discardGenerationModal }
					onApplyBlocks={ applyGeneratedBlocks }
					actions={ toolbarActions }
					includeThemeColors={ includeColors }
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
