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
	style
}) => {
	return (
		<ButtonGroup
			className="o-toggle-group-control"
			style={ style?.group }
		>
			{ options?.map( option => {
				return (
					<div
						key={ option?.value }
						className="o-toggle-option"
						style={ style?.option }
					>
						<Button
							isPrimary={ value == option?.value }
							variant={ value == option?.value ? 'primary' : 'secondary' }
							icon={ option?.icon }
							label={ option?.label }
							onClick={ () => onChange( option?.value )}
							showTooltip={ Boolean( hideTooltip ) }
							style={ value == option?.value ? ( style?.active ?? style?.button ) : style?.button }
						>
							{ option?.label && ! Boolean( hideLabels ) && ! Boolean( showBottomLabels ) ? option?.label : '' }
						</Button>

						<p style={ style?.label }>{ option?.label && ! Boolean( hideLabels ) && Boolean( showBottomLabels ) ?  option?.label : '' }</p>
					</div>
				);
			}) }
		</ButtonGroup>
	);
};

export default ToogleGroupControl;
