/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import { parse } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

import {
	DropZone,
	FormFileUpload,
	Placeholder,
	Spinner,
	withNotices
} from '@wordpress/components';

import { useDispatch } from '@wordpress/data';

import {
	useEffect,
	useState
} from '@wordpress/element';

const BlocksImporter = ({
	clientId,
	attributes,
	noticeOperations,
	noticeUI
}) => {
	useEffect( () => {
		if ( attributes.file ) {
			uploadImport( attributes.file );
		}
	}, []);

	const [ isLoading, setLoading ] = useState( false );

	const { replaceBlocks } = useDispatch( 'core/block-editor' );

	const importBlock = ( content ) => replaceBlocks( clientId, content );

	const uploadImport = ( files ) => {
		setLoading( true );
		const fileTobeRead = files[ 0 ];

		if ( 'application/json' !== fileTobeRead.type ) {
			const error = [
				<strong key="filename">{ fileTobeRead.name }</strong>,
				': ',
				__(
					'Sorry, only JSON files are supported here.',
					'otter-blocks'
				)
			];
			noticeOperations.removeAllNotices();
			noticeOperations.createErrorNotice( error );
			setLoading( false );
			return;
		}

		const fileReader = new FileReader();

		fileReader.onload = async() => {
			let data;
			try {
				data = JSON.parse( fileReader.result );
			} catch ( error ) {
				noticeOperations.removeAllNotices();
				noticeOperations.createErrorNotice(
					__( 'Invalid JSON file', 'otter-blocks' )
				);
				setLoading( false );
				return;
			}

			if ( data.__file && data.content && 'wp_export' === data.__file ) {
				data = parse( data.content );
			}

			if ( data.__file && data.content && 'wp_block' === data.__file ) {
				const postType = await apiFetch({
					path: '/wp/v2/types/wp_block'
				});

				const reusableBlock = await apiFetch({
					path: `/wp/v2/${ postType.rest_base }`,
					data: {
						title:
							data.title ||
							__(
								'Untitled Reusable Block',
								'otter-blocks'
							),
						content: data.content,
						status: 'publish'
					},
					method: 'POST'
				});

				if ( ! reusableBlock.id ) {
					noticeOperations.removeAllNotices();
					noticeOperations.createErrorNotice(
						__(
							'Invalid Reusable Block JSON file',
							'otter-blocks'
						)
					);
					setLoading( false );
					return;
				}

				data = `<!-- wp:block { "ref": ${ reusableBlock.id } } /-->`;
				data = parse( data );
			}

			importBlock( data );
			setLoading( false );
		};

		fileReader.readAsText( fileTobeRead );
	};

	const blockProps = useBlockProps();

	if ( isLoading ) {
		return (
			<div { ...blockProps }>
				<Placeholder>
					<Spinner />
				</Placeholder>
			</div>
		);
	}

	return (
		<div { ...blockProps }>
			<Placeholder
				label={ __( 'Import Blocks from JSON', 'otter-blocks' ) }
				instructions={ __(
					'Upload JSON file from your device.',
					'otter-blocks'
				) }
				icon="category"
				notices={ noticeUI }
			>
				<FormFileUpload
					accept="text/json"
					onChange={ ( e ) => uploadImport( e.target.files ) }
					isSecondary
				>
					{ __( 'Upload' ) }
				</FormFileUpload>

				<DropZone
					label={ __( 'Import from JSON', 'otter-blocks' ) }
					onFilesDrop={ uploadImport }
				/>
			</Placeholder>
		</div>
	);
};

export default withNotices( BlocksImporter );
