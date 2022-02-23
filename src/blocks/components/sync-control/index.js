/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Disabled,
	ToggleControl
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import './editor.scss';

const SyncControl = ({
	field,
	isSynced,
	setAttributes,
	children
}) => {
	const isActive = isSynced?.includes( field );

	const toggleSync = () => {
		let fields = [ ...isSynced ];

		if ( isActive ) {
			const index = fields.indexOf( field );
			if ( -1 !== index ) {
				fields.splice( index, 1 );
			}
		} else {
			fields.push( field );
		}

		if ( 0 === fields.length ) {
			fields = undefined;
		}

		setAttributes({
			isSynced: fields
		});
	};

	return (
		<fieldset className="otter-sync-control">
			<legend>
				<ToggleControl
					label={ __( 'Sync with Globals', 'otter-blocks' ) }
					checked={ isActive }
					onChange={ toggleSync }
				/>
			</legend>

			{ isActive ? <Disabled>{ children }</Disabled> : children }
		</fieldset>
	);
};

export default SyncControl;
