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

	const Tag = attributes.titleTag || 'h5';

	const Category = ({element, category}) => {
		if ( undefined !== category && ( attributes.displayCategory && categoriesList ) ) {
			return <span key={ element } className="o-posts-grid-post-category">{ category.name }</span>;
		}
		return '';
	};

	const Title = ({ element, post }) => {
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

	const Meta = ({ element, post, author, category }) => {
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

					{ ( attributes.displayPostCategory && undefined !== category?.name ) && (

						sprintf( __( ' - %s', 'otter-blocks' ), category.name )
					) }
				</p>
			);
		}
		return '';
	};

	const Description = ({ element, post }) => {
		if ( 0 < attributes.excerptLength && attributes.displayDescription ) {
			return (
				<div key={ element } className="o-posts-grid-post-description">
					<p>
						{ post.excerpt?.rendered && unescapeHTML( post.excerpt.rendered ).substring( 0, attributes.excerptLength ) + '…' }
					</p>
					{
						attributes.displayReadMoreLink && (
							<a href={ post.link } className="o-posts-read-more">
								Read more
							</a>
						)
					}
				</div>
			);
		}
		return '';
	};

	return (
		<div
			className={
				'grid' === attributes.style ?
					classnames(
						'is-grid',
						`o-posts-grid-columns-${ attributes.columns }`,
						{ 'has-shadow': attributes.imageBoxShadow },
						{'o-crop-img': attributes.cropImage }
					) :
					classnames(
						'is-list',
						{ 'has-shadow': attributes.imageBoxShadow },
						{'o-crop-img': attributes.cropImage }
					)
			}
		>
			{
				posts.filter( post => post ).map( post => {
					const category = categoriesList && 0 < post?.categories?.length ? categoriesList.find( item => item.id === post.categories[0]) : undefined;
					const author = authors && post.author ? authors.find( item => item.id === post.author ) : undefined;

					return (
						<div
							key={ post.link }
							className="o-posts-grid-post-blog o-posts-grid-post-plain"
						>
							<div className={classnames( 'o-posts-grid-post' )}>
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
									style={{
										textAlign: attributes.textAlign,
										justifyContent: attributes.verticalAlign
									}}
								>
									{
										attributes.template.map( element => {
											switch ( element ) {
											case 'category':
												return <Category element={element} category={category} />;
											case 'title':
												return <Title element={element} post={post} />;
											case 'meta':
												return <Meta element={element} post={post} author={author} category={category} />;
											case 'description':
												return <Description element={element} post={post} />;
											default:
												return '';
											}
										})
									}
								</div>
							</div>
						</div>
					);

				})
			}
		</div>
	);
};

export default Layout;
