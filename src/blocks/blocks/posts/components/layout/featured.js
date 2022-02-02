/**
 * WordPress dependencies
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import Thumbnail from './thumbnail.js';
import { unescapeHTML, formatDate } from '../../../../helpers/helper-functions.js';

const FeaturedPost = props => {
	const {
		post,
		attributes,
		author,
		category
	} = props;

	const Tag = attributes.titleTag || 'h5';

	if ( ! post  ) {
		return '';
	}

	console.log({post});

	return (
		<div className="o-featured-post">
			<Thumbnail
				id={ post.featured_media }
				link={ post.link }
				alt={ post.title?.rendered }
				imgStyle={{
					borderRadius: attributes.borderRadius !== undefined ? attributes.borderRadius + 'px' : undefined
				}}
			/>
			<div className="wp-block-themeisle-blocks-posts-grid-post-body">
				<Tag className="wp-block-themeisle-blocks-posts-grid-post-title">
					<a href={ post.link }>
						{ unescapeHTML( post.title?.rendered ) }
					</a>
				</Tag>

				<p className='wp-block-themeisle-blocks-posts-grid-post-meta'>
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

				<div className='wp-block-themeisle-blocks-posts-grid-post-description'>
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
			</div>
		</div>
	);
};

export default FeaturedPost;
