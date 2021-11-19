/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	isString,
	isObject,
	isArray
} from 'lodash';

import { Button } from '@wordpress/components';

import './editor.scss';

const ClearButton = ({
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
		<div className="otter-clear-button">
			<Button
				isSmall
				 variant="secondary"
				onClick={ clearValues }
			>
				{ __( 'Clear', 'otter-blocks' ) }
			</Button>
		</div>
	);
};

export default ClearButton;
