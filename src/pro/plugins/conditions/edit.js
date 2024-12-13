/**
 * WordPress dependencies.
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	CheckboxControl,
	DateTimePicker,
	Dropdown,
	ExternalLink,
	FormTokenField,
	Placeholder,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	format,
	__experimentalGetSettings
} from '@wordpress/date';

import { Fragment } from '@wordpress/element';

import { decodeEntities } from '@wordpress/html-entities';

const week = [
	{
		value: 'monday',
		label: __( 'Monday', 'otter-pro' )
	},
	{
		value: 'tuesday',
		label: __( 'Tuesday', 'otter-pro' )
	},
	{
		value: 'wednesday',
		label: __( 'Wednesday', 'otter-pro' )
	},
	{
		value: 'thursday',
		label: __( 'Thursday', 'otter-pro' )
	},
	{
		value: 'friday',
		label: __( 'Friday', 'otter-pro' )
	},
	{
		value: 'saturday',
		label: __( 'Saturday', 'otter-pro' )
	},
	{
		value: 'sunday',
		label: __( 'Sunday', 'otter-pro' )
	}
];

const DateRange = ({
	label,
	id,
	value,
	onChange
}) => {
	const settings = __experimentalGetSettings();

	return (
		<BaseControl
			label={ label }
			id={ id }
		>
			<Dropdown
				position="bottom left"
				renderToggle={ ({ onToggle, isOpen }) => (
					<>
						<Button
							id={ id }
							onClick={ onToggle }
							isSecondary
							aria-expanded={ isOpen }
						>
							{ value ? format( settings.formats.datetime, value ) : __( 'Select Date', 'otter-pro' ) }
						</Button>
					</>
				) }
				renderContent={ () => (
					<DateTimePicker
						currentDate={ value }
						onChange={ onChange }
					/>
				) }
			/>
		</BaseControl>
	);
};

const Multiselect = ({
	label,
	items,
	values,
	onChange
}) => {
	return (
		<FormTokenField
			label={ label }
			value={ ( values && 'object' === typeof values ) ? values.map( id => {
				const obj = items.find( item => Number( id ) === Number( item.value ) );
				return `${ obj?.value }. ${ obj?.label }`;
			}) : undefined }
			suggestions={ items.map( item => `${ item.value }. ${ item.label }` ) }
			onChange={ onChange }
			__experimentalExpandOnFocus={ true }
			__experimentalValidateInput={ value => {
				const regex = /^([^.]+)/;
				const m = regex.exec( value );
				null !== m ? value = Number( m[0]) : value;
				return undefined !== items.find( item => Number( value ) === Number( item.value ) );
			} }
		/>
	);
};

const ProductsMultiselect = ( props ) => {
	const {
		products,
		isLoading
	} = useSelect( select => {
		if ( ! Boolean( window.otterPro.hasWooCommerce ) ) {
			return {
				products: [],
				isLoading: false
			};
		}

		const { COLLECTIONS_STORE_KEY } = window?.wc?.wcBlocksData;
		const {
			getCollection,
			getCollectionError,
			isResolving
		} = select( COLLECTIONS_STORE_KEY );

		// eslint-disable-next-line camelcase
		const productsError = getCollectionError?.( '/wc/store', 'products', { per_page: 0 });

		const products = productsError ? [] : ( getCollection?.( '/wc/store', 'products', { 'per_page': 0 }) ?? [])?.map( result => ({
			value: result.id,
			label: decodeEntities( result.name )
		}) );

		return {
			products,
			isLoading: isResolving( 'getCollection', [ '/wc/store', 'products', { 'per_page': 0 }])
		};
	}, []);

	return isLoading ? (
		<Placeholder><Spinner /></Placeholder>
	) : (
		<Multiselect
			{ ...props }
			items={ products }
		/>
	);
};

const CategoriesMultiselect = ( props ) => {
	const {
		categories,
		isLoading
	} = useSelect( select => {
		if ( ! Boolean( window.otterPro.hasWooCommerce ) ) {
			return {
				categories: [],
				isLoading: false
			};
		}

		const { COLLECTIONS_STORE_KEY } = window?.wc?.wcBlocksData;
		const {
			getCollection,
			getCollectionError,
			isResolving
		} = select( COLLECTIONS_STORE_KEY );

		// eslint-disable-next-line camelcase
		const categoriesError = getCollectionError( '/wc/store', 'products/categories' );

		const categories = categoriesError ? [] : ( getCollection( '/wc/store', 'products/categories' ) ?? [])?.map( result => ({
			value: result.id,
			label: decodeEntities( result.name )
		}) );

		return {
			categories,
			isLoading: isResolving( 'getCollection', [ '/wc/store', 'products/categories' ])
		};
	}, []);

	return isLoading ? (
		<Placeholder><Spinner /></Placeholder>
	) : (
		<Multiselect
			{ ...props }
			items={ categories }
		/>
	);
};

const TagsMultiselect = ( props ) => {
	const {
		tags,
		isLoading
	} = useSelect( select => {
		if ( ! Boolean( window.otterPro.hasWooCommerce ) ) {
			return {
				tags: [],
				isLoading: false
			};
		}

		const { COLLECTIONS_STORE_KEY } = window?.wc?.wcBlocksData;
		const {
			getCollection,
			getCollectionError,
			isResolving
		} = select( COLLECTIONS_STORE_KEY );

		// eslint-disable-next-line camelcase
		const tagsError = getCollectionError( '/wc/store', 'products/tags' );

		const tags = tagsError ? [] : ( getCollection( '/wc/store', 'products/tags' ) ?? [])?.map( result => ({
			value: result.id,
			label: decodeEntities( result.name )
		}) );

		return {
			tags,
			isLoading: isResolving( 'getCollection', [ '/wc/store', 'products/tags' ])
		};
	}, []);

	return isLoading ? (
		<Placeholder><Spinner /></Placeholder>
	) : (
		<Multiselect
			{ ...props }
			items={ tags }
		/>
	);
};

const WooAttributes = ( props ) => {
	const {
		attributes,
		isLoading
	} = useSelect( select => {
		if ( ! Boolean( window.otterPro.hasWooCommerce ) ) {
			return {
				attributes: [],
				isLoading: false
			};
		}

		const { COLLECTIONS_STORE_KEY } = window?.wc?.wcBlocksData;
		const {
			getCollection,
			getCollectionError,
			isResolving
		} = select( COLLECTIONS_STORE_KEY );

		// eslint-disable-next-line camelcase
		const attributesError = getCollectionError( '/wc/store', 'products/attributes' );

		const attributes = attributesError ? [] : ( getCollection( '/wc/store', 'products/attributes' ) ?? [])?.map( result => ({
			value: result.id,
			label: decodeEntities( result.name )
		}) );

		return {
			attributes,
			isLoading: isResolving( 'getCollection', [ '/wc/store', 'products/attributes' ])
		};
	}, []);

	return isLoading ? (
		<Placeholder><Spinner /></Placeholder>
	) : (
		<SelectControl
			{ ...props }
			options={ [
				{
					value: '',
					label: __( 'Select an attribute', 'otter-pro' )
				},
				...attributes
			] }
		/>
	);
};

const CoursesMultiselect = ( props ) => {
	const {
		courses,
		isLoading
	} = useSelect( select => {
		if ( ! Boolean( window.otterPro.hasLearnDash ) ) {
			return {
				courses: [],
				cursesStatus: false
			};
		}

		const courses = select( 'otter-pro' )?.getLearnDashCourses() ?? [];
		return {
			courses,
			isLoading: ! select( 'otter-pro' )?.isLearnDashCoursesLoaded()
		};
	}, []);

	return isLoading ? (
		<Placeholder><Spinner /></Placeholder>
	) : (
		<Multiselect
			{ ...props }
			items={ courses }
		/>
	);
};

const CoursesSelect = ( props ) => {
	const {
		courses,
		isLoading
	} = useSelect( select => {
		if ( ! Boolean( window.otterPro.hasLearnDash ) ) {
			return {
				courses: [],
				cursesStatus: false
			};
		}

		const courses = select( 'otter-pro' )?.getLearnDashCourses() ?? [];
		return {
			courses,
			isLoading: ! select( 'otter-pro' )?.isLearnDashCoursesLoaded()
		};
	}, []);

	return (
		<Fragment>
			{ ! isLoading && (
				<Fragment>
					{ Boolean( courses.length ) ? (
						<SelectControl
							{ ...props }
							options={ courses }
						/>
					) : (
						<p>{ __( 'No courses available.', 'otter-pro' ) }</p>
					) }

					{ props.children }
				</Fragment>
			) }

			{ isLoading && <Placeholder><Spinner /></Placeholder> }
		</Fragment>
	);
};

const GroupsMultiselect = ( props ) => {
	const {
		groups,
		groupsStatus
	} = useSelect( select => {
		if ( ! Boolean( window.otterPro.hasLearnDash ) ) {
			return {
				groups: [],
				groupsStatus: 'loading'
			};
		}

		const groups = select( 'otter-pro' )?.getLearnDashGroups() ?? [];
		return {
			groups,
			groupsStatus: ! select( 'otter-pro' )?.isLearnDashGroupsLoaded()
		};
	}, []);

	return groupsStatus ? (
		<Placeholder><Spinner /></Placeholder>
	) : (
		<Multiselect
			{ ...props }
			items={ groups }
		/>
	);
};

const Edit = ({
	groupIndex,
	itemIndex,
	item,
	conditions,
	setAttributes,
	changeValue
}) => {
	const changeArrayValue = ( value, index, key, type ) => {
		const otterConditions = [ ...conditions ];
		otterConditions[ index ][ key ][ type ] = value;
		setAttributes({ otterConditions });
	};

	const changeDays = ( value, groupIndex, key ) => {
		const otterConditions = [ ...conditions ];

		if ( ! otterConditions[ groupIndex ][ key ].days ) {
			otterConditions[ groupIndex ][ key ].days = [];
		}

		const hasDay = otterConditions[ groupIndex ][ key ].days.indexOf( value );

		if ( -1 !== hasDay ) {
			otterConditions[ groupIndex ][ key ].days.splice( hasDay, 1 );
		} else {
			otterConditions[ groupIndex ][ key ].days.push( value );
		}

		setAttributes({ otterConditions });
	};

	const changeProducts = ( values, index, key ) => {
		const regex = /^([^.]+)/;

		values.forEach( ( value, key ) => {
			const m = regex.exec( value );
			null !== m ? values[ key ] = Number( m[0]) : value;
		});

		const otterConditions = [ ...conditions ];
		otterConditions[ index ][ key ].products = values;
		setAttributes({ otterConditions });
	};

	const changeCategories = ( values, index, key ) => {
		const regex = /^([^.]+)/;

		values.forEach( ( value, key ) => {
			const m = regex.exec( value );
			null !== m ? values[ key ] = Number( m[0]) : value;
		});

		const otterConditions = [ ...conditions ];
		otterConditions[ index ][ key ].categories = values;
		setAttributes({ otterConditions });
	};

	const changeTags = ( values, index, key ) => {
		const regex = /^([^.]+)/;

		values.forEach( ( value, key ) => {
			const m = regex.exec( value );
			null !== m ? values[ key ] = Number( m[0]) : value;
		});

		const otterConditions = [ ...conditions ];
		otterConditions[ index ][ key ].tags = values;
		setAttributes({ otterConditions });
	};

	const changeAttribute = ( values, index, key ) => {
		const otterConditions = [ ...conditions ];

		if ( ! values ) {
			delete otterConditions[ index ][ key ].attribute;
		} else {
			otterConditions[ index ][ key ].attribute = values;
		}

		setAttributes({ otterConditions });
	};

	const changeCourses = ( values, index, key ) => {
		const regex = /^([^.]+)/;

		values.forEach( ( value, key ) => {
			const m = regex.exec( value );
			null !== m ? values[ key ] = Number( m[0]) : value;
		});

		const otterConditions = [ ...conditions ];
		otterConditions[ index ][ key ].courses = values;
		setAttributes({ otterConditions });
	};

	const changeGroups = ( values, index, key ) => {
		const regex = /^([^.]+)/;

		values.forEach( ( value, key ) => {
			const m = regex.exec( value );
			null !== m ? values[ key ] = Number( m[0]) : value;
		});

		const otterConditions = [ ...conditions ];
		otterConditions[ index ][ key ].groups = values;
		setAttributes({ otterConditions });
	};

	return (
		<Fragment>
			{ [ 'postMeta', 'loggedInUserMeta' ].includes( item.type ) && (
				<Fragment>
					<TextControl
						label={ __( 'Meta Key', 'otter-pro' ) }
						help={ __( 'Key of the meta you want to compare.', 'otter-pro' ) }
						placeholder={ __( '_meta_key', 'otter-pro' ) }
						value={ item.meta_key }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'meta_key' ) }
					/>

					<SelectControl
						label={ __( 'Compare Operator', 'otter-pro' ) }
						options={ [
							{
								value: 'is_true',
								label: __( 'Is True', 'otter-pro' )
							},
							{
								value: 'is_false',
								label: __( 'Is False', 'otter-pro' )
							},
							{
								value: 'is_empty',
								label: __( 'Is Empty', 'otter-pro' )
							},
							{
								value: 'if_equals',
								label: __( 'If Equals', 'otter-pro' )
							},
							{
								value: 'if_contains',
								label: __( 'If Contains', 'otter-pro' )
							}
						] }
						value={ item.meta_compare }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'meta_compare' ) }
					/>

					{ ( 'if_equals' === item.meta_compare || 'if_contains' === item.meta_compare ) && (
						<TextControl
							label={ __( 'Meta Value', 'otter-pro' ) }
							help={ __( 'Value of the meta to compare.', 'otter-pro' ) }
							value={ item.meta_value }
							onChange={ e => changeValue( e, groupIndex, itemIndex, 'meta_value' ) }
						/>
					) }
				</Fragment>
			) }

			{ 'queryString' === item.type && (
				<Fragment>
					<TextareaControl
						label={ __( 'Query String', 'otter-pro' ) }
						help={ __( 'Write a key-value pair for each parameter, one per line.', 'otter-pro' ) }
						placeholder="eg. utm_source=facebook"
						value={ item.query_string }
						onChange={ e => changeValue( e.replaceAll( '\itemIndex', '&' ), groupIndex, itemIndex, 'query_string' ) }
					/>

					<SelectControl
						label={ __( 'Match if URL contains', 'otter-pro' ) }
						options={ [
							{
								value: 'any',
								label: __( 'Any of the parameters', 'otter-pro' )
							},
							{
								value: 'all',
								label: __( 'All the parameters', 'otter-pro' )
							}
						] }
						value={ item.compare }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'match' ) }
					/>
				</Fragment>
			) }

			{ 'country' === item.type && (
				<Fragment>
					{ ! Boolean( window.otterPro.hasIPHubAPI ) && (
						<ExternalLink href={ window.themeisleGutenberg.optionsPath }>{ __( 'Setup API to use this feature.', 'otter-pro' ) }</ExternalLink>
					) }

					<TextControl
						label={ __( 'Country Code(s)', 'otter-pro' ) }
						placeholder="US, CA, GB"
						help={ __( 'A comma separated list of country codes', 'otter-pro' ) }
						value={ item.value }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'value' ) }
					/>

					<ExternalLink href="https://www.geoplugin.com/iso3166">{ __( 'A list of country codes.', 'otter-pro' ) }</ExternalLink>
				</Fragment>
			) }

			{ 'cookie' === item.type && (
				<Fragment>
					<TextControl
						label={ __( 'Cookie', 'otter-pro' ) }
						help={ __( 'Key of the cookie you want to compare.', 'otter-pro' ) }
						value={ item.cookie_key }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'cookie_key' ) }
					/>

					<SelectControl
						label={ __( 'Compare Operator', 'otter-pro' ) }
						options={ [
							{
								value: 'is_true',
								label: __( 'Is True', 'otter-pro' )
							},
							{
								value: 'is_false',
								label: __( 'Is False', 'otter-pro' )
							},
							{
								value: 'is_empty',
								label: __( 'Is Empty', 'otter-pro' )
							},
							{
								value: 'if_equals',
								label: __( 'If Equals', 'otter-pro' )
							},
							{
								value: 'if_contains',
								label: __( 'If Contains', 'otter-pro' )
							}
						] }
						value={ item.cookie_compare }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'cookie_compare' ) }
					/>

					{ ( 'if_equals' === item.cookie_compare || 'if_contains' === item.cookie_compare ) && (
						<TextControl
							label={ __( 'Cookie Value', 'otter-pro' ) }
							help={ __( 'Value of the cookie to compare.', 'otter-pro' ) }
							value={ item.cookie_value }
							onChange={ e => changeValue( e, groupIndex, itemIndex, 'cookie_value' ) }
						/>
					) }
				</Fragment>
			) }

			{ 'dateRange' === item.type && (
				<Fragment>
					<DateRange
						label={ __( 'Start Date', 'otter-pro' ) }
						id={ `o-conditions-date-start${ groupIndex }-${ itemIndex }` }
						value={ item.start_date }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'start_date' ) }
					/>

					<DateRange
						label={ __( 'End Date (Optional)', 'otter-pro' ) }
						id={ `o-conditions-date-end${ groupIndex }-${ itemIndex }` }
						value={ item.end_date }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'end_date' ) }
					/>
				</Fragment>
			) }

			{ 'dateRecurring' === item.type && (
				<BaseControl
					label={ __( 'Recurring Days', 'otter-pro' ) }
					help={ __( 'You can use this in combination with other Date Time conditions to make more complex conditions.', 'otter-pro' ) }
				>
					{ week.map( ({ label, value }) => (
						<CheckboxControl
							key={ label }
							label={ label }
							checked={ item.days && item.days.includes( value ) }
							onChange={ () => changeDays( value, groupIndex, itemIndex ) }
						/>
					) ) }
				</BaseControl>
			) }

			{ 'timeRecurring' === item.type && (
				<Fragment>
					<BaseControl
						label={ __( 'Start Time', 'otter-pro' ) }
					>
						<div className="o-conditions">
							<input
								aria-label={ __( 'Hours', 'otter-pro' ) }
								className="components-datetime__time-field-hours-input"
								type="number"
								step="1"
								min="0"
								max="23"
								value={ item.start_time ? item.start_time.split( ':' )[0] : '' }
								onChange={ e => {
									const { value } = e.target;

									if ( 0 > value || 23 < value ) {
										return;
									}

									let time = item.start_time || '00:00';
									time = time.split( ':' );
									time[0] = `00${ value }`.slice( -2 );
									time = time.join( ':' );
									changeValue( time, groupIndex, itemIndex, 'start_time' );
								} }
							/>

							{ ' : ' }

							<input
								aria-label={ __( 'Minutes', 'otter-pro' ) }
								className="components-datetime__time-field-hours-input"
								type="number"
								step="1"
								min="0"
								max="59"
								value={ item.start_time ? item.start_time.split( ':' )[1] : '' }
								onChange={ e => {
									const { value } = e.target;

									if ( 0 > value || 59 < value ) {
										return;
									}

									let time = item.start_time || '00:00';
									time = time.split( ':' );
									time[1] = `00${ value }`.slice( -2 );
									time = time.join( ':' );
									changeValue( time, groupIndex, itemIndex, 'start_time' );
								} }
							/>

							<Button
								isSecondary
								isSmall
								disabled={ ! item.start_time }
								onClick={ () => {
									const otterConditions = [ ...conditions ];
									delete otterConditions[ groupIndex ][ itemIndex ].start_time;
									setAttributes({ otterConditions });
								} }
							>
								{ __( 'Reset', 'otter-pro' ) }
							</Button>
						</div>
					</BaseControl>

					<BaseControl
						label={ __( 'End Time', 'otter-pro' ) }
					>
						<div className="o-conditions">
							<input
								aria-label={ __( 'Hours', 'otter-pro' ) }
								className="components-datetime__time-field-hours-input"
								type="number"
								step="1"
								min="0"
								max="23"
								value={ item.end_time ? item.end_time.split( ':' )[0] : '' }
								onChange={ e => {
									const { value } = e.target;

									if ( 0 > value || 23 < value ) {
										return;
									}

									let time = item.end_time || '00:00';
									time = time.split( ':' );
									time[0] = `00${ value }`.slice( -2 );
									time = time.join( ':' );
									changeValue( time, groupIndex, itemIndex, 'end_time' );
								} }
							/>

							{ ' : ' }

							<input
								aria-label={ __( 'Minutes', 'otter-pro' ) }
								className="components-datetime__time-field-hours-input"
								type="number"
								step="1"
								min="0"
								max="59"
								value={ item.end_time ? item.end_time.split( ':' )[1] : '' }
								onChange={ e => {
									const { value } = e.target;

									if ( 0 > value || 59 < value ) {
										return;
									}

									let time = item.end_time || '00:00';
									time = time.split( ':' );
									time[1] = `00${ value }`.slice( -2 );
									time = time.join( ':' );
									changeValue( time, groupIndex, itemIndex, 'end_time' );
								} }
							/>

							<Button
								isSecondary
								isSmall
								disabled={ ! item.end_time }
								onClick={ () => {
									const otterConditions = [ ...conditions ];
									delete otterConditions[ groupIndex ][ itemIndex ].end_time;
									setAttributes({ otterConditions });
								} }
							>
								{ __( 'Reset', 'otter-pro' ) }
							</Button>
						</div>
					</BaseControl>
				</Fragment>
			) }

			{ 'wooProductsInCart' === item.type && (
				<Fragment>
					<SelectControl
						label={ __( 'Based on', 'otter-pro' ) }
						options={ [
							{
								value: 'products',
								label: __( 'Products', 'otter-pro' )
							},
							{
								value: 'categories',
								label: __( 'Categories', 'otter-pro' )
							}
						] }
						value={ item.on }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'on' ) }
					/>

					{ 'products' === item.on && (
						<Fragment>
							<ProductsMultiselect
								label={ __( 'Products', 'otter-pro' ) }
								values={ item.products }
								onChange={ values => changeProducts( values, groupIndex, itemIndex ) }
							/>
						</Fragment>
					) }

					{ 'categories' === item.on && (
						<Fragment>
							<CategoriesMultiselect
								label={ __( 'Categories', 'otter-pro' ) }
								values={ item.categories }
								onChange={ values => changeCategories( values, groupIndex, itemIndex ) }
							/>
						</Fragment>
					) }
				</Fragment>
			) }

			{ 'wooTotalCartValue' === item.type && (
				<TextControl
					label={ __( 'Total Cart Value', 'otter-pro' ) }
					help={ 
						sprintf( 
							/* translators: %s the currency. */
							__( 'The currency will be based on your WooCommerce settings. Currently it is set to %s.', 'otter-pro' ), 
							window.wcSettings.currency.code 
						) 
					}
					placeholder={ 9.99 }
					value={ item.value }
					onChange={ e => changeValue( e.replace( /[^0-9.]/g, '' ), groupIndex, itemIndex, 'value' ) }
				/>
			) }

			{ 'wooTotalSpent' === item.type && (
				<TextControl
					label={ __( 'Total Money Spent', 'otter-pro' ) }
					help={ 
						sprintf( 
							/* translators: %s the currency. */
							__( 'The currency will be based on your WooCommerce settings. Currently it is set to %s.', 'otter-pro' ), 
							window.wcSettings.currency.code 
						) 
					}
					placeholder={ 9.99 }
					value={ item.value }
					onChange={ e => changeValue( e.replace( /[^0-9.]/g, '' ), groupIndex, itemIndex, 'value' ) }
				/>
			) }

			{ ( 'wooTotalCartValue' === item.type || 'wooTotalSpent' === item.type ) && (
				<SelectControl
					label={ __( 'Compare Operator', 'otter-pro' ) }
					options={ [
						{
							value: 'greater_than',
							label: __( 'Greater Than (>)', 'otter-pro' )
						},
						{
							value: 'less_than',
							label: __( 'Less Than (<)', 'otter-pro' )
						}
					] }
					value={ item.compare }
					onChange={ e => changeValue( e, groupIndex, itemIndex, 'compare' ) }
				/>
			) }

			{ 'wooPurchaseHistory' === item.type && (
				<Fragment>
					<ProductsMultiselect
						label={ __( 'Products', 'otter-pro' ) }
						values={ item.products }
						onChange={ values => changeProducts( values, groupIndex, itemIndex ) }
					/>
				</Fragment>
			) }

			{ 'wooCategory' === item.type && (
				<CategoriesMultiselect
					label={ __( 'Categories', 'otter-pro' ) }
					values={ item.categories }
					onChange={ values => changeCategories( values, groupIndex, itemIndex ) }
				/>
			) }
			{ 'wooTag' === item.type && (
				<TagsMultiselect
					label={ __( 'Tags', 'otter-pro' ) }
					values={ item.tags }
					onChange={ values => changeTags( values, groupIndex, itemIndex ) }
				/>
			)}

			{ 'wooAttribute' === item.type && (
				<Fragment>
					<WooAttributes
						label={ __( 'Attribute', 'otter-pro' ) }
						value={ item.attribute }
						onChange={ values => changeAttribute( values, groupIndex, itemIndex ) }
					/>

					{ !! item.attribute && (
						<FormTokenField
							label={ __( 'Terms', 'otter-pro' ) }
							placeholder={ __( 'List the terms by their slug.', 'otter-pro' ) }
							value={ item.terms }
							onChange={ terms => changeArrayValue( terms, groupIndex, itemIndex, 'terms' ) }
						/>
					) }
				</Fragment>
			)}

			{ 'learnDashPurchaseHistory' === item.type && (
				<Fragment>
					<SelectControl
						label={ __( 'Based on', 'otter-pro' ) }
						options={ [
							{
								value: 'courses',
								label: __( 'Courses', 'otter-pro' )
							},
							{
								value: 'groups',
								label: __( 'Groups', 'otter-pro' )
							}
						] }
						value={ item.on }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'on' ) }
					/>

					{ 'courses' === item.on && (
						<Fragment>
							<CoursesMultiselect
								label={ __( 'Courses', 'otter-pro' ) }
								values={ item.courses }
								onChange={ values => changeCourses( values, groupIndex, itemIndex ) }
							/>
						</Fragment>
					) }

					{ 'groups' === item.on && (
						<Fragment>
							<GroupsMultiselect
								label={ __( 'Groups', 'otter-pro' ) }
								values={ item.groups }
								onChange={ values => changeGroups( values, groupIndex, itemIndex ) }
							/>
						</Fragment>
					) }
				</Fragment>
			) }

			{ 'learnDashCourseStatus' === item.type && (
				<Fragment>
					<CoursesSelect
						label={ __( 'Course', 'otter-pro' ) }
						value={ item.course }
						onChange={ e => changeValue( Number( e ), groupIndex, itemIndex, 'course' ) }
					>
						<SelectControl
							label={ __( 'Status', 'otter-pro' ) }
							options={ [
								{
									value: 'not_started',
									label: __( 'Not Started', 'otter-pro' )
								},
								{
									value: 'in_progress',
									label: __( 'In Progress', 'otter-pro' )
								},
								{
									value: 'completed',
									label: __( 'Completed', 'otter-pro' )
								}
							] }
							value={ item.status }
							onChange={ e => changeValue( e, groupIndex, itemIndex, 'status' ) }
						/>
					</CoursesSelect>
				</Fragment>
			) }
		</Fragment>
	);
};

export default Edit;
