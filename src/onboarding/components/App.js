/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import Sidebar from './Sidebar';
import Main from './Main';
import { useIsSiteEditorLoading } from '../hooks';

const App = () => {
	const isEditorLoading = useIsSiteEditorLoading();

	return (
		<div id="otter-onboarding">
			<div className="o-onboarding">
				<Sidebar
					isEditorLoading={ isEditorLoading }
				/>

				<Main
					isEditorLoading={ isEditorLoading }
				/>
			</div>
		</div>
	);
};

export default App;
