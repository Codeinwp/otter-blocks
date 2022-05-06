/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Popover } from '@wordpress/components';

import { useState } from '@wordpress/element';

import { applyFormat } from '@wordpress/rich-text';

/**
 * Internal dependencies.
 */
import Fields from './fields.js';

const name = 'themeisle-blocks/dynamic-value';

const InlineControls = ({
	value,
	activeAttributes,
	onChange
}) => {
	const [ attributes, setAttributes ] = useState({ ...activeAttributes });

	const changeAttributes = obj => {
		let attrs = { ...attributes };

		Object.keys( obj ).forEach( o => {
			attrs[ o ] = obj[ o ];
		});

		attrs = Object.fromEntries( Object.entries( attrs ).filter( ([ _, v ]) => ( null !== v && '' !== v ) ) );

		setAttributes({ ...attrs });
	};

	return (
		<Popover
			position="bottom center"
			focusOnMount={ false }
			className="o-dynamic-popover"
		>
			<Fields
				activeAttributes={ activeAttributes }
				attributes={ attributes }
				changeAttributes={ changeAttributes }
				onChange={ () => {
					const attrs = Object.fromEntries( Object.entries( attributes ).filter( ([ _, v ]) => ( null !== v && '' !== v ) ) );

					onChange(
						applyFormat( value, {
							type: name,
							attributes: attrs
						})
					);
				} }
			/>
		</Popover>
	);
};

export default InlineControls;
