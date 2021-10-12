/**
 * WordPress dependencies.
 */
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import { addBlockId } from './block-utility';

/**
 * Enhance the block by adding the id generating functions
 * @param {*} Block An Otter Block
 * @param {Object} defaultAttributes The default attributes of the block.
 * @param {(string|undefined)} idPrefix (Optional) The prefix used for generating the block id
 * @returns {React.FunctionComponent} An enhanced component
 * @alternative blockInit
 * @example
 * import attributes from './attributes.js';
 * import edit from './edit.js';
 * registerBlockType( 'themeisle-blocks/circle-counter', {
 * 		edit: OtterBlock( edit, attributes ),
 * })
 */
export const OtterBlock = ( Block, defaultAttributes, idPrefix = undefined ) => ( props ) => {
	const { attributes, setAttributes, clientId, name } = props;
	useEffect( () => {
		const unsubscribe = addBlockId({
			idPrefix,
			attributes,
			setAttributes,
			clientId,
			name,
			defaultAttributes
		});
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);
	return <Block {...props}/>;
};
