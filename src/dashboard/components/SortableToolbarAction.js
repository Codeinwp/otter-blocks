/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	Icon,
	TextControl,
	TextareaControl,
	__experimentalVStack as VStack
} from '@wordpress/components';

import {
	Fragment,
	useRef,
	useState
} from '@wordpress/element';

import { chevronDown, trash } from '@wordpress/icons';

import classnames from 'classnames';

/**
 * Internal dependencies.
 */
import { SortableDragHandle, useSortableRow } from '../../blocks/components/sortable/index.js';

const MAGIC_TAGS = [
	{ tag: '{block_content}', label: '{block_content}', title: __( 'Text content of the block', 'otter-blocks' ) },
	{ tag: '{block_markup}', label: '{block_markup}', title: __( 'Full HTML / block markup with attribute definitions', 'otter-blocks' ), isMarkup: true },
	{ tag: '{block_attributes}', label: '{block_attributes}', title: __( 'Block attribute definitions from block.json', 'otter-blocks' ), isMarkup: true },
	{ tag: '{block_type}', label: '{block_type}', title: __( 'e.g. paragraph, heading, list', 'otter-blocks' ) },
	{ tag: '{tone}', label: '{tone}', title: __( 'Selected tone in the editor', 'otter-blocks' ) }
];

const TextBlockIcon = () => (
	<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<rect x="4" y="4" width="16" height="16" rx="2.5" />
		<path d="M8 10h8M8 14h5" />
	</svg>
);

