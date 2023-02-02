/**
 * External dependencies
 */
import classnames from 'classnames';

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
import { blockInit, buildGetSyncValue } from '../../../helpers/block-utility.js';
import googleFontsLoader from '../../../helpers/google-fonts.js';
import { boxToCSS, _cssBlock, _px } from '../../../helpers/helper-functions';
import { useResponsiveAttributes } from '../../../helpers/utility-hooks';
import Controls from './controls';

const { attributes: defaultAttributes } = metadata;

/**
 * Button Group Props
 * @param {import('./types').ButtonGroupProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	name
}) => {

	const { responsiveGetAttributes } = useResponsiveAttributes( () => {});

	useEffect( () => {
		googleFontsLoader.attach();
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, []);

	const getSyncValue = buildGetSyncValue( name, attributes, defaultAttributes );

	const desktopPadding = {
		top: _px( getSyncValue( 'paddingTopBottom' ) ) ?? '15px',
		bottom: _px( getSyncValue( 'paddingTopBottom' ) ) ?? '15px',
		right: _px ( getSyncValue( 'paddingLeftRight' ) ) ?? '30px',
		left: _px( getSyncValue( 'paddingLeftRight' ) ) ?? '30px'
	};

	const inlineCSS = {
		'--spacing': _px( getSyncValue( 'spacing' ) ),
		'--padding': boxToCSS( responsiveGetAttributes([
			desktopPadding,
			getSyncValue( 'paddingTablet' ),
			getSyncValue( 'paddingMobile' ) ]) ),
		'--font-size': _px( getSyncValue( 'fontSize' ) )
	};

	const alignClasses = [ 'desktop', 'tablet', 'mobile' ]
		.filter( device => attributes.align && attributes.align[ device ])
		.map( device => `align-${ attributes.align[ device ] }-${ device }` );

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames(
			'wp-block-buttons',
			{
				[ `align-${ attributes.align }` ]: 'string' === typeof attributes.align,
				'collapse': responsiveGetAttributes([ 'collapse-desktop', 'collapse-tablet', 'collapse-mobile' ]) === attributes.collapse
			},
			...alignClasses
		),
		style: inlineCSS
	});

	useEffect( () => {
		if ( getSyncValue( 'fontFamily' ) ) {
			googleFontsLoader.loadFontToBrowser( getSyncValue( 'fontFamily' ), getSyncValue( 'fontVariant' ) );
		}
	}, [ attributes.fontFamily ]);

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<style>
				{
					`#block-${clientId} .wp-block-button :is(div, a, span).wp-block-button__link` + _cssBlock([
						[ 'font-family', getSyncValue( 'fontFamily' ) ],
						[ 'font-weight', getSyncValue( 'fontVariant' ) ],
						[ 'font-style', getSyncValue( 'fontStyle' ) ],
						[ 'text-transform', getSyncValue( 'textTransform' ) ],
						[ 'line-height',  _px( getSyncValue( 'lineHeight' ) ) ]
					])
				}
				{
					`#block-${clientId} .wp-block-button .wp-block-button__link :is(svg, i, div)` + _cssBlock([
						[ 'font-size', _px( getSyncValue( 'fontSize' ) ) ]
					])
				}
			</style>

			<div { ...blockProps }>
				<InnerBlocks
					allowedBlocks={ [ 'themeisle-blocks/button' ] }
					__experimentalMoverDirection="horizontal"
					orientation="horizontal"
					template={ [[ 'themeisle-blocks/button' ]] }
					renderAppender={ InnerBlocks.DefaultAppender }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
