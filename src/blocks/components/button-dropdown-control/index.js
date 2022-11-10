/**
 * External dependencies
 */
import classnames from 'classnames';

/**
  * WordPress dependencies
  */
import {
	Button,
	ColorIndicator,
	Dropdown
} from '@wordpress/components';

/**
  * Internal dependencies
  */
import './editor.scss';

const ButtonDropdownControl = ({
	label,
	indicator,
	children
}) => {
	return (
		<Dropdown
			popoverProps={ {
				placement: 'left-start',
				offset: 36,
				shift: true
			} }
			className="o-button-dropdown-control"
			contentClassName="o-button-dropdown-control-content"
			renderToggle={ ({ isOpen, onToggle }) => (
				<Button
					className={ classnames(
						'o-button-dropdown-control-button',
						{ 'is-open': isOpen }
					) }
					onClick={ onToggle }
					aria-expanded={ isOpen }
				>
					<ColorIndicator
						colorValue={ indicator }
					/>

					{ label }
				</Button>
			) }
			renderContent={ () => <div className="block-editor-block-inspector">{ children }</div> }
		/>
	);
};

export default ButtonDropdownControl;
