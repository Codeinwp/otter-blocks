/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

const WelcomeNotice = () => {
	return (
		<div className="otter-nv-sidebar-upsell o-welcome">
			<div className="otter-nv-sidebar-left">
				<div className="otter-nv-sidebar-heading">
					{/* eslint-disable-next-line jsx-a11y/alt-text */}
					<h2>{ __( 'Welcome to Otter!', 'otter-blocks' ) }</h2>
				</div>
				<div className="otter-nv-sidebar-text">
					<p>
						{ __( 'We\'re excited to help you build beautiful, fast, and flexible WordPress sites. Explore our powerful blocks and customization tools — your site-building journey just got a whole lot easier.', 'otter-blocks' ) }
					</p>
				</div>
				<div className="otter-nv-sidebar-action">
					<Button variant="primary" href={ window.otterObj?.newPageUrl }>{ __( 'Create New Page', 'otter-blocks' ) }</Button>
					<Button icon="external" iconPosition="right" variant="secondary" href={ window.otterObj?.otterPage } target="_blank">{ __( 'Learn More', 'otter-blocks' ) }</Button>
				</div>
			</div>
			<div className="otter-nv-sidebar-right">
				{/* eslint-disable-next-line jsx-a11y/alt-text */}
				<iframe src="https://www.youtube.com/embed/WcS2Vi4IOYw" title="Otter - Page Builder Blocks &amp; Extensions for Gutenberg" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
			</div>
		</div>
	);
};

export default WelcomeNotice;
