/**
 * WordPress dependencies
 */
import { Disabled } from '@wordpress/components';

import ServerSideRender from '@wordpress/server-side-render';

const Edit = ({
	attributes
}) => {
	return (
		<Disabled>
			<ServerSideRender
				block="themeisle-blocks/product-add-to-cart"
				attributes={ { ...attributes } }
			/>
		</Disabled>
	);
};

export default Edit;
