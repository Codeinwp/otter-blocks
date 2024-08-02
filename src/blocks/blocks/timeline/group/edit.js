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
	Button,
	Disabled,
	Placeholder,
	Spinner
} from '@wordpress/components';

import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

import { createBlock } from '@wordpress/blocks';

import {
	useSelect,
	dispatch,
	useDispatch,
	use
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
 * Timeline parent component
 *
 * @param {import('../../types').TimelineGroupProps} param
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

	const blockProps = useBlockProps({
		className: classNames({
			'is-reverse': 'reverse-alternative' === attributes.containersAlignment,
			'is-right': 'right' === attributes.containersAlignment,
			'is-left': 'left' === attributes.containersAlignment
		})
	});

	const isChildrenSelected = useSelect( select => {
		if ( isSelected  ) {
			return false;
		}

		const { getSelectedBlockClientId, getBlockRootClientId } = select( 'core/block-editor' );
		const selectedBlockClientId = getSelectedBlockClientId();

		let parentBlockId = getBlockRootClientId( selectedBlockClientId );
		while ( parentBlockId ) {
			if ( parentBlockId === clientId ) {
				return true;
			}
			parentBlockId = getBlockRootClientId( parentBlockId );
		}
	}, [ isSelected, clientId ]);

	const { insertBlock } = useDispatch( 'core/block-editor' );

	const inlineStyles = useMemo( () => {
		return Object.fromEntries(
			[
				[ '--o-timeline-cnt-bg', attributes.containerBackgroundColor ],
				[ '--o-timeline-cnt-br-w', boxToCSS( attributes.containerBorder ) ],
				[ '--o-timeline-cnt-br-c', attributes.containerBorderColor ],
				[ '--o-timeline-cnt-br-r', boxToCSS( attributes.containerRadius ) ],
				[ '--o-timeline-cnt-pd', boxToCSS( attributes.containerPadding ) ],
				[ '--o-timeline-i-font-size', attributes.iconSize ],
				[ '--o-timeline-i-color', attributes.iconColor ],
				[ '--o-timeline-v-color', attributes.verticalLineColor ],
				[ '--o-timeline-v-width', attributes.verticalLineWidth ]
			]
				?.filter( pairs => pairs?.[2] ?? pairs?.[1])
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
						[
							'themeisle-blocks/timeline-item',
							{ },
							[
								[ 'core/paragraph', { content: 'January 15, 2024', fontSize: 'small' }],
								[ 'core/heading', { content: 'Project Launch', level: 3 }],
								[ 'core/paragraph', { content: 'Successfully initiated our new product development project, setting the stage for innovation and growth.' }]
							]
						],
						[
							'themeisle-blocks/timeline-item',
							{ },
							[
								[ 'core/paragraph', { content: 'March 1, 2024', fontSize: 'small' }],
								[ 'core/heading', { content: 'Team Expansion', level: 3 }],
								[ 'core/paragraph', { content: 'Welcomed five new talented members to our development team, bringing fresh perspectives and expertise.' }]
							]
						],
						[
							'themeisle-blocks/timeline-item',
							{ },
							[
								[ 'core/paragraph', { content: 'April 20, 2024', fontSize: 'small' }],
								[ 'core/heading', { content: 'Prototype Development', level: 3 }],
								[ 'core/paragraph', { content: 'Completed the first working prototype of our product, marking a significant milestone in our project timeline.' }]
							]
						],
						[
							'themeisle-blocks/timeline-item',
							{ },
							[
								[ 'core/paragraph', { content: 'June 5, 2024', fontSize: 'small' }],
								[ 'core/heading', { content: 'Market Research', level: 3 }],
								[ 'core/paragraph', { content: 'Conducted comprehensive market analysis to refine our product features and target audience strategy.' }]
							]
						]
					]}
					/>
				</div>
				{
					( isSelected || isChildrenSelected ) &&  (
						<Button
							className="o-timeline-add-item"
							variant='primary'
							onClick={ () => {
								const child = createBlock( 'themeisle-blocks/timeline-item', {});
								insertBlock( child, undefined, clientId );
							} }
							icon={'insert-after'}
						>
							{ __( 'Add Timeline Item', 'otter-blocks' ) }
						</Button>

					)
				}
			</div>
		</Fragment>
	);
};

export default Edit;
