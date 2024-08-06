/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitContol,
	FontSizePicker,
	PanelBody,
	QueryControls,
	RangeControl,
	TextControl,
	BaseControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	BoxShadowControl,
	ButtonToggleControl,
	ClearButton,
	InspectorExtensions,
	InspectorHeader,
	ResponsiveControl,
	ToogleGroupControl
} from '../../components/index.js';

import LayoutBuilder from './components/design-layout-builder.js';
import {
	convertToTitleCase,
	changeActiveStyle,
	getActiveStyle,
	numberToBox
} from '../../helpers/helper-functions.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';
import { useTabSwitch } from '../../helpers/block-utility';
import { makeBox } from '../../plugins/copy-paste/utils';
import { styles } from './constants.js';

const defaultFontSizes = [
	{
		name: __( 'XS', 'otter-blocks' ),
		size: '14px',
		slug: 'xs'
	},
	{
		name: __( 'Small', 'otter-blocks' ),
		size: '16px',
		slug: 'small'
	},
	{
		name: __( 'Medium', 'otter-blocks' ),
		size: '18px',
		slug: 'medium'
	},
	{
		name: __( 'Large', 'otter-blocks' ),
		size: '24px',
		slug: 'large'
	},
	{
		name: __( 'XL', 'otter-blocks' ),
		size: '28px',
		slug: 'xl'
	}
];

