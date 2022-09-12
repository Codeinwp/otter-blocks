/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import {
	Button,
	Modal,
	Spinner,
	TextareaControl
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const Feedback = () => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ feedback, setFeedback ] = useState( '' );
	const [ status, setStatus ] = useState( 'notSubmitted' );
	const [ showInfo, setShowInfo ] = useState( false );

	const sendFeedback = () => {
		setStatus( 'loading' );

		fetch( 'https://api.themeisle.com/tracking/feedback', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				slug: 'otter-blocks',
				version: '',
				feedback
			})
		}).then( r => {
			setStatus( 'submitted' );
		});
	};

	return (
		<>
			<Button
				className="o-feedback"
				variant="link"
				isLink
				onClick={() => setIsOpen( ! isOpen )}
			>
				{ __( 'Help us improve', 'otter-blocks' ) }
			</Button>
			{ isOpen && (
				<Modal
					className="o-feedback-modal"
					title={ __( 'Tell us about your experience', 'otter-blocks' ) }
					onRequestClose={() => {
						setIsOpen( false );
						setStatus( 'notSubmitted' );
					}}
				>
					{ 'submitted' !== status ? (
						<>
							<TextareaControl
								placeholder={ __( 'Share your thoughts about Otter Blocks', 'otter-blocks' ) }
								value={ feedback }
								rows={7}
								cols={50}
								onChange={ value => setFeedback( value ) }
							/>
							{ showInfo && (
								<div>
									<p>Details</p>
								</div>
							) }
							<div className="buttons-wrap">
								<Button
									variant="link"
									isLink
									onClick={() => setShowInfo( ! showInfo )}
								>
									{ __( 'What info do we collect?', 'otter-blocks' ) }
								</Button>
								<Button
									variant="primary"
									isPrimary
									onClick={ () => sendFeedback() }
								>
									{ 'loading' === status ? <Spinner/> : __( 'Send feedback', 'otter-blocks' ) }
								</Button>
							</div>
						</>
					) : (
						<p>Thank you!</p>
					) }
				</Modal>
			) }
		</>
	);
};
