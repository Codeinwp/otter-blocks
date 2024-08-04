/**
 * WordPress Dependencies
 */
import {
	Placeholder,
	Spinner
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import { useSelect } from '@wordpress/data';

import { isEmpty } from 'lodash';

export const useThumbnail = ( id, size, alt ) => {
	const {
		featuredImage,
		altText
	} = useSelect( select => {
		if ( ! id ) {
			return {
				featuredImage: null,
				altText: null
			};
		}

		const image = select( 'core' ).getMedia( id, { context: 'view' });

		const featuredImage = image ?
			( 'string' !== typeof image && ! isEmpty( image.media_details ) && 0 < Object.keys( image.media_details.sizes ).length ) ?
				image.media_details.sizes[size] ?
					image.media_details.sizes[size].source_url :
					image.source_url :
				image.source_url :
			null;

		return {
			featuredImage,
			altText: image && image.alt_text ? image.alt_text : alt
		};
	}, [ size, id ]);

	return {
		featuredImage,
		altText
	};
};

export const Thumbnail = ({
	id,
	link,
	alt,
	size,
	imgStyle
}) => {
	const { featuredImage, altText } = useThumbnail( id, size, alt );

	if ( null === featuredImage ) {
		return <Fragment />;
	}

	return (
		<div className="o-posts-grid-post-image">
			<a href={ link }>
				{ featuredImage ? <img src={ featuredImage } size={ size } alt={ altText } data-id={ id } style={ imgStyle } /> : <Placeholder><Spinner/></Placeholder> }
			</a>
		</div>
	);
};
