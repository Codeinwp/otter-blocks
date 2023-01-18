/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';

/**
 * Advanced Columns Block
 */
import './columns/index.js';
import './column/index.js';
import { isColorDark } from '../../helpers/helper-functions';

export const useDarkBackground = ( attributes, setAttributes ) => {
	useEffect( () => {
		if ( 'color' === attributes.backgroundType ) {
			const isDark = isColorDark( attributes.backgroundColor );
			const className = 'has-dark-bg';

			if ( isDark && ! attributes?.className?.includes( className ) ) {
				let classes = attributes.className || '';
				classes = classes.split( ' ' );
				classes.push( className );
				classes = classes.join( ' ' ).trim();
				setAttributes({ className: classes });
			}

			if ( ! isDark && attributes?.className?.includes( className ) ) {
				setAttributes({ className: attributes.className.replace( className, '' ).trim() });
			}
		}
	}, [ attributes.backgroundType, attributes.backgroundColor ]);
};
