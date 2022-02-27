/**
 * WordPress dependencies
 */

import { useBlockProps } from '@wordpress/block-editor';

import { Disabled } from '@wordpress/components';

import ServerSideRender from '@wordpress/server-side-render';

const Edit = () => {
	return (
		<div { ...useBlockProps() }>
			<Disabled>
				<ServerSideRender block="themeisle-blocks/about-author"/>
			</Disabled>
		</div>
	);
};

export default Edit;
