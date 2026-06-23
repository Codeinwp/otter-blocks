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

import { useState } from '@wordpress/element';

import { chevronDown, trash } from '@wordpress/icons';

import classnames from 'classnames';

/**
 * Internal dependencies.
 */
import { SortableDragHandle, useSortableRow } from '../../blocks/components/sortable/index.js';

const SortableToolbarAction = ({
	id,
	action,
	index,
	isSaving,
	onUpdate,
	onRemove
}) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const {
		attributes,
		listeners,
		setNodeRef,
		style
	} = useSortableRow( id );

	const title = action.title || __( 'Untitled action', 'otter-blocks' );

	const toggleOpen = () => {
		setIsOpen( ( open ) => ! open );
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

						<div className="otter-ai-action-card__field">
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
							<p className="otter-ai-action-card__help">
								{ __( 'Otter automatically attaches the selected block(s) and their structure, so the prompt only needs to describe the change. This action appears as a quick-start chip in the AI chat.', 'otter-blocks' ) }
							</p>
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
