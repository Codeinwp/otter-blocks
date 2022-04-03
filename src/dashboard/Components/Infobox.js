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
				<h2>{ title }</h2>

				{ children }
			</div>
		</PanelBody>
	);
};

export default Infobox;
