/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Spinner } from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	useEffect,
	useState
} from '@wordpress/element';

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

	const [ isLoading, setIsLoading ] = useState( true );

	const Controls = STEP_DATA[ currentStep ]?.content || null;

	useEffect( () => {
		if ( ! isEditorLoading ) {
			setIsLoading( false );
		}
	}, [ isEditorLoading ]);

	if ( isLoading ) {
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
