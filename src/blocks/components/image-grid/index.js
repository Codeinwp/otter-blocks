/**
 * WordPress dependencies
 */
import { debounce } from 'lodash';

import {
	MediaUpload,
	MediaUploadCheck
} from '@wordpress/block-editor';

import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';
import GridList from './GridList.js';

const ImageGrid = ({
	attributes,
	onSelectImages
}) => {
	const selectImages = useMemo( () => debounce( onSelectImages, 250 ), []);

	return (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={ selectImages }
				allowedTypes={ [ 'image' ] }
				multiple
				addToGallery={ true }
				gallery
				value={ attributes.images.map( ({ id }) => id ) }
				render={ ({ open }) => (
					<GridList
						attributes={ attributes }
						open={ open }
						onSelectImages={ onSelectImages }
					/>
				) }
			/>
		</MediaUploadCheck>
	);
};

export default ImageGrid;
