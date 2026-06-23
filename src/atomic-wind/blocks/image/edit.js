import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	MediaPlaceholder,
	MediaReplaceFlow,
	BlockControls,
} from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	PanelBody,
	TextControl,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import useQueryPreview from '../../query/use-query-preview';

const IMAGE_PREVIEW_STYLE = {
	display: 'block',
	width: '100%',
	height: '120px',
	objectFit: 'contain',
	boxSizing: 'border-box',
	backgroundColor: '#f6f7f7',
	border: '1px solid #ddd',
	borderRadius: '2px',
	marginBottom: '8px',
};

const IMAGE_ACTIONS_STYLE = {
	display: 'flex',
	gap: '8px',
	flexWrap: 'wrap',
	marginBottom: '16px',
};

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

function getAuthorAvatarUrl( post ) {
	if ( ! post ) {
		return '';
	}
	const authors = post._embedded?.author;
	if ( authors && authors.length > 0 ) {
		const urls = authors[ 0 ]?.avatar_urls;
		return urls?.[ '256' ] || urls?.[ '96' ] || urls?.[ '48' ] || urls?.[ '24' ] || '';
	}
	return '';
}

function ImageSettings( { id, url, alt, onSelectImage, setAttributes } ) {
	const instanceId = useInstanceId( ImageSettings );
	const imageControlId = `atomic-wind-image-control-${ instanceId }`;

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Settings', 'otter-blocks' ) }>
				<BaseControl
					id={ imageControlId }
					label={ __( 'Image', 'otter-blocks' ) }
				>
					{ url && (
						<img
							src={ url }
							alt={ alt || '' }
							style={ IMAGE_PREVIEW_STYLE }
						/>
					) }

					<div style={ IMAGE_ACTIONS_STYLE }>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ onSelectImage }
								allowedTypes={ [ 'image' ] }
								value={ id }
								render={ ( { open } ) => (
									<Button
										isSecondary
										onClick={ open }
									>
										{ url
											? __( 'Replace image', 'otter-blocks' )
											: __( 'Select image', 'otter-blocks' )
										}
									</Button>
								) }
							/>
						</MediaUploadCheck>

						{ url && (
							<Button
								isSecondary
								onClick={ () => setAttributes( {
									id: undefined,
									url: undefined,
									alt: '',
								} ) }
							>
								{ __( 'Remove image', 'otter-blocks' ) }
							</Button>
						) }
					</div>
				</BaseControl>

				<TextControl
					label={ __( 'Image URL', 'otter-blocks' ) }
					value={ url || '' }
					onChange={ ( value ) =>
						setAttributes( { url: value, id: undefined } )
					}
				/>
				<TextControl
					label={ __( 'Alt Text', 'otter-blocks' ) }
					value={ alt || '' }
					onChange={ ( value ) =>
						setAttributes( { alt: value } )
					}
				/>
			</PanelBody>
		</InspectorControls>
	);
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { id, url, alt, postField } = attributes;
	const blockProps = useBlockProps();
	const { isActive, post } = useQueryPreview( clientId, postField );
	const selectImage = ( media ) =>
		setAttributes( {
			id: media.id,
			url: media.url || media.source_url,
			alt: media.alt || media.alt_text || '',
		} );

	if ( isActive ) {
		const previewUrl = postField === 'author_avatar'
			? getAuthorAvatarUrl( post )
			: getFeaturedImageUrl( post );
		const placeholderLabel = postField === 'author_avatar'
			? __( 'Author Avatar', 'otter-blocks' )
			: __( 'Featured Image', 'otter-blocks' );

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
				{ placeholderLabel }
			</div>
		);
	}

	if ( ! url ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					onSelect={ selectImage }
					allowedTypes={ [ 'image' ] }
					labels={ {
						title: __( 'Image', 'otter-blocks' ),
						instructions: __(
							'Upload or select an image, or enter a URL.',
							'otter-blocks'
						),
					} }
				/>
				<ImageSettings
					id={ id }
					url={ url }
					alt={ alt }
					onSelectImage={ selectImage }
					setAttributes={ setAttributes }
				/>
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
					onSelect={ selectImage }
				/>
			</BlockControls>
			<ImageSettings
				id={ id }
				url={ url }
				alt={ alt }
				onSelectImage={ selectImage }
				setAttributes={ setAttributes }
			/>
			<img { ...blockProps } src={ url } alt={ alt } />
		</>
	);
}
