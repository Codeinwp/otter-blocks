/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

import { useEffect } from '@wordpress/element';

const Edit = ({
	setAttributes,
	clientId
}) => {
	const { parent } = useSelect( select => {
		const {
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );

		const parentClientId = getBlockRootClientId( clientId );
		const parentBlock = getBlock( parentClientId );

		return {
			parent: parentBlock
		};
	});

	useEffect( () => {
		if ( parent ) {
			setAttributes({ formId: parent.attributes.id });
		}
	}, [ parent ]);

	return null;
};

export default Edit;
