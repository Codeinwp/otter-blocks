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
import { blockInit, useCSSNode } from '../../helpers/block-utility';
import { boxValues, _cssBlock } from '../../helpers/helper-functions';
import { isObjectLike, merge } from 'lodash';

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

	const inlineStyles = {
		'--min-width': attributes.minWidth ? attributes.minWidth + 'px' : '400px',
		'--max-width': attributes.maxWidth ? attributes.maxWidth + 'px' : undefined,
		'--background-color': attributes.backgroundColor,
		'--close-color': attributes.closeColor,
		'--overlay-color': attributes.overlayColor,
		'--overlay-opacity': attributes.overlayOpacity ? attributes.overlayOpacity / 100 : 1,
		'--brd-width': boxValues( attributes.borderWidth ),
		'--brd-radius': boxValues( attributes.borderRadius ),
		'--brd-color': attributes.borderColor,
		'--brd-style': attributes.borderStyle
	};

	const [ cssNodeName, setNodeCSS ] = useCSSNode();

	useEffect( () => {
		setNodeCSS(
			[
				_cssBlock([
					[ '--width', attributes.width ],
					[ '--height', attributes.height ],
					[ '--padding', boxValues( attributes.padding, { top: '20px', bottom: '20px', left: '20px', right: '20px' }) ]
				]),
				_cssBlock([
					[ '--width', attributes.widthTablet ],
					[ '--height', attributes.heightTablet ],
					[ '--padding', boxValues( merge({}, attributes.padding ?? {}, attributes.paddingTablet ), { top: '20px', bottom: '20px', left: '20px', right: '20px' }), isObjectLike ]
				]),
				_cssBlock([
					[ '--width', attributes.widthMobile ],
					[ '--height', attributes.heightMobile ],
					[ '--padding', boxValues( merge({}, attributes.padding ?? {}, attributes.paddingTablet ?? {}, attributes.paddingMobile ), { top: '20px', bottom: '20px', left: '20px', right: '20px' }), isObjectLike ]
				])
			],
			[
				'@media ( min-width: 960px )',
				'@media ( min-width: 600px ) and ( max-width: 960px )',
				'@media ( max-width: 600px )'
			]
		);
	}, [
		attributes.padding,
		attributes.width,
		attributes.height,
		attributes.paddingTablet,
		attributes.paddingMobile,
		attributes.widthTablet,
		attributes.widthMobile,
		attributes.heightTablet,
		attributes.heightMobile
	]);

	const blockProps = useBlockProps({
		id: attributes.id,
		style: inlineStyles,
		className: cssNodeName
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
					<div className="otter-popup__modal_wrap">
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
