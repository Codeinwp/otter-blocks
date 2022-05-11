/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Disabled,
	ToggleControl
} from '@wordpress/components';

import { useDispatch } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

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
	const { enableComplementaryArea } = useDispatch( 'core/interface' );

	const isActive = isSynced?.includes( field );

	const toggleSync = () => {
		let fields = [ ...( isSynced || []) ];

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
		<fieldset className="o-sync-control">
			<legend>
				<ToggleControl
					label={ <Fragment>{ __( 'Sync with', 'otter-blocks' ) }</Fragment> }
					checked={ isActive }
					onChange={ toggleSync }
				/>

				<span
					tabIndex="0"
					className="clickable"
					onClick={ () => enableComplementaryArea( 'core/edit-post', 'themeisle-blocks/otter-options' ) }
				>
					{ __( 'Globals', 'otter-blocks' ) }
				</span>
			</legend>

			{ isActive ? <Disabled>{ children }</Disabled> : children }
		</fieldset>
	);
};

export default SyncControl;
