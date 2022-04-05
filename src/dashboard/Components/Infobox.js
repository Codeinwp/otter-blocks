/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { PanelBody } from '@wordpress/components';

const Infobox = ({
	title,
	children
}) => {
	return (
		<PanelBody>
			<div className="otter-info">
				<h3>{ title }</h3>

				{ children }
			</div>
		</PanelBody>
	);
};

export default Infobox;
