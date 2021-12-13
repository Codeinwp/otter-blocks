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
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	RichText
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
import defaultAttributes from './attributes.js';
import Controls from './controls.js';
import Inspector from './inspector.js';
import { blockInit } from '../../helpers/block-utility.js';
import hexToRgba from 'hex-rgba';

const CONTENT_POSITIONS = {
	'top left': {
		alignItems: 'flex-start',
		justifyContent: 'flex-start'
	},
	'top center': {
		alignItems: 'center',
		justifyContent: 'flex-start'
	},
	'top right': {
		alignItems: 'flex-end',
		justifyContent: 'flex-start'
	},
	'center left': {
		alignItems: 'flex-start',
		justifyContent: 'center'
	},
	'center center': {
		alignItems: 'center',
		justifyContent: 'center'
	},
	center: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	'center right': {
		alignItems: 'flex-end',
		justifyContent: 'center'
	},
	'bottom left': {
		alignItems: 'flex-start',
		justifyContent: 'flex-end'
	},
	'bottom center': {
		alignItems: 'center',
		justifyContent: 'flex-end'
	},
	'bottom right': {
		alignItems: 'flex-end',
		justifyContent: 'flex-end'
	}
};

const Edit = ({
	attributes,
	setAttributes,
	className,
	isSelected,
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
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
				isFliped={ isFliped }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div
				id={ attributes.id }
				className={
					classnames(
						className,
						{ 'flipX': 'flipX' === attributes.animType },
						{ 'flipY': 'flipY' === attributes.animType }
					)
				}
				css={ shadowCSS }
			>
				<div
					className={
						classnames(
							'o-inner',
							{ invert: attributes.isInverted }
						)
					}
					style={ {
						transform: isFliped ? 'var(--flip-anim)' : 'unset',
						width: attributes.width,
						height: attributes.height
					} }
				>
					<div
						className="o-front"
						style={ {
							borderColor: attributes.borderColor,
							borderRadius: attributes.borderRadius,
							borderWidth: attributes.borderWidth,
							backgroundColor: 'color' === attributes.frontBackgroundType ? attributes.frontBackgroundColor : undefined,
							backgroundImage: 'image' === attributes.frontBackgroundType ? `url(${attributes.frontBackgroundImage?.url})` : ( attributes.frontBackgroundGradient || undefined ),
							backgroundPosition: 'image' === attributes.frontBackgroundType ? `${ Math.round( attributes.frontBackgroundPosition?.x * 100 ) }% ${ Math.round( attributes.frontBackgroundPosition?.y * 100 ) }%` : undefined,
							backgroundRepeat: 'image' === attributes.frontBackgroundType ? attributes.fontBackgroundRepeat : undefined,
							backgroundAttachment: 'image' === attributes.frontBackgroundType ? attributes.frontBackgroundAttachment : undefined,
							backgroundSize: 'image' === attributes.frontBackgroundType ? attributes.frontBackgroundSize : undefined
						} }
					>
						<div
							className="o-content"
							style={ {
								padding: attributes.padding,
								...( CONTENT_POSITIONS[ attributes.frontAlign ] || {})
							} }
							css={ css`
								background-color: rgba(0, 0, 0, ${ ( attributes.frontOverlayOpacity || 0 ) / 100 });
							` }
						>
							{ attributes.frontMedia?.url && (
								<img
									style={{
										width: attributes.frontMediaWidth + 'px',
										height: attributes.frontMediaHeight + 'px'
									}}
									className="o-img"
									srcSet={ attributes.frontMedia?.url }
								/>
							) }

							<RichText
								tagName="h3"
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
						style={ {
							padding: attributes.padding,
							borderColor: attributes.borderColor,
							borderRadius: attributes.borderRadius,
							borderWidth: attributes.borderWidth,
							justifyContent: attributes.backVerticalAlign,
							backgroundColor: 'color' === attributes.backBackgroundType ? attributes.backBackgroundColor : undefined,
							backgroundImage: 'image' === attributes.backBackgroundType ? `url(${attributes.backBackgroundImage?.url})` : ( attributes.backBackgroundGradient || undefined ),
							backgroundPosition: 'image' === attributes.backBackgroundType ? `${ Math.round( attributes.backBackgroundPosition?.x * 100 ) }% ${ Math.round( attributes.backBackgroundPosition?.y * 100 ) }%` : undefined,
							backgroundRepeat: 'image' === attributes.backBackgroundType ? attributes.fontBackgroundRepeat : undefined,
							backgroundAttachment: 'image' === attributes.backBackgroundType ? attributes.backBackgroundAttachment : undefined,
							backgroundSize: 'image' === attributes.backBackgroundType ? attributes.backBackgroundSize : undefined
						} }
					>
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
