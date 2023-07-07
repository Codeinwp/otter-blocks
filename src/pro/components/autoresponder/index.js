import { useState } from '@wordpress/element';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { RichTextEditor } from '../../../blocks/components';
import classNames from 'classnames';

const AutoresponderBodyModal = ({ value, onChange, area, addExtraMargin }) => {
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
			<Button
				variant="secondary"
				onClick={() => setOpen( true )}
				className={ classNames({ 'o-autoresponder-margin': Boolean( addExtraMargin ) }) }
			>
				{ __( 'Add Autoresponder Body', 'otter-blocks' ) }
			</Button>
		</>
	);
};

export default AutoresponderBodyModal;
