/**
 * WordPress dependencies.
 */
import { Tooltip } from '@wordpress/components';

import { info } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './editor.scss';

const Notice = ({
	notice,
	instructions
}) => {
	return (
		<div className="o-notice">
			{ notice }

			{ instructions && (
				<Tooltip
					text={ instructions }
					position="bottom center"
				>
					{ info }
				</Tooltip>
			) }
		</div>
	);
};

export default Notice;
