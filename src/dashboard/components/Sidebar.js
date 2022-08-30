/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import Infobox from './Infobox.js';

import LicenseField from './LicenseField.js';
import  { setUtm } from '../../blocks/helpers/helper-functions.js';
const Sidebar = ({
	setTab
}) => {
	return (
		<Fragment>
			{ Boolean( window.otterObj.hasPro ) ? (
				<LicenseField />
			) : (
				<Infobox
					title={ __( 'Otter Pro', 'otter-blocks' ) }
				>
					<p>{ __( 'Upgrade to Otter Pro and get instant access to all pro features — including WooCommerce builder — and much more.', 'otter-blocks' ) }</p>

					<div className="otter-info-button-group">
						<Button
							variant="secondary"
							isSecondary
							onClick={ () => setTab( 'upsell' ) }
						>
							{ __( 'Learn More', 'otter-blocks' ) }
						</Button>

						<Button
							variant="primary"
							isPrimary
							target="_blank"
							href={ setUtm( window.otterObj.upgradeLink, 'infobox' ) }
						>
							{ __( 'Explore Otter Pro', 'otter-blocks' ) }
						</Button>
					</div>
				</Infobox>
			) }

			<Infobox
				title={ __( 'Useful links', 'otter-blocks' ) }
			>
				<ul className="otter-info-links">
					<li><a href="https://wordpress.org/support/plugin/otter-blocks" target="_blank">{ __( 'Support', 'otter-blocks' ) }</a></li>
					<li><a href="https://otter.nolt.io/" target="_blank">{ __( 'Feature request', 'otter-blocks' ) }</a></li>
					<li><a href="https://wordpress.org/support/plugin/otter-blocks/reviews/#new-post" target="_blank">{ __( 'Leave a review', 'otter-blocks' ) }</a></li>
				</ul>

				<div className="otter-info-button-group is-single">
					<Button
						variant="secondary"
						isSecondary
						target="_blank"
						href={ window.otterObj.docsLink }
					>
						{ __( 'Documentation', 'otter-blocks' ) }
					</Button>
				</div>
			</Infobox>
		</Fragment>
	);
};

export default Sidebar;
