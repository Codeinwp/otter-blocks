
/**
 * External dependencies
 */
import classnames from 'classnames';
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import { Button } from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Controls from './controls.js';
import Inspector from './inspector.js';
import {
	blockInit,
	useCSSNode
} from '../../helpers/block-utility.js';
import { boxToCSS, getChoice, mergeBoxDefaultValues, stringToBox, _px } from '../../helpers/helper-functions.js';
import { isNumber } from 'lodash';
import { type FlipProps } from './types';
import {
	useDarkBackground,
	useResponsiveAttributes
} from '../../helpers/utility-hooks.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Flip component
 * @param props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	isSelected
}: FlipProps ) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	useDarkBackground( 'color' === attributes.frontBackgroundType && attributes.frontBackgroundColor, attributes, setAttributes, 'has-dark-front-bg' );
	useDarkBackground( 'color' === attributes.backBackgroundType && attributes.backBackgroundColor, attributes, setAttributes, 'has-dark-back-bg' );

	const [ currentSide, setSide ] = useState( 'front' );

	const { responsiveGetAttributes } = useResponsiveAttributes( setAttributes );

	const getShadowColor = () => {
		if ( attributes.boxShadowColor ) {
			if ( attributes.boxShadowColor.includes( '#' ) && attributes?.boxShadowColorOpacity && 0 <= attributes.boxShadowColorOpacity ) {
				return hexToRgba( attributes.boxShadowColor, attributes.boxShadowColorOpacity || 0.00001 );
			}
			return attributes.boxShadowColor;
		}
		return hexToRgba( '#000000', attributes.boxShadowColorOpacity !== undefined ? ( attributes.boxShadowColorOpacity || 0.00001 ) : 1 );
	};

	const inlineStyles = {
		'--width': responsiveGetAttributes([ isNumber( attributes.width ) ? _px( attributes.width ) : attributes?.width, attributes.widthTablet, attributes?.widthMobile ]) ?? '100%',
		'--width-tablet': attributes.widthTablet,
		'--width-mobile': attributes.widthMobile,
		'--height': responsiveGetAttributes([ isNumber( attributes.height ) ? _px( attributes.height ) : attributes?.height, attributes.heightTablet, attributes?.heightMobile ]) ?? '300px',
		'--height-tablet': attributes.heightTablet,
		'--height-mobile': attributes.heightMobile,
		'--border-width': attributes.borderWidth !== undefined && boxToCSS( mergeBoxDefaultValues(
			stringToBox( _px( attributes.borderWidth ) ),
			{ left: '3px', right: '3px', bottom: '3px', top: '3px' }
		)  ),
		'--border-color': attributes.borderColor,
		'--border-radius': attributes.borderRadius !== undefined && boxToCSS( mergeBoxDefaultValues(
			stringToBox( _px( attributes.borderRadius ) ),
			{ left: '10px', right: '10px', bottom: '10px', top: '10px' }
		)  ),
		'--front-background': getChoice([
			[ ( 'gradient' === attributes.frontBackgroundType && attributes.frontBackgroundGradient ), attributes.frontBackgroundGradient ],
			[ ( 'image' === attributes.frontBackgroundType && attributes.frontBackgroundImage?.url ), `url( ${ attributes.frontBackgroundImage?.url } ) ${ attributes.frontBackgroundRepeat || 'repeat' } ${ attributes.frontBackgroundAttachment || 'scroll' } ${ Math.round( attributes.frontBackgroundPosition?.x ?? 0.5 * 100 ) }% ${ Math.round( attributes.frontBackgroundPosition?.y ?? 0.5 * 100 ) }%/${ attributes.frontBackgroundSize || 'auto' }` ],
			[ attributes.frontBackgroundColor ]
		]),
		'--back-background': getChoice([
			[ ( 'gradient' === attributes.backBackgroundType && attributes.backBackgroundGradient ), attributes.backBackgroundGradient ],
			[ ( 'image' === attributes.backBackgroundType && attributes.backBackgroundImage?.url ), `url( ${ attributes.backBackgroundImage?.url } ) ${ attributes.backBackgroundRepeat || 'repeat' } ${ attributes.backBackgroundAttachment || 'scroll' } ${ Math.round( attributes.backBackgroundPosition?.x ?? 0.5 * 100 ) }% ${ Math.round( attributes.backBackgroundPosition?.y ?? 0.5 * 100 ) }%/${ attributes.backBackgroundSize || 'auto' }` ],
			[ attributes.backBackgroundColor ]
		]),
		'--box-shadow': attributes.boxShadow && `${ attributes.boxShadowHorizontal }px ${ attributes.boxShadowVertical }px ${ attributes.boxShadowBlur }px ${ getShadowColor() }`,
		'--front-vertical-align': attributes.frontVerticalAlign,
		'--front-horizontal-align': attributes.frontHorizontalAlign,
		'--back-vertical-align': attributes.backVerticalAlign,
		'--front-media-width': _px( attributes.frontMediaWidth ),
		'--front-media-height': _px( attributes.frontMediaHeight ),
		'--padding': boxToCSS( responsiveGetAttributes([ attributes?.padding, attributes.paddingTablet, attributes?.paddingMobile ]) ?? ( isNumber( attributes.padding ) ? stringToBox( _px( attributes.padding ) ) : stringToBox( '20px' ) ) ),
		'--padding-tablet': boxToCSS( attributes?.paddingTablet ),
		'--padding-mobile': boxToCSS( attributes?.paddingMobile )
	};

	const [ cssNodeName, setNodeCSS ] = useCSSNode();

	useEffect( () => {
		setNodeCSS([
			`.o-flip-inner {
				transform: ${ 'back' === currentSide ? 'var( --flip-anim )' : 'unset' };
			}`,
			`.o-flip-front .o-flip-content h3 {
				color: ${ attributes.titleColor };
				${ attributes.titleFontSize && `font-size: ${ _px( attributes.titleFontSize ) }` }
			}`,
			`.o-flip-front .o-flip-content p {
				color: ${ attributes.descriptionColor };
				${ attributes.descriptionFontSize && `font-size: ${ _px( attributes.descriptionFontSize ) }` }
			}`
		]);
	}, [ currentSide, attributes.titleFontSize, attributes.descriptionFontSize, attributes.titleColor, attributes.descriptionColor ]);

	const blockProps = useBlockProps({

		// @ts-ignore
		id: attributes.id,
		className: classnames(
			{
				'flipX': 'flipX' === attributes.animType,
				'flipY': 'flipY' === attributes.animType,
				'flipY-rev': 'flipY-rev' === attributes.animType,
				'flipX-rev': 'flipX-rev' === attributes.animType
			},
			cssNodeName
		),
		style: inlineStyles
	});

	return (
		<Fragment>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
				currentSide={ currentSide }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				currentSide={ currentSide }
				setSide={ setSide }
			/>

			{/** @ts-ignore */}
			<div { ...blockProps }>
				<div
					className={
						classnames(
							'o-flip-inner',
							{ invert: attributes.isInverted }
						)
					}
				>
					<div className="o-flip-front">
						<div className="o-flip-content">
							{ attributes.frontMedia?.url && (
								<img
									className="o-img"
									srcSet={ attributes.frontMedia?.url }
								/>
							) }

							<RichText
								tagName="h3"
								value={ attributes.title ?? '' }
								onChange={ title => setAttributes({ title })}
								placeholder={ __( 'Front title', 'otter-blocks' )}
							/>

							<RichText
								tagName="p"
								value={ attributes.description ?? '' }
								onChange={ description => setAttributes({ description })}
								placeholder={ __( 'This is is just a placeholder to help you visualise how the content is displayed in the flip box. Feel free to edit this with your actual content.', 'otter-blocks' )}
							/>
						</div>
					</div>

					<div className="o-flip-back">
						<div className="o-flip-content">
							<InnerBlocks
								renderAppender={ isSelected ? InnerBlocks.DefaultBlockAppender : undefined }
								template={[
									[ 'core/heading', {
										placeholder: __( 'Back title', 'otter-blocks' ),
										level: 3
									}],
									[ 'core/paragraph', { placeholder: __( 'This is is just a placeholder to help you visualise how the content is displayed in the flip box. Feel free to edit this with your actual content.', 'otter-blocks' ) }],
									[ 'core/buttons', {
										layout: { type: 'flex', justifyContent: 'center' }
									}, [[ 'core/button', { className: 'is-style-fill', placeholder: __( 'Button text', 'otter-blocks' ) }]]]
								]}
							/>
						</div>
					</div>
				</div>

				{ isSelected && (
					<div className="o-switcher">
						<Button
							variant="primary"
							onClick={ () => setSide( 'back' === currentSide ? 'front' : 'back' ) }
						>
							{ 'back' === currentSide  ? __( 'Flip to Front', 'otter-blocks' ) : __( 'Flip to Back', 'otter-blocks' ) }
						</Button>
					</div>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
