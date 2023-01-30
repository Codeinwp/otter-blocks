/**
 * WordPress dependencies.
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../helpers/block-utility.js';
import Controls from './controls.js';
import Inspector from './inspector.js';
import { _px } from '../../helpers/helper-functions';
import classNames from 'classnames';
import { useResponsiveAttributes } from '../../helpers/utility-hooks';

const { attributes: defaultAttributes } = metadata;

/**
 * Icon List component
 * @param {import('./types').IconListProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	className
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const { responsiveGetAttributes } = useResponsiveAttributes( setAttributes );

	const inlineStyles = {
		'--icon-align': responsiveGetAttributes([ attributes.horizontalAlign, attributes.alignmentTablet, attributes.alignmentMobile  ]),
		'--icon-align-tablet': attributes.alignmentTablet,
		'--icon-align-mobile': attributes.alignmentMobile,
		'--gap': _px( attributes.gap ),
		'--gap-icon-label': attributes.gapIconLabel,
		'--font-size': _px( attributes.defaultSize ),
		'--icon-size': attributes.defaultIconSize,
		'--label-visibility': attributes.hideLabels ? 'none' : undefined,
		'--divider-color': attributes.dividerColor,
		'--divider-width': attributes.dividerWidth,
		'--divider-length': attributes.dividerLength,

		'--divider-margin-left': attributes.horizontalAlign ? 'auto' : undefined,
		'--divider-margin-right': 'flex-end' === attributes.horizontalAlign ? '0' : undefined,
		'--divider-margin-left-tablet': attributes.alignmentTablet ? 'auto' : undefined,
		'--divider-margin-right-tablet': 'flex-end' === attributes.alignmentTablet ? '0' : undefined,
		'--divider-margin-left-mobile': attributes.alignmentMobile ? 'auto' : undefined,
		'--divider-margin-right-mobile': 'flex-end' === attributes.alignmentMobile ? '0' : undefined
	};

	const blockProps = useBlockProps({
		id: attributes.id,
		style: inlineStyles,
		className: classNames( className, { 'has-divider': Boolean( attributes.hasDivider ) })
	});

	return (
		<Fragment>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<InnerBlocks
					allowedBlocks={ [ 'themeisle-blocks/icon-list-item' ] }
					__experimentalMoverDirection="vertical"
					orientation="vertical"
					template={ [
						[ 'themeisle-blocks/icon-list-item', { placeholder: __( 'List item one', 'otter-blocks' ) }],
						[ 'themeisle-blocks/icon-list-item', { placeholder: __( 'List item two', 'otter-blocks' ) }],
						[ 'themeisle-blocks/icon-list-item', { placeholder: __( 'List item three', 'otter-blocks' ) }]
					] }
					renderAppender={ InnerBlocks.DefaultAppender }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
