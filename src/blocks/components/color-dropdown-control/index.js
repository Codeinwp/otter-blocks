/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	__experimentalColorGradientControl as ColorGradientControl
} from '@wordpress/block-editor';

import {
	Button,
	ColorIndicator,
	Dropdown
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';

/**
 * The component for choosing colors and gradients.
 *
 * Warning: `onColorChange` and `onGradientChange` trigger at the same time. If you choose a color, `onColorChange` will trigger with the color value and `onGradientChange` will trigger with `undefined`.
 *
 * @param {import('./type').ColorDropdownControlProps} props
 * @returns
 */
const ColorDropdownControl = ({
	label,
	colorValue,
	gradientValue,
	onColorChange,
	onGradientChange,
	className
}) => {
	return (
		<Dropdown
			popoverProps={ {
				placement: 'left-start',
				offset: 36,
				shift: true
			} }
			className={ classnames(
				'o-color-dropdown-control',
				className
			) }
			contentClassName="o-color-dropdown-control-content"
			renderToggle={ ({ isOpen, onToggle }) => (
				<Button
					className={ classnames(
						'o-color-dropdown-control-button',
						{ 'is-open': isOpen }
					) }
					onClick={ onToggle }
					aria-expanded={ isOpen }
				>
					<ColorIndicator
						colorValue={ colorValue ?? gradientValue }
					/>

					{ label }
				</Button>
			) }
			renderContent={ () => (
				<ColorGradientControl
					colorValue={ colorValue }
					onColorChange={ onColorChange }
					gradientValue={ gradientValue }
					onGradientChange={ onGradientChange }
				/>
			) }
		/>
	);
};

export default ColorDropdownControl;
