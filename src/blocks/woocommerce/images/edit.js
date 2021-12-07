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
				block="themeisle-blocks/product-images"
				attributes={ { ...attributes } }
			/>
		</Disabled>
	);
};

export default Edit;
