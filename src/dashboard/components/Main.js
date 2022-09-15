/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Placeholder,
	Spinner
} from '@wordpress/components';

import {
	Fragment
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import useSettings from '../../blocks/helpers/use-settings.js';
import Sidebar from './Sidebar.js';
import Dashboard from './pages/Dashboard.js';
import Upsell from './pages/Upsell.js';
import Integrations from './pages/Integrations.js';
import Feedback from './pages/Feedback.js';

const Main = ({
	currentTab,
	setTab
}) => {
	const [ getOption, updateOption, status ] = useSettings();

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
		<Fragment>
			<div className={ `otter-main is-${ currentTab}`}>
				<Content />

				{ ! [ 'upsell', 'feedback' ].includes( currentTab ) && (
					<div className="otter-right">
						<Sidebar setTab={ setTab }/>
					</div>
				) }
			</div>
		</Fragment>
	);
};

export default Main;
