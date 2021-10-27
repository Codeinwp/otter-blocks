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
					--front-img: url( ${ attributes.frontImg?.url } );
					--back-img: url( ${ attributes.backImg?.url } );
					--front-bg-color: ${ attributes.backgroundColor };
					--back-bg-color: ${ attributes.backgroundColor };
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
						height: attributes.height,
						borderRadius: attributes.borderRadius
					}}
				>
					<div
						className="o-front"
						style={{
							padding: attributes.padding,
							alignItems: attributes.horizontalAlign,
							justifyContent: attributes.verticalAlign,
							backgroundImage: `url( ${ attributes.frontImg?.url } )`,
							backgroundPosition: `${ Math.round( attributes.frontImgFocalpoint.x * 100 ) }% ${ Math.round( attributes.frontImgFocalpoint.y * 100 ) }%`
						}}
					>

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
					<div
						className="o-back"
						style={{ padding: attributes.padding }}
					>
						<InnerBlocks
							renderAppender={ InnerBlocks.ButtonBlockAppender  }
						/>
					</div>
					{/* <InnerBlocks /> // BUG: this does not show any display
						allowedBlocks={ [ 'themeisle-blocks/flip-item' ] }
						template={ [ [ 'themeisle-blocks/flip-item' ], [ 'themeisle-blocks/flip-item' ] ] }
						templateLock="all"
						renderAppender={ InnerBlocks.ButtonBlockAppender  }
					/> */}
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
