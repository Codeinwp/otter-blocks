/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */


import {
	Thumbnail,
	useThumbnail
} from './thumbnail.js';

import { getActiveStyle } from '../../../../helpers/helper-functions.js';

import { styles } from '../../constants.js';

import {
	PostsCategory,
	PostsDescription,
	PostsMeta,
	PostsTitle
} from './index.js';

const FeaturedPost = ({
	post,
	attributes,
	author,
	categoriesList
}) => {
	const activeStyle = getActiveStyle( styles, attributes?.className );
	const isTiled = 'tiled' === activeStyle;
	const { featuredImage } = useThumbnail( post?.featured_media, post.title?.rendered, attributes?.imageSize );

	if ( ! post  ) {
		return '';
	}

	const category = categoriesList && 0 < post?.categories?.length ? categoriesList.find( item => item.id === post.categories[0]) : undefined;

	const hasFeaturedImage = 0 !== post.featured_media && attributes.displayFeaturedImage;

	const css = {
		backgroundPosition: 'center center',
		backgroundSize: 'cover'
	};

	if ( hasFeaturedImage && isTiled ) {
		css.backgroundImage = `url(${ featuredImage })`;
	}

	return (
		<div className="o-featured-container">
			<div
				className="o-featured-post"
				style={ css }
			>
				{ ( attributes.displayFeaturedImage && ! isTiled ) && (
					<Thumbnail
						id={ post.featured_media }
						link={ post.link }
						alt={ post.title?.rendered }
						imgStyle={{
							borderRadius: attributes.borderRadius !== undefined ? attributes.borderRadius + 'px' : undefined
						}}
					/>
				) }

				<div className="o-posts-grid-post-body">
					{ attributes.template.map( element => {
						const categories = categoriesList && 0 < post?.categories?.length ? categoriesList.filter( item => post.categories.includes( item.id ) ) : [];

						switch ( element ) {
						case 'category':
							return <PostsCategory attributes={ attributes } element={ element } category={ category } categoriesList={ categoriesList }/>;
						case 'title':
							return <PostsTitle attributes={ attributes } element={ element } post={ post } />;
						case 'meta':
							return <PostsMeta attributes={ attributes } element={ element } post={ post } author={ author } categories={ categories } />;
						case 'description':
							return <PostsDescription attributes={ attributes } element={ element } post={ post } />;
						default:
							return applyFilters( 'otter.postsBlock.templateLoop', '', element, attributes );
						}
					}) }
				</div>
			</div>
		</div>
	);
};

export default FeaturedPost;
