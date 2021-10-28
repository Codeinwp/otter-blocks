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

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId,
	isSelected
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const [ isFliped, setFliped ] = useState( false );

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
					--border-radius: ${ attributes.borderRadius || 10 }px;
					--padding: ${ attributes.padding || 20 }px;

					.o-content {
						background-color: rgba(0, 0, 0, ${ ( attributes.frontOverlayOpacity || 0 ) / 100});
					}
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
							backgroundColor: attributes.frontBackgroundColor,
							backgroundImage: `url(${attributes.frontImg?.url})`,
							backgroundPosition: `${ Math.round( attributes.frontImgFocalpoint.x * 100 ) }% ${ Math.round( attributes.frontImgFocalpoint.y * 100 ) }%`
						}}
					>
						<div
							className="o-content"
							style={{
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
								tagName="h1"
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
					<div
						className="o-back"
						style={{
							backgroundColor: attributes.backBackgroundColor,
							backgroundImage: `url(${attributes.backImg?.url})`
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
