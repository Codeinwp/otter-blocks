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
import SiteInfo from './steps/SiteInfo';
import Appearance from './steps/Appearance';

const STEP_DATA = {
	'site_info': {
		title: __( 'Add your site\'s info', 'otter-blocks' ),
		description: __( 'Add your site title and a logo. No logo yet? No worries, you can add one later.', 'otter-blocks' ),
		hideSkip: true,
		controls: SiteInfo
	},
	'appearance': {
		title: __( 'Edit site\'s appearance', 'otter-blocks' ),
		description: __( 'Change the appearance of your entire site in minutes, by choosing a theme style preset.', 'otter-blocks' ),
		hideSkip: true,
		controls: Appearance
	},
	'blog_template': {
		title: __( 'Select a template for your Blog Page', 'otter-blocks' ),
		description: __( 'Choose a layout for for how your blog posts appear in the blog page.', 'otter-blocks' )
	},
	'single_template': {
		title: __( 'Select a template for your Single Posts', 'otter-blocks' ),
		description: __( 'Choose a layout for your single posts', 'otter-blocks' )
	},
	'additional_templates': {
		title: __( 'Add additional pages to your site', 'otter-blocks' ),
		description: __( 'Create additional pages to your website.', 'otter-blocks' )
	}
};

const Sidebar = ({ isEditorLoading }) => {
	const {
		currentStep,
		stepIndex
	} = useSelect( select => {
		const { getStep } = select( 'otter/onboarding' );

		return {
			currentStep: getStep()?.id,
			stepIndex: getStep()?.value
		};
	});

	const { nextStep, previousStep } = useDispatch( 'otter/onboarding' );

	const Controls = STEP_DATA[ currentStep ]?.controls || null;

	const onExit = () => {
		const node = document.getElementById( 'otter-onboarding' );
		node.remove();
	};

	return (
		<div className="o-sidebar">
			{ ( isEditorLoading ) && (
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

				{ 1 !== stepIndex ? (
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

				{ Controls && <Controls /> }
			</div>

			<div className="o-sidebar__actions">
				<Button
					variant="primary"
					onClick={ nextStep }
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
