/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {

	/*@ts-ignore */
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

type ColorDropdownControlProps = {
	label?: string
	colorValue?: string
	gradientValue?: string
	onColorChange?: ( color: string ) => void
	onGradientChange?: ( color: string ) => void
	className?: `${'is-list' | 'is-list is-first'}${string}`
}

/**
 * Add a single color picker component. To append a component to one another use "is-list" as className in both component. Use "is-first" to mark which is the first.
 * @param props The props.
 * @returns A color picker component.
 */
const ColorDropdownControl = ({
	label,
	colorValue,
	gradientValue,
	onColorChange,
	onGradientChange,
	className
} : ColorDropdownControlProps ) => {
	return (
		<Dropdown

			/*@ts-ignore */
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

						/*@ts-ignore */
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
