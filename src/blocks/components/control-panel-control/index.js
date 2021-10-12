/**
 * External dependencies
 */
import classnames from 'classnames';
import { backup, Icon } from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	Dropdown
} from '@wordpress/components';

import { useInstanceId } from '@wordpress/compose';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';

const ControlPanelControl = ({
	label,
	attributes,
	setAttributes,
	resetValues,
	onClick,
	children
}) => {
	useEffect( () => {
		for ( const key in resetValues ) {
			if ( resetValues[ key ] !== attributes[ key ]) {
				return setActive( true );
			}

			setActive( false );
		}
	}, [ attributes ]);

	const instanceId = useInstanceId( ControlPanelControl );

	const [ isActive, setActive ] = useState( false );

	const id = `inspector-control-panel-control-${ instanceId }`;

	return (
		<div className="otter-control-panel-control">
			<div className="components-base-control__field">
				<div className="components-base-control__title">
					<label
						className="components-base-control__label"
						for={ id }
					>
						{ label }
					</label>

					<div className="floating-controls">
						<Dropdown
							position="top left"
							headerTitle={ label }
							expandOnMobile={ true }
							renderToggle={ ({ isOpen, onToggle }) => (
								<Fragment>
									{ isActive && (
										<Button
											icon={ <Icon icon={ backup } /> }
											label={ __( 'Reset to default', 'otter-blocks' ) }
											shotTooltip={ true }
											isTertiary
											onClick={ () => setAttributes({ ...resetValues }) }
										/>
									) }

									<Button
										id={ id }
										icon="admin-settings"
										label={ label }
										shotTooltip={ true }
										onClick={ () => {
											onToggle();
											if ( onClick ) {
												onClick();
											}
										} }
										aria-expanded={ isOpen }
										className={ classnames(
											{ 'is-active': isActive }
										) }
									/>
								</Fragment>
							) }
							renderContent={ () => (
								<div className="otter-popover-settings">
									{ children }
								</div>
							) }
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ControlPanelControl;
