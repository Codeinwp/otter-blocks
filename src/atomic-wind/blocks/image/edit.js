import {
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	BlockControls,
} from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import useQueryPreview from '../../query/use-query-preview';

function getFeaturedImageUrl( post ) {
	if ( ! post ) {
		return '';
	}
	const embedded = post._embedded?.[ 'wp:featuredmedia' ];
	if ( embedded && embedded.length > 0 ) {
		return embedded[ 0 ]?.media_details?.sizes?.large?.source_url
			|| embedded[ 0 ]?.source_url
			|| '';
	}
	return '';
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { id, url, alt, postField } = attributes;
	const blockProps = useBlockProps();
	const { isActive, post } = useQueryPreview( clientId, postField );

	if ( isActive ) {
		const previewUrl = getFeaturedImageUrl( post );

		if ( previewUrl ) {
			return <img { ...blockProps } src={ previewUrl } alt="" />;
		}

		return (
			<div { ...blockProps } style={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '200px',
				background: '#f0f0f0',
				color: '#757575',
				fontSize: '13px',
			} }>
				{ __( 'Featured Image', 'atomic-wind' ) }
			</div>
		);
	}

	if ( ! url ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					onSelect={ ( media ) =>
						setAttributes( {
							id: media.id,
							url: media.url,
							alt: media.alt || '',
						} )
					}
					allowedTypes={ [ 'image' ] }
					labels={ {
						title: __( 'Image', 'atomic-wind' ),
						instructions: __(
							'Upload or select an image, or enter a URL.',
							'atomic-wind'
						),
					} }
				/>
				<InspectorControls>
					<PanelBody title={ __( 'Settings', 'atomic-wind' ) }>
						<TextControl
							label={ __( 'Image URL', 'atomic-wind' ) }
							value={ url || '' }
							onChange={ ( value ) =>
								setAttributes( { url: value, id: undefined } )
							}
						/>
					</PanelBody>
				</InspectorControls>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<MediaReplaceFlow
					mediaId={ id }
					mediaURL={ url }
					allowedTypes={ [ 'image' ] }
					onSelect={ ( media ) =>
						setAttributes( {
							id: media.id,
							url: media.url,
							alt: media.alt || '',
						} )
					}
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'atomic-wind' ) }>
					<TextControl
						label={ __( 'Image URL', 'atomic-wind' ) }
						value={ url }
						onChange={ ( value ) =>
							setAttributes( { url: value, id: undefined } )
						}
					/>
					<TextControl
						label={ __( 'Alt Text', 'atomic-wind' ) }
						value={ alt }
						onChange={ ( value ) =>
							setAttributes( { alt: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<img { ...blockProps } src={ url } alt={ alt } />
		</>
	);
}
