/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import Finish from './Finish';
import Sidebar from './Sidebar';
import Main from './Main';
import { useIsSiteEditorLoading } from '../hooks';

const App = () => {
	const isEditorLoading = useIsSiteEditorLoading();

	const {
		isFinished,
		isSmall
	} = useSelect( select => {
		const { isFinished } = select( 'otter/onboarding' );
		const { isViewportMatch } = select( 'core/viewport' );

		const isSmall = isViewportMatch( '< medium' );

		return {
			isFinished: isFinished(),
			isSmall
		};
	}, []);

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
