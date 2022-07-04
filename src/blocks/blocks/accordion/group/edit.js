/** @jsx jsx */

/**
 * External dependencies
 */
import classnames from 'classnames';
import GoogleFontLoader from 'react-google-font-loader';

import {
	css,
	jsx
} from '@emotion/react';

/**
 * WordPress dependencies.
 */
import {
	InnerBlocks,
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
import {
	blockInit,
	getDefaultValueByField
} from '../../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Accordion Group component
 * @param {import('./types').AccordionGroupProps} props
 * @returns
 */
const Edit = ({
	name,
	attributes,
	setAttributes,
	clientId,
	isSelected
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const headerBorder = getValue( 'headerBorder' );
	const contentBorder = getValue( 'contentBorder' );

	const getBorderValue = ( type, position, property ) => {
		const border = 'header' === type ?
			headerBorder :
			( 'content' === type ?
				contentBorder :
				undefined );

		if ( ! border ) {
			return '';
		}

		// for backward compatibility purposes
		if ( 'color' === property ) {
			return border[position] ?
				border[position].color :
				border.color || getValue( 'borderColor' );
		}

		return border[position] && border[position][property] ? border[position][property] : border[property];
	};

	const getBorder = ( type ) => {
		let borderStyle = '';

		[ 'Top', 'Right', 'Bottom', 'Left' ].forEach( position => {
			[ 'Width', 'Style', 'Color' ].forEach( prop => {
				const varName = `${type.slice( 0, 1 )}Border${position.slice( 0, 1 )}${prop.slice( 0, 1 )}`;
				borderStyle = borderStyle +
					`--${ varName }: ${ getBorderValue( type, position.toLowerCase(), prop.toLowerCase() ) || ''  };`;
			});
		});

		return borderStyle;
	};

	const styles = css`
		--titleColor: ${ getValue( 'titleColor' ) };
		--titleBackground: ${ getValue( 'titleBackground' ) };
		--contentBackground: ${ getValue( 'contentBackground' ) };
		--fontFamily: ${ getValue( 'fontFamily' ) };
		--fontVariant: ${ getValue( 'fontVariant' ) };
		--fontStyle: ${ getValue( 'fontStyle' ) };
		--textTransform: ${ getValue( 'textTransform' ) };
		--letterSpacing: ${ getValue( 'letterSpacing' ) ? getValue( 'letterSpacing' ) + 'px' : undefined };
		${ getBorder( 'header' ) }
		${ getBorder( 'content' ) }
	`;

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames({
			[ `is-${ attributes.gap }-gap` ]: attributes.gap
		}),
		css: styles
	});

	return (
		<Fragment>
			{ attributes.fontFamily && (
				<GoogleFontLoader fonts={ [ {
					font: attributes.fontFamily,
					weights: attributes.fontVariant && [ `${ attributes.fontVariant + ( 'italic' === attributes.fontStyle ? ':i' : '' ) }` ]
				} ] } />
			) }

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				getValue={ getValue }
			/>

			<div { ...blockProps }>
				<InnerBlocks
					allowedBlocks={ [ 'themeisle-blocks/accordion-item' ] }
					template={ [ [ 'themeisle-blocks/accordion-item' ] ] }
					renderAppender={ isSelected ? InnerBlocks.ButtonBlockAppender : '' }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
