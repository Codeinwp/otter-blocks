/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalToolsPanelItem as ToolsPanelItem,
	Button,
	Modal,
	TextControl
} from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Notice } from '../../../blocks/components';
import { RichTextEditor } from '../../../blocks/components';

const AutoresponderBody = ({ formOptions, setFormOption }) => {
	const [ isOpen, setOpen ] = useState( false );
	const onChange = body => {
		setFormOption({ autoresponder: { ...formOptions.autoresponder, body }});
	};

	return (
		<>
			{ isOpen && (
				<Modal
					title={ __( 'Autoresponder Body' ) }
					onRequestClose={() => setOpen( false )}
					shouldCloseOnClickOutside={ false }
				>
					<RichTextEditor
						value={ formOptions.autoresponder?.body }
						onChange={ onChange }
						help={ __( 'Enter the body of the autoresponder email.', 'otter-blocks' ) }
						allowRawHTML
					/>
				</Modal>
			) }
			<br/>
			<Button
				variant="secondary"
				onClick={() => setOpen( true )}
			>
				{ __( 'Add Autoresponder Body', 'otter-blocks' ) }
			</Button>
		</>
	);
};

const FormOptions = ( Options, formOptions, setFormOption ) => {
	return (
		<>
			{ Options }

			<ToolsPanelItem
				hasValue={ () => undefined !== formOptions.autoresponder?.subject || undefined !== formOptions.autoresponder?.body }
				label={ __( 'Autoresponder', 'otter-blocks' ) }
				onDeselect={ () => setFormOption({ autoresponder: undefined }) }
			>
				{ Boolean( window.otterPro.isActive ) ? (
					<>
						<TextControl
							label={ __( 'Autoresponder Subject', 'otter-blocks' ) }
							placeholder={ __( 'Confirmation of your subscription', 'otter-blocks' ) }
							value={ formOptions.autoresponder?.subject }
							onChange={ subject => setFormOption({ autoresponder: { ...formOptions.autoresponder, subject }}) }
							help={ __( 'Enter the subject of the autoresponder email.', 'otter-blocks' ) }
						/>

						<AutoresponderBody
							formOptions={ formOptions }
							setFormOption={ setFormOption }
						/>
					</>
				) : (
					<div>
						<Notice
							notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
							instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Form Block.', 'otter-blocks' ) }
						/>
					</div>
				) }
			</ToolsPanelItem>
		</>
	);
};

addFilter( 'otter.formBlock.options', 'themeisle-gutenberg/form-block-options', FormOptions );
