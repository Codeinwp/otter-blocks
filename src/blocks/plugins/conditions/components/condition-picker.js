/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Dropdown,
	Icon,
	SearchControl
} from '@wordpress/components';

import { useState } from '@wordpress/element';

import { lock } from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import { getConditionIcon } from '../utils.js';

const PickerContent = ({ conditions, onSelect }) => {
	const [ search, setSearch ] = useState( '' );

	// With Otter Pro active, the remaining disabled entries need their integration plugin instead.
	const disabledHelp = Boolean( window.otterPro?.isActive ) ?
		__( 'Requires a plugin that is not installed or active.', 'otter-blocks' ) :
		__( 'Available in Otter Pro', 'otter-blocks' );

	const groups = Object.keys( conditions )
		.map( key => {
			const group = conditions[ key ];
			const query = search.trim().toLowerCase();

			return {
				...group,
				items: group.conditions.filter( condition => {
					if ( ! query ) {
						return true;
					}

					return condition.label.toLowerCase().includes( query ) || group.label.toLowerCase().includes( query );
				})
			};
		})
		.filter( group => Boolean( group.items.length ) );

	return (
		<div className="o-conditions-picker">
			<SearchControl
				__nextHasNoMarginBottom
				hideLabelFromVision
				label={ __( 'Search conditions', 'otter-blocks' ) }
				placeholder={ __( 'Search conditions…', 'otter-blocks' ) }
				value={ search }
				onChange={ setSearch }
			/>

			<div className="o-conditions-picker__list">
				{ ! groups.length && (
					<p className="o-conditions-picker__empty">{ __( 'No conditions found.', 'otter-blocks' ) }</p>
				) }

				{ groups.map( group => (
					<div key={ group.label }>
						<div className="o-conditions-picker__group-label">{ group.label }</div>

						{ group.items.map( condition => {
							const isDisabled = Boolean( condition?.isDisabled );

							return (
								<button
									key={ condition.value }
									type="button"
									className={ classnames( 'o-conditions-picker__item', { 'is-disabled': isDisabled }) }
									aria-disabled={ isDisabled }
									title={ isDisabled ? disabledHelp : undefined }
									onClick={ () => {
										if ( ! isDisabled ) {
											onSelect( condition.value );
										}
									} }
								>
									<span className="o-conditions__row-icon">
										<Icon icon={ getConditionIcon( condition.value ) } size={ 16 } />
									</span>

									<span className="o-conditions-picker__item-content">
										<span className="o-conditions-picker__item-label">
											{ condition.label }
											{ isDisabled && <Icon icon={ lock } size={ 14 } /> }
										</span>

										{ condition.help && (
											<span className="o-conditions-picker__item-help">{ condition.help }</span>
										) }
									</span>
								</button>
							);
						}) }
					</div>
				) ) }
			</div>
		</div>
	);
};

const ConditionPicker = ({
	conditions,
	onSelect,
	renderToggle
}) => {
	return (
		<Dropdown
			className="o-conditions__picker"
			popoverProps={ {
				placement: 'bottom-start',
				noArrow: true,
				className: 'o-conditions-picker__popover'
			} }
			renderToggle={ renderToggle }
			renderContent={ ({ onClose }) => (
				<PickerContent
					conditions={ conditions }
					onSelect={ value => {
						onSelect( value );
						onClose();
					} }
				/>
			) }
		/>
	);
};

export default ConditionPicker;
