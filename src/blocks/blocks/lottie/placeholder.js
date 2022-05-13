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
	Placeholder
} from '@wordpress/components';

import { useState } from '@wordpress/element';

const BlockPlaceholder = ({
	className,
	file,
	onChange,
	attributes
}) => {
	const [ url, setURL ] = useState( attributes.file?.url || null );

	const onChangeValue = e => {
		if ( e ) {
			e.preventDefault();
		}
		return onChange( url );
	};

	if ( Boolean( window.themeisleGutenberg.isWPVIP ) ) {
		return (
			<Placeholder
				label={ __( 'Lottie', 'otter-blocks' ) }
				instructions={ __( 'Add Lottie animations and files to your website.', 'otter-blocks' ) }
				icon={ <BlockIcon icon={ video } /> }
				className={ className }
			>
				<form onSubmit={ onChangeValue }>
					<input
						type="url"
						value={ url || '' }
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
				</form>
			</Placeholder>
		);
	}

	return (
		<MediaPlaceholder
			labels={ {
				title: __( 'Lottie', 'otter-blocks' ),
				instructions: __( 'Add Lottie animations and files to your website.', 'otter-blocks' )
			} }
			icon={ <BlockIcon icon={ video } /> }
			accept={ [ 'application/json' ] }
			allowedTypes={ [ 'application/json' ] }
			value={ { ...file } }
			onSelectURL={ onChange }
			onSelect={ onChange }
		/>
	);
};

export default BlockPlaceholder;
