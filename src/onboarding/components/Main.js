/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Spinner } from '@wordpress/components';

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import Homepage from './steps/Homepage';
import Template from './steps/Template';

const STEP_DATA = {
	'site_info': {
		controls: Homepage
	},
	'appearance': {
		controls: Homepage
	},
	'archive_template': {
		controls: Template,
		props: {
			type: 'archive',
			label: __( 'Post Archive', 'otter-blocks' )
		}
	},
	'single_template': {
		controls: Template,
		props: {
			type: 'single',
			label: __( 'Single Post', 'otter-blocks' )
		}
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
			<Controls
				{ ...STEP_DATA[ currentStep ]?.props }
			/>
		</div>
	);
};

export default Main;
