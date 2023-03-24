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

const AutoresponderBody = ({ autoresponderBody, setFormOption }) => {
	const [ isOpen, setOpen ] = useState( false );
	const onChange = value => {
		setFormOption({ autoresponderBody: value });
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
						value={ autoresponderBody }
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
				hasValue={ () => undefined !== formOptions.autoresponderSubject && undefined !== formOptions.autoresponderBody }
				label={ __( 'Autoresponder', 'otter-blocks' ) }
				onDeselect={ () => setFormOption({ autoresponderSubject: undefined, autoresponderBody: undefined }) }
			>
				{ Boolean( window.otterPro.isActive ) ? (
					<>
						<TextControl
							label={ __( 'Autoresponder Subject', 'otter-blocks' ) }
							placeholder={ __( 'Confirmation of your subscription', 'otter-blocks' ) }
							value={ formOptions.autoresponderSubject }
							onChange={ autoresponderSubject => setFormOption({ autoresponderSubject }) }
							help={ __( 'Enter the subject of the autoresponder email.', 'otter-blocks' ) }
						/>

						<AutoresponderBody
							autoresponderBody={ formOptions.autoresponderBody }
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
