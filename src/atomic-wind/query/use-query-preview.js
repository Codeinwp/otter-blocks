import { useSelect } from '@wordpress/data';

/**
 * Returns preview data from the first queried post when inside a query box with a postField set.
 *
 * @param {string} clientId  Block client ID.
 * @param {string} postField The postField attribute value.
 * @return {{ isActive: boolean, post: Object|null, queryPostType: string }} Preview state.
 */
export default function useQueryPreview( clientId, postField ) {
	return useSelect( ( select ) => {
		const inactive = { isActive: false, post: null, queryPostType: '' };

		if ( ! postField ) {
			return inactive;
		}

		const { getBlockParents, getBlock } = select( 'core/block-editor' );
		const parents = getBlockParents( clientId );
		let queryPostType = '';
		for ( const parentId of parents ) {
			const parent = getBlock( parentId );
			if ( parent?.name === 'atomic-wind/box' && parent?.attributes?.queryPostType ) {
				queryPostType = parent.attributes.queryPostType;
				break;
			}
		}

		if ( ! queryPostType ) {
			return inactive;
		}

		const posts = select( 'core' ).getEntityRecords( 'postType', queryPostType, {
			per_page: 1,
			_embed: true,
		} );

		return {
			isActive: true,
			post: posts && posts.length > 0 ? posts[ 0 ] : null,
			queryPostType,
		};
	}, [ clientId, postField ] );
}
