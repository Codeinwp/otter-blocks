/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './value.js';
import './link.js';
import './media.js';

const { Notice } = window.otterComponents;

const Notices = el => {
	if ( Boolean( window.otterPro.isExpired ) ) {
		return (
			<Notice
				notice={ __( 'Otter Pro license has expired.', 'otter-blocks' ) }
				instructions={ __( 'You need to renew your Otter Pro license in order to continue using Pro features of Dynamic Content.', 'otter-blocks' ) }
			/>
		);
	}

	if ( ! Boolean( window.otterPro.isActive ) ) {
		return (
			<Notice
				notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
				instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Dynamic Content.', 'otter-blocks' ) }
			/>
		);
	}

	return el;
};

addFilter( 'otter.dynamicContent.text.notices', 'themeisle-gutenberg/dynamic-content/text-notices', Notices );
addFilter( 'otter.dynamicContent.link.notices', 'themeisle-gutenberg/dynamic-content/link-notices', Notices );
