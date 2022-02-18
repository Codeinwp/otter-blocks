/** @jsx jsx */

/**
 * WordPress dependencies.
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

import {
	css,
	jsx
} from '@emotion/react';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../helpers/block-utility.js';
import Controls from './controls.js';
import Inspector from './inspector.js';

const { attributes: defaultAttributes } = metadata;

const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const styles = css`
		--horizontalAlign: ${ attributes.horizontalAlign };
		${ attributes.gap && `--gap: ${ attributes.gap }px;` }
		${ attributes.defaultSize && `--fontSize: ${ attributes.defaultSize }px;` }
	`;

	const blockProps = useBlockProps({
		id: attributes.id,
		css: styles
	});

	return (
		<Fragment>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<InnerBlocks
					allowedBlocks={ [ 'themeisle-blocks/icon-list-item' ] }
					__experimentalMoverDirection="vertical"
					orientation="vertical"
					template={ [ [ 'themeisle-blocks/icon-list-item' ] ] }
					renderAppender={ InnerBlocks.DefaultAppender }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
