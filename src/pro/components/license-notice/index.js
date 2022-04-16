/**
 * WordPress dependencies.
 */
import { Tooltip } from '@wordpress/components';

import { info } from '@wordpress/icons';

const LicenseNotice = ({
	notice,
	instructions
}) => {
	return (
		<div className="o-expired-notice">
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

export default LicenseNotice;
