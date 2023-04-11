/**
 * External dependencies
 */
import classnames from 'classnames';
import googleFontsLoader from '../../../helpers/google-fonts.js';

/**
 * WordPress dependencies.
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { Fragment, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import BlockAppender from '../../../components/block-appender-button';
import { boxValues, hex2rgba } from '../../../helpers/helper-functions';
import {
	blockInit,
	getDefaultValueByField,
	useCSSNode
} from '../../../helpers/block-utility.js';

import { useDarkBackground } from '../../../helpers/utility-hooks.js';

// @ts-ignore
import faIcons from '../../../../../assets/fontawesome/fa-icons.json';

const { attributes: defaultAttributes } = metadata;

const PREFIX_TO_FAMILY = {
	fas: 'Font Awesome 5 Free',
	far: 'Font Awesome 5 Free',
	fal: 'Font Awesome 5 Free',
	fab: 'Font Awesome 5 Brands'
};

const px = value => value ? `${ value }px` : value;

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
		googleFontsLoader.attach();
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	// Make it true for old users if they have more than one accordion item
	// with initiallyOpen === true, and false by default otherwise
	const children = useSelect( select => {
		return select( 'core/block-editor' ).getBlocksByClientId( clientId )[0].innerBlocks;
	});

	useEffect( () => {
		if ( attributes.alwaysOpen === undefined ) {
			setAttributes({ alwaysOpen: 1 < children.filter( child => true === child.attributes.initialOpen ).length });
		}
	}, []);

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const inlineStyles = {
		'--title-color': getValue( 'titleColor' ),
		'--title-background': getValue( 'titleBackground' ),
		'--content-background': getValue( 'contentBackground' ),
		'--border-color': getValue( 'borderColor' ),
		'--border-width': getValue( 'borderWidth' ),
		'--box-shadow': attributes.boxShadow.active && `${attributes.boxShadow.horizontal}px ${attributes.boxShadow.vertical}px ${attributes.boxShadow.blur}px ${attributes.boxShadow.spread}px ${hex2rgba( attributes.boxShadow.color, attributes.boxShadow.colorOpacity )}`,
		'--padding': boxValues( attributes.padding, { top: '18px', right: '24px', bottom: '18px', left: '24px' }),
		'--padding-tablet': boxValues( attributes.paddingTablet, { top: '18px', right: '24px', bottom: '18px', left: '24px' }),
		'--padding-mobile': boxValues( attributes.paddingMobile, { top: '18px', right: '24px', bottom: '18px', left: '24px' }),
		'--gap': px( attributes.gap )
	};

	const [ fontCSSNodeName, setFontNodeCSS ] = useCSSNode();
	useEffect( () => {
		setFontNodeCSS([
			`> * > * > .wp-block-themeisle-blocks-accordion-item .wp-block-themeisle-blocks-accordion-item__title > * {
				${ attributes.fontSize ? ( 'font-size:' + attributes.fontSize + 'px' ) : '' };
				${ attributes.fontFamily ? ( 'font-family:' + attributes.fontFamily ) : '' };
				${ attributes.fontVariant ? ( 'font-variant:' + attributes.fontVariant ) : '' };
				${ attributes.fontStyle ? ( 'font-style:' + attributes.fontStyle ) : '' };
				${ attributes.textTransform ? ( 'text-transform:' + attributes.textTransform ) : '' };
				${ attributes.letterSpacing ? ( 'letter-spacing:' + attributes.letterSpacing + 'px' ) : '' };
			}`
		]);
	}, [ attributes.fontSize, attributes.fontFamily, attributes.fontVariant, attributes.fontStyle, attributes.textTransform, attributes.letterSpacing ]);

	const [ iconsCSSNodeName, setIconsNodeCSS ] = useCSSNode();
	useEffect( () => {
		const icon = getValue( 'icon' );
		const openIcon = getValue( 'openItemIcon' );

		setIconsNodeCSS([
			...( icon ? [ `> * > * > .wp-block-themeisle-blocks-accordion-item:not(.is-open) > .wp-block-themeisle-blocks-accordion-item__title::after {
				content: "\\${ faIcons[ icon.name ].unicode }" !important;
				font-family: "${ PREFIX_TO_FAMILY[ icon.prefix ] }" !important;
				font-weight: ${ 'fas' !== icon.prefix ? '400' : '900' }
			}` ] : []),
			...( openIcon ? [ `> * > * > .wp-block-themeisle-blocks-accordion-item.is-open > .wp-block-themeisle-blocks-accordion-item__title::after {
				content: "\\${ faIcons[ openIcon.name ].unicode }" !important;
				font-family: "${ PREFIX_TO_FAMILY[ openIcon.prefix ] }" !important;
				font-weight: ${ 'fas' !== openIcon.prefix ? '400' : '900' }
			}` ]  : [])
		]);
	}, [ attributes.icon, attributes.openItemIcon ]);

	const [ activeCSSNodeName, setActiveNodeCSS ] = useCSSNode();
	useEffect( () => {
		const activeTitleColor = getValue( 'activeTitleColor' );
		const activeTitleBackground = getValue( 'activeTitleBackground' );

		setActiveNodeCSS([
			...( activeTitleColor ? [ `> * > * > .wp-block-themeisle-blocks-accordion-item.is-open > .wp-block-themeisle-blocks-accordion-item__title {
				--title-color: ${ activeTitleColor };
			}` ] : []),
			...( activeTitleBackground ? [ `> * > * > .wp-block-themeisle-blocks-accordion-item.is-open > .wp-block-themeisle-blocks-accordion-item__title {
				--title-background: ${ activeTitleBackground };
			}` ] : [])
		]);
	}, [ attributes.activeTitleColor, attributes.activeTitleBackground ]);

	useEffect( () => {
		if ( attributes.fontFamily ) {
			googleFontsLoader.loadFontToBrowser( attributes.fontFamily, attributes.fontVariant );
		}
	}, [ attributes.fontFamily ]);

	useDarkBackground( getValue( 'titleBackground' ), attributes, setAttributes, 'has-dark-title-bg', 'has-light-title-bg' );
	useDarkBackground( getValue( 'activeTitleBackground' ), attributes, setAttributes, 'has-dark-active-title-bg', 'has-light-active-title-bg' );
	useDarkBackground( getValue( 'contentBackground' ), attributes, setAttributes, 'has-dark-content-bg', 'has-light-content-bg' );

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames({
			[ iconsCSSNodeName ]: iconsCSSNodeName,
			[ activeCSSNodeName ]: activeCSSNodeName,
			[ fontCSSNodeName ]: fontCSSNodeName,
			[ `is-${ attributes.gap }-gap` ]: 'string' === typeof attributes.gap,
			'no-gap': 0 === attributes.gap,
			'has-gap': 'string' !== typeof attributes.gap && 0 < attributes.gap,
			'icon-first': attributes.iconFirst,
			'has-icon': !! attributes.icon,
			'has-open-icon': !! attributes.openItemIcon
		}),
		style: inlineStyles
	});

	return (
		<Fragment>
			<Inspector
				clientId={ clientId }
				attributes={ attributes }
				setAttributes={ setAttributes }
				getValue={ getValue }
			/>

			<div { ...blockProps }>
				<InnerBlocks
					allowedBlocks={ [ 'themeisle-blocks/accordion-item' ] }
					template={ [
						[ 'themeisle-blocks/accordion-item', { title: __( 'Accordion title 1', 'otter-blocks' ) }],
						[ 'themeisle-blocks/accordion-item', { title: __( 'Accordion title 2', 'otter-blocks' ) }]
					] }
					renderAppender={ isSelected ? () =>
						<BlockAppender
							buttonText={ __( 'Add Accordion Item', 'otter-blocks' ) }
							variant="primary"
							allowedBlock="themeisle-blocks/accordion-item"
							clientId={ clientId }
						/> : undefined
					}
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
