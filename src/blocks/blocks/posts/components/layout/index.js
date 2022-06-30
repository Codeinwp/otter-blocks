/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import Thumbnail from './thumbnail.js';
import { unescapeHTML, formatDate } from '../../../../helpers/helper-functions.js';

const Layout = ({
	attributes,
	posts,
	categoriesList,
	authors
}) => {
	return (
		<div
			className={
				'grid' === attributes.style ?
					classnames(
						'is-grid',
						`o-posts-grid-columns-${ attributes.columns }`,
						{
							'has-shadow': attributes.imageBoxShadow,
							'o-crop-img': attributes.cropImage
						}
					) :
					classnames(
						'is-list',
						{
							'has-shadow': attributes.imageBoxShadow,
							'o-crop-img': attributes.cropImage
						}
					)
			}
		>
			{ posts
				.filter( post => post )
				.slice( attributes.enableFeaturedPost ? 1 : 0 )
				.map( post => {
					const category = categoriesList && 0 < post?.categories?.length ? categoriesList.find( item => item.id === post.categories[0]) : undefined;
					const author = authors && post.author ? authors.find( item => item.id === post.author ) : undefined;
					return (
						<div
							key={ post.link }
							className="o-posts-grid-post-blog o-posts-grid-post-plain"
						>
							<div className={ classnames( 'o-posts-grid-post' ) }>
								{ ( 0 !== post.featured_media && attributes.displayFeaturedImage ) && (
									<Thumbnail
										id={ post.featured_media }
										link={ post.link }
										alt={ post.title?.rendered }
										size={ attributes.imageSize }
										imgStyle={{
											borderRadius: attributes.borderRadius !== undefined ? attributes.borderRadius + 'px' : undefined
										}}
									/>
								) }

								<div
									className={ classnames(
										'o-posts-grid-post-body',
										{ 'is-full': ! attributes.displayFeaturedImage }
									) }
								>
									{ attributes.template.map( element => {
										switch ( element ) {
										case 'category':
											return <PostsCategory key={ element } attributes={ attributes } element={ element } category={ category } categoriesList={ categoriesList }/>;
										case 'title':
											return <PostsTitle key={ element } attributes={ attributes } element={ element } post={ post } />;
										case 'meta':
											return <PostsMeta key={ element } attributes={ attributes } element={ element } post={ post } author={ author } category={ category } />;
										case 'description':
											return <PostsDescription key={ element } attributes={ attributes } element={ element } post={ post } />;
										default:
											return applyFilters( 'otter.postsBlock.templateLoop', '', element, attributes );
										}
									}) }
								</div>
							</div>
						</div>
					);
				}) }
		</div>
	);
};

export const PostsCategory = ({ attributes, element, category, categoriesList }) => {
	if ( undefined !== category && ( attributes.displayCategory && categoriesList ) ) {
		return <span key={ element } className="o-posts-grid-post-category">{ category.name }</span>;
	}
	return '';
};

export const PostsTitle = ({ attributes, element, post }) => {
	const Tag = attributes.titleTag || 'h5';
	if ( attributes.displayTitle ) {
		return (
			<Tag key={ element } className="o-posts-grid-post-title">
				<a href={ post.link }>
					{ unescapeHTML( post.title?.rendered ) }
				</a>
			</Tag>
		);
	}
	return '';
};

export const PostsMeta = ({ attributes, element, post, author, category }) => {
	if ( attributes.displayMeta && ( attributes.displayDate || attributes.displayAuthor ) ) {
		return (
			<p key={ element } className="o-posts-grid-post-meta">
				{ ( attributes.displayDate ) && (

					/* translators: %s Date posted */
					sprintf( __( 'on %s', 'otter-blocks' ), formatDate( post.date ) )
				) }

				{ ( attributes.displayAuthor && undefined !== author ) && (

					/* translators: %s Author of the post */
					sprintf( __( ' by %s', 'otter-blocks' ), author.name )
				) }

				{ ( attributes.displayComments ) && (

					// TODO: A way to check the number of comments is to make an API request. This seems wasteful for now. It might change in the future.
					sprintf(
						' - %1$s %2$s',
						'0',
						'1' === '0' ? __( 'comment', 'otter-blocks' ) : __( 'comments', 'otter-blocks' )
					)
				) }

				{ ( attributes.displayPostCategory && undefined !== category?.name ) && (

					sprintf( __( ' - %s', 'otter-blocks' ), category.name )
				) }
			</p>
		);
	}
	return '';
};

export const PostsDescription = ({attributes,  element, post }) => {
	if ( 0 < attributes.excerptLength && attributes.displayDescription ) {
		return (
			<div key={ element } className="o-posts-grid-post-description">
				<p>
					{ post.excerpt?.rendered && unescapeHTML( post.excerpt.rendered ).substring( 0, attributes.excerptLength ) + '…' }
				</p>
				{ attributes.displayReadMoreLink && (
					<a href={ post.link } className="o-posts-read-more">
						{ __( 'Read more', 'otter-blocks' ) }
					</a>
				) }
			</div>
		);
	}
	return '';
};

export default Layout;
