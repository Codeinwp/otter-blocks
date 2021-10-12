/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	BaseControl,
	Button,
	Dropdown,
	Toolbar
} from '@wordpress/components';

import { useInstanceId } from '@wordpress/compose';

import { BlockControls } from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';

const StyleSwitcherControl = ({
	label,
	value,
	options,
	onChange
}) => {
	const instanceId = useInstanceId( StyleSwitcherControl );

	const id = `inspector-style-switcher-control-${ instanceId }`;
	const onChangeValue = value => onChange( value );

	return (
		<BaseControl
			id={ id }
			label={ label }
		>
			<div className="otter-style-switcher">
				{ options.map( option => {
					return (
						<Button
							className={ classnames(
								'otter-style-switcher-item',
								{ 'is-active': option.value === value }
							) }
							tabIndex="0"
							onClick={ () => onChangeValue( option.value ) }
						>
							<div className="otter-style-switcher-item-preview">
								<img src={ option.image } />
							</div>
							<div className="otter-style-switcher-item-label">
								{ option.label }
							</div>
						</Button>
					);
				}) }
			</div>
		</BaseControl>
	);
};

export const StyleSwitcherInspectorControl = StyleSwitcherControl;

export const StyleSwitcherBlockControl = ({
	label,
	value,
	options,
	onChange
}) => {
	const onChangeValue = value => onChange( value );

	return (
		<BlockControls>
			<Toolbar>
				<Dropdown
					contentClassName="otter-styles-popover-content"
					position="bottom center"
					renderToggle={ ({ isOpen, onToggle }) => (
						<Button
							className="components-dropdown-menu__toggle"
							icon={ 'admin-appearance' }
							onClick={ onToggle }
							aria-haspopup="true"
							aria-expanded={ isOpen }
							label={ label }
							showTooltip={ true }
						>
							<span className="components-dropdown-menu__indicator" />
						</Button>
					) }
					renderContent={ () => (
						<Fragment>
							<div className="otter-style-switcher">
								{ options.map( option => {
									return (
										<Button
											className={ classnames(
												'otter-style-switcher-item',
												{ 'is-active': option.value === value }
											) }
											tabIndex="0"
											onClick={ () => onChangeValue( option.value ) }
										>
											<div className="otter-style-switcher-item-preview">
												<img src={ option.image } />
											</div>
											<div className="otter-style-switcher-item-label">
												{ option.label }
											</div>
										</Button>
									);
								}) }
							</div>
						</Fragment>
					) }
				/>
			</Toolbar>
		</BlockControls>
	);
};
