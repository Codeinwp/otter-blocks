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
			return setAttributes({ verticalAlign: 'unset' });
		}

		return setAttributes({ verticalAlign: value });
	};

	const getVerticalAlignValue = () => {
		if ( 'flex-start' === attributes.verticalAlign ) {
			return 'top';
		} else if ( 'flex-end' === attributes.verticalAlign ) {
			return 'bottom';
		}

		return attributes.verticalAlign;
	};

	return (
		<BlockControls>
			<BlockVerticalAlignmentToolbar
				onChange={ changeVerticalAlign }
				value={ getVerticalAlignValue() }
			/>
		</BlockControls>
	);
};

export default Controls;
