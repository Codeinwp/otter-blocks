/**
 * WordPress dependencies.
 */
import {
	BlockControls,
	BlockVerticalAlignmentToolbar
} from '@wordpress/block-editor';

const Controls = ({
	attributes,
	setAttributes
}) => {
	const changeVerticalAlign = value => {
		if ( attributes.verticalAlign === value ) {
			return setAttributes({ verticalAlign: undefined });
		}

		return setAttributes({ verticalAlign: value });
	};

	return (
		<BlockControls>
			<BlockVerticalAlignmentToolbar
				onChange={ changeVerticalAlign }
				value={ attributes.verticalAlign }
			/>
		</BlockControls>
	);
};

export default Controls;
