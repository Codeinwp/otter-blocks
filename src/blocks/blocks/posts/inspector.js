/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	PanelBody,
	QueryControls,
	RangeControl,
	TextControl,
	BaseControl,
	SelectControl
} from '@wordpress/components';

import { InspectorControls } from '@wordpress/block-editor';

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import LayoutBuilder from './components/layout-builder.js';
import { StyleSwitcherInspectorControl } from '../../components/style-switcher-control/index.js';
import { convertToTitleCase } from '../../helpers/helper-functions.js';

const Inspector = ({
	attributes,
	setAttributes,
	changeStyle,
	categoriesList
}) => {

	const {
		slugs
	} = useSelect( select => {
		return {
			slugs: select( 'otter-store' ).getPostsSlugs()
		};
	}, [ attributes.postTypes ]);

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
		} else {
			if ( '' !== value ) {
				categories = [ {
					id: value,
					name: categoriesList.find( e => e.id === Number( value ) ).name
				} ];
			}
		}

		setAttributes({ categories });
	};

	const changeColumns = value => {
		setAttributes({ columns: value });
	};

	const getFields = field => {
		if ( 'image' === field ) {
			return attributes.displayFeaturedImage;
		}
		if ( 'imageBoxShadow' === field ) {
			return attributes.imageBoxShadow;
		}

		if ( 'category' === field ) {
			return attributes.displayCategory;
		}

		if ( 'title' === field ) {
			return attributes.displayTitle;
		}

		if ( 'meta' === field ) {
			return attributes.displayMeta;
		}

		if ( 'description' === field ) {
			return attributes.displayDescription;
		}

		if ( 'date' === field ) {
			return attributes.displayDate;
		}

		if ( 'author' === field ) {
			return attributes.displayAuthor;
		}
	};

	const toggleFields = field => {
		if ( 'image' === field ) {
			setAttributes({ displayFeaturedImage: ! attributes.displayFeaturedImage });
		}

		if ( 'imageBoxShadow' === field ) {
			setAttributes({ imageBoxShadow: ! attributes.imageBoxShadow });
		}

		if ( 'category' === field ) {
			setAttributes({ displayCategory: ! attributes.displayCategory });
		}

		if ( 'title' === field ) {
			setAttributes({ displayTitle: ! attributes.displayTitle });
		}

		if ( 'meta' === field ) {
			setAttributes({ displayMeta: ! attributes.displayMeta });
		}

		if ( 'description' === field ) {
			setAttributes({ displayDescription: ! attributes.displayDescription });
		}

		if ( 'date' === field ) {
			setAttributes({ displayDate: ! attributes.displayDate });
		}

		if ( 'author' === field ) {
			setAttributes({ displayAuthor: ! attributes.displayAuthor });
		}
	};

	const changeImageSize = value => {
		setAttributes({ imageSize: value });
	};

	const changeTitleTag = value => {
		setAttributes({ titleTag: value });
	};

	const changeExcerptLength = value => {
		setAttributes({ excerptLength: value });
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Styles', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<StyleSwitcherInspectorControl
					value={ attributes.style }
					options={ [
						{
							label: __( 'Grid', 'otter-blocks' ),
							value: 'grid',
							image: window.themeisleGutenberg.assetsPath + '/icons/posts-grid.jpg'
						},
						{
							label: __( 'List', 'otter-blocks' ),
							value: 'list',
							image: window.themeisleGutenberg.assetsPath + '/icons/posts-list.jpg'
						}
					] }
					onChange={ changeStyle }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Post Types', 'otter-blocks' ) }
			>
				<BaseControl>
					{ __( 'Select the types of the post. If none is selected, the default WordPress post will be displayed.', 'otter-blocks' ) }
				</BaseControl>

				<SelectControl
					label={ __( 'Post Type', 'otter-blocks' ) }
					value= { attributes.postTypes[0] || null }
					onChange={ ( value ) => value && setAttributes({ postTypes: [ value ] }) }
					options= {
						slugs.map( slug => ({ label: convertToTitleCase( slug ), value: slug }) )
					}
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				{ 'grid' === attributes.style && (
					<RangeControl
						label={ __( 'Columns', 'otter-blocks' ) }
						value={ attributes.columns }
						onChange={ changeColumns }
						min={ 1 }
						max={ 5 }
					/>
				) }

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
			</PanelBody>

			<PanelBody
				title={ __( 'Design & Layout', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<LayoutBuilder
					attributes={ attributes }
					getFields={ getFields }
					toggleFields={ toggleFields }
					setAttributes={ setAttributes }
					imageSize={ {
						value: attributes.imageSize,
						onChange: changeImageSize
					} }
					titleTag={ {
						value: attributes.titleTag,
						onChange: changeTitleTag
					} }
					excerptLimit={ {
						value: attributes.excerptLength,
						onChange: changeExcerptLength
					} }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
