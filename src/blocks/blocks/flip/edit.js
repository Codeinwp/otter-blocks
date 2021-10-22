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
import { InnerBlocks } from '@wordpress/block-editor';

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
				className={ classnames( className ) }
			>
				<div
					className="o-inner"
					style={{
						transform: isFliped ? 'rotateY(180deg)' : 'unset',
						width: attributes.width,
						height: attributes.height,
						borderRadius: attributes.borderRadius,
						backgroundColor: attributes.backgroundColor
					}}
				>
					<div
						className="o-front"
						style={{ padding: attributes.padding }}
					>
						<h1>FRONT</h1>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris laoreet tempor ante, ac consequat nisl luctus nec. Etiam eu pellentesque tortor. Vivamus lobortis vitae torto</p>
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
