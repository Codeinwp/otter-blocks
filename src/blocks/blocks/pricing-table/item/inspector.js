import {
	PanelBody,
	BaseControl,
	ToggleControl,
	FormTokenField,
	TextControl
} from '@wordpress/components';
import { ContrastChecker, InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const Inspector = ({ attributes, setAttributes }) => {
	const {
		variations,
		buttonText,
		isFeatured,
		hasTableLink,
		selector,
		linkText
	} = attributes;

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Settings', 'otter-blocks' ) }>
				<TextControl
					label={ __( 'Button Text', 'otter-blocks' ) }
					value={ attributes.buttonText }
					onChange={ buttonText => setAttributes({ buttonText }) }
				/>

				<TextControl
					label={ __( 'Button Link', 'otter-blocks' ) }
					help={ __( 'Set a link to redirect the user after clinking.', 'otter-blocks' ) }
					value={ attributes.buttonLink }
					onChange={ buttonLink => setAttributes({ buttonLink }) }
				/>

				<ToggleControl
					label={ __( 'Featured Package' ) }
					help={ __(
						'Is this a featured package? Adds a `Best Value` ribbon at the top and pops up the pricing table.',
						'otter-blocks'
					) }
					checked={ isFeatured }
					onChange={ isFeatured => setAttributes({ isFeatured }) }
				/>
			</PanelBody>
			<PanelBody title={ __( 'Table Link', 'otter-blocks' ) }>
				<ToggleControl
					label={ __( 'Should have table link', 'otter-blocks' ) }
					help={ __(
						'This should be enabled if there is a features table at the end of page.',
						'otter-blocks'
					) }
					checked={ hasTableLink }
					onChange={ ( nextVal ) =>
						setAttributes({ hasTableLink: nextVal })
					}
				/>
				{ hasTableLink && (
					<>
						<BaseControl
							id="link-text"
							label={ __( 'Link Text', 'otter-blocks' ) }
						>
							<input
								type="text"
								id="link-text"
								value={ linkText }
								onChange={ ( e ) => {
									setAttributes({
										linkText: e.target.value
									});
								} }
							/>
						</BaseControl>
						<BaseControl
							id="css-selector"
							label={ __( 'On link click', 'otter-blocks' ) }
							help={ __(
								'Go to this selector and show it. It will be hidden at page load initially.',
								'otter-blocks'
							) }
						>
							<input
								type="text"
								id="css-selector"
								value={ selector }
								onChange={ ( e ) => {
									setAttributes({
										selector: e.target.value
									});
								} }
							/>
						</BaseControl>
					</>
				) }
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.backgroundColor,
						onChange: backgroundColor => setAttributes({ backgroundColor }),
						label: __( 'Background', 'otter-blocks' )
					},
					{
						value: attributes.titleColor,
						onChange: titleColor => setAttributes({ titleColor }),
						label: __( 'Title Color', 'otter-blocks' )
					},
					{
						value: attributes.descriptionColor,
						onChange: descriptionColor => setAttributes({ descriptionColor }),
						label: __( 'Description Color', 'otter-blocks' )
					},
					{
						value: attributes.priceColor,
						onChange: priceColor => setAttributes({ priceColor }),
						label: __( 'Price Color', 'otter-blocks' )
					},
					{
						value: attributes.buttonColor,
						onChange: buttonColor => setAttributes({ buttonColor }),
						label: __( 'Button Color', 'otter-blocks' )
					}
				] }
			>
				<ContrastChecker
					{ ...{
						textColor: attributes.titleColor,
						backgroundColor: attributes.backgroundColor
					} }
				/>
			</PanelColorSettings>
		</InspectorControls>
	);
};

export default Inspector;
