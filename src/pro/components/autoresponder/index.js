import { useState } from '@wordpress/element';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { RichTextEditor } from '../../../blocks/components';

const AutoresponderBodyModal = ({ value, onChange, area }) => {
	const [ isOpen, setOpen ] = useState( false );

	return (
		<>
			{ isOpen && (
				<Modal
					title={ __( 'Autoresponder Body' ) }
					onRequestClose={() => setOpen( false )}
					shouldCloseOnClickOutside={ false }
				>
					<RichTextEditor
						value={ value }
						onChange={ onChange }
						help={ __( 'Enter the body of the autoresponder email.', 'otter-blocks' ) }
						allowRawHTML
						area={ area }
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

export default AutoresponderBodyModal;
