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
		if ( 'top' === value ) {
			value = 'flex-start';
		} else if ( 'bottom' === value ) {
			value = 'flex-end';
		}

		setAttributes({ verticalAlign: value });
	};

	let getVerticalAlignValue = () => {
		if ( 'flex-start' === attributes.verticalAlign ) {
			return 'top';
		} else if ( 'flex-end' === attributes.verticalAlign ) {
			return 'bottom';
		} else {
			return attributes.verticalAlign;
		}
	};

	getVerticalAlignValue = getVerticalAlignValue();

	return (
		<BlockControls>
			<BlockVerticalAlignmentToolbar
				onChange={ changeVerticalAlign }
				value={ getVerticalAlignValue }
			/>
		</BlockControls>
	);
};

export default Controls;
