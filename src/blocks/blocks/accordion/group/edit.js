/**
 * External dependencies
 */
import classnames from 'classnames';
import GoogleFontLoader from 'react-google-font-loader';

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

import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import {
	blockInit,
	getDefaultValueByField
} from '../../../helpers/block-utility.js';
import { hex2rgba } from '../../../helpers/helper-functions';
import Controls from './controls';

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

	// Make it true for old users if they have more than one accordion item
	// with initiallyOpen === true, and false by default otherwise
	if ( attributes.alwaysOpen === undefined ) {
		const children = select( 'core/block-editor' ).getBlocksByClientId( clientId )[0].innerBlocks;
		setAttributes({ alwaysOpen: 1 < children.filter( child => true === child.attributes.initialOpen ).length });
	}

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const getBorderValue = ( type, position, property ) => {
		const border = 'header' === type ?
			getValue( 'headerBorder' ) :
			( 'content' === type ?
				getValue( 'contentBorder' ) :
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

	const inlineStyles = {
		'--titleColor': getValue( 'titleColor' ),
		'--titleBackground': getValue( 'titleBackground' ),
		'--contentBackground': getValue( 'contentBackground' ),
		'--fontFamily': getValue( 'fontFamily' ),
		'--fontVariant': getValue( 'fontVariant' ),
		'--fontStyle': getValue( 'fontStyle' ),
		'--textTransform': getValue( 'textTransform' ),
		'--letterSpacing': getValue( 'letterSpacing' ) ? getValue( 'letterSpacing' ) + 'px' : undefined,
		'--fontSize': getValue( 'fontSize' ) ? getValue( 'fontSize' ) + 'px' : undefined,
		'--boxShadow': getValue( 'boxShadow' ) &&
			getValue( 'boxShadowHorizontal' ) + 'px ' +
			getValue( 'boxShadowVertical' ) + 'px ' +
			getValue( 'boxShadowBlur' ) + 'px ' +
			getValue( 'boxShadowSpread' ) + 'px ' +
			hex2rgba( getValue( 'boxShadowColor' ), getValue( 'boxShadowColorOpacity' ) )
	};

	const addBorderStyle = ( type ) => {
		[ 'Top', 'Right', 'Bottom', 'Left' ].forEach( position => {
			[ 'Width', 'Style', 'Color' ].forEach( prop => {
				const varName = `--${type.slice( 0, 1 )}Border${position.slice( 0, 1 )}${prop.slice( 0, 1 )}`;
				inlineStyles[varName] = getBorderValue( type, position.toLowerCase(), prop.toLowerCase() ) || '';
			});
		});
	};

	const addPaddingStyle = ( type ) => {
		const padding = 'header' === type ? attributes.headerPadding : ( 'content' === type ? attributes.contentPadding : null );
		if ( ! padding ) {
			return;
		}

		[ 'Top', 'Right', 'Bottom', 'Left' ].forEach( position => {
			const varName = `--${type.slice( 0, 1 )}Padding${position}`;
			inlineStyles[varName] = padding[ position.toLowerCase() ];
		});
	};

	addBorderStyle( 'header' );
	addBorderStyle( 'content' );
	addPaddingStyle( 'header' );
	addPaddingStyle( 'content' );

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames({
			[ `is-${ attributes.gap }-gap` ]: attributes.gap
		}),
		style: inlineStyles
	});

	return (
		<Fragment>
			{ attributes.fontFamily && (
				<GoogleFontLoader fonts={ [ {
					font: attributes.fontFamily,
					weights: attributes.fontVariant && [ `${ attributes.fontVariant + ( 'italic' === attributes.fontStyle ? ':i' : '' ) }` ]
				} ] } />
			) }

			<Controls
				clientId={ clientId }
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Inspector
				clientId={ clientId }
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
