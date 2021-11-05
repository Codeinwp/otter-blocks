import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
	isString,
	isObject,
	isArray
} from 'lodash';

/**
 * @typedef {Object} IClearButton
 * @property {React.ReactNode} children
 * @property {((string | Object.<string, ?boolean>)[]  | string)} values
 * @property {Function} setAttributes
 */

/**
 * A button for clearing the values of array of attributes
 * @param {...IClearButton} props
 * @returns {React.FunctionComponent}
 */
const ClearButton = ({
	children,
	values,
	setAttributes
}) => {

	const clearValues = () => {

		const attrToClear = ( isArray( values ) ? values : [ values ])
			.map(
				value => {
					if ( isString( value ) ) {
						return value;
					} else if ( isObject( value )   ) {
						const keys =  Object.keys( value );
						if ( 1 === keys.length ) {
							return value[ keys[0] ] ? keys[0] : undefined;
						}
					}
					return undefined;
				}
			)
			.filter( isString )
			.reduce( ( acc, attrName ) => {
				acc[attrName] = undefined;
				return acc;
			}, {});
		setAttributes( attrToClear );
	};

	return (
		<div
			style={{
				width: '100%',
				display: 'flex',
				justifyContent: 'flex-end'
			}}
		>
			<Button
				isSmall
				isSecondary
				onClick={ clearValues }
			>
				{children || __( 'Clear', 'otter-blocks' )}
			</Button>
		</div>
	);
};

export default ClearButton;
