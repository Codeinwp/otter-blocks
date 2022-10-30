/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	useState
} from '@wordpress/element';
import {
	Button,
	Modal
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal Dependencies
 */
import './editor.scss';
import FeedbackForm from './feedback-form';

const { assetsPath } = window.themeisleGutenberg ? window.themeisleGutenberg : window.otterObj;
const finishIcon = assetsPath + ( '/' === assetsPath[ assetsPath.length - 1 ] ? '' : '/' ) + 'icons/finish-feedback.svg';

export const FeedbackModalComponent = ({
	source,
	status,
	setStatus,
	closeModal,
	isOpen
}) => {
	return (
		<>
			{ isOpen && (
				<Modal
					className={ classnames( 'o-feedback-modal', { 'no-header': 'submitted' === status }) }
					title={ __( 'What\'s the one thing you need in Otter?', 'otter-blocks' ) }
					onRequestClose={ closeModal }
					shouldCloseOnClickOutside={ false }
				>
					{ 'submitted' !== status ? (
						<FeedbackForm
							source={ source }
							status={ status }
							setStatus={ setStatus }
						/>
					) : (
						<div className="finish-feedback">
							<img
								src={ finishIcon }
							/>
							<p className="f-title">{ __( 'Thank you for your feedback', 'otter-blocks' ) }</p>
							<p className="f-description">{ __( 'Your feedback is highly appreciated and will help us to improve Otter Blocks.', 'otter-blocks' ) }</p>
							<Button
								className="f-done"
								variant="secondary"
								isSecondary
								onClick={ closeModal }
							>
								{ __( 'Done', 'otter-blocks' ) }
							</Button>
						</div>
					) }
				</Modal>
			) }
		</>
	);
};

/**
 * Displays a button that opens a modal for sending feedback
 *
 * @param {string} content
 * @param {string} source
 * @param {string} text
 * @param {Button.ButtonVariant} variant
 */
const FeedbackModal = (
	content,
	source,
	text = __( 'Help us improve', 'otter-blocks' ),
	variant = 'link'
) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ status, setStatus ] = useState( 'notSubmitted' );

	const closeModal = () => {
		setIsOpen( false );
		setStatus( 'notSubmitted' );
	};

	return (
		<>
			<Button
				id="o-feedback"
				variant={ variant }
				isLink={ 'link' === variant }
				isSecondary={ 'secondary' === variant }
				isPrimary={ 'primary' === variant }
				onClick={() => setIsOpen( ! isOpen )}
			>
				{ text }
			</Button>
			<FeedbackModalComponent
				isOpen={isOpen}
				status={status}
				closeModal={closeModal}
				source={source}
				setStatus={setStatus}
			/>
		</>
	);
};

addFilter( 'otter.feedback', 'themeisle-gutenberg/feedback-modal', FeedbackModal );
