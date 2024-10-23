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

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Controls from './controls.js';
import Inspector from './inspector.js';
import socialList from './services.js';
import { blockInit } from '../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Sharing Icon component
 * @param {import('./types.js').SharingIconsProps} props
 * @return
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const { isQueryChild } = useSelect( select => {
		const {
			getBlock,
			getBlockParentsByBlockName
		} = select( 'core/block-editor' );

		const currentBlock = getBlock( clientId );

		return {
			isQueryChild: 0 < getBlockParentsByBlockName( currentBlock?.clientId, 'core/query' ).length
		};
	}, []);

	useEffect( () => {
		if ( isQueryChild ) {
			setAttributes({ context: 'query' });
		}
	}, [ isQueryChild ]);

	const blockProps = useBlockProps();

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
