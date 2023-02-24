/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	__experimentalBoxControl as BoxControl,
	FontSizePicker
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';
import { isEmptyBox, _px } from '../../../../helpers/helper-functions';

const Tabs = ({
	blockName,
	defaults: attributes,
	changeConfig
}) => {

	const setAttributes = x => changeConfig( blockName, x );

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Typography', 'otter-blocks' ) }
			>
				<FontSizePicker
					fontSizes={ [
						{
							name: __( 'Extra Small', 'otter-blocks' ),
							icon: 'small',
							size: '14px'
						},
						{
							name: __( 'Small', 'otter-blocks' ),
							slug: 'small',
							size: '16px'
						},
						{
							name: __( 'Medium', 'otter-blocks' ),
							slug: 'medium',
							size: '18px'
						},
						{
							name: __( 'Large', 'otter-blocks' ),
							slug: 'large',
							size: '24px'
						},
						{
							name: __( 'Extra Large', 'otter-blocks' ),
							slug: 'extra-large',
							size: '28px'
						}
					] }
					value={ attributes.titleFontSize }
					onChange={ titleFontSize => setAttributes({ titleFontSize }) }
				/>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Colors', 'otter-blocks' ) }
				initialOpen={ true }
				setAttributes={ setAttributes }
				colorSettings={ [
					{
						value: attributes.titleBackgroundColor,
						label: __( 'Title Background', 'otter-blocks' ),
						onChange: titleBackgroundColor => setAttributes({ titleBackgroundColor })
					},
					{
						value: attributes.activeTitleBackgroundColor,
						label: __( 'Active Title Background', 'otter-blocks' ),
						onChange: activeTitleBackgroundColor => setAttributes({ activeTitleBackgroundColor })
					},
					{
						value: attributes.titleColor,
						label: __( 'Title Color', 'otter-blocks' ),
						onChange: titleColor => setAttributes({ titleColor })
					},
					{
						value: attributes.activeTitleColor,
						label: __( 'Active Title Color', 'otter-blocks' ),
						onChange: activeTitleColor => setAttributes({ activeTitleColor })
					},
					{
						value: attributes.contentTextColor,
						label: __( 'Content Text Color', 'otter-blocks' ),
						onChange: contentTextColor => setAttributes({ contentTextColor })
					},
					{
						value: attributes.tabColor,
						label: __( 'Content Background', 'otter-blocks' ),
						onChange: tabColor => setAttributes({ tabColor })
					},
					{
						value: attributes.borderColor,
						label: __( 'Border', 'otter-blocks' ),
						onChange: borderColor => setAttributes({ borderColor })
					},
					{
						value: attributes.activeBorderColor,
						label: __( 'Active Border', 'otter-blocks' ),
						onChange: activeBorderColor => setAttributes({ activeBorderColor })
					}
				] }
			/>

			<PanelBody
				title={ __( 'Dimensions(Layout)', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<BoxControl
					label={ __( 'Title Padding', 'otter-blocks' ) }
					values={ attributes.titlePadding }
					onChange={ titlePadding => setAttributes({ titlePadding: ! isEmptyBox( titlePadding ) ? titlePadding : undefined }) }
				/>
				<BoxControl
					label={ __( 'Content Padding', 'otter-blocks' ) }
					values={ attributes.contentPadding }
					onChange={ contentPadding => setAttributes({ contentPadding:
					! isEmptyBox( contentPadding ) ? contentPadding : undefined }) }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Border Radius', 'otter-blocks' ) }
				initialOpen={ true }
			>
				{/*

								TODO: Temporary disabled until the first prototype.

								<BoxControl
									label={ __( 'Radius', 'otter-blocks' ) }
									values={ attributes.borderRadius }
									onChange={ borderRadius => setAttributes({ borderRadius }) }
									id="o-border-raduis-box"
								/> */}

				<BoxControl
					label={ __( 'Title Border Width', 'otter-blocks' ) }
					values={ attributes.titleBorderWidth }
					onChange={ titleBorderWidth => {
						setAttributes({ titleBorderWidth: ! isEmptyBox( titleBorderWidth ) ? titleBorderWidth : undefined });
					} }
				/>

				<BoxControl
					label={ __( 'Content Border Width', 'otter-blocks' ) }
					values={ attributes.borderWidth }
					onChange={ borderWidth => {
						setAttributes({ borderWidth: ! isEmptyBox( borderWidth ) ? borderWidth : undefined });
					} }
				/>
			</PanelBody>
		</Fragment>
	);
};

export default Tabs;
