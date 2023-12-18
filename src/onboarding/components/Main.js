/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Spinner } from '@wordpress/components';

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import STEP_DATA from '../steps';

const Main = ({ isEditorLoading }) => {
	const { currentStep } = useSelect( select => {
		const { getStep } = select( 'otter/onboarding' );

		return {
			currentStep: getStep()?.id
		};
	});

	const Controls = STEP_DATA[ currentStep ]?.content || null;

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
