/**
 * External dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import SiteInfo from './components/steps/SiteInfo';
import Appearance from './components/steps/Appearance';
import Homepage from './components/steps/Homepage';
import Template from './components/steps/Template';
import Pages from './components/steps/Pages';

const isSupported = step => {
	const { supportedSteps } = window.otterOnboardingData;

	return supportedSteps.includes( step );
};

const STEP_DATA = {
	'site_info': {
		title: __( 'Add your site\'s info', 'otter-blocks' ),
		description: __( 'Add your site title and a logo. No logo yet? No worries, you can add one later.', 'otter-blocks' ),
		isSupported: true,
		hideSkip: true,
		controls: SiteInfo,
		content: Homepage
	},
	'appearance': {
		title: __( 'Edit site\'s appearance', 'otter-blocks' ),
		description: __( 'Change the appearance of your entire site in minutes, by choosing a theme style preset.', 'otter-blocks' ),
		isSupported: true,
		hideSkip: true,
		controls: Appearance,
		content: Homepage
	},
	'front-page_template': {
		title: __( 'Select a template for your Homepage', 'otter-blocks' ),
		description: __( 'Choose a layout for for website\'s homepage.', 'otter-blocks' ),
		isSupported: isSupported( 'front-page' ),
		content: Template,
		props: {
			type: 'front-page',
			label: __( 'Homepage', 'otter-blocks' )
		}
	},
	'archive_template': {
		title: __( 'Select a template for your Blog Page', 'otter-blocks' ),
		description: __( 'Choose a layout for how your blog posts appear in the blog page.', 'otter-blocks' ),
		isSupported: isSupported( 'archive' ),
		content: Template,
		props: {
			type: 'archive',
			label: __( 'Post Archive', 'otter-blocks' )
		}
	},
	'single_template': {
		title: __( 'Select a template for your Single Posts', 'otter-blocks' ),
		description: __( 'Choose a layout for your single posts', 'otter-blocks' ),
		isSupported: isSupported( 'single' ),
		content: Template,
		props: {
			type: 'single',
			label: __( 'Single Post', 'otter-blocks' )
		}
	},
	'additional_templates': {
		title: __( 'Add additional pages to your site', 'otter-blocks' ),
		description: __( 'Create additional pages to your website.', 'otter-blocks' ),
		isSupported: isSupported( 'page_templates' ),
		content: Pages
	}
};

export default STEP_DATA;
