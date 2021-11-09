/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	RangeControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */


const ReviewControl = ({
	blockName,
	defaults,
	changeConfig
}) => {

	return (
		<Fragment>
			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ true }
				colorSettings={ [
					{
						value: defaults.primaryColor,
						onChange: primaryColor => changeConfig( blockName, {primaryColor}),
						label: __( 'Primary', 'otter-blocks' )
					},
					{
						value: defaults.backgroundColor,
						onChange: backgroundColor => changeConfig( blockName, {backgroundColor}),
						label: __( 'Background', 'otter-blocks' )
					},
					{
						value: defaults.textColor,
						onChange: textColor => changeConfig( blockName, {textColor}),
						label: __( 'Text', 'otter-blocks' )
					},
					{
						value: defaults.buttonTextColor,
						onChange: buttonTextColor => changeConfig( blockName, {buttonTextColor}),
						label: __( 'Button Text', 'otter-blocks' )
					}
				] }
			>

				<ContrastChecker
					{ ...{
						textColor: defaults.primaryColor,
						backgroundColor: defaults.backgroundColor
					} }
				/>
			</PanelColorSettings>
		</Fragment>
	);
};

export default ReviewControl;
