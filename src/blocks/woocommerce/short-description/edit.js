/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

import { Disabled } from '@wordpress/components';

import ServerSideRender from '@wordpress/server-side-render';

const Edit = ({
	attributes
}) => {
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			<Disabled>
				<ServerSideRender
					block="themeisle-blocks/product-short-description"
					attributes={ { ...attributes } }
				/>
			</Disabled>
		</div>
	);
};

export default Edit;
