/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	Disabled,
	Spinner
} from '@wordpress/components';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

/**
 * Internal dependencies.
 */
import STEP_DATA from '../steps';
import Main from './Main';

const Sidebar = ({ isEditorLoading }) => {
	const {
		currentStep,
		stepIndex,
		isSaving,
		siteURL,
		isSmall
	} = useSelect( select => {
		const { getSite } = select( 'core' );

		const {
			getStep,
			isSaving
		} = select( 'otter/onboarding' );

		const { isViewportMatch } = select( 'core/viewport' );

		const isSmall = isViewportMatch( '< medium' );

		const siteURL = getSite()?.url;

		return {
			currentStep: getStep()?.id,
			stepIndex: getStep()?.value,
			isSaving: isSaving(),
			siteURL,
			isSmall
		};
	});

	const {
		nextStep,
		previousStep,
		onContinue
	} = useDispatch( 'otter/onboarding' );

	const Controls = STEP_DATA[ currentStep ]?.controls || null;

	const onExit = () => {
		window.open( siteURL, '_self' );
	};

	return (
		<div className="o-sidebar">
			{ ( isEditorLoading || isSaving ) && (
				<div className="o-sidebar__loader">
					<Disabled>
						<Spinner />
					</Disabled>
				</div>
			) }

			<div className="o-sidebar__header">
				<img
					className="o-sidebar__logo"
					src={ `${ window.otterObj.assetsPath }images/logo-alt.png` }
				/>

				{ 0 !== stepIndex ? (
					<Button
						variant="tertiary"
						onClick={ previousStep }
					>
						{ __( 'Go back', 'otter-blocks' ) }
					</Button>
				) : (
					<Button
						variant="tertiary"
						onClick={ onExit }
					>
						{ __( 'Exit', 'otter-blocks' ) }
					</Button>
				) }
			</div>

			<div className="o-sidebar__content">
				<div className="o-sidebar__info">
					<h2>{ STEP_DATA[ currentStep ]?.title }</h2>
					<p>{ STEP_DATA[ currentStep ]?.description }</p>
				</div>

				{ isSmall && (
					<Main
						isEditorLoading={ isEditorLoading }
					/>
				) }

				{ Controls && <Controls /> }
			</div>

			<div className="o-sidebar__actions">
				<Button
					variant="primary"
					onClick={ onContinue }
				>
					{ __( 'Continue', 'otter-blocks' ) }
				</Button>

				{ ! STEP_DATA[ currentStep ]?.hideSkip && (
					<Button
						variant="tertiary"
						onClick={ nextStep }
					>
						{ __( 'Skip this step', 'otter-blocks' ) }
					</Button>
				) }
			</div>
		</div>
	);
};

export default Sidebar;
