/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	PanelRow
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import './editor.scss';

const SyncPanel = ({
	fields,
	isSynced,
	setAttributes
}) => {
	const isActive = isSynced?.length == fields.length;

	const onSync = () => {
		if ( isActive ) {
			setAttributes({ isSynced: undefined });
		} else {
			setAttributes({ isSynced: fields });
		}
	};

	return (
		<PanelRow className="o-sync-defaults-row">
			<Button
				icon={ isActive ? 'saved' : 'admin-site-alt3' }
				variant="secondary"
				onClick={ onSync }
			>
				{ isActive ? __( 'Synced with Global Defaults', 'otter-blocks' ) : __( 'Sync with Global Defaults', 'otter-blocks' ) }
			</Button>
		</PanelRow>
	);
};

export default SyncPanel;
