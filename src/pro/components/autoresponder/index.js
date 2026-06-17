import { useRef, useState } from '@wordpress/element';
import {
	Button,
	Disabled,
	Modal,
	Notice,
	TabPanel
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { RichTextEditor } from '../../../blocks/components';
import MagicTagInput from './magic-tag-input';
import classNames from 'classnames';

/**
 * The rich-text body editor shared by the AI-off modal and the Fallback message tab.
 *
 * @param {Object}                  props
 * @param {string|undefined}        props.value    The autoresponder body.
 * @param {(value: string) => void} props.onChange Body change handler.
 * @param {string|undefined}        props.area     The rich-text editor area.
 * @return {JSX.Element}
 */
const AutoresponderBodyEditor = ({ value, onChange, area }) => (
	<RichTextEditor
		value={ value }
		onChange={ onChange }
		help={ __( 'Enter the body of the autoresponder email.', 'otter-pro' ) }
		allowRawHTML
		area={ area }
	/>
);

/**
 * The AI Prompt tab: prompt textarea plus a row of magic-tag chips built from the form fields.
 *
 * @param {Object}                                props
 * @param {string|undefined}                      props.prompt   The AI prompt value.
 * @param {(value: string) => void}               props.onChange Prompt change handler.
 * @param {Array<{token: string, label: string}>} props.tags     The magic tags to render as chips.
 * @param {boolean}                               props.disabled Whether the prompt input is disabled (Pro preview).
 * @return {JSX.Element}
 */
const AIPromptTab = ({ prompt, onChange, tags, disabled }) => {
	const inputRef = useRef( null );

	const insertTag = ( token, label ) => inputRef.current?.insertToken( token, label );

	return (
		<>
			<div className="o-autoresponder-prompt">
				<p className="o-autoresponder-prompt__label">{ __( 'Prompt', 'otter-pro' ) }</p>
				<MagicTagInput
					ref={ inputRef }
					value={ prompt }
					onChange={ onChange }
					tags={ tags }
					disabled={ disabled }
					placeholder={ __( 'Describe the reply the AI should write…', 'otter-pro' ) }
				/>
				<p className="o-autoresponder-prompt__help">
					{ __( 'Describe the reply the AI should write. Use magic tags to weave in the submitted values.', 'otter-pro' ) }
				</p>
			</div>

			{ 0 < tags.length && (
				<div className="o-autoresponder-magic-tags">
					<p className="o-autoresponder-magic-tags__title">
						{ __( 'Magic tags', 'otter-pro' ) }
					</p>
					<div className="o-autoresponder-magic-tags__list">
						{ tags.map( tag => (
							<Button
								key={ tag.token }
								variant="secondary"
								isSmall
								className="o-autoresponder-magic-tags__chip"
								label={ sprintf(
									// translators: %s: the form field label.
									__( 'Insert the %s field value', 'otter-pro' ),
									tag.label
								) }
								showTooltip
								onClick={ () => insertTag( tag.token, tag.label ) }
							>
								{ tag.label }
							</Button>
						) ) }
					</div>
					<p className="o-autoresponder-magic-tags__help">
						{ __( 'Detected from your form fields. Click to insert — each tag is replaced with the submitted value when the reply is generated.', 'otter-pro' ) }
					</p>
				</div>
			) }
		</>
	);
};

/**
 * Autoresponder message modal. When AI is off it shows a single body editor; when AI is on it
 * shows a tab switcher between the AI prompt and the fallback (static) message.
 *
 * @param {Object}                                props
 * @param {string|undefined}                      props.value            The autoresponder body.
 * @param {(value: string) => void}               props.onChange         Body change handler.
 * @param {string|undefined}                      props.area             The rich-text editor area.
 * @param {boolean}                               props.addExtraMargin   Whether to add extra margin to the trigger button.
 * @param {Object|undefined}                      props.aiAutoresponder  The AI autoresponder option.
 * @param {(value: Object) => void}               props.onChangeAIPrompt AI prompt change handler.
 * @param {Array<{token: string, label: string}>} props.magicTags        The magic tags to render as chips.
 * @param {boolean}                               props.disabled         Whether the modal contents are a disabled Pro preview.
 * @return {JSX.Element}
 */
const AutoresponderBodyModal = ({
	value,
	onChange,
	area,
	addExtraMargin,
	aiAutoresponder,
	onChangeAIPrompt,
	magicTags = [],
	disabled = false
}) => {
	const [ isOpen, setOpen ] = useState( false );

	const isAIEnabled = Boolean( aiAutoresponder?.enabled );

	return (
		<>
			{ isOpen && (
				<Modal
					title={ __( 'Autoresponder Message', 'otter-pro' ) }
					className="o-autoresponder-modal"
					size="medium"
					onRequestClose={() => setOpen( false )}
					shouldCloseOnClickOutside={ false }
				>
					{ disabled && (
						<Notice isDismissible={ false } status="warning">
							{ __( 'This is a preview. Activate Otter Pro to set up the autoresponder.', 'otter-pro' ) }
						</Notice>
					) }
					<TabPanel
						className="o-autoresponder-tabs"
						tabs={[
							{
								name: 'message',
								title: isAIEnabled ? __( 'Fallback message', 'otter-pro' ) : __( 'Message', 'otter-pro' )
							},
							{
								name: 'ai-prompt',
								title: __( 'AI Prompt', 'otter-pro' )
							}
						]}
					>
						{ tab => (
							'ai-prompt' === tab.name ? (
								<>
									{ ! isAIEnabled && (
										<Notice isDismissible={ false } status="warning">
											{ __( '“Reply with AI” is off, so this prompt is not used. Turn it on to generate replies from submissions.', 'otter-pro' ) }
										</Notice>
									) }
									{ /* Disable only the content, not the tab switcher. */ }
									<Disabled isDisabled={ disabled }>
										<AIPromptTab
											prompt={ aiAutoresponder?.prompt }
											onChange={ onChangeAIPrompt }
											tags={ magicTags }
											disabled={ disabled }
										/>
									</Disabled>
								</>
							) : (
								<>
									{ isAIEnabled && (
										<Notice isDismissible={ false } status="info">
											{ __( 'Sent as-is if an AI reply can\'t be generated.', 'otter-pro' ) }
										</Notice>
									) }
									<Disabled isDisabled={ disabled }>
										<AutoresponderBodyEditor
											value={ value }
											onChange={ onChange }
											area={ area }
										/>
									</Disabled>
								</>
							)
						) }
					</TabPanel>
				</Modal>
			) }
			<Button
				variant="secondary"
				onClick={() => setOpen( true )}
				className={ classNames({ 'o-autoresponder-margin': Boolean( addExtraMargin ) }) }
			>
				{ __( 'Edit Autoresponder Message', 'otter-pro' ) }
			</Button>
		</>
	);
};

export default AutoresponderBodyModal;
