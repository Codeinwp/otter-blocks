/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { RichText } from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import defaultAttributes from './attributes.js';
import { blockInit } from '../../../helpers/block-utility.js';
import Inspector from './inspector.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const style = {
		backgroundColor: attributes.backgroundColor
	};

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div
				className={ className }
				id={ attributes.id }
				style={ style }
			>
				<div
					className="otter-business-hour-item__label"
					style={ {
						color: attributes.labelColor
					} }
				>
					<RichText
						placeholder={ __( 'Day', 'otter-blocks' ) }
						value={ attributes.label }
						onChange={ label => {
							setAttributes({ label });
						} }
						tagName="span"
					/>
				</div>

				<div
					className="otter-business-hour-item__time"
					style={ {
						color: attributes.timeColor
					} }
				>
					<RichText
						placeholder={ __( 'Opening Hours', 'otter-blocks' ) }
						value={ attributes.time }
						onChange={ time => {
							setAttributes({ time });
						} }
						tagName="span"
					/>
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
