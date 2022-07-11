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
	getDefaultValueByField, useCSSNode
} from '../../../helpers/block-utility.js';
import { hex2rgba } from '../../../helpers/helper-functions';

// @ts-ignore
import faIcons from '../../../../../assets/fontawesome/fa-icons.json';

const { attributes: defaultAttributes } = metadata;

const PREFIX_TO_FAMILY = {
	fas: 'Font Awesome 5 Free',
	far: 'Font Awesome 5 Free',
	fal: 'Font Awesome 5 Free',
	fab: 'Font Awesome 5 Brands'
};

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

	const boxShadow = getValue( 'boxShadow' );

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
		'--boxShadow': boxShadow.active && `${boxShadow.horizontal}px ${boxShadow.vertical}px ${boxShadow.blur}px ${boxShadow.spread}px ${hex2rgba( boxShadow.color, boxShadow.colorOpacity )}`
	};

	const addBorderStyle = ( type ) => {
		[ 'top', 'right', 'bottom', 'left' ].forEach( position => {
			[ 'width', 'style', 'color' ].forEach( prop => {
				if ( 'content' === type && 'top' === position ) {
					return;
				}

				const varName = `--${type.slice( 0, 1 )}Border${position.slice( 0, 1 ).toUpperCase()}${prop.slice( 0, 1 ).toUpperCase()}`;
				inlineStyles[varName] = getBorderValue( type, position, prop ) || '';
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

	const [ cssNodeName, setNodeCSS ] = useCSSNode();
	useEffect( () => {
		const icon = getValue( 'icon' );
		const openIcon = getValue( 'openItemIcon' );

		setNodeCSS([
			icon && `.wp-block-themeisle-blocks-accordion-item:not(.is-open) .wp-block-themeisle-blocks-accordion-item__title::after {
				content: "\\${ faIcons[ icon.name ].unicode }" !important;
				font-family: "${ PREFIX_TO_FAMILY[ icon.prefix ] }" !important;
				font-weight: ${ 'fas' !== icon.prefix ? '400' : '900' }
			}`,
			openIcon && `.wp-block-themeisle-blocks-accordion-item.is-open .wp-block-themeisle-blocks-accordion-item__title::after {
				content: "\\${ faIcons[ openIcon.name ].unicode }" !important;
				font-family: "${ PREFIX_TO_FAMILY[ openIcon.prefix ] }" !important;
				font-weight: ${ 'fas' !== openIcon.prefix ? '400' : '900' }
			}`
		]);
	}, [ attributes.icon, attributes.openItemIcon ]);

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames({
			[ cssNodeName ]: cssNodeName,
			[ `is-${ attributes.gap }-gap` ]: attributes.gap,
			'icon-first': attributes.iconFirst,
			'has-icon': !! attributes.icon,
			'has-open-icon': !! attributes.openItemIcon
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
