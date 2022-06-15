/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

import { Disabled } from '@wordpress/components';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

import ServerSideRender from '@wordpress/server-side-render';

/**
 * Internal dependencies
 */
import Controls from './controls.js';
import Inspector from './inspector';
import { blockInit } from '../../helpers/block-utility';
import metadata from './block.json';
import socialList from './services.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Sharing Icon component
 * @param {import('./types.js').SharingIconsProps} props
 * @returns
 */
const Edit = ({
	name,
	attributes,
	setAttributes,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const blockProps = useBlockProps({
		id: attributes.id
	});

	return (
		<Fragment>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
				socialList={ socialList }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				socialList={ socialList }
			/>

			<div { ...blockProps }>
				<Disabled>
					<ServerSideRender
						block="themeisle-blocks/sharing-icons"
						attributes={ attributes }
					/>
				</Disabled>
			</div>
		</Fragment>
	);
};

export default Edit;
