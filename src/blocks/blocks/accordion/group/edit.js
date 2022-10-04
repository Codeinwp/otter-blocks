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
	if ( attributes.alwaysOpen === undefined ) {
		const children = select( 'core/block-editor' ).getBlocksByClientId( clientId )[0].innerBlocks;
		setAttributes({ alwaysOpen: 1 < children.filter( child => true === child.attributes.initialOpen ).length });
	}

	const getValue = field => getDefaultValueByField({ name, field, defaultAttributes, attributes });

	const inlineStyles = {
		'--title-color': getValue( 'titleColor' ),
		'--title-background': getValue( 'titleBackground' ),
		'--content-background': getValue( 'contentBackground' ),
		'--border-color': getValue( 'borderColor' ),
		'--border-style': getValue( 'borderStyle' ),
		'--border-width': px( getValue( 'borderWidth' ) ),
		'--font-family': attributes.fontFamily,
		'--font-variant': attributes.fontVariant,
		'--font-style': attributes.fontStyle,
		'--text-transform': attributes.textTransform,
		'--letter-spacing': attributes.letterSpacing ? attributes.letterSpacing + 'px' : undefined,
		'--font-size': attributes.fontSize ? attributes.fontSize + 'px' : undefined,
		'--box-shadow': attributes.boxShadow.active &&
			`${attributes.boxShadow.horizontal}px
			${attributes.boxShadow.vertical}px
			${attributes.boxShadow.blur}px ${attributes.boxShadow.spread}px
			${hex2rgba( attributes.boxShadow.color, attributes.boxShadow.colorOpacity )}`,
		'--header-padding': boxValues( attributes.headerPadding, { top: '18px', right: '24px', bottom: '18px', left: '24px' }),
		'--content-padding': boxValues( attributes.contentPadding, { top: '18px', right: '24px', bottom: '18px', left: '24px' })
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
		const activeTitleColor = getValue( 'activeTitleColor' );
		const activeTitleBackground = getValue( 'activeTitleBackground' );

		setActiveNodeCSS([
			activeTitleColor && `.wp-block-themeisle-blocks-accordion-item.is-open .wp-block-themeisle-blocks-accordion-item__title {
				--title-color: ${ activeTitleColor };
			}`,
			activeTitleBackground && `.wp-block-themeisle-blocks-accordion-item.is-open .wp-block-themeisle-blocks-accordion-item__title {
				--title-background: ${ activeTitleBackground };
			}`
		]);
	}, [ attributes.activeTitleColor, attributes.activeTitleBackground ]);

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
