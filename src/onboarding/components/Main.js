/**
 * WordPress dependencies.
 */
import { Spinner } from '@wordpress/components';

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import Homepage from './steps/Homepage';

const STEP_DATA = {
	'site_info': {
		controls: Homepage
	},
	'appearance': {
		controls: Homepage
	},
	'blog_template': {
		controls: Homepage
	},
	'single_template': {
		controls: Homepage
	},
	'additional_templates': {
		controls: Homepage
	}
};

const Main = ({ isEditorLoading }) => {
	const { currentStep } = useSelect( select => {
		const { getStep } = select( 'otter/onboarding' );

		return {
			currentStep: getStep()?.id
		};
	});

	const Controls = STEP_DATA[ currentStep ]?.controls || null;

	if ( isEditorLoading ) {
		return (
			<div className="o-preview__loader">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="o-main">
			<Controls/>
		</div>
	);
};

export default Main;
