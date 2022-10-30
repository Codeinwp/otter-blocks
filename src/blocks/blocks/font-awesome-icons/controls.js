/**
 * WordPress dependencies...
 */
import {
	AlignmentToolbar,
	BlockControls
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import LinkControl from '../../components/link-control/index.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';
import { alignHandler } from './edit.js';

const mappings = {
	'left': 'flex-start',
	'center': 'center',
	'right': 'flex-end',
	'flex-start': 'left',
	'flex-end': 'right'
};

const Controls = ({
	attributes,
	setAttributes,
	isSelected
}) => {
	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useResponsiveAttributes( setAttributes );

	return (
		<BlockControls>
			<AlignmentToolbar
				value={ mappings[ responsiveGetAttributes([ alignHandler( attributes.align )?.desktop, alignHandler( attributes.align )?.tablet, alignHandler( attributes.align )?.mobile ]) ?? 'center' ] }
				onChange={ value => responsiveSetAttributes( '' === value ? undefined : mappings[value], [ 'align.desktop', 'align.tablet', 'align.mobile' ], alignHandler( attributes.align ) )}
			/>

			<LinkControl
				isSelected={ isSelected }
				setAttributes={ setAttributes }
				url={ attributes.link }
				opensInNewTab={ attributes.newTab }
			/>
		</BlockControls>
	);
};

export default Controls;
