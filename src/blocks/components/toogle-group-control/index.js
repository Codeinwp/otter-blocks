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
 * Style properties.
 * @typedef {Object} Style
 * @property {object} group - The group style.
 * @property {object} option - The option style.
 * @property {object} button - The button style.
 * @property {object} label - The group style.
 */


/**
 * Option definition.
 * @typedef {Object} Option
 * @property {(number|string)} label - The current value.
 * @property {(number|string)} value - Hide the labels.
 * @property {any} icon - Hide the labels.
 */

/**
 * Toggle Group Control properties.
 * @typedef {Object} ToogleGroupControlProps
 * @property {(number|string)} value - The current value.
 * @property {Array.<Option>} options - The options.
 * @property {Func} onChange - Handler for changing the current value.
 * @property {boolean} hideLabels - Hide the labels.
 * @property {boolean} hideTooltip - Hide tooltip.
 * @property {boolean} showBottomLabels - Display the labels under the buttons.
 * @property {Style} style - The component style.
 */

/**
 *	A group of buttons that actions as a toggle
 *
 * @param {ToogleGroupControlProps} props
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
							style={ style?.button }
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
