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
				value={ mappings[ responsiveGetAttributes([ attributes.alignment?.desktop, attributes.alignment?.tablet, attributes.alignment?.mobile ]) ?? 'center' ] }
				onChange={ value => responsiveSetAttributes( '' === value ? undefined : mappings[value], [ 'alignment.desktop', 'alignment.tablet', 'alignment.mobile' ], attributes.alignment )}
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
