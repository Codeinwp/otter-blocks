/**
 * WordPress dependencies.
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import { isEmpty } from 'lodash';

import apiFetch from '@wordpress/api-fetch';

import {
	BaseControl,
	Button,
	CheckboxControl,
	DateTimePicker,
	Dropdown,
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

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import { decodeEntities } from '@wordpress/html-entities';

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

const Edit = ({
	groupIndex,
	itemIndex,
	item,
	conditions,
	setAttributes,
	changeValue
}) => {
	const [ courses, setCourses ] = useState([]);
	const [ coursesStatus, setCoursesStatus ] = useState( 'loading' );
	const [ courseGroups, setCourseGroups ] = useState([]);
	const [ courseGroupsStatus, setCourseGroupsStatus ] = useState( 'loading' );

	useEffect( () => {
		if ( Boolean( window.otterPro.hasLearnDash ) ) {
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

		if ( Boolean( window.otterPro.hasWooCommerce ) ) {
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
			{ 'postMeta' === item.type && (
				<Fragment>
					<TextControl
						label={ __( 'Meta Key', 'otter-blocks' ) }
						help={ __( 'Key of the meta you want to compare.', 'otter-blocks' ) }
						placeholder={ __( '_meta_key', 'otter-blocks' ) }
						value={ item.meta_key }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'meta_key' ) }
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
						value={ item.meta_compare }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'meta_compare' ) }
					/>

					{ ( 'if_equals' === item.meta_compare || 'if_contains' === item.meta_compare ) && (
						<TextControl
							label={ __( 'Meta Value', 'otter-blocks' ) }
							help={ __( 'Value of the meta to compare.', 'otter-blocks' ) }
							value={ item.meta_value }
							onChange={ e => changeValue( e, groupIndex, itemIndex, 'meta_value' ) }
						/>
					) }
				</Fragment>
			) }

			{ 'queryString' === item.type && (
				<Fragment>
					<TextareaControl
						label={ __( 'Query String', 'otter-blocks' ) }
						help={ __( 'Write a key-value pair for each parameter, one per line.', 'otter-blocks' ) }
						placeholder="eg. utm_source=facebook"
						value={ item.query_string }
						onChange={ e => changeValue( e.replaceAll( '\itemIndex', '&' ), groupIndex, itemIndex, 'query_string' ) }
					/>

					<SelectControl
						label={ __( 'Match if URL contains', 'otter-blocks' ) }
						options={ [
							{
								value: 'any',
								label: __( 'Any of the parameters', 'otter-blocks' )
							},
							{
								value: 'all',
								label: __( 'All the parameters', 'otter-blocks' )
							}
						] }
						value={ item.compare }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'match' ) }
					/>
				</Fragment>
			) }

			{ 'dateRange' === item.type && (
				<Fragment>
					<DateRange
						label={ __( 'Start Date', 'otter-blocks' ) }
						id={ `o-conditions-date-start${ groupIndex }-${ itemIndex }` }
						value={ item.start_date }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'start_date' ) }
					/>

					<DateRange
						label={ __( 'End Date (Optional)', 'otter-blocks' ) }
						id={ `o-conditions-date-end${ groupIndex }-${ itemIndex }` }
						value={ item.end_date }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'end_date' ) }
					/>
				</Fragment>
			) }

			{ 'dateRecurring' === item.type && (
				<BaseControl
					label={ __( 'Recurring Days', 'otter-blocks' ) }
					help={ __( 'You can use this in combination with other Date Time conditions to make more complex conditions.', 'otter-blocks' ) }
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
								value={ item.start_time ? item.start_time.split( ':' )[0] : '' }
								onChange={ e => {
									const value = e.target.value;

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
								aria-label={ __( 'Minutes', 'otter-blocks' ) }
								className="components-datetime__time-field-hours-input"
								type="number"
								step="1"
								min="0"
								max="59"
								value={ item.start_time ? item.start_time.split( ':' )[1] : '' }
								onChange={ e => {
									const value = e.target.value;

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
								value={ item.end_time ? item.end_time.split( ':' )[0] : '' }
								onChange={ e => {
									const value = e.target.value;

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
								aria-label={ __( 'Minutes', 'otter-blocks' ) }
								className="components-datetime__time-field-hours-input"
								type="number"
								step="1"
								min="0"
								max="59"
								value={ item.end_time ? item.end_time.split( ':' )[1] : '' }
								onChange={ e => {
									const value = e.target.value;

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
								{ __( 'Reset', 'otter-blocks' ) }
							</Button>
						</div>
					</BaseControl>
				</Fragment>
			) }

			{ 'wooProductsInCart' === item.type && (
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
						value={ item.on }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'on' ) }
					/>

					{ 'products' === item.on && (
						<Fragment>
							{ 'loaded' === productsStatus && (
								<Multiselect
									label={ __( 'Products', 'otter-blocks' ) }
									items={ products }
									values={ item.products }
									onChange={ values => changeProducts( values, groupIndex, itemIndex ) }
								/>
							) }

							{ 'loading' === productsStatus && <Placeholder><Spinner /></Placeholder> }
						</Fragment>
					) }

					{ 'categories' === item.on && (
						<Fragment>
							{ 'loaded' === categoriesStatus && (
								<Multiselect
									label={ __( 'Categories', 'otter-blocks' ) }
									items={ categories }
									values={ item.categories }
									onChange={ values => changeCategories( values, groupIndex, itemIndex ) }
								/>
							) }

							{ 'loading' === categoriesStatus && <Placeholder><Spinner /></Placeholder> }
						</Fragment>
					) }
				</Fragment>
			) }

			{ 'wooTotalCartValue' === item.type && (
				<TextControl
					label={ __( 'Total Cart Value', 'otter-blocks' ) }
					help={ sprintf( __( 'The currency will be based on your WooCommerce settings. Currently it is set to %s.', 'otter-blocks' ), window.wcSettings.currency.code ) }
					placeholder={ 9.99 }
					value={ item.value }
					onChange={ e => changeValue( e.replace( /[^0-9.]/g, '' ), groupIndex, itemIndex, 'value' ) }
				/>
			) }

			{ 'wooTotalSpent' === item.type && (
				<TextControl
					label={ __( 'Total Money Spent', 'otter-blocks' ) }
					help={ sprintf( __( 'The currency will be based on your WooCommerce settings. Currently it is set to %s.', 'otter-blocks' ), window.wcSettings.currency.code ) }
					placeholder={ 9.99 }
					value={ item.value }
					onChange={ e => changeValue( e.replace( /[^0-9.]/g, '' ), groupIndex, itemIndex, 'value' ) }
				/>
			) }

			{ ( 'wooTotalCartValue' === item.type || 'wooTotalSpent' === item.type ) && (
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
					value={ item.compare }
					onChange={ e => changeValue( e, groupIndex, itemIndex, 'compare' ) }
				/>
			) }

			{ 'wooPurchaseHistory' === item.type && (
				<Fragment>
					{ 'loaded' === productsStatus && (
						<Multiselect
							label={ __( 'Products', 'otter-blocks' ) }
							items={ products }
							values={ item.products }
							onChange={ values => changeProducts( values, groupIndex, itemIndex ) }
						/>
					) }

					{ 'loading' === productsStatus && <Placeholder><Spinner /></Placeholder> }
				</Fragment>
			) }

			{ 'learnDashPurchaseHistory' === item.type && (
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
						value={ item.on }
						onChange={ e => changeValue( e, groupIndex, itemIndex, 'on' ) }
					/>

					{ 'courses' === item.on && (
						<Fragment>
							{ 'loaded' === coursesStatus && (
								<Multiselect
									label={ __( 'Courses', 'otter-blocks' ) }
									items={ courses }
									values={ item.courses }
									onChange={ values => changeCourses( values, groupIndex, itemIndex ) }
								/>
							) }

							{ 'loading' === coursesStatus && <Placeholder><Spinner /></Placeholder> }
						</Fragment>
					) }

					{ 'groups' === item.on && (
						<Fragment>
							{ 'loaded' === courseGroupsStatus && (
								<Multiselect
									label={ __( 'Groups', 'otter-blocks' ) }
									items={ courseGroups }
									values={ item.groups }
									onChange={ values => changeGroups( values, groupIndex, itemIndex ) }
								/>
							) }

							{ 'loading' === courseGroupsStatus && <Placeholder><Spinner /></Placeholder> }
						</Fragment>
					) }
				</Fragment>
			) }

			{ 'learnDashCourseStatus' === item.type && (
				<Fragment>
					{ 'loaded' === coursesStatus && (
						<Fragment>
							{ Boolean( courses.length ) ? (
								<SelectControl
									label={ __( 'Course', 'otter-blocks' ) }
									options={ courses }
									value={ item.course }
									onChange={ e => changeValue( Number( e ), groupIndex, itemIndex, 'course' ) }
								/>
							) : (
								<p>{ __( 'No courses available.', 'otter-blocks' ) }</p>
							) }

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
								value={ item.status }
								onChange={ e => changeValue( e, groupIndex, itemIndex, 'status' ) }
							/>
						</Fragment>
					) }

					{ 'loading' === coursesStatus && <Placeholder><Spinner /></Placeholder> }
				</Fragment>
			) }
		</Fragment>
	);
};

export default Edit;
