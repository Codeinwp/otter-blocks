/**
 * External dependencies
 */
import {
	closeSmall,
	external
} from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { InnerBlocks } from '@wordpress/block-editor';

import { Button } from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Inspector from './inspector.js';
import defaultAttributes from './attributes.js';
import { blockInit } from '../../helpers/block-utility.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, []);

	const [ isEditing, setEditing ] = useState( false );

	const style = {
		content: {
			minWidth: attributes.minWidth,
			background: attributes.backgroundColor
		},
		close: {
			color: attributes.closeColor
		},
		overlay: {
			background: attributes.overlayColor,
			opacity: ( attributes.overlayOpacity || 75 ) / 100
		}
	};

	return (
		<Fragment>
			<Inspector
				attributes={ attributes  }
				setAttributes={ setAttributes }
			/>

			<div
				id={ attributes.id }
				className={ className }
			>
				<Button
					isPrimary
					icon={ external }
					onClick={ () => setEditing( true ) }
				>
					{ __( 'Edit Popup', 'otter-blocks' ) }
				</Button>

				{ isEditing && (
					<div className="otter-popup__modal_wrap">
						<div
							role="presentation"
							className="otter-popup__modal_wrap_overlay"
							style={ style.overlay }
							onClick={ () => setEditing( false ) }
						/>

						<div
							className="otter-popup__modal_content"
							style={ style.content }
						>
							{ attributes.showClose && (
								<div className="otter-popup__modal_header">
									<Button
										icon={ closeSmall }
										style={ style.close }
										onClick={ () => setEditing( false ) }
									/>
								</div>
							) }

							<div className="otter-popup__modal_body">
								<InnerBlocks />
							</div>
						</div>
					</div>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
