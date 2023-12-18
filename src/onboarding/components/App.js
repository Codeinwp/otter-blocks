/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { useSelect } from '@wordpress/data';

import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import Finish from './Finish';
import Start from './Start';
import Sidebar from './Sidebar';
import Main from './Main';
import { useIsSiteEditorLoading } from '../hooks';
import { recordEvent } from '../utils';

const App = () => {
	const isEditorLoading = useIsSiteEditorLoading();

	const {
		isFinished,
		isWelcomeScreen,
		isSmall
	} = useSelect( select => {
		const {
			isFinished,
			isWelcomeScreen
		} = select( 'otter/onboarding' );
		const { isViewportMatch } = select( 'core/viewport' );

		const isSmall = isViewportMatch( '< medium' );

		return {
			isFinished: isFinished(),
			isWelcomeScreen: isWelcomeScreen(),
			isSmall
		};
	}, []);

	useEffect( () => {
		recordEvent();
	}, []);

	if ( isWelcomeScreen ) {
		return (
			<div id="otter-onboarding">
				<Start/>
			</div>
		);
	}

	if ( isFinished ) {
		return (
			<div id="otter-onboarding">
				<Finish/>
			</div>
		);
	}

	return (
		<div id="otter-onboarding">
			<div className="o-onboarding">
				<Sidebar
					isEditorLoading={ isEditorLoading }
				/>

				{ ! isSmall && (
					<Main
						isEditorLoading={ isEditorLoading }
					/>
				)}
			</div>
		</div>
	);
};

export default App;
