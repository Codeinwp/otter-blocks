import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';

const Feedback = () => {
	return (
		<PanelBody>
			<div className="otter-info">
				<h3>{ __( 'Answer a few questions to help us improve Otter', 'otter-blocks' ) }</h3>
				<p>{ __( 'We\'re always looking for suggestions to further improve Otter Blocks. If your feedback is especially helpful, and we choose to do an interview with you to discuss your suggestions, you will even gain a yearly membership for free for your trouble.', 'otter-blocks' ) }</p>
				{ applyFilters( 'otter.feedback', 'dashboard', __( 'Share your Feedback', 'otter-blocks' ), 'secondary' ) }
			</div>
			<img src={ window.otterObj.assetsPath + 'images/dashboard-feedback.png' }/>
		</PanelBody>
	);
};

export default Feedback;
