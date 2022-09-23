/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import './editor.scss';

const ButtonToggle = ({
	label,
	help,
	options,
	value,
	onChange
}) => {
	return (
		<BaseControl
			label={ label }
			help={ help }
		>
			<div className="o-button-toggle">
				{ options.map( option => {
					return (
						<Button
							className={ classnames(
								'o-button-toggle__item',
								{
									'is-active': option.value === value
								}
							) }
							key={ option.value }
							variant="secondary"
							label={ option.label }
							aria-current={ option.value === value }
							onClick={ () => onChange( option.value ) }
						>
							{ option.label }
						</Button>
					);
				}) }
			</div>
		</BaseControl>
	);
};

export default ButtonToggle;
