/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { clamp } from 'lodash';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	BaseControl,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	FontSizePicker
} from '@wordpress/components';


/**
 *
 * @param {import('./types').ContentGeneratorInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {


	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>


			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
