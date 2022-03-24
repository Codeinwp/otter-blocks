/** @jsx jsx */

/**
 * External dependencies
 */
import {
	css,
	jsx
} from '@emotion/react';

import {
	closeSmall,
	external
} from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import { Button } from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import { blockInit } from '../../helpers/block-utility';

const { attributes: defaultAttributes } = metadata;

/**
 * Popup component
 * @param {import('./types').PopupPros} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, []);

	const [ isEditing, setEditing ] = useState( false );

	const styles = css`
		--minWidth: ${ attributes.minWidth ? attributes.minWidth + 'px' : '400px' };
		--backgroundColor: ${ attributes.backgroundColor };
		--closeColor: ${ attributes.closeColor };
		--overlayColor: ${ attributes.overlayColor };
		--overlayOpacity: ${ attributes.overlayOpacity ? attributes.overlayOpacity / 100 : 1 };
	`;

	const blockProps = useBlockProps({
		id: attributes.id,
		css: styles
	});

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<Button
					isPrimary
					icon={ external }
					onClick={ () => setEditing( true ) }
				>
					{ __( 'Edit Popup', 'otter-blocks' ) }
				</Button>

				{ isEditing && (
					<div className="otter-popup__modal_wrap animated fadeIn fast">
						<div
							role="presentation"
							className="otter-popup__modal_wrap_overlay"
							onClick={ () => setEditing( false ) }
						/>

						<div className="otter-popup__modal_content">
							{ attributes.showClose && (
								<div className="otter-popup__modal_header">
									<Button
										icon={ closeSmall }
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
