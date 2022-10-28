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

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../helpers/block-utility.js';
import Controls from './controls.js';
import Inspector from './inspector.js';
import { _px } from '../../helpers/helper-functions';
import classNames from 'classnames';

const { attributes: defaultAttributes } = metadata;

/**
 * Icon List component
 * @param {import('./types').IconListProps} props
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

	const inlineStyles = {
		'--icon-align': attributes.horizontalAlign,
		'--icon-align-tablet': attributes.alignmentTablet,
		'--icon-align-mobile': attributes.alignmentMobile,
		'--gap': _px( attributes.gap ),
		'--gap-icon-label': attributes.gapIconLabel,
		'--font-size': _px( attributes.defaultSize ),
		'--icon-size': attributes.defaultIconSize,
		'--label-visibility': attributes.hideLabels ? 'none' : undefined,
		'--divider-color': attributes.dividerColor,
		'--divider-width': attributes.dividerWidth,
		'--divider-length': attributes.dividerLength
	};

	const blockProps = useBlockProps({
		id: attributes.id,
		style: inlineStyles,
		className: classNames({ 'has-divider': Boolean( attributes.hasDivider ) })
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
					template={ [[ 'themeisle-blocks/icon-list-item' ]] }
					renderAppender={ InnerBlocks.DefaultAppender }
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
