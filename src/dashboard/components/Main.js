/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Placeholder,
	Spinner
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import useSettings from '../../blocks/helpers/use-settings.js';
import Sidebar from './Sidebar.js';
import Dashboard from './pages/Dashboard.js';
import Upsell from './pages/Upsell.js';
import Integrations from './pages/Integrations.js';
import Feedback from './pages/Feedback.js';
import NoticeCard from './NoticeCard';
import { applyFilters } from '@wordpress/hooks';

const Main = ({
	currentTab,
	setTab
}) => {
	const [ getOption, updateOption, status ] = useSettings();
	const feedbackBtn = applyFilters( 'otter.feedback', 'dashboard', __( 'Share your Feedback', 'otter-blocks' ), 'secondary' );

	if ( 'loading' === status ) {
		return (
			<Placeholder>
				<Spinner />
			</Placeholder>
		);
	}

	const Content = () => {
		switch ( currentTab ) {
		case 'integrations':
			return (
				<div className="otter-left">
					<Integrations/>
				</div>
			);
		case 'upsell':
			return (
				<Upsell />
			);
		case 'feedback':
			return (
				<Feedback />
			);
		default:
			return (
				<div className="otter-left">
					<Dashboard
						status={ status }
						getOption={ getOption }
						updateOption={ updateOption }
					/>
				</div>
			);
		}
	};

	return (
		<div className={ `otter-main is-${ currentTab}`}>
			{ 'dashboard' === currentTab && window.otterObj.showFeedbackNotice && (
				<NoticeCard
					slug="feedback"
				>
					<img src={ window.otterObj.assetsPath + 'images/dashboard-feedback.png' } style={ { maxWidth: '100%', objectFit: 'cover' } }/>
					<div className="notice-text">
						<h3>{ __( 'What\'s one thing you need in Otter Blocks?', 'otter-blocks' ) }</h3>
						<span>{ __( 'We\'re always looking for suggestions to further improve Otter Blocks and your feedback can help us do that.', 'otter-blocks' ) }</span>
					</div>
					<span>
						{ feedbackBtn }
					</span>
				</NoticeCard>
			) }

			<Content />

			{ 'upsell' !== currentTab && (
				<div className="otter-right">
					<Sidebar setTab={ setTab }/>
				</div>
			) }
		</div>
	);
};

export default Main;
