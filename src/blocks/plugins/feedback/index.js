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

/**
 * Displays a button that opens a modal for sending feedback
 *
 * @param {import('./type').FeedbackModalProps} props
 * @returns
 */
const FeedbackModal = ({
	source,
	text = __( 'Help us improve', 'otter-blocks' ),
	variant = 'link'
}) => {
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
			{ isOpen && (
				<Modal
					className={ classnames( 'o-feedback-modal', { 'no-header': 'submitted' === status }) }
					title={ __( 'What\'s one thing you need in Otter?', 'otter-blocks' ) }
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

addFilter( 'otter.feedback', 'themeisle-gutenberg/feedback-modal', FeedbackModal );
