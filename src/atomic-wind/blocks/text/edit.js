import {
	useBlockProps,
	RichText,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import useQueryPreview from '../../query/use-query-preview';

const TAG_OPTIONS = [
	{ label: 'p', value: 'p' },
	{ label: 'span', value: 'span' },
	{ label: 'h1', value: 'h1' },
	{ label: 'h2', value: 'h2' },
	{ label: 'h3', value: 'h3' },
	{ label: 'h4', value: 'h4' },
	{ label: 'h5', value: 'h5' },
	{ label: 'h6', value: 'h6' },
];

function getPreviewText( post, postField ) {
	if ( ! post ) {
		return '';
	}
	switch ( postField ) {
		case 'title':
			return post.title?.rendered || '';
		case 'excerpt':
			return ( post.excerpt?.rendered || '' ).replace( /<[^>]+>/g, '' ).trim();
		case 'date':
			return post.date ? new Date( post.date ).toLocaleDateString() : '';
		case 'author':
			return post._embedded?.author?.[ 0 ]?.name || '';
		case 'categories': {
			const cats = post._embedded?.[ 'wp:term' ]?.[ 0 ];
			return cats ? cats.map( ( c ) => c.name ).join( ', ' ) : '';
		}
		case 'tags': {
			const tags = post._embedded?.[ 'wp:term' ]?.[ 1 ];
			return tags ? tags.map( ( t ) => t.name ).join( ', ' ) : '';
		}
		case 'modified_date':
			return post.modified ? new Date( post.modified ).toLocaleDateString() : '';
		case 'comment_count':
			return String( post.comment_count ?? 0 );
		default:
			return '';
	}
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { tagName, content, postField } = attributes;
	const blockProps = useBlockProps();
	const { isActive, post } = useQueryPreview( clientId, postField );

	if ( isActive ) {
		const previewText = getPreviewText( post, postField );
		const TagName = tagName || 'p';

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
				<TagName { ...blockProps }>
					{ previewText || __( 'No data', 'atomic-wind' ) }
				</TagName>
			</>
		);
	}

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
			<RichText
				{ ...blockProps }
				tagName={ tagName }
				value={ content }
				onChange={ ( value ) => setAttributes( { content: value } ) }
				placeholder={ __( 'Write text…', 'atomic-wind' ) }
				data-rich-text=""
			/>
		</>
	);
}
