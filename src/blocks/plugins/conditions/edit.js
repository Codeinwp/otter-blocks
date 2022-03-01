/**
 * WordPress dependencies.
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import { isEmpty } from 'lodash';

import apiFetch from '@wordpress/api-fetch';

import { InspectorControls } from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	CheckboxControl,
	DateTimePicker,
	Dropdown,
	ExternalLink,
	FormTokenField,
	PanelBody,
	Placeholder,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl
} from '@wordpress/components';

import {
	format,
	__experimentalGetSettings
} from '@wordpress/date';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies.
 */
import PanelTab from '../../components/panel-tab/index.js';

const isBoosterActive = Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive );
const isNeve = Boolean( window.themeisleGutenberg.hasNeveSupport.hasNeve );
const isNevePro = Boolean( window.themeisleGutenberg.hasNeveSupport.hasNevePro );
const postTypes = Object.keys( window.themeisleGutenberg.postTypes );

const Edit = ({
	attributes,
	setAttributes
}) => {
	useEffect( () => {
		return () => {
			if ( ! Boolean( attributes?.otterConditions?.length ) ) {
				return;
			}

			let otterConditions = [ ...attributes.otterConditions ];

			otterConditions.forEach( ( i, n ) => {
				if ( isEmpty( i ) ) {
					otterConditions.splice( n, 1 );
				}
			});

			if ( ! Boolean( otterConditions.length ) ) {
				otterConditions = undefined;
			}

			setAttributes({ otterConditions });
		};
	}, []);

	const [ courses, setCourses ] = useState([]);
	const [ coursesStatus, setCoursesStatus ] = useState( 'loading' );
	const [ courseGroups, setCourseGroups ] = useState([]);
	const [ courseGroupsStatus, setCourseGroupsStatus ] = useState( 'loading' );

	useEffect( () => {
		if ( Boolean( window.themeisleGutenberg.hasLearnDash ) && isBoosterActive ) {
			( async() => {
				setCoursesStatus( 'loading' );
				setCourseGroupsStatus( 'loading' );

				try {
					const data = await apiFetch({ path: 'ldlms/v2/sfwd-courses' });
					const items = data.map( datum => ({
						value: datum.id,
						label: datum.title.rendered
					}) );
					setCourses( items );
					setCoursesStatus( 'loaded' );
				} catch ( error ) {
					setCoursesStatus( 'error' );
				}

				try {
					const data = await apiFetch({ path: 'ldlms/v2/groups' });
					const items = data.map( datum => ({
						value: datum.id,
						label: datum.title.rendered
					}) );
					setCourseGroups( items );
					setCourseGroupsStatus( 'loaded' );
				} catch ( error ) {
					setCourseGroupsStatus( 'error' );
				}
			})();
		}
	}, []);

	const { postAuthors } = useSelect( select => {
		const { getUsers } = select( 'core' );
		const authors = getUsers({ who: 'authors' });

		let postAuthors = [];

		if ( authors && Boolean( authors.length ) ) {
			postAuthors = authors.map( author => author.username );
		}

		return {
			postAuthors
		};
	});

	let { postCategories } = useSelect( select => {
		const { getEntityRecords } = select( 'core' );
		// eslint-disable-next-line camelcase
		const categories = getEntityRecords( 'taxonomy', 'category', { per_page: 100 });

		let postCategories = [];

		if ( categories && Boolean( categories.length ) ) {
			postCategories = categories.map( category => category.slug );
		}

		return {
			postCategories
		};
	});

	const {
		products,
		categories,
		productsStatus,
		categoriesStatus
	} = useSelect( select => {
		let products = [];
		let categories = [];
		let productsStatus = 'loading';
		let categoriesStatus = 'loading';

		if ( Boolean( window.themeisleGutenberg.hasWooCommerce ) && isBoosterActive ) {
			const { COLLECTIONS_STORE_KEY } = window.wc.wcBlocksData;

			// eslint-disable-next-line camelcase
			const productsError = select( COLLECTIONS_STORE_KEY ).getCollectionError( '/wc/store', 'products', { per_page: 100 });

			if ( productsError ) {
				productsStatus = 'error';
			} else {
				// eslint-disable-next-line camelcase
				products = select( COLLECTIONS_STORE_KEY ).getCollection( '/wc/store', 'products', { per_page: 100 });

				if ( ! isEmpty( products ) ) {
					productsStatus = 'loaded';

					products = products.map( result => ({
						value: result.id,
						label: decodeEntities( result.name )
					}) );
				}
			}

			const categoriesError = select( COLLECTIONS_STORE_KEY ).getCollectionError( '/wc/store', 'products/categories' );

			if ( categoriesError ) {
				categoriesStatus = 'error';
			} else {
				categories = select( COLLECTIONS_STORE_KEY ).getCollection( '/wc/store', 'products/categories' );

				if ( ! isEmpty( categories ) ) {
					categoriesStatus = 'loaded';

					categories = categories.map( result => ({
						value: result.id,
						label: decodeEntities( result.name )
					}) );
				}
			}
		}

		return {
			products,
			categories,
			productsStatus,
			categoriesStatus
		};
	}, []);

	const addGroup = () => {
		const otterConditions = [ ...( attributes.otterConditions || []) ];
		otterConditions.push([ {} ]);
		setAttributes({ otterConditions });
	};

	const removeGroup = n => {
		const otterConditions = [ ...attributes.otterConditions ];
		otterConditions.splice( n, 1 );
		setAttributes({ otterConditions });
	};

	const addNewCondition = index => {
		const otterConditions = [ ...attributes.otterConditions ];
		otterConditions[ index ].push({});
		setAttributes({ otterConditions });
	};

	const removeCondition = ( index, key ) => {
		const otterConditions = [ ...attributes.otterConditions ];
		otterConditions[ index ].splice( key, 1 );

		if ( 0 === otterConditions[ index ]) {
			otterConditions.splice( index, 1 );
		}

		setAttributes({ otterConditions });
	};

	const changeCondition = ( value, index, key ) => {
		const otterConditions = [ ...attributes.otterConditions ];

		const attrs = {};

		if ( 'userRoles' === value || 'postAuthor' === value || 'postMeta' === value ) {
			attrs.visibility = true;
		}

		if ( 'postMeta' === value ) {
			// eslint-disable-next-line camelcase
			attrs.meta_compare = 'is_true';
		}

		if ( 'wooProductsInCart' == value ) {
			attrs.on = 'products';
		}

		if ( 'wooTotalCartValue' === value ) {
			// eslint-disable-next-line camelcase
			attrs.compare = 'greater_than';
		}

		if ( 'learnDashPurchaseHistory' == value ) {
			attrs.on = 'courses';
		}

		if ( 'learnDashCourseStatus' == value ) {
			attrs.status = 'not_started';
		}

		if ( 'none' === value ) {
			otterConditions[ index ][ key ] = {};
		} else {
			otterConditions[ index ][ key ] = {
				type: value,
				...attrs
			};
		}

		setAttributes({ otterConditions });
	};

	const changeArrayValue = ( value, index, key, type ) => {
		const otterConditions = [ ...attributes.otterConditions ];
		otterConditions[ index ][ key ][ type ] = value;
		setAttributes({ otterConditions });
	};

	const changeProducts = ( values, index, key ) => {
		const regex = /^([^.]+)/;

		values.forEach( ( value, key ) => {
			const m = regex.exec( value );
			null !== m ? values[ key ] = Number( m[0]) : value;
		});

		const otterConditions = [ ...attributes.otterConditions ];
		otterConditions[ index ][ key ].products = values;
		setAttributes({ otterConditions });
	};

	const changeCategories = ( values, index, key ) => {
		const regex = /^([^.]+)/;

		values.forEach( ( value, key ) => {
			const m = regex.exec( value );
			null !== m ? values[ key ] = Number( m[0]) : value;
		});

		const otterConditions = [ ...attributes.otterConditions ];
		otterConditions[ index ][ key ].categories = values;
		setAttributes({ otterConditions });
	};

	const changeCourses = ( values, index, key ) => {
		const regex = /^([^.]+)/;

		values.forEach( ( value, key ) => {
			const m = regex.exec( value );
			null !== m ? values[ key ] = Number( m[0]) : value;
		});

		const otterConditions = [ ...attributes.otterConditions ];
		otterConditions[ index ][ key ].courses = values;
		setAttributes({ otterConditions });
	};

	const changeGroups = ( values, index, key ) => {
		const regex = /^([^.]+)/;

		values.forEach( ( value, key ) => {
			const m = regex.exec( value );
			null !== m ? values[ key ] = Number( m[0]) : value;
		});

		const otterConditions = [ ...attributes.otterConditions ];
		otterConditions[ index ][ key ].groups = values;
		setAttributes({ otterConditions });
	};


	const changeVisibility = ( value, index, key ) => {
		const otterConditions = [ ...attributes.otterConditions ];
		otterConditions[ index ][ key ].visibility = 'true' === value ? true : false;
		setAttributes({ otterConditions });
	};

	const changeValue = ( value, index, key, field ) => {
		const otterConditions = [ ...attributes.otterConditions ];
		if ( null !== value ) {
			otterConditions[ index ][ key ][ field ] = value;
		} else {
			delete otterConditions[ index ][ key ][ field ];
		}
		setAttributes({ otterConditions });
	};

	const changeDays = ( value, index, key ) => {
		const otterConditions = [ ...attributes.otterConditions ];

		if ( ! otterConditions[ index ][ key ].days ) {
			otterConditions[ index ][ key ].days = [];
		}

		const hasDay = otterConditions[ index ][ key ].days.indexOf( value );

		if ( -1 !== hasDay ) {
			otterConditions[ index ][ key ].days.splice( hasDay, 1 );
		} else {
			otterConditions[ index ][ key ].days.push( value );
		}

		setAttributes({ otterConditions });
	};

	const getConditions = () => {
		const conditions = [
			{
				value: 'none',
				label: __( 'Select a condition', 'otter-blocks' ),
				help: __( 'Select a condition to control the visibility of your block.', 'otter-blocks' )
			},
			{
				value: 'loggedInUser',
				label: __( 'Logged In Users', 'otter-blocks' ),
				help: __( 'The selected block will only be visible to logged-in users.' )
			},
			{
				value: 'loggedOutUser',
				label: __( 'Logged Out Users', 'otter-blocks' ),
				help: __( 'The selected block will only be visible to logged-out users.' )
			},
			{
				value: 'userRoles',
				label: __( 'User Roles', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user roles.' )
			},
			{
				value: 'postAuthor',
				label: __( 'Post Author', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on post author.' )
			},
			{
				value: 'postType',
				label: __( 'Post Type', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on post type.' )
			},
			{
				value: 'postCategory',
				label: __( 'Post Category', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on post category.' )
			},
			{
				value: 'postMeta',
				label: __( 'Post Meta', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on post meta condition.' )
			},
			{
				value: 'dateRange',
				label: __( 'Date Range', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the date range. Timezone is used based on your WordPress settings.' )
			},
			{
				value: 'dateRecurring',
				label: __( 'Date Recurring', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the selected days. Timezone is used based on your WordPress settings.' )
			},
			{
				value: 'timeRecurring',
				label: __( 'Time Recurring', 'otter-blocks' ),
				help: __( 'The selected block will be visible during the selected time. Timezone is used based on your WordPress settings.' )
			},
			{
				value: 'wooProductsInCart',
				label: __( 'Products in Cart', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the products added to WooCommerce cart.' )
			},
			{
				value: 'wooTotalCartValue',
				label: __( 'Total Cart Value', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the total value of WooCommerce cart.' )
			},
			{
				value: 'wooPurchaseHistory',
				label: __( 'Purchase History', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s WooCommerce purchase history.' )
			},
			{
				value: 'learnDashPurchaseHistory',
				label: __( 'Purchase History', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s LearnDash purchase history.' )
			},
			{
				value: 'learnDashCourseStatus',
				label: __( 'Course Status', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s LearnDash course status.' )
			},
			{
				value: 'queryString',
				label: __( 'Query String', 'otter-blocks' ),
				help: __( 'The condition will be met if the URL contains any of the specified parameters.' )
			}
		];

		return conditions;
	};

	const customVisibility = [ 'userRoles', 'postAuthor', 'postMeta', 'postType', 'postCategory', 'wooProductsInCart', 'wooPurchaseHistory', 'learnDashPurchaseHistory', 'learnDashCourseStatus', 'queryString' ];

	const week = [
		{
			value: 'monday',
			label: __( 'Monday', 'otter-blocks' )
		},
		{
			value: 'tuesday',
			label: __( 'Tuesday', 'otter-blocks' )
		},
		{
			value: 'wednesday',
			label: __( 'Wednesday', 'otter-blocks' )
		},
		{
			value: 'thursday',
			label: __( 'Thursday', 'otter-blocks' )
		},
		{
			value: 'friday',
			label: __( 'Friday', 'otter-blocks' )
		},
		{
			value: 'saturday',
			label: __( 'Saturday', 'otter-blocks' )
		},
		{
			value: 'sunday',
			label: __( 'Sunday', 'otter-blocks' )
		}
	];

	const Separator = ({ label }) => {
		return (
			<div className="o-conditions__operator-wrapper">
				<div className="o-conditions__operator-line"></div>
				<div className="o-conditions__operator-word">
					<span>{ label }</span>
				</div>
			</div>
		);
	};

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
								{ value ? format( settings.formats.datetime, value ) : __( 'Select Date', 'otter-blocks' ) }
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
					return `${ obj.value }. ${ obj.label }`;
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

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Visibility Conditions', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<p>{ __( 'Control the visibility of your blocks based on the following conditions.', 'otter-blocks' ) }</p>

				{ ( isNeve && ! isBoosterActive ) && (
					<Fragment>
						<p>{ __( 'Unlock the full power of Block Conditions with Neve Pro\'s Block Editor Booster. ', 'otter-blocks' ) }</p>

						<p>
							{ ! isNevePro && (
								<ExternalLink href="https://themeisle.com/themes/neve/pricing">
									{ __( 'Get Neve Pro.', 'otter-blocks' ) }
								</ExternalLink>
							) }

							{ isNevePro && (
								<ExternalLink href={ window.themeisleGutenberg.hasNeveSupport.optionsPage }>
									{ __( 'Enable Block Editor Booster.', 'otter-blocks' ) }
								</ExternalLink>
							) }
						</p>
					</Fragment>
				) }

				<p>{ __( 'Display the block if…', 'otter-blocks' ) }</p>

				{ attributes.otterConditions && attributes.otterConditions.map( ( group, index ) => {
					return (
						<Fragment key={ index }>
							<PanelTab
								label={ __( 'Rule Group', 'otter-blocks' ) }
								onDelete={ () => removeGroup( index ) }
							>
								{ group && group.map( ( i, n ) => (
									<Fragment key={ `${ index }-${ i }` }>
										<BaseControl
											label={ __( 'Condition', 'otter-blocks' ) }
											help={ getConditions().find( condition => condition.value === ( i.type || 'none' ) ).help }
											id={ `o-conditions-${ index }-${ n }` }
										>
											<select
												value={ i.type || '' }
												onChange={ e => changeCondition( e.target.value, index, n ) }
												className="components-select-control__input"
												id={ `o-conditions-${ index }-${ n }` }
											>
												<option value="none">{ __( 'Select a condition', 'otter-blocks' ) }</option>

												<optgroup label={ __( 'Users', 'otter-blocks' ) }>
													<option value="loggedInUser">{ __( 'Logged In Users', 'otter-blocks' ) }</option>
													<option value="loggedOutUser">{ __( 'Logged Out Users', 'otter-blocks' ) }</option>
													<option value="userRoles">{ __( 'User Roles', 'otter-blocks' ) }</option>
												</optgroup>

												<optgroup label={ __( 'Posts', 'otter-blocks' ) }>
													<option value="postAuthor">{ __( 'Post Author', 'otter-blocks' ) }</option>
													<option value="postType">{ __( 'Post Type', 'otter-blocks' ) }</option>
													<option value="postCategory">{ __( 'Post Category', 'otter-blocks' ) }</option>
													{ ( isBoosterActive || isNeve ) && (
														<option value="postMeta" disabled={ ! isBoosterActive }>{ __( 'Post Meta', 'otter-blocks' ) }</option>
													) }
												</optgroup>

												{ ( isBoosterActive || isNeve ) && (
													<optgroup label={ __( 'URL', 'otter-blocks' ) }>
														<option value="queryString" disabled={ ! isBoosterActive }>{ __( 'Query String', 'otter-blocks' ) }</option>
													</optgroup>
												) }

												{ ( isBoosterActive || isNeve ) && (
													<optgroup label={ __( 'Date & Time', 'otter-blocks' ) }>
														<option value="dateRange" disabled={ ! isBoosterActive }>{ __( 'Date Range', 'otter-blocks' ) }</option>
														<option value="dateRecurring" disabled={ ! isBoosterActive }>{ __( 'Date Recurring', 'otter-blocks' ) }</option>
														<option value="timeRecurring" disabled={ ! isBoosterActive }>{ __( 'Time Recurring', 'otter-blocks' ) }</option>
													</optgroup>
												) }

												{ ( Boolean( window.themeisleGutenberg.hasWooCommerce ) && ( isBoosterActive || isNeve ) ) && (
													<optgroup label={ __( 'WooCommerce', 'otter-blocks' ) }>
														<option value="wooProductsInCart" disabled={ ! isBoosterActive }>{ __( 'Products in Cart', 'otter-blocks' ) }</option>
														<option value="wooTotalCartValue" disabled={ ! isBoosterActive }>{ __( 'Total Cart Value', 'otter-blocks' ) }</option>
														<option value="wooPurchaseHistory" disabled={ ! isBoosterActive }>{ __( 'Purchase History', 'otter-blocks' ) }</option>
													</optgroup>
												) }

												{ ( Boolean( window.themeisleGutenberg.hasLearnDash ) && ( isBoosterActive || isNeve ) ) && (
													<optgroup label={ __( 'LearnDash', 'otter-blocks' ) }>
														<option value="learnDashPurchaseHistory" disabled={ ! isBoosterActive }>{ __( 'Purchase History', 'otter-blocks' ) }</option>
														<option value="learnDashCourseStatus" disabled={ ! isBoosterActive }>{ __( 'Course Status', 'otter-blocks' ) }</option>
													</optgroup>
												) }
											</select>
										</BaseControl>

										{ 'queryString' === i.type && (
											<Fragment>
												<TextareaControl
													label={ __( 'Query String', 'otter-blocks' ) }
													help={ __( 'Write a key-value pair for each parameter, one per line.', 'otter-blocks' ) }
													placeholder='eg. utm_source=facebook'
													value={ i.query_string.replace( '&', '\n' )}
													onChange={ e => changeValue( e.replace( '\n', '&' ), index, n, 'query_string' ) }
												/>
											</Fragment>
										) }

										{ 'userRoles' === i.type && (
											<FormTokenField
												label={ __( 'User Roles', 'otter-blocks' ) }
												value={ i.roles }
												suggestions={ Object.keys( window.themeisleGutenberg.userRoles ) }
												onChange={ roles => changeArrayValue( roles, index, n, 'roles' ) }
												__experimentalExpandOnFocus={ true }
												__experimentalValidateInput={ newValue => Object.keys( window.themeisleGutenberg.userRoles ).includes( newValue ) }
											/>
										) }

										{ 'postAuthor' === i.type && (
											<FormTokenField
												label={ __( 'Post Authors', 'otter-blocks' ) }
												value={ i.authors }
												suggestions={ postAuthors }
												onChange={ authors => changeArrayValue( authors, index, n, 'authors' ) }
												__experimentalExpandOnFocus={ true }
												__experimentalValidateInput={ newValue => postAuthors.includes( newValue ) }
											/>
										) }

										{ 'postType' === i.type && (
											<FormTokenField
												label={ __( 'Post Types', 'otter-blocks' ) }
												value={ i.post_types }
												suggestions={ postTypes }
												onChange={ types => changeArrayValue( types, index, n, 'post_types' ) }
												__experimentalExpandOnFocus={ true }
												__experimentalValidateInput={ newValue => postTypes.includes( newValue ) }
											/>
										) }

										{ 'postCategory' === i.type && (
											<FormTokenField
												label={ __( 'Post Category', 'otter-blocks' ) }
												value={ i.categories }
												suggestions={ postCategories }
												onChange={ categories => changeArrayValue( categories, index, n, 'categories' ) }
												__experimentalExpandOnFocus={ true }
												__experimentalValidateInput={ newValue => postCategories.includes( newValue ) }
											/>
										) }

										{ 'postMeta' === i.type && (
											<Fragment>
												<TextControl
													label={ __( 'Meta Key', 'otter-blocks' ) }
													help={ __( 'Key of the meta you want to compare.', 'otter-blocks' ) }
													placeholder={ __( '_meta_key', 'otter-blocks' ) }
													value={ i.meta_key }
													onChange={ e => changeValue( e, index, n, 'meta_key' ) }
												/>

												<SelectControl
													label={ __( 'Compare Operator', 'otter-blocks' ) }
													options={ [
														{
															value: 'is_true',
															label: __( 'Is True', 'otter-blocks' )
														},
														{
															value: 'is_false',
															label: __( 'Is False', 'otter-blocks' )
														},
														{
															value: 'is_empty',
															label: __( 'Is Empty', 'otter-blocks' )
														},
														{
															value: 'if_equals',
															label: __( 'If Equals', 'otter-blocks' )
														},
														{
															value: 'if_contains',
															label: __( 'If Contains', 'otter-blocks' )
														}
													] }
													value={ i.meta_compare }
													onChange={ e => changeValue( e, index, n, 'meta_compare' ) }
												/>

												{ ( 'if_equals' === i.meta_compare || 'if_contains' === i.meta_compare ) && (
													<TextControl
														label={ __( 'Meta Value', 'otter-blocks' ) }
														help={ __( 'Value of the meta to compare.', 'otter-blocks' ) }
														value={ i.meta_value }
														onChange={ e => changeValue( e, index, n, 'meta_value' ) }
													/>
												) }
											</Fragment>
										) }

										{ 'dateRange' === i.type && (
											<Fragment>
												<DateRange
													label={ __( 'Start Date', 'otter-blocks' ) }
													id={ `o-conditions-date-start${ index }-${ n }` }
													value={ i.start_date }
													onChange={ e => changeValue( e, index, n, 'start_date' ) }
												/>

												<DateRange
													label={ __( 'End Date (Optional)', 'otter-blocks' ) }
													id={ `o-conditions-date-end${ index }-${ n }` }
													value={ i.end_date }
													onChange={ e => changeValue( e, index, n, 'end_date' ) }
												/>
											</Fragment>
										) }

										{ 'dateRecurring' === i.type && (
											<BaseControl
												label={ __( 'Recurring Days', 'otter-blocks' ) }
												help={ __( 'You can use this in combination with other Date Time conditions to make more complex conditions.', 'otter-blocks' ) }
											>
												{ week.map( ({ label, value }) => (
													<CheckboxControl
														key={ label }
														label={ label }
														checked={ i.days && i.days.includes( value ) }
														onChange={ () => changeDays( value, index, n ) }
													/>
												) ) }
											</BaseControl>
										) }

										{ 'timeRecurring' === i.type && (
											<Fragment>
												<BaseControl
													label={ __( 'Start Time', 'otter-blocks' ) }
												>
													<div className="o-conditions">
														<input
															aria-label={ __( 'Hours', 'otter-blocks' ) }
															className="components-datetime__time-field-hours-input"
															type="number"
															step="1"
															min="0"
															max="23"
															value={ i.start_time ? i.start_time.split( ':' )[0] : '' }
															onChange={ e => {
																const value = e.target.value;

																if ( 0 > value || 23 < value ) {
																	return;
																}

																let time = i.start_time || '00:00';
																time = time.split( ':' );
																time[0] = `00${ value }`.slice( -2 );
																time = time.join( ':' );
																changeValue( time, index, n, 'start_time' );
															} }
														/>

														{ ' : ' }

														<input
															aria-label={ __( 'Minutes', 'otter-blocks' ) }
															className="components-datetime__time-field-hours-input"
															type="number"
															step="1"
															min="0"
															max="59"
															value={ i.start_time ? i.start_time.split( ':' )[1] : '' }
															onChange={ e => {
																const value = e.target.value;

																if ( 0 > value || 59 < value ) {
																	return;
																}

																let time = i.start_time || '00:00';
																time = time.split( ':' );
																time[1] = `00${ value }`.slice( -2 );
																time = time.join( ':' );
																changeValue( time, index, n, 'start_time' );
															} }
														/>

														<Button
															isSecondary
															isSmall
															disabled={ ! i.start_time }
															onClick={ () => {
																const otterConditions = [ ...attributes.otterConditions ];
																delete otterConditions[ index ][ n ].start_time;
																setAttributes({ otterConditions });
															} }
														>
															{ __( 'Reset', 'otter-blocks' ) }
														</Button>
													</div>
												</BaseControl>

												<BaseControl
													label={ __( 'End Time', 'otter-blocks' ) }
												>
													<div className="o-conditions">
														<input
															aria-label={ __( 'Hours', 'otter-blocks' ) }
															className="components-datetime__time-field-hours-input"
															type="number"
															step="1"
															min="0"
															max="23"
															value={ i.end_time ? i.end_time.split( ':' )[0] : '' }
															onChange={ e => {
																const value = e.target.value;

																if ( 0 > value || 23 < value ) {
																	return;
																}

																let time = i.end_time || '00:00';
																time = time.split( ':' );
																time[0] = `00${ value }`.slice( -2 );
																time = time.join( ':' );
																changeValue( time, index, n, 'end_time' );
															} }
														/>

														{ ' : ' }

														<input
															aria-label={ __( 'Minutes', 'otter-blocks' ) }
															className="components-datetime__time-field-hours-input"
															type="number"
															step="1"
															min="0"
															max="59"
															value={ i.end_time ? i.end_time.split( ':' )[1] : '' }
															onChange={ e => {
																const value = e.target.value;

																if ( 0 > value || 59 < value ) {
																	return;
																}

																let time = i.end_time || '00:00';
																time = time.split( ':' );
																time[1] = `00${ value }`.slice( -2 );
																time = time.join( ':' );
																changeValue( time, index, n, 'end_time' );
															} }
														/>

														<Button
															isSecondary
															isSmall
															disabled={ ! i.end_time }
															onClick={ () => {
																const otterConditions = [ ...attributes.otterConditions ];
																delete otterConditions[ index ][ n ].end_time;
																setAttributes({ otterConditions });
															} }
														>
															{ __( 'Reset', 'otter-blocks' ) }
														</Button>
													</div>
												</BaseControl>
											</Fragment>
										) }

										{ 'wooProductsInCart' === i.type && (
											<Fragment>
												<SelectControl
													label={ __( 'Based on', 'otter-blocks' ) }
													options={ [
														{
															value: 'products',
															label: __( 'Products', 'otter-blocks' )
														},
														{
															value: 'categories',
															label: __( 'Categories', 'otter-blocks' )
														}
													] }
													value={ i.on }
													onChange={ e => changeValue( e, index, n, 'on' ) }
												/>

												{ 'products' === i.on && (
													<Fragment>
														{ 'loaded' === productsStatus && (
															<Multiselect
																label={ __( 'Products', 'otter-blocks' ) }
																items={ products }
																values={ i.products }
																onChange={ values => changeProducts( values, index, n ) }
															/>
														) }

														{ 'loading' === productsStatus && <Placeholder><Spinner /></Placeholder> }
													</Fragment>
												) }

												{ 'categories' === i.on && (
													<Fragment>
														{ 'loaded' === categoriesStatus && (
															<Multiselect
																label={ __( 'Categories', 'otter-blocks' ) }
																items={ categories }
																values={ i.categories }
																onChange={ values => changeCategories( values, index, n ) }
															/>
														) }

														{ 'loading' === categoriesStatus && <Placeholder><Spinner /></Placeholder> }
													</Fragment>
												) }
											</Fragment>
										) }

										{ 'wooTotalCartValue' === i.type && (
											<Fragment>
												<TextControl
													label={ __( 'Total Cart Value', 'otter-blocks' ) }
													help={ sprintf( __( 'The currency will be based on your WooCommerce settings. Currently it is set to %s.', 'otter-blocks' ), window.wcSettings.currency.code ) }
													placeholder={ 9.99 }
													value={ i.value }
													onChange={ e => changeValue( e.replace( /[^0-9.]/g, '' ), index, n, 'value' ) }
												/>

												<SelectControl
													label={ __( 'Compare Operator', 'otter-blocks' ) }
													options={ [
														{
															value: 'greater_than',
															label: __( 'Greater Than (>)', 'otter-blocks' )
														},
														{
															value: 'less_than',
															label: __( 'Less Than (<)', 'otter-blocks' )
														}
													] }
													value={ i.compare }
													onChange={ e => changeValue( e, index, n, 'compare' ) }
												/>
											</Fragment>
										) }

										{ 'wooPurchaseHistory' === i.type && (
											<Fragment>
												{ 'loaded' === productsStatus && (
													<Multiselect
														label={ __( 'Products', 'otter-blocks' ) }
														items={ products }
														values={ i.products }
														onChange={ values => changeProducts( values, index, n ) }
													/>
												) }

												{ 'loading' === productsStatus && <Placeholder><Spinner /></Placeholder> }
											</Fragment>
										) }

										{ 'learnDashPurchaseHistory' === i.type && (
											<Fragment>
												<SelectControl
													label={ __( 'Based on', 'otter-blocks' ) }
													options={ [
														{
															value: 'courses',
															label: __( 'Courses', 'otter-blocks' )
														},
														{
															value: 'groups',
															label: __( 'Groups', 'otter-blocks' )
														}
													] }
													value={ i.on }
													onChange={ e => changeValue( e, index, n, 'on' ) }
												/>

												{ 'courses' === i.on && (
													<Fragment>
														{ 'loaded' === coursesStatus && (
															<Multiselect
																label={ __( 'Courses', 'otter-blocks' ) }
																items={ courses }
																values={ i.courses }
																onChange={ values => changeCourses( values, index, n ) }
															/>
														) }

														{ 'loading' === coursesStatus && <Placeholder><Spinner /></Placeholder> }
													</Fragment>
												) }

												{ 'groups' === i.on && (
													<Fragment>
														{ 'loaded' === courseGroupsStatus && (
															<Multiselect
																label={ __( 'Groups', 'otter-blocks' ) }
																items={ courseGroups }
																values={ i.groups }
																onChange={ values => changeGroups( values, index, n ) }
															/>
														) }

														{ 'loading' === courseGroupsStatus && <Placeholder><Spinner /></Placeholder> }
													</Fragment>
												) }
											</Fragment>
										) }

										{ 'learnDashCourseStatus' === i.type && (
											<Fragment>
												{ 'loaded' === coursesStatus && (
													<Fragment>
														<SelectControl
															label={ __( 'Course', 'otter-blocks' ) }
															options={ courses }
															value={ i.course }
															onChange={ e => changeValue( Number( e ), index, n, 'course' ) }
														/>

														<SelectControl
															label={ __( 'Status', 'otter-blocks' ) }
															options={ [
																{
																	value: 'not_started',
																	label: __( 'Not Started', 'otter-blocks' )
																},
																{
																	value: 'in_progress',
																	label: __( 'In Progress', 'otter-blocks' )
																},
																{
																	value: 'completed',
																	label: __( 'Completed', 'otter-blocks' )
																}
															] }
															value={ i.status }
															onChange={ e => changeValue( e, index, n, 'status' ) }
														/>
													</Fragment>
												) }

												{ 'loading' === coursesStatus && <Placeholder><Spinner /></Placeholder> }
											</Fragment>
										) }

										{ customVisibility.includes( i.type ) && (
											<SelectControl
												label={ __( 'If condition is true, the block should be:', 'otter-blocks' ) }
												options={ [
													{
														value: true,
														label: __( 'Visible', 'otter-blocks' )
													},
													{
														value: false,
														label: __( 'Hidden', 'otter-blocks' )
													}
												] }
												value={ i.visibility }
												onChange={ e => changeVisibility( e, index, n ) }
											/>
										) }

										<Button
											isDestructive
											className="o-conditions__add"
											onClick={ () => removeCondition( index, n ) }
										>
											{ __( 'Delete Condition', 'otter-blocks' ) }
										</Button>

										{ ( 1 < group.length && n !== group.length - 1 ) && (
											<Separator label={ __( 'AND', 'otter-blocks' ) } />
										) }
									</Fragment>
								) ) }

								<Button
									isSecondary
									className="o-conditions__add"
									onClick={ () => addNewCondition( index ) }
								>
									{ __( 'Add a New Condition', 'otter-blocks' ) }
								</Button>
							</PanelTab>

							{ ( 1 < attributes.otterConditions.length && index !== attributes.otterConditions.length - 1 ) && (
								<Separator label={ __( 'OR', 'otter-blocks' ) } />
							) }
						</Fragment>
					);
				}) }

				<Button
					isSecondary
					className="o-conditions__add"
					onClick={ addGroup }
				>
					{ __( 'Add Rule Group', 'otter-blocks' ) }
				</Button>
			</PanelBody>
		</InspectorControls>
	);
};

export default Edit;
