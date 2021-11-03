import {
	PanelBody,
	BaseControl,
	ToggleControl,
	FormTokenField
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
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
			<PanelBody title={ __( 'FastSpring Package', 'themeisle' ) }>
				<BaseControl
					id="button-text"
					label={ __( 'Button Text', 'themeisle' ) }
				>
					<input
						type="text"
						id="button-text"
						value={ buttonText }
						onChange={ ( e ) => {
							setAttributes({ buttonText: e.target.value });
						} }
					/>
				</BaseControl>
				<hr />
				<FormTokenField
					value={ variations }
					label={
						<>
							<h4>Variations:</h4>
							<small>
								e.g. <code>neve-8</code>, <code>neve-2</code>,
								etc.
							</small>
						</>
					}
					onChange={ ( nextVariations ) =>
						setAttributes({
							variations: nextVariations
						})
					}
					placeholder={ __( 'Type in a Variation', 'themeisle' ) }
				/>
				<hr />
				<ToggleControl
					label={ __( 'Featured Package' ) }
					help={ __(
						'Is this a featured package? Adds a `Best Value` ribbon at the top and pops up the pricing table.',
						'themeisle'
					) }
					checked={ isFeatured }
					onChange={ ( nextVal ) =>
						setAttributes({ isFeatured: nextVal })
					}
				/>
			</PanelBody>
			<PanelBody title={ __( 'Table Link', 'themeisle' ) }>
				<ToggleControl
					label={ __( 'Should have table link', 'themeisle' ) }
					help={ __(
						'This should be enabled if there is a features table at the end of page.',
						'themeisle'
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
							label={ __( 'Link Text', 'themeisle' ) }
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
							label={ __( 'On link click', 'themeisle' ) }
							help={ __(
								'Go to this selector and show it. It will be hidden at page load initially.',
								'themeisle'
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
		</InspectorControls>
	);
};

export default Inspector;
