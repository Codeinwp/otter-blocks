/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	FontSizePicker,
	PanelBody,
	QueryControls,
	RangeControl,
	TextControl,
	BaseControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

import { InspectorControls } from '@wordpress/block-editor';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import InspectorHeader from '../../components/inspector-header/index.js';
import { InspectorExtensions } from '../../components/inspector-slot-fill/index.js';
import LayoutBuilder from './components/design-layout-builder.js';
import ToogleGroupControl from '../../components/toogle-group-control/index.js';
import ButtonToggle from '../../components/button-toggle-control/index.js';
import ResponsiveControl from '../../components/responsive-control/index.js';
import {
	buildResponsiveGetAttributes,
	buildResponsiveSetAttributes,
	convertToTitleCase,
	changeActiveStyle,
	getActiveStyle
} from '../../helpers/helper-functions.js';

const styles = [
	{
		label: __( 'Default', 'otter-blocks' ),
		value: 'default',
		isDefault: true
	},
	{
		label: __( 'Boxed', 'otter-blocks' ),
		value: 'boxed'
	}
];

const defaultFontSizes = [
	{
		name: 14,
		size: '14px'
	},
	{
		name: 16,
		size: '16px'
	},
	{
		name: 18,
		size: '18px'
	},
	{
		name: 24,
		size: '24px'
	},
	{
		name: 28,
		size: '28px'
	}
];

/**
 *
 * @param {import('../popup/types.js').PopupInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	categoriesList
}) => {
	const [ tab, setTab ] = useState( 'settings' );

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
	} = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

		return {
			responsiveSetAttributes: buildResponsiveSetAttributes( setAttributes, view ),
			responsiveGetAttributes: buildResponsiveGetAttributes( view )
		};
	}, []);

	const categorySuggestions = categoriesList.reduce(
		( accumulator, category ) => ({
			...accumulator,
			[ category.name ]: category
		}),
		{}
	);

	const selectedCategories = attributes.categories ? attributes.categories.map( category => {
		const cat = categoriesList.find( cat => cat.id === Number( category.id ) );
		return {
			id: category.id,
			name: cat?.name || cat?.slug || ''
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
					if ( 'object' === typeof name ) {
						return name;
					}

					const category = categoriesList.find( e => e.name === name );
					if ( category ) {
						return {
							id: category.id,
							name
						};
					}
				}).filter( e => undefined !== e );
			}
		} else if ( '' !== value ) {
			categories = [{
				id: value,
				name: categoriesList.find( e => e.id === Number( value ) ).name
			}];
		}

		setAttributes({ categories });
	};

	const changeColumns = value => {
		setAttributes({ columns: value });
	};

	const changeStyle = value => {
		const classes = changeActiveStyle( attributes?.className, styles, value );
		setAttributes({ className: classes });
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

			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
			>
				<ButtonToggle
					options={ styles }
					value={ getActiveStyle( styles, attributes?.className ) }
					onChange={ changeStyle }
				/>
			</PanelBody>

			{ 'settings' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Layout', 'otter-blocks' ) }
					>
						<BaseControl>
							{ __( 'Select the types of the post. If none is selected, the default WordPress post will be displayed.', 'otter-blocks' ) }
						</BaseControl>

						<SelectControl
							label={ __( 'Post Type', 'otter-blocks' ) }
							value={ attributes.postTypes[0] || null }
							onChange={ ( value ) => value && setAttributes({ postTypes: [ value ] }) }
							options={
								slugs.map( slug => ({ label: convertToTitleCase( slug ), value: slug }) )
							}
						/>

						<ButtonToggle
							label={ __( 'Orientation', 'otter-blocks' ) }
							options={[
								{
									label: __( 'Row', 'otter-blocks' ),
									value: 'grid'
								},
								{
									label: __( 'Columns', 'otter-blocks' ),
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
								onChange={ changeColumns }
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
							onChange={ enableFeaturedPost => setAttributes({ enableFeaturedPost })}
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Design & Layout', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<LayoutBuilder
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					</PanelBody>
				</Fragment>
			) }

			{ 'style' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Typography', 'otter-blocks' ) }
					>
						<SelectControl
							label={ __( 'Title Tag', 'otter-blocks' ) }
							value={ attributes.titleTag || 'h5' }
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
								values={ responsiveGetAttributes([ attributes.customTitleFontSize, attributes.customTitleFontSizeTablet, attributes.customTitleFontSizeMobile ]) }
								onChange={ value => responsiveSetAttributes( value, [ 'customTitleFontSize', 'customTitleFontSizeTablet', 'customTitleFontSizeMobile' ]) }
							/>
						</ResponsiveControl>

						<ResponsiveControl
							label={ __( 'Description Size', 'otter-blocks' ) }
						>
							<FontSizePicker
								fontSizes={ defaultFontSizes }
								withReset
								values={ responsiveGetAttributes([ attributes.customDescriptionFontSize, attributes.customDescriptionFontSizeTablet, attributes.customDescriptionFontSizeMobile ]) }
								onChange={ value => responsiveSetAttributes( value, [ 'customDescriptionFontSize', 'customDescriptionFontSizeTablet', 'customDescriptionFontSizeMobile' ]) }
							/>
						</ResponsiveControl>
					</PanelBody>
				</Fragment>
			) }

			<InspectorExtensions/>
		</InspectorControls>
	);
};

export default Inspector;
