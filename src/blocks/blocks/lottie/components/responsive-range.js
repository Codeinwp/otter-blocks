import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Button, RangeControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

const ResponsiveRange = ({
	label,
	help,
	value,
	units,
	activeUnit,
	onReset,
	onChange,
	onUnitChange,
	min = 0,
	max = 100
}) => {
	const unitButtons = () => {
		return units.map( ( unit, index ) => {
			const buttonClass = classnames({
				active: activeUnit ? activeUnit === unit : 'px' === unit
			});

			return (
				<Button
					key={index}
					isSmall
					className={ buttonClass }
					onClick={ () => onUnitChange( unit ) }
				>
					{ unit }
				</Button>
			);
		});
	};

	return (
		<div className="otter-responsive-range-control">
			<div className="units">{ unitButtons() }</div>
			<RangeControl
				label={ label }
				help={ help }
				value={ value }
				onChange={ onChange }
				allowReset
				min={ min }
				max={ max }
			/>
		</div>
	);
};

export default ResponsiveRange;
