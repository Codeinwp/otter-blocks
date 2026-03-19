import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { serialize } from '@wordpress/blocks';

const TAG_OPTIONS = [
	{ label: 'div', value: 'div' },
	{ label: 'span', value: 'span' },
	{ label: 'section', value: 'section' },
	{ label: 'article', value: 'article' },
	{ label: 'main', value: 'main' },
	{ label: 'aside', value: 'aside' },
	{ label: 'header', value: 'header' },
	{ label: 'footer', value: 'footer' },
	{ label: 'nav', value: 'nav' },
	{ label: 'details', value: 'details' },
	{ label: 'summary', value: 'summary' },
];

function escapeHtml( str ) {
	return str
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' );
}

function renderBlockPreview( block, post ) {
	const { name, attributes, innerBlocks: nested } = block;
	const cls = attributes.className || '';
	const postField = attributes.postField || '';

	let inner = '';
	if ( nested?.length ) {
		inner = nested
			.map( ( child ) => renderBlockPreview( child, post ) )
			.join( '' );
	}

	switch ( name ) {
		case 'atomic-wind/box': {
			const tag = attributes.tagName || 'div';
			return `<${ tag } class="${ cls }">${ inner }</${ tag }>`;
		}
		case 'atomic-wind/text': {
			const tag = attributes.tagName || 'p';
			let content = attributes.content || '';
			if ( postField && post ) {
				switch ( postField ) {
					case 'title':
						content = post.title?.rendered || content;
						break;
					case 'excerpt': {
						const tmp = document.createElement( 'div' );
						tmp.innerHTML = post.excerpt?.rendered || '';
						const text = tmp.textContent;
						content = text
							? escapeHtml( text )
							: content;
						break;
					}
					case 'date': {
						const d = post.date
							? new Date( post.date ).toLocaleDateString()
							: '';
						content = d ? escapeHtml( d ) : content;
						break;
					}
					case 'author': {
						const authorName =
							post._embedded?.author?.[ 0 ]?.name || '';
						content = authorName
							? escapeHtml( authorName )
							: content;
						break;
					}
					case 'categories': {
						const cats = post._embedded?.[ 'wp:term' ]?.[ 0 ];
						if ( cats ) {
							content = escapeHtml( cats.map( ( c ) => c.name ).join( ', ' ) );
						}
						break;
					}
					case 'tags': {
						const tagsList = post._embedded?.[ 'wp:term' ]?.[ 1 ];
						if ( tagsList ) {
							content = escapeHtml( tagsList.map( ( t ) => t.name ).join( ', ' ) );
						}
						break;
					}
					case 'modified_date': {
						const md = post.modified
							? new Date( post.modified ).toLocaleDateString()
							: '';
						content = md ? escapeHtml( md ) : content;
						break;
					}
					case 'comment_count': {
						content = escapeHtml( String( post.comment_count ?? 0 ) );
						break;
					}
				}
			}
			return `<${ tag } class="${ cls }" data-rich-text="">${ content }</${ tag }>`;
		}
		case 'atomic-wind/image': {
			let src = attributes.url || '';
			let alt = attributes.alt || '';
			if ( postField === 'featured_image' && post ) {
				const media =
					post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ];
				if ( media ) {
					src = media.source_url || src;
					alt = media.alt_text || post.title?.rendered || alt;
				} else {
					return '';
				}
			}
			if ( ! src ) {
				return '';
			}
			return `<img class="${ cls }" src="${ src }" alt="${ escapeHtml( alt ) }"/>`;
		}
		case 'atomic-wind/link': {
			const text = attributes.text || '';
			return `<a class="${ cls }">${ inner || text }</a>`;
		}
		default:
			return serialize( [ block ] )
				.replace( /<!--\s+\/?wp:[\s\S]*?-->/g, '' )
				.replace( / href="[^"]*"/g, '' );
	}
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		tagName,
		queryPostType,
		queryCount,
		queryOrderBy,
		queryOrder,
	} = attributes;
	const TagName = tagName;

	const blockProps = useBlockProps();
	const { children, ...innerBlocksWrapperProps } =
		useInnerBlocksProps( blockProps );

	const innerBlocks = useSelect(
		( select ) => {
			if ( ! queryPostType ) {
				return [];
			}
			return select( 'core/block-editor' ).getBlocks( clientId );
		},
		[ clientId, queryPostType ]
	);

	const posts = useSelect(
		( select ) => {
			if ( ! queryPostType ) {
				return null;
			}
			return select( 'core' ).getEntityRecords(
				'postType',
				queryPostType,
				{
					per_page: queryCount || 3,
					orderby: queryOrderBy || 'date',
					order: ( queryOrder || 'desc' ).toLowerCase(),
					_embed: true,
				}
			);
		},
		[ queryPostType, queryCount, queryOrderBy, queryOrder ]
	);

	const previews = useMemo( () => {
		if ( ! innerBlocks.length || ! queryPostType ) {
			return [];
		}

		// Posts still loading — show template duplicates as placeholder.
		if ( posts === null ) {
			const count = ( queryCount || 3 ) - 1;
			if ( count < 1 ) {
				return [];
			}
			const html = serialize( innerBlocks )
				.replace( /<!--\s+\/?wp:[\s\S]*?-->/g, '' )
				.replace( / href="[^"]*"/g, '' );
			return Array.from( { length: count } ).map( () => html );
		}

		// Template represents the first post; previews show the rest.
		return posts.slice( 1 ).map( ( post ) =>
			innerBlocks
				.map( ( block ) => renderBlockPreview( block, post ) )
				.join( '' )
		);
	}, [ innerBlocks, posts, queryPostType, queryCount ] );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'atomic-wind' ) }>
					<SelectControl
						label={ __( 'HTML Tag', 'atomic-wind' ) }
						value={ tagName }
						options={ TAG_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { tagName: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<TagName { ...innerBlocksWrapperProps }>
				{ children }
				{ previews.map( ( html, i ) => (
					<div
						key={ i }
						style={ { pointerEvents: 'none', opacity: 0.5 } }
						dangerouslySetInnerHTML={ { __html: html } }
					/>
				) ) }
			</TagName>
		</>
	);
}
