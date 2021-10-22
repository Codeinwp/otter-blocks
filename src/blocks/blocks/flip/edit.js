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

	const innerStyle = css`
		transform: ${ isFliped ? 'rotateY(180deg)' : 'unset' };
	`;

	return (
		<Fragment>
			{/* <Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/> */}

			<div
				id={ attributes.id }
				className={ classnames( className ) }
			>
				<div className="o-inner" css={innerStyle}>
					<div className="o-front">
						<h1>FRONT</h1>
						<p>Lorem ipsilum</p>
					</div>
					<div className="o-back">
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
