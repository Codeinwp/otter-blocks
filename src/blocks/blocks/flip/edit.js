
/**
 * External dependencies
 */
import classnames from 'classnames';

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
import {blockInit, useCSSNode} from '../../helpers/block-utility.js';
import {getChoice} from '../../helpers/helper-functions';

const { attributes: defaultAttributes } = metadata;

/**
 * Flip component
 * @param {import('./types').FlipProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	isSelected
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const [ isFliped, setFliped ] = useState( false );

	const getShadowColor = () => {
		if ( attributes.boxShadowColor ) {
			if ( attributes.boxShadowColor.includes( '#' ) && 0 <= attributes.boxShadowColorOpacity ) {
				return hexToRgba( attributes.boxShadowColor, attributes.boxShadowColorOpacity || 0.00001 );
			}
			return attributes.boxShadowColor;
		}
		return hexToRgba( '#000000', attributes.boxShadowColorOpacity !== undefined ? ( attributes.boxShadowColorOpacity || 0.00001 ) : 1 );
	};

	const inlineStyles = {
		'--width': attributes.width !== undefined && `${ attributes.width }px`,
		'--height': attributes.height !== undefined && `${ attributes.height }px`,
		'--borderWidth': attributes.borderWidth !== undefined && `${ attributes.borderWidth }px`,
		'--borderColor': attributes.borderColor,
		'--borderRadius': attributes.borderRadius !== undefined && `${ attributes.borderRadius }px`,
		'--frontBackground': getChoice([
			[ ( 'gradient' === attributes.frontBackgroundType && attributes.frontBackgroundGradient ), attributes.frontBackgroundGradient ],
			[ ( 'image' === attributes.frontBackgroundType && attributes.frontBackgroundImage?.url ), `url( ${ attributes.frontBackgroundImage?.url } ) ${ attributes.frontBackgroundRepeat || 'repeat' } ${ attributes.frontBackgroundAttachment || 'scroll' } ${ Math.round( attributes.frontBackgroundPosition?.x * 100 ) || 50 }% ${ Math.round( attributes.frontBackgroundPosition?.y * 100 ) || 50 }%/${ attributes.frontBackgroundSize || 'auto' }` ],
			[ attributes.frontBackgroundColor ]
		]),
		'--backBackground': getChoice([
			[ ( 'gradient' === attributes.backBackgroundType && attributes.backBackgroundGradient ), attributes.backBackgroundGradient ],
			[ ( 'image' === attributes.backBackgroundType && attributes.backBackgroundImage?.url ), `url( ${ attributes.backBackgroundImage?.url } ) ${ attributes.backBackgroundRepeat || 'repeat' } ${ attributes.backBackgroundAttachment || 'scroll' } ${ Math.round( attributes.backBackgroundPosition?.x * 100 ) || 50 }% ${ Math.round( attributes.backBackgroundPosition?.y * 100 ) || 50 }%/${ attributes.backBackgroundSize || 'auto' }` ],
			[ attributes.backBackgroundColor ]
		]),
		'--padding': attributes.padding !== undefined && `${ attributes.padding }px`,
		'--boxShadow': attributes.boxShadow && `${ attributes.boxShadowHorizontal }px ${ attributes.boxShadowVertical }px ${ attributes.boxShadowBlur }px ${ getShadowColor() }`,
		'--frontVerticalAlign': attributes.frontVerticalAlign,
		'--frontHorizontalAlign': attributes.frontHorizontalAlign,
		'--backVerticalAlign': attributes.backVerticalAlign,
		'--frontMediaWidth': attributes.frontMediaWidth !== undefined && `${ attributes.frontMediaWidth }px`,
		'--frontMediaHeight': attributes.frontMediaHeight !== undefined && `${ attributes.frontMediaHeight }px`
	};

	const [ cssNodeName, setNodeCSS ] = useCSSNode();

	useEffect( () => {
		setNodeCSS([
			`.o-flip-inner {
				transform: ${ isFliped ? 'var( --flip-anim )' : 'unset' };
			}`,
			`.o-flip-front .o-flip-content h3 {
				color: ${ attributes.titleColor };
				${ attributes.titleFontSize && `font-size: ${ attributes.titleFontSize }px;` }
			}`,
			`.o-flip-front .o-flip-content p {
				color: ${ attributes.descriptionColor };
				${ attributes.descriptionFontSize && `font-size: ${ attributes.descriptionFontSize }px;` }
			}`
		]);
	}, [ isFliped, attributes.titleFontSize, attributes.descriptionFontSize ]);

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames(
			{
				'flipX': 'flipX' === attributes.animType,
				'flipY': 'flipY' === attributes.animType
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
				isFliped={ isFliped }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

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
								value={ attributes.title }
								onChange={ title => setAttributes({ title })}
								placeholder={ __( 'Insert a title', 'otter-blocks' )}
							/>

							<RichText
								tagName="p"
								value={ attributes.description }
								onChange={ description => setAttributes({ description })}
								placeholder={ __( 'Insert a description', 'otter-blocks' )}
							/>
						</div>
					</div>

					<div className="o-flip-back">
						<InnerBlocks
							renderAppender={ isSelected ? InnerBlocks.ButtonBlockAppender : '' }
						/>
					</div>
				</div>

				{ isSelected && (
					<div className="o-switcher">
						<Button
							isPrimary
							onClick={ () => setFliped( ! isFliped ) }
						>
							{ isFliped  ? __( 'Flip to front', 'otter-blocks' ) : __( 'Flip to back', 'otter-blocks' ) }
						</Button>
					</div>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
