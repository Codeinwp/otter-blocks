/**
 * WordPress dependencies
 */
import { pick } from 'lodash';

import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	InspectorControls,
	PanelColorSettings,
	MediaPlaceholder
} from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	ExternalLink,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	Notice
} from '@wordpress/components';

import { useState, Fragment } from '@wordpress/element';

const PanelItem = ({
	title,
	remove,
	children
}) => {
	const [ isOpen, setOpen ] = useState( false );

	return (
		<div className="wp-block-themeisle-blocks-review__inspector_panel_item">
			<div className="wp-block-themeisle-blocks-review__inspector_panel_item__header">
				<Button
					className="wp-block-themeisle-blocks-review__inspector_panel_item__title"
					onClick={ () => setOpen( ! isOpen ) }
				>
					{ title }
				</Button>

				<Button
					icon="no-alt"
					label={ __( 'Remove', 'otter-blocks' ) }
					showTooltip={ true }
					className="wp-block-themeisle-blocks-review__inspector_panel_item__arrow"
					onClick={ remove }
				/>
			</div>

			{ isOpen && (
				<div className="wp-block-themeisle-blocks-review__inspector_panel_item__content">
					{ children }
				</div>
			) }
		</div>
	);
};

const Inspector = ({
	attributes,
	setAttributes,
	productAttributes
}) => {
	const addFeature = () => {
		const features = [ ...attributes.features ];
		features.push({
			title: __( 'Feature', 'otter-blocks' ),
			rating: 9
		});
		setAttributes({ features });
	};

	const changeFeature = ( index, value ) => {
		const features = [ ...attributes.features ];
		features[ index ] = {
			...features[ index ],
			...value
		};
		setAttributes({ features });
	};

	const removeFeature = ( index ) => {
		let features = [ ...attributes.features ];
		features = features.filter( ( el, i ) => i !== index );
		setAttributes({ features });
	};

	const addPro = () => {
		const pros = [ ...attributes.pros ];
		pros.push( '' );
		setAttributes({ pros });
	};

	const changePro = ( index, value ) => {
		const pros = [ ...attributes.pros ];
		pros[ index ] = value;
		setAttributes({ pros });
	};

	const removePro = ( index ) => {
		let pros = [ ...attributes.pros ];
		pros = pros.filter( ( el, i ) => i !== index );
		setAttributes({ pros });
	};

	const addCon = () => {
		const cons = [ ...attributes.cons ];
		cons.push( '' );
		setAttributes({ cons });
	};

	const changeCon = ( index, value ) => {
		const cons = [ ...attributes.cons ];
		cons[ index ] = value;
		setAttributes({ cons });
	};

	const removeCon = ( index ) => {
		let cons = [ ...attributes.cons ];
		cons = cons.filter( ( el, i ) => i !== index );
		setAttributes({ cons });
	};

	const addLinks = () => {
		const links = [ ...attributes.links ];
		links.push({
			label: __( 'Buy Now', 'otter-blocks' ),
			href: ''
		});
		setAttributes({ links });
	};

	const changeLinks = ( index, value ) => {
		const links = [ ...attributes.links ];
		links[ index ] = {
			...links[ index ],
			...value
		};
		setAttributes({ links });
	};

	const removeLinks = ( index ) => {
		let links = [ ...attributes.links ];
		links = links.filter( ( el, i ) => i !== index );
		setAttributes({ links });
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Product Details', 'otter-blocks' ) }
			>
				{
					attributes.product && (
						<Notice
							status="warning"
							isDismissible={ false }
							className="otter-html-anchor-control-notice"
						>
							{__( 'WooCommerce product synchronization is active. Some options might be disabled.', 'otter-blocks' ) }
						</Notice>
					)
				}
				<TextControl
					label={ __( 'Product Name', 'otter-blocks' ) }
					type="text"
					placeholder={ __( 'Name of your product…', 'otter-blocks' ) }
					value={ productAttributes?.title || attributes.title }
					disabled={ attributes.product }
					onChange={ title => setAttributes({ title }) }
				/>

				<BaseControl>
					<TextControl
						label={ __( 'Currency', 'otter-blocks' ) }
						type="text"
						placeholder={ __( 'Currency code, like USD or EUR.', 'otter-blocks' ) }
						value={ productAttributes?.currency ||  attributes.currency }
						disabled={ attributes.product }
						onChange={ currency => setAttributes({ currency }) }
					/>

					{ __( 'Currency code in three digit ISO 4217 code.', 'otter-blocks' ) + ' ' }

					<ExternalLink href="https://en.wikipedia.org/wiki/ISO_4217#Active_codes">
						{ __( 'List of ISO 4217 codes.', 'otter-blocks' ) }
					</ExternalLink>
				</BaseControl>

				<TextControl
					label={ __( 'Price', 'otter-blocks' ) }
					type="number"
					value={ productAttributes?.price || attributes.price }
					disabled={ attributes.product }
					onChange={ value => setAttributes({ price: '' !== value ? Number( value ) : undefined }) }
				/>

				<TextControl
					label={ __( 'Discounted Price', 'otter-blocks' ) }
					type="number"
					value={ productAttributes?.discounted || attributes.discounted }
					disabled={ attributes.product }
					onChange={ value => setAttributes({ discounted: '' !== value ? Number( value ) : undefined }) }
				/>

				{ ! ( attributes.image || productAttributes?.image ) ? (
					<MediaPlaceholder
						labels={ {
							title: __( 'Product Image', 'otter-blocks' )
						} }
						accept="image/*"
						allowedTypes={ [ 'image' ] }
						value={ attributes.image }
						onSelect={ value => setAttributes({ image: pick( value, [ 'id', 'alt', 'url' ]) }) }
					/>
				) : (
					<BaseControl
						className="wp-block-themeisle-blocks-review__inspector_image"
					>
						<img
							src={ productAttributes?.image?.url || attributes.image.url }
							alt={ productAttributes?.image?.url || attributes.image.alt }
						/>

						<Button
							isSecondary
							onClick={ () => setAttributes({ image: undefined }) }
							disabled={ attributes.product }
						>
							{ __( 'Remove image', 'otter-blocks' ) }
						</Button>
					</BaseControl>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Product Features', 'otter-blocks' ) }
				initialOpen={ false }
			>
				{ 0 < attributes.features.length && attributes.features.map( ( feature, index ) => (
					<PanelItem
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
					className="wp-block-themeisle-blocks-review__inspector_add"
					onClick={ addFeature }
				>
					{ __( 'Add Feature', 'otter-blocks' ) }
				</Button>
			</PanelBody>

			<PanelBody
				title={ __( 'Pros', 'otter-blocks' ) }
				initialOpen={ false }
			>
				{ 0 < attributes.pros.length && attributes.pros.map( ( pro, index ) => (
					<PanelItem
						title={ pro || __( 'Pro', 'otter-blocks' ) }
						remove={ () => removePro( index ) }
					>
						<TextControl
							label={ __( 'Title', 'otter-blocks' ) }
							type="text"
							placeholder={ __( 'Why do you like the product?', 'otter-blocks' ) }
							value={ pro }
							onChange={ value => changePro( index, value ) }
						/>
					</PanelItem>
				) ) }

				<Button
					isSecondary
					isLarge
					className="wp-block-themeisle-blocks-review__inspector_add"
					onClick={ addPro }
				>
					{ __( 'Add Item', 'otter-blocks' ) }
				</Button>
			</PanelBody>

			<PanelBody
				title={ __( 'Cons', 'otter-blocks' ) }
				initialOpen={ false }
			>
				{ 0 < attributes.cons.length && attributes.cons.map( ( con, index ) => (
					<PanelItem
						title={ con || __( 'Con', 'otter-blocks' ) }
						remove={ () => removeCon( index ) }
					>
						<TextControl
							label={ __( 'Title', 'otter-blocks' ) }
							type="text"
							placeholder={ __( 'What can be improved?', 'otter-blocks' ) }
							value={ con }
							onChange={ value => changeCon( index, value ) }
						/>
					</PanelItem>
				) ) }

				<Button
					isSecondary
					isLarge
					className="wp-block-themeisle-blocks-review__inspector_add"
					onClick={ addCon }
				>
					{ __( 'Add Item', 'otter-blocks' ) }
				</Button>
			</PanelBody>

			<PanelBody
				title={ __( 'Links', 'otter-blocks' ) }
				initialOpen={ false }
			>
				{
					attributes.product && (
						<Notice
							status="warning"
							isDismissible={ false }
							className="otter-html-anchor-control-notice"
						>
							{__( 'WooCommerce product synchronization is active. Some options might be disabled.', 'otter-blocks' ) }
						</Notice>
					)
				}

				{ 0 < productAttributes?.links?.length && productAttributes?.links?.map( ( link, index ) => (
					<PanelItem
						title={ link.label || __( 'Link', 'otter-blocks' ) }
						remove={ () => removeLinks( index ) }
					>
						<TextControl
							label={ __( 'Label', 'otter-blocks' ) }
							type="text"
							placeholder={ __( 'Button label', 'otter-blocks' ) }
							disabled={ attributes.product }
							value={ link.label }
						/>

						<TextControl
							label={ __( 'Link', 'otter-blocks' ) }
							type="url"
							placeholder={ 'https://…' }
							value={ link.href }
							disabled={ attributes.product }
						/>

						<ToggleControl
							label={ __( 'Is this Sponsored?', 'otter-blocks' ) }
							checked={ link.isSponsored }
							disabled={ attributes.product }
						/>
					</PanelItem>
				) ) }

				{
					! ( 0 < productAttributes?.links?.length ) && (
						<Fragment>
							{ 0 < attributes.links.length && attributes.links.map( ( link, index ) => (
								<PanelItem
									title={ link.label || __( 'Link', 'otter-blocks' ) }
									remove={ () => removeLinks( index ) }
								>
									<TextControl
										label={ __( 'Label', 'otter-blocks' ) }
										type="text"
										placeholder={ __( 'Button label', 'otter-blocks' ) }
										value={ link.label }
										onChange={ label => changeLinks( index, { label }) }
									/>

									<TextControl
										label={ __( 'Link', 'otter-blocks' ) }
										type="url"
										placeholder={ 'https://…' }
										value={ link.href }
										onChange={ href => changeLinks( index, { href }) }
									/>

									<ToggleControl
										label={ __( 'Is this Sponsored?', 'otter-blocks' ) }
										checked={ link.isSponsored }
										onChange={ () => changeLinks( index, { isSponsored: ! link.isSponsored }) }
									/>
								</PanelItem>
							) ) }

							<Button
								isSecondary
								isLarge
								className="wp-block-themeisle-blocks-review__inspector_add"
								onClick={ addLinks }
							>
								{ __( 'Add Links', 'otter-blocks' ) }
							</Button>
						</Fragment>
					)
				}


			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.primaryColor,
						onChange: value => setAttributes({ primaryColor: value }),
						label: __( 'Primary', 'otter-blocks' )
					},
					{
						value: attributes.backgroundColor,
						onChange: value => setAttributes({ backgroundColor: value }),
						label: __( 'Background', 'otter-blocks' )
					},
					{
						value: attributes.textColor,
						onChange: value => setAttributes({ textColor: value }),
						label: __( 'Text', 'otter-blocks' )
					},
					{
						value: attributes.buttonTextColor,
						onChange: value => setAttributes({ buttonTextColor: value }),
						label: __( 'Button Text', 'otter-blocks' )
					}
				] }
			>

				<ContrastChecker
					{ ...{
						textColor: attributes.primaryColor,
						backgroundColor: attributes.backgroundColor
					} }
				/>
			</PanelColorSettings>

			{ ( Boolean( window.themeisleGutenberg.hasNeveSupport.hasNeve ) && ! Boolean( window.themeisleGutenberg.hasNeveSupport.hasNevePro ) ) && (
				<PanelBody
					title={ __( 'More Features', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<p>{ __( 'Build comparison tables for reviews, synchronize review data with WooCommerce products and more with Neve Pro. ', 'otter-blocks' )  }</p>

					<ExternalLink href="https://themeisle.com/themes/neve/pricing">
						{ __( 'Get Neve Pro. ', 'otter-blocks' )  }
					</ExternalLink>
				</PanelBody>
			) }
		</InspectorControls>
	);
};

export default Inspector;
