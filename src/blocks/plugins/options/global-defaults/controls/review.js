/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	RangeControl,
	TextControl,
	PanelBody,
	Button,
	BaseControl,
	ExternalLink
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

const PanelItem = ({
	title,
	remove,
	children
}) => {
	const [ isOpen, setOpen ] = useState( false );

	return (
		<div className="o-review__inspector_panel_item">
			<div className="o-review__inspector_panel_item__header">
				<Button
					className="o-review__inspector_panel_item__title"
					onClick={ () => setOpen( ! isOpen ) }
				>
					{ title }
				</Button>

				<Button
					icon="no-alt"
					label={ __( 'Remove', 'otter-blocks' ) }
					showTooltip={ true }
					className="o-review__inspector_panel_item__arrow"
					onClick={ remove }
				/>
			</div>

			{ isOpen && (
				<div className="o-review__inspector_panel_item__content">
					{ children }
				</div>
			) }
		</div>
	);
};

const Review = ({
	blockName,
	defaults,
	changeConfig
}) => {
	const setAttributes = ( attrs ) => changeConfig( blockName, attrs );

	const addFeature = () => {
		const features = [ ...defaults.features ];
		features.push({
			title: __( 'Feature', 'otter-blocks' ),
			rating: 9
		});
		setAttributes({ features });
	};

	const changeFeature = ( index, value ) => {
		const features = [ ...defaults.features ];
		features[ index ] = {
			...features[ index ],
			...value
		};
		setAttributes({ features });
	};

	const removeFeature = ( index ) => {
		let features = [ ...defaults.features ];
		features = features.filter( ( el, i ) => i !== index );
		setAttributes({ features });
	};

	return (
		<Fragment>
			<BaseControl>
				<TextControl
					label={ __( 'Currency', 'otter-blocks' ) }
					type="text"
					placeholder={ __( 'Currency code, like USD or EUR.', 'otter-blocks' ) }
					value={ defaults.currency }
					onChange={ value => setAttributes({ currency: value }) }
				/>

				{ __( 'Currency code in three digit ISO 4217 code.', 'otter-blocks' ) + ' ' }

				<ExternalLink href="https://en.wikipedia.org/wiki/ISO_4217#Active_codes">
					{ __( 'List of ISO 4217 codes.', 'otter-blocks' ) }
				</ExternalLink>
			</BaseControl>

			<PanelBody
				title={ __( 'Product Features', 'otter-blocks' ) }
				initialOpen={ false }
			>
				{ 0 < defaults?.features?.length && defaults?.features?.map( ( feature, index ) => (
					<PanelItem
						key={ index }
						title={ feature.title || __( 'Feature', 'otter-blocks' ) }
						remove={ () => removeFeature( index ) }
					>
						<TextControl
							label={ __( 'Title', 'otter-blocks' ) }
							type="text"
							placeholder={ __( 'Feature title', 'otter-blocks' ) }
							value={ feature.title }
							onChange={ title => changeFeature( index, { title }) }
						/>

						<RangeControl
							label={ __( 'Rating', 'otter-blocks' ) }
							value={ feature.rating }
							onChange={ value => changeFeature( index, { rating: Number( value ) }) }
							min={ 1 }
							max={ 10 }
						/>
					</PanelItem>
				) ) }

				<Button
					isSecondary
					isLarge
					className="o-review__inspector_add"
					onClick={ addFeature }
				>
					{ __( 'Add Feature', 'otter-blocks' ) }
				</Button>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: defaults.primaryColor,
						onChange: value => changeConfig( blockName, { primaryColor: value }),
						label: __( 'Primary', 'otter-blocks' )
					},
					{
						value: defaults.backgroundColor,
						onChange: value => changeConfig( blockName, { backgroundColor: value }),
						label: __( 'Background', 'otter-blocks' )
					},
					{
						value: defaults.textColor,
						onChange: value => changeConfig( blockName, { textColor: value }),
						label: __( 'Text', 'otter-blocks' )
					},
					{
						value: defaults.buttonTextColor,
						onChange: value => changeConfig( blockName, { buttonTextColor: value }),
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

export default Review;
