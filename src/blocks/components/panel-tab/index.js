/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';

const PanelTab = ({
	label,
	onDelete,
	children,
	initialOpen = false
}) => {
	const [ isOpen, setOpen ] = useState( initialOpen );

	return (
		<div className="o-panel-tab">
			<div className="o-panel-tab__header">
				<div className="o-panel-tab__header__label">{ label }</div>

				<Button
					icon={ isOpen ? 'arrow-up-alt2' : 'arrow-down-alt2' }
					label={ isOpen ? __( 'Close Settings', 'otter-blocks' ) : __( 'Open Settings', 'otter-blocks' ) }
					showTooltip={ true }
					onClick={ () => setOpen( ! isOpen ) }
				/>

				<Button
					icon="no-alt"
					label={ __( 'Delete', 'otter-blocks' ) }
					showTooltip={ true }
					onClick={ onDelete }
				/>
			</div>

			{ isOpen && <div className="o-panel-tab__content">{ children }</div> }
		</div>
	);
};

export default PanelTab;
