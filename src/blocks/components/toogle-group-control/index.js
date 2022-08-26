/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	ButtonGroup,
	Button
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';

/**
 *	A group of buttons that actions as a toggle
 *
 * @param {import('./type').ToggleGroupControlProps} props
 * @returns {JSX.Element}
 */
const ToogleGroupControl = ({
	value,
	options,
	onChange,
	hideLabels,
	hideTooltip,
	showBottomLabels,
	hasIcon = false
}) => {
	return (
		<ButtonGroup
			className={ classNames(
				'o-toggle-group-control',
				{
					'has-icon': hasIcon
				}
			) }
		>
			{ options?.map( option => {
				return (
					<div
						key={ option?.value }
						className="o-toggle-option"
					>
						<Button
							isPrimary={ value == option?.value }
							variant={ value == option?.value ? 'primary' : 'secondary' }
							icon={ option?.icon }
							label={ option?.label }
							onClick={ () => onChange( option?.value )}
							showTooltip={ Boolean( hideTooltip ) }
						>
							{ option?.label && ! Boolean( hideLabels ) && ! Boolean( showBottomLabels ) ? option?.label : '' }
						</Button>

						<p>{ option?.label && ! Boolean( hideLabels ) && Boolean( showBottomLabels ) ?  option?.label : '' }</p>
					</div>
				);
			}) }
		</ButtonGroup>
	);
};

export default ToogleGroupControl;
