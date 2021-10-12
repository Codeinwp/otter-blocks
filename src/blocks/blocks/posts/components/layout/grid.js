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
import { unescapeHTML, formatDate } from '../../../../helpers/helper-functions.js';
import Thumbnail from './thumbnail.js';

const Grid = ({
	className,
	attributes,
	posts,
	categoriesList,
	authors
}) => {
	const Tag = attributes.titleTag || 'h5';

	return (
		<div className={ classnames(
			className,
			'is-grid',
			`wp-block-themeisle-blocks-posts-grid-columns-${ attributes.columns }`,
			{ 'has-shadow': attributes.imageBoxShadow }
		) }>
			{ posts.filter( post => post ).map( post => {
				let category, author;

				if ( categoriesList && 0 < post.categories?.length ) {
					category = categoriesList.find( item => item.id === post.categories[0]);
				}

				if ( authors && post.author ) {
					author = authors.find( item => item.id === post.author );
				}

				return (
					<div key={post.link} className="wp-block-themeisle-blocks-posts-grid-post-blog wp-block-themeisle-blocks-posts-grid-post-plain">
						<div className="wp-block-themeisle-blocks-posts-grid-post">
							{ ( undefined !== post.featured_media && 0 !== post.featured_media && attributes.displayFeaturedImage ) && (
								<Thumbnail
									id={ post.featured_media }
									link={ post.link }
									alt={ post.title?.rendered }
									size={ attributes.imageSize }
								/>
							) }

							<div className="wp-block-themeisle-blocks-posts-grid-post-body">
								{ attributes.template.map( element => {
									if ( 'category' === element ) {
										if ( undefined !== category && ( attributes.displayCategory && categoriesList ) ) {
											return <span class="wp-block-themeisle-blocks-posts-grid-post-category">{ category.name }</span>;
										}
									}

									if ( 'title' === element ) {
										if ( attributes.displayTitle ) {
											return (
												<Tag className="wp-block-themeisle-blocks-posts-grid-post-title">
													<a href={ post.link }>
														{ unescapeHTML( post.title?.rendered ) }
													</a>
												</Tag>
											);
										}
									}

									if ( 'meta' === element ) {
										if ( attributes.displayMeta && ( attributes.displayDate || attributes.displayAuthor ) ) {
											return (
												<p className="wp-block-themeisle-blocks-posts-grid-post-meta">
													{ ( attributes.displayDate ) && (

														/**
														 * translators: %s Date posted
														 */
														sprintf( __( 'on %s', 'otter-blocks' ), formatDate( post.date ) )
													) }

													{ ( attributes.displayAuthor && undefined !== author && authors ) && (

														/**
														 * translators: %s Author
														 */
														sprintf( __( ' by %s', 'otter-blocks' ), author.name )
													) }
												</p>
											);
										}
									}

									if ( 'description' === element ) {
										if ( 0 < attributes.excerptLength && attributes.displayDescription ) {
											return (
												<p className="wp-block-themeisle-blocks-posts-grid-post-description">
													{ post.excerpt?.rendered && unescapeHTML( post.excerpt.rendered ).substring( 0, attributes.excerptLength ) + '…' }
												</p>
											);
										}
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

export default Grid;
