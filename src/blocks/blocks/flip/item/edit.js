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

import { Button } from '@wordpress/components';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId,
	isSelected
}) => {

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
				<InnerBlocks
					renderAppender={ InnerBlocks.ButtonBlockAppender }
				/>

			</div>
		</Fragment>
	);
};

export default Edit;