const SortableToolbarAction = ({
	id,
	action,
	index,
	isSaving,
	onUpdate,
	onRemove
}) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const promptFieldRef = useRef( null );
	const {
		attributes,
		listeners,
		setNodeRef,
		style
	} = useSortableRow( id );

	const title = action.title || __( 'Untitled action', 'otter-blocks' );
	const availabilityLabel = 'any' === action.availability
		? __( 'Any block', 'otter-blocks' )
		: __( 'Text blocks', 'otter-blocks' );

	const toggleOpen = () => {
		setIsOpen( ( open ) => ! open );
	};

	const insertMagicTag = ( tag ) => {
		const prompt = action.prompt || '';
		const textarea = promptFieldRef.current?.querySelector( 'textarea' );

		if ( ! textarea ) {
			onUpdate( index, { prompt: `${ prompt }${ tag }` });
			return;
		}

		const start = textarea.selectionStart ?? prompt.length;
		const end = textarea.selectionEnd ?? prompt.length;
		const caret = start + tag.length;

		onUpdate( index, { prompt: prompt.slice( 0, start ) + tag + prompt.slice( end ) });

		// Restore focus and place the caret right after the inserted tag once the new value is rendered.
		window.requestAnimationFrame( () => {
			textarea.focus();
			textarea.setSelectionRange( caret, caret );
		});
	};

	const stopPropagation = ( event ) => {
		event.stopPropagation();
	};

	return (
		<div
			ref={ setNodeRef }
			style={ style }
			className={ classnames( 'otter-ai-action-card', {
				'is-open': isOpen,
				'is-off': ! action.enabled
			}) }
		>
			<div
				className="otter-ai-action-card__header"
				role="button"
				tabIndex={ 0 }
				onClick={ toggleOpen }
				onKeyDown={ ( event ) => {
					if ( 'Enter' === event.key || ' ' === event.key ) {
						event.preventDefault();
						toggleOpen();
					}
				} }
			>
				<div
					className="otter-ai-action-card__grip-wrap"
					onClick={ stopPropagation }
					onKeyDown={ stopPropagation }
				>
					<SortableDragHandle
						variant="dashboard"
						listeners={ listeners }
						attributes={ attributes }
						className="otter-ai-action-card__grip"
						title={ __( 'Drag to reorder', 'otter-blocks' ) }
					/>
				</div>

				<div className="otter-ai-action-card__summary">
					<div className="otter-ai-action-card__title-row">
						<span className="otter-ai-action-card__title">{ title }</span>
						{ action.custom && (
							<span className="otter-ai-action-card__custom-badge">
								{ __( 'Custom', 'otter-blocks' ) }
							</span>
						) }
					</div>

					<div className="otter-ai-action-card__badges">
						<span className="otter-ai-action-card__badge">
							<TextBlockIcon />
							{ availabilityLabel }
						</span>
					</div>
				</div>

				<button
					type="button"
					className="otter-ai-action-card__switch"
					aria-pressed={ action.enabled }
					title={
						action.enabled
							? __( 'Shown in toolbar', 'otter-blocks' )
							: __( 'Hidden from toolbar', 'otter-blocks' )
					}
					disabled={ isSaving }
					onClick={ ( event ) => {
						stopPropagation( event );
						onUpdate( index, { enabled: ! action.enabled } );
					} }
				/>

				<span className={ classnames( 'otter-ai-action-card__chevron', { 'is-open': isOpen }) } aria-hidden="true">
					<Icon icon={ chevronDown } />
				</span>
			</div>

			{ isOpen && (
				<div className="otter-ai-action-card__expand">
					<VStack spacing={ 4 } className="otter-ai-action-card__fields">
						<div className="otter-ai-action-card__field">
							<span className="otter-ai-action-card__caption">
								{ __( 'Action name', 'otter-blocks' ) }
							</span>
							<TextControl
								value={ action.title }
								label={ __( 'Action name', 'otter-blocks' ) }
								hideLabelFromVision
								placeholder={ __( 'e.g. Make persuasive', 'otter-blocks' ) }
								disabled={ isSaving }
								onChange={ ( value ) => onUpdate( index, { title: value }) }
								onClick={ stopPropagation }
							/>
						</div>

						{ 'tone' !== action.type && (
							<Fragment>
								<div className="otter-ai-action-card__field" ref={ promptFieldRef }>
									<span className="otter-ai-action-card__caption">
										{ __( 'Prompt', 'otter-blocks' ) }
									</span>
									<TextareaControl
										value={ action.prompt }
										label={ __( 'Prompt', 'otter-blocks' ) }
										hideLabelFromVision
										placeholder={ __( 'Write the instruction Otter sends to the model…', 'otter-blocks' ) }
										disabled={ isSaving }
										onChange={ ( value ) => onUpdate( index, { prompt: value }) }
										onClick={ stopPropagation }
									/>
								</div>

								<div className="otter-ai-action-card__magic-tags">
									<div className="otter-ai-action-card__magic-tags-heading">
										<span className="otter-ai-action-card__caption">
											{ __( 'Insert a magic tag', 'otter-blocks' ) }
										</span>
										<span className="otter-ai-action-card__magic-tags-hint">
											{ __( 'click to drop it at the cursor', 'otter-blocks' ) }
										</span>
									</div>

									<div className="otter-ai-action-card__magic-tags-chips">
										{
											MAGIC_TAGS.map( ( { tag, label, title: tagTitle, isMarkup } ) => (
												<button
													key={ tag }
													type="button"
													className={ classnames( 'otter-ai-action-card__chip', {
														'is-markup': isMarkup
													}) }
													title={ tagTitle }
													disabled={ isSaving }
													onClick={ () => insertMagicTag( tag ) }
												>
													<span className="otter-ai-action-card__chip-plus">+</span>
													{ label }
												</button>
											) )
										}
									</div>

									<p className="otter-ai-action-card__magic-tags-note">
										<span className="otter-ai-action-card__magic-tags-note-icon" aria-hidden="true" />
										<span>
											{ __( 'Dashed tags resolve to', 'otter-blocks' ) }
											{ ' ' }
											<strong>{ __( 'block markup', 'otter-blocks' ) }</strong>
											{ ' ' }
											{ __( '(HTML) instead of plain text — useful for actions that rebuild structure.', 'otter-blocks' ) }
										</span>
									</p>
								</div>
							</Fragment>
						) }

						{ 'tone' === action.type && (
							<p className="otter-ai-action-card__help">
								{ __( 'Tone actions use preset tone pills in the editor. The prompt supports {tone} and {block_content}.', 'otter-blocks' ) }
							</p>
						) }

						<div className="otter-ai-action-card__divider" />

						<div className="otter-ai-action-card__availability">
							<div className="otter-ai-action-card__availability-copy">
								<span className="otter-ai-action-card__caption">
									{ __( 'Available in', 'otter-blocks' ) }
								</span>
								<p className="otter-ai-action-card__help">
									{ __( 'Choose which block types show this action in the toolbar.', 'otter-blocks' ) }
								</p>
							</div>

							<div className="otter-ai-action-card__segmented">
								<button
									type="button"
									className={ classnames( 'otter-ai-action-card__segment', {
										'is-active': 'richtext' === action.availability
									}) }
									disabled={ isSaving }
									onClick={ () => onUpdate( index, { availability: 'richtext' }) }
								>
									{ __( 'Text blocks only', 'otter-blocks' ) }
								</button>
								<button
									type="button"
									className={ classnames( 'otter-ai-action-card__segment', {
										'is-active': 'any' === action.availability
									}) }
									disabled={ isSaving }
									onClick={ () => onUpdate( index, { availability: 'any' }) }
								>
									{ __( 'Any block type', 'otter-blocks' ) }
								</button>
							</div>
						</div>

						<div className="otter-ai-action-card__footer">
							<Button
								variant="tertiary"
								disabled={ isSaving }
								onClick={ () => setIsOpen( false ) }
							>
								{ __( 'Done', 'otter-blocks' ) }
							</Button>

							{ action.custom && (
								<Button
									className="otter-ai-action-card__delete"
									icon={ trash }
									label={ __( 'Delete action', 'otter-blocks' ) }
									showTooltip
									disabled={ isSaving }
									onClick={ () => onRemove( index ) }
								/>
							) }
						</div>
					</VStack>
				</div>
			) }
		</div>
	);
};

export default SortableToolbarAction;
