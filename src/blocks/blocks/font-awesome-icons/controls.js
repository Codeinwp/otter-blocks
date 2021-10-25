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

const Controls = ({
	attributes,
	setAttributes,
	isSelected
}) => {
	return (
		<BlockControls>
			<AlignmentToolbar
				value={ attributes.align }
				onChange={ e => setAttributes({ align: e }) }
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
