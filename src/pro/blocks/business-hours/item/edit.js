/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import { useDarkBackground } from '../../../../blocks/helpers/utility-hooks.js';

const { blockInit } = window.otterUtils;

const { attributes: defaultAttributes } = metadata;

/**
 * Business Hours Item component
 * @param {import('./types').BusinessHoursItemProps} props
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
	}, [ attributes.id ]);

	useDarkBackground( attributes.backgroundColor, attributes, setAttributes );

	const style = {
		backgroundColor: attributes.backgroundColor
	};

	const blockProps = useBlockProps({
		id: attributes.id,
		style
	});

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
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
