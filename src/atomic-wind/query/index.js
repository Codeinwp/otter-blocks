import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl, ToggleControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';


const POST_FIELD_OPTIONS = {
	'atomic-wind/text': [
		{ label: __( 'None', 'otter-blocks' ), value: '' },
		{ label: __( 'Title', 'otter-blocks' ), value: 'title' },
		{ label: __( 'Excerpt', 'otter-blocks' ), value: 'excerpt' },
		{ label: __( 'Date', 'otter-blocks' ), value: 'date' },
		{ label: __( 'Author', 'otter-blocks' ), value: 'author' },
		{ label: __( 'Categories', 'otter-blocks' ), value: 'categories' },
		{ label: __( 'Tags', 'otter-blocks' ), value: 'tags' },
		{ label: __( 'Modified Date', 'otter-blocks' ), value: 'modified_date' },
		{ label: __( 'Comment Count', 'otter-blocks' ), value: 'comment_count' },
		{ label: __( 'Reading Time', 'otter-blocks' ), value: 'reading_time' },
		{ label: __( 'Custom Field', 'otter-blocks' ), value: 'custom_field' },
	],
	'atomic-wind/link': [
		{ label: __( 'None', 'otter-blocks' ), value: '' },
		{ label: __( 'Permalink', 'otter-blocks' ), value: 'permalink' },
		{ label: __( 'Author Posts URL', 'otter-blocks' ), value: 'author_posts_url' },
		{ label: __( 'Category Link', 'otter-blocks' ), value: 'category_link' },
		{ label: __( 'Tag Link', 'otter-blocks' ), value: 'tag_link' },
		{ label: __( 'Date Archive', 'otter-blocks' ), value: 'date_archive' },
		{ label: __( 'Author Archive', 'otter-blocks' ), value: 'author_archive' },
	],
	'atomic-wind/image': [
		{ label: __( 'None', 'otter-blocks' ), value: '' },
		{ label: __( 'Featured Image', 'otter-blocks' ), value: 'featured_image' },
		{ label: __( 'Author Avatar', 'otter-blocks' ), value: 'author_avatar' },
	],
};

const ORDER_BY_OPTIONS = [
	{ label: __( 'Date', 'otter-blocks' ), value: 'date' },
	{ label: __( 'Title', 'otter-blocks' ), value: 'title' },
	{ label: __( 'Modified', 'otter-blocks' ), value: 'modified' },
	{ label: __( 'Random', 'otter-blocks' ), value: 'rand' },
	{ label: __( 'Menu Order', 'otter-blocks' ), value: 'menu_order' },
];

const ORDER_OPTIONS = [
	{ label: __( 'DESC', 'otter-blocks' ), value: 'DESC' },
	{ label: __( 'ASC', 'otter-blocks' ), value: 'ASC' },
];

addFilter(
	'blocks.registerBlockType',
	'atomic-wind/query-attributes',
	( settings ) => {
		if ( settings.category !== 'atomic-wind' ) {
			return settings;
		}

		const extraAttributes = {
			postField: {
				type: 'string',
				default: '',
			},
			excerptLength: {
				type: 'number',
				default: 25,
			},
			customFieldKey: {
				type: 'string',
				default: '',
			},
		};

		if ( settings.name === 'atomic-wind/box' ) {
			extraAttributes.queryPostType = {
				type: 'string',
				default: '',
			};
			extraAttributes.queryCount = {
				type: 'number',
				default: 3,
			};
			extraAttributes.queryOrderBy = {
				type: 'string',
				default: 'date',
			};
			extraAttributes.queryOrder = {
				type: 'string',
				default: 'DESC',
			};
			extraAttributes.queryTaxonomy = {
				type: 'string',
				default: '',
			};
			extraAttributes.queryExcludeCurrent = {
				type: 'boolean',
				default: false,
			};
			extraAttributes.querySticky = {
				type: 'string',
				default: '',
			};
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				...extraAttributes,
			},
		};
	}
);

const withQueryControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( ! props.name.startsWith( 'atomic-wind/' ) ) {
			return <BlockEdit { ...props } />;
		}

		const { attributes, setAttributes } = props;
		const isBox = props.name === 'atomic-wind/box';
		const hasPostFieldOptions = POST_FIELD_OPTIONS.hasOwnProperty( props.name );

		const postTypes = useSelect( ( select ) => {
			if ( ! isBox ) {
				return [];
			}
			const types = select( 'core' ).getPostTypes( { per_page: -1 } );
			if ( ! types ) {
				return [];
			}
			return types
				.filter( ( type ) => type.viewable )
				.map( ( type ) => ( {
					label: type.labels.singular_name,
					value: type.slug,
				} ) );
		}, [ isBox ] );

		const [ taxSlug, termSlug ] = ( attributes.queryTaxonomy || '' ).split( ':' );

		const taxonomies = useSelect( ( select ) => {
			if ( ! isBox || ! attributes.queryPostType ) {
				return [];
			}
			const allTaxonomies = select( 'core' ).getTaxonomies( { per_page: -1 } );
			if ( ! allTaxonomies ) {
				return [];
			}
			return allTaxonomies.filter( ( tax ) => tax.visibility?.public_queryable !== false && tax.visibility?.show_ui !== false );
		}, [ isBox, attributes.queryPostType ] );

		const terms = useSelect( ( select ) => {
			if ( ! isBox || ! taxSlug ) {
				return [];
			}
			const records = select( 'core' ).getEntityRecords( 'taxonomy', taxSlug, { per_page: -1 } );
			return records || [];
		}, [ isBox, taxSlug ] );

		const isInsideQuery = useSelect( ( select ) => {
			if ( ! hasPostFieldOptions ) {
				return false;
			}
			const { getBlockParents, getBlock } = select( 'core/block-editor' );
			const parents = getBlockParents( props.clientId );
			return parents.some( ( parentId ) => {
				const parent = getBlock( parentId );
				return parent?.name === 'atomic-wind/box' && !! parent?.attributes?.queryPostType;
			} );
		}, [ props.clientId, hasPostFieldOptions ] );

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					{ isBox && (
						<PanelBody
							title={ __( 'Query', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<SelectControl
								label={ __( 'Post Type', 'otter-blocks' ) }
								value={ attributes.queryPostType || '' }
								options={ [
									{ label: __( 'None', 'otter-blocks' ), value: '' },
									...postTypes,
								] }
								onChange={ ( value ) =>
									setAttributes( { queryPostType: value } )
								}
							/>
							{ attributes.queryPostType && (
								<>
									<RangeControl
										label={ __( 'Posts Per Page', 'otter-blocks' ) }
										value={ attributes.queryCount || 3 }
										onChange={ ( value ) =>
											setAttributes( { queryCount: value } )
										}
										min={ 1 }
										max={ 50 }
									/>
									<SelectControl
										label={ __( 'Order By', 'otter-blocks' ) }
										value={ attributes.queryOrderBy || 'date' }
										options={ ORDER_BY_OPTIONS }
										onChange={ ( value ) =>
											setAttributes( { queryOrderBy: value } )
										}
									/>
									<SelectControl
										label={ __( 'Order', 'otter-blocks' ) }
										value={ attributes.queryOrder || 'DESC' }
										options={ ORDER_OPTIONS }
										onChange={ ( value ) =>
											setAttributes( { queryOrder: value } )
										}
									/>
									<SelectControl
										label={ __( 'Taxonomy', 'otter-blocks' ) }
										value={ taxSlug || '' }
										options={ [
											{ label: __( 'None', 'otter-blocks' ), value: '' },
											...taxonomies.map( ( tax ) => ( {
												label: tax.name,
												value: tax.slug,
											} ) ),
										] }
										onChange={ ( value ) =>
											setAttributes( { queryTaxonomy: value ? value + ':' : '' } )
										}
									/>
									{ taxSlug && (
										<SelectControl
											label={ __( 'Term', 'otter-blocks' ) }
											value={ termSlug || '' }
											options={ [
												{ label: __( 'All', 'otter-blocks' ), value: '' },
												...terms.map( ( term ) => ( {
													label: term.name,
													value: term.slug,
												} ) ),
											] }
											onChange={ ( value ) =>
												setAttributes( { queryTaxonomy: taxSlug + ':' + ( value || '' ) } )
											}
										/>
									) }
									<ToggleControl
										label={ __( 'Exclude Current Post', 'otter-blocks' ) }
										checked={ !! attributes.queryExcludeCurrent }
										onChange={ ( value ) =>
											setAttributes( { queryExcludeCurrent: value } )
										}
									/>
									<SelectControl
										label={ __( 'Sticky Posts', 'otter-blocks' ) }
										value={ attributes.querySticky || '' }
										options={ [
											{ label: __( 'Default', 'otter-blocks' ), value: '' },
											{ label: __( 'Exclude', 'otter-blocks' ), value: 'exclude' },
											{ label: __( 'Only Sticky', 'otter-blocks' ), value: 'only' },
										] }
										onChange={ ( value ) =>
											setAttributes( { querySticky: value } )
										}
									/>
									<p className="components-base-control__help">
										{ __( 'Inner blocks are repeated for each queried post on the frontend.', 'otter-blocks' ) }
									</p>
								</>
							) }
						</PanelBody>
					) }
					{ hasPostFieldOptions && isInsideQuery && (
						<PanelBody
							title={ __( 'Post Data', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<SelectControl
								label={ __( 'Post Field', 'otter-blocks' ) }
								value={ attributes.postField || '' }
								options={ POST_FIELD_OPTIONS[ props.name ] }
								onChange={ ( value ) =>
									setAttributes( { postField: value } )
								}
								help={
									attributes.postField
										? __( 'Content will be replaced with post data on the frontend.', 'otter-blocks' )
										: undefined
								}
							/>
							{ attributes.postField === 'excerpt' && props.name === 'atomic-wind/text' && (
								<RangeControl
									label={ __( 'Excerpt Length (words)', 'otter-blocks' ) }
									value={ attributes.excerptLength || 25 }
									onChange={ ( value ) =>
										setAttributes( { excerptLength: value } )
									}
									min={ 1 }
									max={ 100 }
								/>
							) }
							{ attributes.postField === 'custom_field' && props.name === 'atomic-wind/text' && (
								<TextControl
									label={ __( 'Meta Key', 'otter-blocks' ) }
									value={ attributes.customFieldKey || '' }
									onChange={ ( value ) =>
										setAttributes( { customFieldKey: value } )
									}
									help={ __( 'Enter the post meta key or ACF field name.', 'otter-blocks' ) }
								/>
							) }
						</PanelBody>
					) }
				</InspectorControls>
			</>
		);
	};
}, 'withQueryControls' );

addFilter(
	'editor.BlockEdit',
	'atomic-wind/query-controls',
	withQueryControls
);
