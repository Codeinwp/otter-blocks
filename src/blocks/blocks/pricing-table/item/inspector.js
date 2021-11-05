import {
	PanelBody,
	BaseControl,
	ToggleControl,
	FormTokenField,
	TextControl,
	RangeControl,
	SelectControl
} from '@wordpress/components';
import { ContrastChecker, InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const Inspector = ({ attributes, setAttributes }) => {

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

				<TextControl
					label={ __( 'Price', 'otter-blocks' ) }
					type="number"
					help={ __( 'Set the current price.', 'otter-blocks' ) }
					value={ attributes.price }
					onChange={ price => setAttributes({ price }) }
				/>

				<TextControl
					label={ __( 'Currency', 'otter-blocks' ) }
					help={ __( 'Set the currency. E.g.: $, £, €, ¥, ₹', 'otter-blocks' ) }
					value={ attributes.currency }
					onChange={ currency => setAttributes({ currency }) }
				/>

				<TextControl
					label={ __( 'Period', 'otter-blocks' ) }
					help={ __( 'Set the period. E.g.: month, year', 'otter-blocks' ) }
					value={ attributes.period }
					onChange={ period => setAttributes({ period }) }
				/>

				<ToggleControl
					label={ __( 'Is on sale', 'otter-blocks' ) }
					help={ __(
						'Show the old price.',
						'otter-blocks'
					) }
					checked={ attributes.isSale }
					onChange={ isSale => setAttributes({ isSale }) }
				/>

				{
					attributes.isSale && (
						<TextControl
							label={ __( 'Old Price', 'otter-blocks' ) }
							type="number"
							help={ __( 'Set the old price.', 'otter-blocks' ) }
							value={ attributes.oldPrice }
							onChange={ oldPrice => setAttributes({ price }) }
						/>

					)
				}


				<ToggleControl
					label={ __( 'Featured Package', 'otter-blocks' ) }
					help={ __(
						'Is this a featured package? Adds a `Best Value` ribbon at the top and pops up the pricing table.',
						'otter-blocks'
					) }
					checked={ attributes.isFeatured }
					onChange={ isFeatured => setAttributes({ isFeatured }) }
				/>
				{
					attributes.isFeatured && (
						<TextControl
							label={ __( 'Ribbon Text', 'otter-blocks' ) }
							help={ __( 'Set the ribbon message. E.g.: Best Value, Best Buy, Offer.', 'otter-blocks' ) }
							value={ attributes.ribbonText }
							onChange={ ribbonText => setAttributes({ ribbonText }) }
						/>
					)
				}

			</PanelBody>
			<PanelBody title={ __( 'Table Link', 'otter-blocks' ) }>
				<ToggleControl
					label={ __( 'Should have table link', 'otter-blocks' ) }
					help={ __(
						'This should be enabled if there is a features table at the end of page.',
						'otter-blocks'
					) }
					checked={ attributes.hasTableLink }
					onChange={ hasTableLink => setAttributes({ hasTableLink }) }
				/>

				{ attributes.hasTableLink && (
					<>
						<TextControl
							label={ __( 'See More Link Text', 'otter-blocks' ) }
							help={ __( 'Set the text for the link in the fotter.', 'otter-blocks' ) }
							value={ attributes.linkText }
							onChange={ linkText => setAttributes({ linkText }) }
						/>
						<TextControl
							label={ __( 'On link click', 'otter-blocks' ) }
							help={ __(
								'Go to this selector and show it. It will be hidden at page load initially.',
								'otter-blocks'
							) }
							value={ attributes.selector }
							onChange={ selector => setAttributes({ selector }) }
						/>
					</>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Border Width', 'otter-blocks' ) }
					help={ __( 'Set the width of the border', 'otter-blocks' ) }
					value={ attributes.borderWidth }
					onChange={ borderWidth => setAttributes({ borderWidth })}
				/>

				<SelectControl
					label={ __( 'Border Style', 'otter-blocks' ) }
					help={ __( 'Set the style of the border', 'otter-blocks' ) }
					value={ attributes.borderStyle }
					options={[
						{label: __( 'Default', 'otter-blocks' ), value: '' },
						{label: __( 'Dashed', 'otter-blocks' ), value: 'dashed' },
						{label: __( 'Dotted', 'otter-blocks' ), value: 'dotted' },
						{label: __( 'Double', 'otter-blocks' ), value: 'double' },
						{label: __( 'Groove', 'otter-blocks' ), value: 'groove' },
						{label: __( 'Ridge', 'otter-blocks' ), value: 'ridge' },
						{label: __( 'Solid', 'otter-blocks' ), value: 'solid' }
					]}
					onChange={ borderStyle => setAttributes({ borderStyle }) }
				/>
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
						value: attributes.oldPriceColor,
						onChange: oldPriceColor => setAttributes({ oldPriceColor }),
						label: __( 'Old Price Color', 'otter-blocks' )
					},
					{
						value: attributes.buttonColor,
						onChange: buttonColor => setAttributes({ buttonColor }),
						label: __( 'Button Color', 'otter-blocks' )
					},
					{
						value: attributes.ribbonColor,
						onChange: ribbonColor => setAttributes({ ribbonColor }),
						label: __( 'Ribbon Color', 'otter-blocks' )
					},
					{
						value: attributes.borderColor,
						onChange: borderColor => setAttributes({ borderColor }),
						label: __( 'Border Color', 'otter-blocks' )
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
