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
	PostsDescription,
	PostsMeta,
	PostsTitle
} from './index.js';

const FeaturedPost = ({
	post,
	attributes,
	author,
	category
}) => {
	if ( ! post  ) {
		return '';
	}

	return (
		<div className={ classNames( 'o-featured-post', { 'has-shadow': attributes.imageBoxShadow }) }>
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
					switch ( element ) {
					case 'title':
						return <PostsTitle attributes={ attributes } element={ element } post={ post } />;
					case 'meta':
						return <PostsMeta attributes={ attributes } element={ element } post={ post } author={ author } category={ category } />;
					case 'description':
						return <PostsDescription attributes={ attributes } element={ element } post={ post } />;
					default:
						return applyFilters( 'otter.postsBlock.templateLoop', '', element, attributes );
					}
				}) }
			</div>
		</div>
	);
};

export default FeaturedPost;
