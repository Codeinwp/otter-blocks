/** @jsx jsx */

/**
 * External dependencies
 */
import classnames from 'classnames';

import {
	css,
	jsx
} from '@emotion/react';

/**
 * WordPress dependencies.
 */
import { InnerBlocks, RichText } from '@wordpress/block-editor';

import { __ } from '@wordpress/i18n';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import defaultAttributes from './attributes.js';

import Inspector from './inspector.js';
import { blockInit } from '../../helpers/block-utility.js';
import { Button } from '@wordpress/components';
import hexToRgba from 'hex-rgba';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId
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

	const shadowCSS = attributes.boxShadow ?
		css`
		.o-front${ ! attributes.isInverted ? ':hover' : '' }, .o-back${ attributes.isInverted ? ':hover' : '' } {
			box-shadow: ${ attributes.boxShadowHorizontal }px ${ attributes.boxShadowVertical }px ${ attributes.boxShadowBlur }px ${ getShadowColor() };
		}
		` : '';

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div
				id={ attributes.id }
				className={
					classnames(
						className,
						{'flipX': 'flipX' === attributes.animType},
						{'flipY': 'flipY' === attributes.animType}
					)
				}
				css={ css`
					.o-content {
						background-color: rgba(0, 0, 0, ${ ( attributes.frontOverlayOpacity || 0 ) / 100});
					}

					${shadowCSS}
				`}
			>
				<div
					className={
						classnames(
							'o-inner',
							{ invert: attributes.isInverted }
						)
					}
					style={{
						transform: isFliped ? 'var(--flip-anim)' : 'unset',
						width: attributes.width,
						height: attributes.height
					}}
				>
					<div
						className="o-front"
						style={{
							borderColor: attributes.borderColor,
							borderRadius: attributes.borderRadius,
							borderWidth: attributes.borderWidth,
							backgroundColor: attributes.frontBackgroundColor,
							backgroundImage: `url(${attributes.frontImg?.url})`,
							backgroundPosition: `${ Math.round( attributes.frontImgFocalpoint?.x * 100 ) }% ${ Math.round( attributes.frontImgFocalpoint?.y * 100 ) }%`
						}}
					>
						<div
							className="o-content"
							style={{
								padding: attributes.padding,
								alignItems: attributes.horizontalAlign,
								justifyContent: attributes.verticalAlign
							}}
						>
							{
								attributes.frontMedia?.url && (
									<img
										style={{
											width: attributes.frontMediaWidth + 'px',
											height: attributes.frontMediaHeight + 'px'
										}}
										className="o-img"
										srcSet={ attributes.frontMedia?.url }
									/>
								)
							}

							<RichText
								tagName="h2"
								value={ attributes.title }
								onChange={ title => setAttributes({ title })}
								placeholder={ __( 'Insert a title', 'otter-blocks' )}
								style={{
									fontSize: attributes.titleFontSize ? attributes.titleFontSize + 'px' : undefined,
									color: attributes.titleColor
								}}
							/>

							<RichText
								tagName="p"
								value={ attributes.description }
								onChange={ description => setAttributes({ description })}
								placeholder={ __( 'Insert a description', 'otter-blocks' )}
								style={{
									fontSize: attributes.descriptionFontSize ? attributes.descriptionFontSize + 'px' : undefined,
									color: attributes.descriptionColor
								}}
							/>
						</div>

					</div>
					<div
						className="o-back"
						style={{
							padding: attributes.padding,
							borderColor: attributes.borderColor,
							borderRadius: attributes.borderRadius,
							borderWidth: attributes.borderWidth,
							justifyContent: attributes.backVerticalAlign,
							backgroundColor: attributes.backBackgroundColor,
							backgroundImage: `url(${attributes.backImg?.url})`,
							backgroundPosition: `${ Math.round( attributes.backImgFocalpoint?.x * 100 ) }% ${ Math.round( attributes.backImgFocalpoint?.y * 100 ) }%`
						}}
					>
						<InnerBlocks
							renderAppender={ InnerBlocks.ButtonBlockAppender  }
						/>
					</div>
				</div>

				<div className="o-switcher">
					<Button
						isPrimary
						onClick={ () => setFliped( ! isFliped )}
					> { __( 'Flip to ', 'otter-blocks' ) + ( isFliped  ? __( 'front', 'otter-blocks' ) : __( 'back', 'otter-blocks' ) ) } </Button>
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
