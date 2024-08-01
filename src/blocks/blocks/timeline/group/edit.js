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

import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

import {
	useSelect,
	dispatch
} from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useMemo,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../../helpers/block-utility';
import Inspector from './inspector.js';
import classNames from 'classnames';
import { boxToCSS } from '../../../helpers/helper-functions';

const { attributes: defaultAttributes } = metadata;

/**
 * Posts component
 * @param {import('../../types').TimelineGroupProps} param0
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

	const blockProps = useBlockProps({
		className: classNames({
			'is-reverse': 'reverse-alternative' === attributes.containersAlignment,
			'is-right': 'right' === attributes.containersAlignment,
			'is-alternative': 'alternative' === attributes.containersAlignment
		})
	});

	const inlineStyles = useMemo( () => {
		return Object.fromEntries(
			[
				[ '--o-timeline-cnt-bg', attributes.containerBackgroundColor ],
				[ '--o-timeline-v-color', attributes.verticalLineColor ],
				[ '--o-timeline-i-font-size', attributes.iconSize ],
				[ '--o-timeline-cnt-pd', boxToCSS( attributes.containerPadding ) ],
				[ '--o-timeline-cnt-br-r', attributes.containerRadius?.top ]
			]
				?.filter( pairs => pairs?.[2] ?? pairs?.[1])

				.map( ([ key, value ]) => [ key, value ])
		);
	}, [ attributes ]);

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<div className="o-timeline-root" style={inlineStyles}>
					<InnerBlocks template={[
						[ 'themeisle-blocks/timeline-item', { }],
						[ 'themeisle-blocks/timeline-item', { }],
						[ 'themeisle-blocks/timeline-item', { }],
						[ 'themeisle-blocks/timeline-item', { }]
					]} />
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
