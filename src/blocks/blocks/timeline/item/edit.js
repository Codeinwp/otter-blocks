/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	isObject,
	isUndefined,
	pickBy
} from 'lodash';

import {
	Disabled,
	Placeholder,
	Spinner
} from '@wordpress/components';

import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

import {
	useSelect,
	dispatch
} from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../../helpers/block-utility';

const { attributes: defaultAttributes } = metadata;

/**
 * Posts component
 * @param {import('./types').PostProps} param0
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const blockProps = useBlockProps();

	return (
		<Fragment>
			<div { ...blockProps }>
				<div class="container">
					<div class="icon">
						<i class="fas fa-circle"></i>
					</div>
					<div class="content">
						<InnerBlocks
							template={[
								[ 'core/heading', { placeholder: 'July 20, 2024', fontSize: 'small' }],
								[ 'core/image', { url: 'https://via.placeholder.com/400x200', alt: 'Event Image' }],
								[ 'core/heading', { placeholder: 'Event Name' }],
								[ 'core/paragraph', { placeholder: 'Description' }]
							]}
						/>
					</div>
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
