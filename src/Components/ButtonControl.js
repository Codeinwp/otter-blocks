/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

const ButtonControl = ({
	label,
	help,
	buttonLabel,
	disabled,
	action,
	className
}) => {
	return (
		<div
			className={ classnames(
				'components-base-control',
				'otter-button-control',
				className
			) }
		>
			<div className="components-base-control_labels">
				<span className="components-base-control__label">{ label }</span>
				<p className="components-base-control__help">{ help }</p>
			</div>

			<div className="otter-button-control-group">
				<Button
					isPrimary
					isLarge
					disabled={ disabled }
					onClick={ action }
				>
					{ buttonLabel }
				</Button>
			</div>
		</div>
	);
};

export default ButtonControl;
