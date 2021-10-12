/**
 * External dependencies
 */
import { video } from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	BlockIcon,
	MediaPlaceholder
} from '@wordpress/block-editor';

import {
	Button,
	ExternalLink,
	Modal,
	Placeholder
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

const BlockPlaceholder = ({
	className,
	file,
	onChange
}) => {
	useEffect( () => {
		wp.api.loadPromise.then( () => {
			const settings = new wp.api.models.Settings();

			settings.fetch().then( response => {
				if ( response.themeisle_allow_json_upload ) {
					setJSONAllowed( response.themeisle_allow_json_upload );
				}
			});
		});
	}, []);

	const [ isJSONAllowed, setJSONAllowed ] = useState( false );
	const [ url, setURL ] = useState( null );
	const [ isOpen, setOpen ] = useState( false );

	const onChangeValue = e => {
		if ( e ) {
			e.preventDefault();
		}

		return onChange( url );
	};

	if ( isJSONAllowed && ! Boolean( window.themeisleGutenberg.isWPVIP ) ) {
		return (
			<MediaPlaceholder
				labels={ {
					title: __( 'Lottie', 'otter-blocks' ),
					instructions: __( 'Add Lottie animations and files to your website.', 'otter-blocks' )
				} }
				icon={ <BlockIcon icon={ video } />}
				accept={ [ 'application/json' ] }
				allowedTypes={ [ 'application/json' ] }
				value={ { ...file } }
				onSelectURL={ onChange }
				onSelect={ onChange }
			/>
		);
	}

	return (
		<Fragment>
			<Placeholder
				label={ __( 'Lottie', 'otter-blocks' ) }
				instructions={ __( 'Add Lottie animations and files to your website.', 'otter-blocks' ) }
				icon={ <BlockIcon icon={ video } />}
				className={ className }
			>
				<form onSubmit={ onChangeValue }>
					<input
						type="url"
						value={ url }
						className="components-placeholder__input"
						aria-label={ __( 'Lottie', 'otter-blocks' ) }
						placeholder={ __( 'Enter URL to embed here…', 'otter-blocks' ) }
						onChange={ e => setURL( e.target.value ) }
					/>

					<Button
						isPrimary
						disabled={ ! url }
						type="submit"
					>
						{ __( 'Embed', 'otter-blocks' ) }
					</Button>

					{ ! Boolean( window.themeisleGutenberg.isWPVIP ) && (
						<Button
							isSecondary
							onClick={ () => setOpen( true ) }
						>
							{ __( 'Upload', 'otter-blocks' ) }
						</Button>
					) }
				</form>
			</Placeholder>

			{ isOpen && (
				<Modal
					title={ __( 'Allow JSON Uploads', 'otter-blocks' ) }
					closeLabel={ __( 'Close' ) }
					onRequestClose={ () => setOpen( false ) }
					overlayClassName="wp-block-themeisle-blocks-lottie-modal"
				>
					{ __( 'This file type is not permitted for security reasons. Would you still like to enable JSON uploads?', 'otter-blocks' ) }
					<br/><br/>
					<ExternalLink href={ window.themeisleGutenberg.optionsPath }>{ __( 'You can enable JSON uploads from Otter.', 'otter-blocks' ) }</ExternalLink>
					<br/><br/>
					{ __( 'You will have to refresh the page after changing JSON upload settings.', 'otter-blocks' ) }
				</Modal>
			) }
		</Fragment>
	);
};

export default BlockPlaceholder;
