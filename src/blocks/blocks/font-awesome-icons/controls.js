/**
 * WordPress dependencies...
 */
import {
	AlignmentToolbar,
	BlockControls
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import LinkControl from '../../components/link-control/index.js';
import { buildResponsiveGetAttributes, buildResponsiveSetAttributes } from '../../helpers/helper-functions.js';
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
	} = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

		return {
			responsiveSetAttributes: buildResponsiveSetAttributes( setAttributes, view ),
			responsiveGetAttributes: buildResponsiveGetAttributes( view )
		};
	}, []);

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
