/**
 * WordPress dependencies
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import { Placeholder } from '@wordpress/components';

const Inactive = ({
	icon,
	label,
	blockProps
}) => {
	const instructions = sprintf(
		// translators: %1$s: block name, %2$s: action (renew or activate)
		__( 'You need to %2$s your Otter Pro license in order to use %1$s block.', 'otter-blocks' ),
		label,
		Boolean( window.otterPro.isExpired ) ? __( 'renew', 'otter-blocks' ) : __( 'activate', 'otter-blocks' )
	);

	return (
		<div { ...blockProps }>
			<Placeholder
				icon={ icon }
				label={ label }
				instructions={ instructions }
				className="o-license-warning"
			/>
		</div>
	);
};

export default Inactive;
