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

import Thumbnail from './thumbnail.js';

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
	category,
	categoriesList
}) => {
	if ( ! post  ) {
		return '';
	}

	return (
		<div className="o-featured-container">
			<div className="o-featured-post">
				{ attributes.displayFeaturedImage && (
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
