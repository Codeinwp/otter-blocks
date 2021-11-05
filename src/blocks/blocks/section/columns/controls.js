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
			setAttributes({ verticalAlign: 'unset' });
		} else if ( 'top' === value ) {
			setAttributes({ verticalAlign: 'flex-start' });
		} else if ( 'bottom' === value ) {
			setAttributes({ verticalAlign: 'flex-end' });
		}

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