/**
 *
 * @param {import('./types.js').PostInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	categoriesList,
	isLoading
}) => {
	const [ tab, setTab ] = useTabSwitch( attributes.id, 'settings' );
	const style = getActiveStyle( styles, attributes?.className );

	const {
		slugs
	} = useSelect( select => {
		return {
			slugs: select( 'otter-store' ).getPostsSlugs()
		};
	}, [ attributes.postTypes ]);

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useResponsiveAttributes( setAttributes );

	const categorySuggestions = categoriesList.reduce(
		( accumulator, category ) => ({
			...accumulator,
			[ category.name ]: category
		}),
		{}
	);

	const selectedCategories = attributes.categories ? attributes.categories.map( category => {
		const cat = categoriesList.find( cat => cat.id === Number( category.id ) );
		const isInvalid = ! isLoading && categoriesList?.length && ! cat;

		return {
			id: category.id,
			name: ( category?.name ?? cat?.name ?? cat?.slug ) +
				( isInvalid ? ' (' + __( 'Invalid', 'otter-blocks' ) + ')' : '' ),
			slug: category?.slug ?? cat?.slug ?? ''
		};
	}) : [];

	const selectedCategoryId = ( 'object' === typeof attributes.categories ) ?
		1 <= attributes.categories.length ? attributes.categories[0].id : undefined :
		attributes.categories;

	const selectCategories = value => {
		let categories;

		if ( 'object' === typeof value ) {
			if ( 0 < value.length ) {
				categories = value.map( name => {
					const category = categoriesList.find( e => e.name === name || e.name === name?.value );
					if ( category ) {
						return {
							id: category.id,
							name: name?.value ?? name,
							slug: category?.slug ?? ''
						};
					}
				}).filter( e => undefined !== e );
			}
		} else if ( '' !== value ) {
			categories = [{
				id: value,
				name: categoriesList.find( e => e.id === Number( value ) ).name,
				slug: categoriesList.find( e => e.id === Number( value ) )?.slug ?? ''
			}];
		}

		setAttributes({ categories });
	};

	const changeStyle = value => {
		const classes = changeActiveStyle( attributes?.className, styles, value );
		setAttributes({ className: classes });
	};

	const changeBoxShadow = ( type, data ) => {
		const boxShadow = { ...attributes[ type ] };
		Object.entries( data ).map( ([ key, val ] = data ) => {
			boxShadow[key] = val;
		});

		setAttributes({ [type]: boxShadow });
	};

	return (
		<InspectorControls>
			<InspectorHeader
				value={ tab }
				options={[
					{
						label: __( 'Settings', 'otter-blocks' ),
						value: 'settings'
					},
					{
						label: __( 'Style', 'otter-blocks' ),
						value: 'style'
					}
				]}
				onChange={ setTab }
			/>

			{ 'settings' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Layout', 'otter-blocks' ) }
					>
						<SelectControl
							label={ __( 'Post Type', 'otter-blocks' ) }
							help={ __( 'WordPress contains different types of content and they are divided into collections called "Post types". By default there are a few different ones such as blog posts and pages, but plugins could add more.', 'otter-blocks' ) }
							value={ attributes.postTypes[0] || null }
							onChange={ ( value ) => {
								if ( value ) {
									setAttributes({ postTypes: [ value ] });
								}
							} }
							options={
								slugs.map( slug => ({ label: convertToTitleCase( slug ), value: slug }) )
							}
						/>

						<ButtonToggleControl
							label={ __( 'Layout', 'otter-blocks' ) }
							options={[
								{
									label: __( 'Grid', 'otter-blocks' ),
									value: 'grid'
								},
								{
									label: __( 'List', 'otter-blocks' ),
									value: 'list'
								}
							]}
							value={ attributes.style }
							onChange={ value => setAttributes({ style: value }) }
						/>

						{ 'grid' === attributes.style && (
							<RangeControl
								label={ __( 'Columns', 'otter-blocks' ) }
								value={ attributes.columns }
								onChange={ columns => setAttributes({ columns }) }
								min={ 1 }
								max={ 5 }
							/>
						) }

						<BaseControl
							label={ __( 'Content Alignment', 'otter-blocks' ) }
						>
							<ToogleGroupControl
								value={ attributes.textAlign }
								options={[
									{
										icon: 'editor-alignleft',
										label: __( 'Left', 'otter-blocks' ),
										value: 'left'
									},
									{
										icon: 'editor-aligncenter',
										label: __( 'Center', 'otter-blocks' ),
										value: 'center'
									},
									{
										icon: 'editor-alignright',
										label: __( 'Right', 'otter-blocks' ),
										value: 'right'
									}
								]}
								onChange={ textAlign => setAttributes({ textAlign }) }
								hasIcon
							/>
						</BaseControl>
					</PanelBody>

					<PanelBody
						title={ __( 'Settings', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<QueryControls
							order={ attributes.order }
							orderBy={ attributes.orderBy }
							onOrderChange={ value => setAttributes({ order: value }) }
							onOrderByChange={ value => setAttributes({ orderBy: value }) }
							numberOfItems={ attributes.postsToShow }
							onNumberOfItemsChange={ value => setAttributes({ postsToShow: value }) }
							categorySuggestions={ categorySuggestions }
							selectedCategoryId={ selectedCategoryId }
							selectedCategories={ selectedCategories }
							onCategoryChange={ selectCategories }
						/>

						<TextControl
							label={ __( 'Offset', 'otter-blocks' ) }
							help={ __( 'Number of post to displace or pass over.', 'otter-blocks' ) }
							type="number"
							value={ attributes.offset }
							min={ 0 }
							onChange={ value => setAttributes({ offset: Number( value ) }) }
						/>

						<ToggleControl
							label={ __( 'Enable Featured Post', 'otter-blocks' ) }
							checked={ attributes.enableFeaturedPost }
							onChange={ () => setAttributes({ enableFeaturedPost: ! Boolean( attributes.enableFeaturedPost ), hasPagination: undefined })}
						/>

						{
							attributes.enableFeaturedPost && (
								<SelectControl
									label={ __( 'Featured Post', 'otter-blocks' ) }
									value={ attributes.featuredPostOrder }
									options={ [
										{ label: __( 'Latest Post', 'otter-blocks' ), value: 'none' },
										{ label: __( 'Sticky Post', 'otter-blocks' ), value: 'sticky-first' }
									] }
									onChange={ value => setAttributes({ featuredPostOrder: 'none' !== value ? value : undefined }) }
								/>
							)
						}

						<ToggleControl
							label={ __( 'Enable Pagination', 'otter-blocks' ) }
							checked={ attributes.hasPagination }
							onChange={ () => setAttributes({ hasPagination: ! Boolean( attributes.hasPagination ), enableFeaturedPost: undefined, featuredPostOrder: undefined }) }
						/>

					</PanelBody>

					<PanelBody
						title={ __( 'Elements', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<LayoutBuilder
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					</PanelBody>

					<InspectorExtensions/>
				</Fragment>
			) }

			{ 'style' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Style', 'otter-blocks' ) }
					>
						<ButtonToggleControl
							options={ styles }
							value={ getActiveStyle( styles, attributes?.className ) }
							onChange={ changeStyle }
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Typography', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<SelectControl
							label={ __( 'Title Tag', 'otter-blocks' ) }
							value={ attributes.titleTag || 'h4' }
							options={ [
								{ label: __( 'H1', 'otter-blocks' ), value: 'h1' },
								{ label: __( 'H2', 'otter-blocks' ), value: 'h2' },
								{ label: __( 'H3', 'otter-blocks' ), value: 'h3' },
								{ label: __( 'H4', 'otter-blocks' ), value: 'h4' },
								{ label: __( 'H5', 'otter-blocks' ), value: 'h5' },
								{ label: __( 'H6', 'otter-blocks' ), value: 'h6' }
							] }
							onChange={ titleTag => setAttributes({ titleTag }) }
						/>

						<ResponsiveControl
							label={ __( 'Title Size', 'otter-blocks' ) }
						>
							<FontSizePicker
								fontSizes={ defaultFontSizes }
								withReset
								value={ responsiveGetAttributes([ attributes.customTitleFontSize, attributes.customTitleFontSizeTablet, attributes.customTitleFontSizeMobile ]) }
								onChange={ value => responsiveSetAttributes( value, [ 'customTitleFontSize', 'customTitleFontSizeTablet', 'customTitleFontSizeMobile' ]) }
							/>
						</ResponsiveControl>

						<ResponsiveControl
							label={ __( 'Description Size', 'otter-blocks' ) }
						>
							<FontSizePicker
								fontSizes={ defaultFontSizes }
								withReset
								value={ responsiveGetAttributes([ attributes.customDescriptionFontSize, attributes.customDescriptionFontSizeTablet, attributes.customDescriptionFontSizeMobile ]) }
								onChange={ value => responsiveSetAttributes( value, [ 'customDescriptionFontSize', 'customDescriptionFontSizeTablet', 'customDescriptionFontSizeMobile' ]) }
							/>
						</ResponsiveControl>

						<ResponsiveControl
							label={ __( 'Meta Size', 'otter-blocks' ) }
						>
							<FontSizePicker
								fontSizes={ defaultFontSizes }
								withReset
								value={ responsiveGetAttributes([ attributes.customMetaFontSize, attributes.customMetaFontSizeTablet, attributes.customMetaFontSizeMobile ]) }
								onChange={ value => responsiveSetAttributes( value, [ 'customMetaFontSize', 'customMetaFontSizeTablet', 'customMetaFontSizeMobile' ]) }
							/>
						</ResponsiveControl>

						{
							attributes.hasPagination && (
								<BaseControl
									id="o-posts-grid-pagination-font-size"
									label={ __( 'Pagination', 'otter-blocks' ) }
								>
									<FontSizePicker
										fontSizes={ defaultFontSizes }
										withReset
										value={ attributes.pagSize ?? '16px' }
										onChange={ pagSize => setAttributes({ pagSize }) }
									/>
								</BaseControl>
							)
						}
					</PanelBody>

					<PanelColorSettings
						title={ __( 'Color', 'otter-blocks' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: attributes.textColor,
								onChange: textColor => setAttributes({ textColor }),
								label: __( 'Text', 'otter-blocks' ),
								isShownByDefault: false
							},
							{
								value: attributes.backgroundColor,
								onChange: backgroundColor => setAttributes({ backgroundColor }),
								label: __( 'Background', 'otter-blocks' ),
								isShownByDefault: false
							},
							{
								value: attributes.borderColor,
								onChange: borderColor => setAttributes({ borderColor }),
								label: __( 'Border', 'otter-blocks' ),
								isShownByDefault: false
							},
							...( 'tiled' === style ? [
								{
									value: attributes.backgroundOverlay,
									onChange: backgroundOverlay => setAttributes({ backgroundOverlay }),
									label: __( 'Background Overlay', 'otter-blocks' ),
									enableAlpha: true,
									isShownByDefault: false
								}
							] : []),
							...( attributes.hasPagination ? [
								{
									value: attributes.pagColor,
									onChange: pagColor => setAttributes({ pagColor }),
									label: __( 'Pagination Link', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.pagBgColor,
									onChange: pagBgColor => setAttributes({ pagBgColor }),
									label: __( 'Pagination Background', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.pagBorderColor,
									onChange: pagBorderColor => setAttributes({ pagBorderColor }),
									label: __( 'Pagination Border', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.pagColorActive,
									onChange: pagColorActive => setAttributes({ pagColorActive }),
									label: __( 'Pagination Active Link', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.pagBgColorActive,
									onChange: pagBgColorActive => setAttributes({ pagBgColorActive }),
									label: __( 'Pagination Active Background', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.pagColorHover,
									onChange: pagColorHover => setAttributes({ pagColorHover }),
									label: __( 'Pagination Hover Link', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.pagBgColorHover,
									onChange: pagBgColorHover => setAttributes({ pagBgColorHover }),
									label: __( 'Pagination Hover Background', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.pagBorderColorHover,
									onChange: pagBorderColorHover => setAttributes({ pagBorderColorHover }),
									label: __( 'Pagination Hover Border', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.pagBorderColorActive,
									onChange: pagBorderColorActive => setAttributes({ pagBorderColorActive }),
									label: __( 'Pagination Active Border', 'otter-blocks' ),
									isShownByDefault: false
								}
							] : [])
						] }
					/>

					<PanelBody
						title={ __( 'Image', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<BoxControl
							label={ __( 'Border Radius', 'otter-blocks' ) }
							values={ numberToBox( attributes.borderRadius ) }
							onChange={ borderRadius => setAttributes({ borderRadius }) }
							id="o-border-raduis-box"
						/>

						{ 'list' === attributes.style && (
							<Fragment>
								<ResponsiveControl
									label={ __( 'Image Width', 'otter-blocks' ) }
								>
									<UnitContol
										value={ responsiveGetAttributes([ attributes.imageWidth, attributes.imageWidthTablet, attributes.imageWidthMobile ]) }
										onChange={ value => responsiveSetAttributes( value, [ 'imageWidth', 'imageWidthTablet', 'imageWidthMobile' ]) }
									/>

									<ClearButton
										values={[ 'imageWidth', 'imageWidthTablet', 'imageWidthMobile' ]}
										setAttributes={ setAttributes }
									/>
								</ResponsiveControl>
							</Fragment>
						) }

						<BoxShadowControl
							boxShadow={ attributes.imageBoxShadow }
							onChange={ data => changeBoxShadow( 'imageBoxShadow', data ) }
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Spacing', 'otter-blocks' ) }
						initialOpen={ false }
					>
						{ 'list' !== attributes.style && (
							<ResponsiveControl
								label={ __( 'Column Gap', 'otter-blocks' ) }
							>
								<UnitContol
									value={ responsiveGetAttributes([ attributes.columnGap, attributes.columnGapTablet, attributes.columnGapMobile ]) ?? '30px' }
									onChange={ value => responsiveSetAttributes( value, [ 'columnGap', 'columnGapTablet', 'columnGapMobile' ]) }
								/>

								<ClearButton
									values={[ 'columnGap', 'columnGapTablet', 'columnGapMobile' ]}
									setAttributes={ setAttributes }
								/>
							</ResponsiveControl>
						) }

						<ResponsiveControl
							label={ __( 'Row Gap', 'otter-blocks' ) }
						>
							<UnitContol
								value={ responsiveGetAttributes([ attributes.rowGap, attributes.rowGapTablet, attributes.rowGapMobile ]) ?? '30px' }
								onChange={ value => responsiveSetAttributes( value, [ 'rowGap', 'rowGapTablet', 'rowGapMobile' ]) }
							/>

							<ClearButton
								values={[ 'rowGap', 'rowGapTablet', 'rowGapMobile' ]}
								setAttributes={ setAttributes }
							/>
						</ResponsiveControl>

						<ResponsiveControl
							label={ __( 'Content Padding', 'otter-blocks' ) }
						>
							<UnitContol
								value={ responsiveGetAttributes([ attributes.padding, attributes.paddingTablet, attributes.paddingMobile ]) }
								onChange={ value => responsiveSetAttributes( value, [ 'padding', 'paddingTablet', 'paddingMobile' ]) }
							/>

							<ClearButton
								values={[ 'padding', 'paddingTablet', 'paddingMobile' ]}
								setAttributes={ setAttributes }
							/>
						</ResponsiveControl>

						<BaseControl
							label={ __( 'Space Between', 'otter-blocks' ) }
						>
							<FontSizePicker
								fontSizes={ defaultFontSizes }
								withReset
								value={ attributes.contentGap }
								onChange={ contentGap => setAttributes({ contentGap }) }
							/>
						</BaseControl>

						{
							attributes.hasPagination && (
								<Fragment>
									<RangeControl
										label={ __( 'Pagination Gap', 'otter-blocks' ) }
										value={ attributes.pagGap ? parseInt( attributes.pagGap ) : 5 }
										onChange={ pagGap => setAttributes({ pagGap: pagGap + 'px' }) }
										min={ 0 }
										max={ 50 }
									/>
									<BoxControl
										label={ __( 'Pagination Padding', 'otter-blocks' ) }
										values={ attributes.pagPadding ?? { top: '5px', right: '15px', bottom: '5px', left: '15px' } }
										onChange={ pagPadding => setAttributes({ pagPadding }) }
										allowReset
									/>
									<BoxControl
										label={ __( 'Pagination Container Margin', 'otter-blocks' ) }
										values={ attributes.pagContMargin ?? { top: '10px', 'bottom': '30px' } }
										onChange={ pagContMargin => setAttributes({ pagContMargin }) }
										sides={[ 'top', 'bottom' ]}
										allowReset
									/>
								</Fragment>
							)
						}
					</PanelBody>

					<PanelBody
						title={ __( 'Border', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<UnitContol
							label={ __( 'Width', 'otter-blocks' ) }
							value={ attributes.borderWidth ?? '0px' }
							onChange={ borderWidth => setAttributes({ borderWidth }) }
						/>

						<ClearButton
							values={[ 'borderWidth' ]}
							setAttributes={ setAttributes }
						/>

						<BoxControl
							label={ __( 'Radius', 'otter-blocks' ) }
							values={ attributes.cardBorderRadius ?? makeBox( '0px' )  }
							onChange={ cardBorderRadius => setAttributes({ cardBorderRadius }) }
							id="o-border-raduis-box"
							allowReset={ false }
						/>

						{
							attributes.hasPagination && (
								<Fragment>
									<BoxControl
										label={ __( 'Pagination Border Radius', 'otter-blocks' ) }
										values={ attributes.pagBorderRadius ?? makeBox( '0px' ) }
										onChange={ pagBorderRadius => setAttributes({ pagBorderRadius }) }
										id="o-border-raduis-box"
										allowReset
									/>
									<BoxControl
										label={ __( 'Pagination Border Width', 'otter-blocks' ) }
										values={ attributes.pagBorderWidth ?? makeBox( '0px' ) }
										onChange={ pagBorderWidth => setAttributes({ pagBorderWidth }) }
										allowReset
									/>
								</Fragment>
							)
						}

						<BoxShadowControl
							boxShadow={ attributes.boxShadow }
							onChange={ data => changeBoxShadow( 'boxShadow', data ) }
						/>
					</PanelBody>
				</Fragment>
			) }
		</InspectorControls>
	);
};

export default Inspector;
