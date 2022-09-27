/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import FeedbackForm from '../../../blocks/plugins/feedback/feedback-form';
import Infobox from '../Infobox';

const finishIcon = `${ window.otterObj.assetsPath }icons/finish-feedback.svg`;

const Feedback = () => {
	const [ status, setStatus ] = useState( 'notSubmitted' );

	return (
		<Infobox
			title={ 'submitted' !== status && __( 'What\'s one thing you need in Otter Blocks?', 'otter-blocks' ) }
		>
			{ 'submitted' !== status ? (
				<FeedbackForm
					source="dashboard"
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
				</div>
			) }
		</Infobox>
	);
};

export default Feedback;
