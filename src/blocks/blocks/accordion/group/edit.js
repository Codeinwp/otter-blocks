/**
 * External dependencies
 */
import classnames from 'classnames';
import googleFontsLoader from '../../../helpers/google-fonts.js';

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
	getDefaultValueByField,
	useCSSNode
} from '../../../helpers/block-utility.js';
import {
	boxValues,
	hex2rgba
} from '../../../helpers/helper-functions';

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
		googleFontsLoader.attach();
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

	const boxShadow = getValue( 'boxShadow' );
	const headerBorder = getValue( 'headerBorder' );
	const contentBorder = getValue( 'contentBorder' );

	const inlineStyles = {
		'--title-color': getValue( 'titleColor' ),
		'--title-background': getValue( 'titleBackground' ),
		'--content-background': getValue( 'contentBackground' ),
		'--font-family': getValue( 'fontFamily' ),
		'--font-variant': getValue( 'fontVariant' ),
		'--font-style': getValue( 'fontStyle' ),
		'--text-transform': getValue( 'textTransform' ),
		'--letter-spacing': getValue( 'letterSpacing' ) ? getValue( 'letterSpacing' ) + 'px' : undefined,
		'--font-size': getValue( 'fontSize' ) ? getValue( 'fontSize' ) + 'px' : undefined,
		'--box-shadow': boxShadow.active && `${boxShadow.horizontal}px ${boxShadow.vertical}px ${boxShadow.blur}px ${boxShadow.spread}px ${hex2rgba( boxShadow.color, boxShadow.colorOpacity )}`,
		'--header-padding': boxValues( getValue( 'headerPadding' ), { top: '18px', right: '24px', bottom: '18px', left: '24px' }),
		'--content-padding': boxValues( getValue( 'contentPadding' ), { top: '18px', right: '24px', bottom: '18px', left: '24px' }),
		'--header-border-width': headerBorder?.width && boxValues( headerBorder.width, { top: '1px', right: '1px', bottom: '1px', left: '1px' }),
		'--content-border-width': contentBorder?.width && boxValues( contentBorder.width, { top: '0', right: '1px', bottom: '1px', left: '1px' }),
		'--header-border-color': headerBorder?.color,
		'--content-border-color': contentBorder?.color,
		'--header-border-style': headerBorder?.style,
		'--content-border-style': contentBorder?.style
	};

	const [ iconsCSSNodeName, setIconsNodeCSS ] = useCSSNode();
	useEffect( () => {
		const icon = getValue( 'icon' );
		const openIcon = getValue( 'openItemIcon' );

		setIconsNodeCSS([
			icon ? `.wp-block-themeisle-blocks-accordion-item:not(.is-open) .wp-block-themeisle-blocks-accordion-item__title::after {
				content: "\\${ faIcons[ icon.name ].unicode }" !important;
				font-family: "${ PREFIX_TO_FAMILY[ icon.prefix ] }" !important;
				font-weight: ${ 'fas' !== icon.prefix ? '400' : '900' }
			}` : '',
			openIcon ? `.wp-block-themeisle-blocks-accordion-item.is-open .wp-block-themeisle-blocks-accordion-item__title::after {
				content: "\\${ faIcons[ openIcon.name ].unicode }" !important;
				font-family: "${ PREFIX_TO_FAMILY[ openIcon.prefix ] }" !important;
				font-weight: ${ 'fas' !== openIcon.prefix ? '400' : '900' }
			}` : ''
		]);
	}, [ attributes.icon, attributes.openItemIcon ]);

	const [ activeCSSNodeName, setActiveNodeCSS ] = useCSSNode();
	useEffect( () => {
		setActiveNodeCSS([
			`.wp-block-themeisle-blocks-accordion-item.is-open .wp-block-themeisle-blocks-accordion-item__title {
				--title-color: ${ getValue( 'activeTitleColor' ) };
				--title-background: ${ getValue( 'activeTitleBackground' ) };
			}`,
			`.wp-block-themeisle-blocks-accordion-item.is-open .wp-block-themeisle-blocks-accordion-item__content {
				--content-background: ${ getValue( 'activeContentBackground' ) };
			}`
		]);
	}, [ attributes.activeTitleColor, attributes.activeTitleBackground, attributes.activeContentBackground ]);

	useEffect( () => {
		if ( attributes.fontFamily ) {
			googleFontsLoader.loadFontToBrowser( attributes.fontFamily, attributes.fontVariant );
		}
	}, [ attributes.fontFamily ]);

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames({
			[ iconsCSSNodeName ]: iconsCSSNodeName,
			[ activeCSSNodeName ]: activeCSSNodeName,
			[ `is-${ attributes.gap }-gap` ]: attributes.gap,
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
					template={ [[ 'themeisle-blocks/accordion-item' ]] }
					renderAppender={ isSelected ? InnerBlocks.ButtonBlockAppender : '' }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
