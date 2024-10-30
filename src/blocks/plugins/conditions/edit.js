/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { isEmpty } from 'lodash';

import {
	BaseControl,
	Button,
	ExternalLink,
	FormTokenField,
	PanelBody,
	SelectControl,
	Spinner,
	Placeholder, ToggleControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	memo,
	useEffect,
	useState
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import StripeControls from './components/stripe-controls';
import { PanelTab } from '../../components/index.js';

const postTypes = Object.keys( window.themeisleGutenberg.postTypes );

const defaultConditions = {
	'users': {
		label: __( 'Users', 'otter-blocks' ),
		conditions: [
			{
				value: 'loggedInUser',
				label: __( 'Logged In Users', 'otter-blocks' ),
				help: __( 'The selected block will only be visible to logged-in users.', 'otter-blocks'  )
			},
			{
				value: 'loggedOutUser',
				label: __( 'Logged Out Users', 'otter-blocks' ),
				help: __( 'The selected block will only be visible to logged-out users.', 'otter-blocks'  )
			},
			{
				value: 'userRoles',
				label: __( 'User Roles', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user roles.', 'otter-blocks'  ),
				toogleVisibility: true
			},
			{
				value: 'loggedInUserMeta',
				label: __( 'Logged-in User Meta (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on meta of the logged-in user condition.', 'otter-blocks'  ),
				isDisabled: true
			}
		]
	},
	'posts': {
		label: __( 'Posts', 'otter-blocks' ),
		conditions: [
			{
				value: 'postAuthor',
				label: __( 'Post Author', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on post author.', 'otter-blocks'  ),
				toogleVisibility: true
			},
			{
				value: 'postType',
				label: __( 'Post Type', 'otter-blocks' ),
				help: __( 'The selected block will be visible if post becomes to one of the selected post types.', 'otter-blocks'  ),
				toogleVisibility: true
			},
			{
				value: 'postCategory',
				label: __( 'Post Category', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on selected post categories.', 'otter-blocks'  ),
				toogleVisibility: true
			},
			{
				value: 'postTag',
				label: __( 'Post Tag', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on selected post tags.', 'otter-blocks'  ),
				toogleVisibility: true
			},
			{
				value: 'postMeta',
				label: __( 'Post Meta (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on post meta condition.', 'otter-blocks'  ),
				isDisabled: true
			}
		]
	},
	'dateAndTime': {
		label: __( 'Date & Time', 'otter-blocks' ),
		conditions: [
			{
				value: 'dateRange',
				label: __( 'Date Range (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the date range. Timezone is used based on your WordPress settings.', 'otter-blocks'  ),
				isDisabled: true
			},
			{
				value: 'dateRecurring',
				label: __( 'Date Recurring (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the selected days. Timezone is used based on your WordPress settings.', 'otter-blocks'  ),
				isDisabled: true
			},
			{
				value: 'timeRecurring',
				label: __( 'Time Recurring (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible during the selected time. Timezone is used based on your WordPress settings.', 'otter-blocks'  ),
				isDisabled: true
			}
		]
	},
	'advance': {
		label: __( 'Advance', 'otter-blocks' ),
		conditions: [
			{
				value: 'screenSize',
				label: __( 'Screen Size', 'otter-blocks' ),
				help: __( 'The selected block will be invisible based on the screen size.', 'otter-blocks'  ),
				toggleVisibility: true
			},
			{
				value: 'queryString',
				label: __( 'Query String (Pro)', 'otter-blocks' ),
				help: __( 'The condition will be met if the URL contains specified parameters.', 'otter-blocks'  ),
				isDisabled: true
			},
			{
				value: 'country',
				label: __( 'Country (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s country based on the IP address.', 'otter-blocks'  ),
				isDisabled: true
			},
			{
				value: 'cookie',
				label: __( 'Cookie (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on PHP cookies.', 'otter-blocks'  ),
				isDisabled: true
			}
		]
	},
	'woocommerce': {
		label: __( 'WooCommerce', 'otter-blocks' ),
		conditions: [
			{
				value: 'wooProductsInCart',
				label: __( 'Products in Cart (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the products added to WooCommerce cart.', 'otter-blocks'  ),
				isDisabled: true
			},
			{
				value: 'wooTotalCartValue',
				label: __( 'Total Cart Value (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the total value of WooCommerce cart.', 'otter-blocks'  ),
				isDisabled: true
			},
			{
				value: 'wooPurchaseHistory',
				label: __( 'Purchase History (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s WooCommerce purchase history.', 'otter-blocks'  ),
				isDisabled: true
			},
			{
				value: 'wooTotalSpent',
				label: __( 'Total Spent (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on how much the user spent during lifetime.', 'otter-blocks'  ),
				isDisabled: true
			}
		]
	},
	'woocommerceProduct': {
		label: __( 'WooCommerce Product', 'otter-blocks' ),
		conditions: [
			{
				value: 'wooCategory',
				label: __( 'Product Category (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the product category.', 'otter-blocks'  ),
				isDisabled: true
			},
			{
				value: 'wooTag',
				label: __( 'Product Tag (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the product tag.', 'otter-blocks'  ),
				isDisabled: true
			},
			{
				value: 'wooAttribute',
				label: __( 'Product Attribute (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the product attribute.', 'otter-blocks'  ),
				isDisabled: true
			}
		]
	},
	'stripe': {
		label: __( 'Stripe', 'otter-blocks' ),
		conditions: [
			{
				value: 'stripePurchaseHistory',
				label: __( 'Purchase History', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s Stripe purchase history.', 'otter-blocks'  ),
				toogleVisibility: true
			}
		]
	},
	'learndash': {
		label: __( 'LearnDash', 'otter-blocks' ),
		conditions: [
			{
				value: 'learnDashPurchaseHistory',
				label: __( 'Purchase History (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s LearnDash purchase history.', 'otter-blocks'  ),
				isDisabled: true
			},
			{
				value: 'learnDashCourseStatus',
				label: __( 'Course Status (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s LearnDash course status.', 'otter-blocks'  ),
				isDisabled: true
			}
		]
	}
};
const defaultConditionsKeys = Object.keys( defaultConditions );

const AuthorsFieldToken = ( props ) => {
	const {
		postAuthors,
		isLoading
	} = useSelect( select => {
		const { getUsers, isResolving } = select( 'core' );

		return {
			postAuthors: ( getUsers({ who: 'authors', context: 'view' }) ?? []).map( author => author.username ??  author.name ).filter( Boolean ),
			isLoading: isResolving( 'getUsers', [{ who: 'authors', context: 'view' }])
		};
	}, []);

	return isLoading ? (
		<Placeholder><Spinner /></Placeholder>
	) : (
		<FormTokenField
			{ ...props }
			suggestions={ postAuthors }
			__experimentalExpandOnFocus={ true }
			__experimentalValidateInput={ newValue => postAuthors.includes( newValue ) }
		/>
	);
};

export const CategoriesFieldToken = ( props ) => {
	const {
		postCategories,
		isLoading
	} = useSelect( select => {
		const { getEntityRecords, isResolving } = select( 'core' );

		return {
			postCategories: ( getEntityRecords( 'taxonomy', 'category', { 'per_page': -1, context: 'view' }) ?? []).map( category => category.slug ),
			isLoading: isResolving( 'getEntityRecords', [ 'taxonomy', 'category', { 'per_page': -1, context: 'view' }])
		};
	}, [ ]);

	return isLoading ? (
		<Placeholder><Spinner /></Placeholder>
	) : (
		<FormTokenField
			{ ...props }
			suggestions={ postCategories }
			__experimentalExpandOnFocus={ true }
			__experimentalValidateInput={ newValue => postCategories.includes( newValue ) }
		/>
	);
};

const TagsFieldToken = ( props ) => {
	const {
		postTags,
		isLoading
	} = useSelect( select => {
		const { getEntityRecords, isResolving } = select( 'core' );

		return {
			postTags: ( getEntityRecords( 'taxonomy', 'post_tag', { 'per_page': -1, context: 'view' }) ?? []).map( tag => tag.slug ),
			isLoading: isResolving( 'getEntityRecords', [ 'taxonomy', 'post_tag', { 'per_page': -1, context: 'view' }])
		};
	}, [ ]);

	return isLoading ? (
		<Placeholder><Spinner /></Placeholder>
	) : (
		<FormTokenField
			{ ...props }
			suggestions={ postTags }
			__experimentalExpandOnFocus={ true }
			__experimentalValidateInput={ newValue => postTags.includes( newValue ) }
		/>
	);
};

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

const Edit = ({
	attributes,
	setAttributes: _setAttributes,
	name
}) => {
	const [ buffer, setBuffer ] = useState( null );
	const [ conditions, setConditions ] = useState({});
	const [ flatConditions, setFlatConditions ] = useState([]);
	const [ toggleVisibility, setToggleVisibility ] = useState([]);

	const setAttributes = ( attrs ) => {

		if ( window.wp.hasOwnProperty( 'customize' ) && window.wp.customize ) {

			/**
			 * Customizer only use shallow comparision for checking the changes, thus conditions updates are not detected.
			 * Trick: By changing the numbers of the conditions we trigger the update.
			 * The buffer will revert the trick to the correct value.
			 */
			const otterConditions = [ ...( attrs.otterConditions || []), []];
			_setAttributes({ otterConditions });
			setBuffer( attrs );
		} else {
			_setAttributes( attrs );
		}

	};

	/**
	 * Use an intermediary buffer to add the real attributes to the block.
	 */
	useEffect( () => {
		if ( buffer &&  window.wp.hasOwnProperty( 'customize' ) && window.wp.customize ) {
			_setAttributes( buffer );
		}
	}, [ buffer ]);

	useEffect( () => {
		if ( ! Boolean( attributes?.otterConditions?.length ) ) {
			return;
		}

		let otterConditions = [ ...attributes.otterConditions?.filter( c => ! isEmpty( c ) ) ];

		if ( ! Boolean( otterConditions.length ) ) {
			otterConditions = undefined;
		}

		setAttributes({ otterConditions });
	}, []);

	useEffect( () => {
		const c = applyFilters( 'otter.blockConditions.conditions', defaultConditions );

		const conditionsKeys = Object.keys( c ).filter( key => defaultConditionsKeys.includes( key ) );
		const flat = conditionsKeys.map( i => c?.[i].conditions ).flat();

		flat.splice( 0, 0, {
			value: 'none',
			label: __( 'Select a condition', 'otter-blocks' ),
			help: __( 'Select a condition to control the visibility of your block.', 'otter-blocks' )
		});

		setConditions( c );
		setFlatConditions( flat );
		setToggleVisibility( flat.filter( i => i.toogleVisibility )?.map( i => i.value ) );
	}, [ attributes.otterConditions ]);

	const addGroup = () => {
		const otterConditions = [ ...( attributes.otterConditions || []) ];
		otterConditions.push([{}]);
		setAttributes({ otterConditions });
	};

	const removeGroup = n => {
		let otterConditions = [ ...attributes.otterConditions ];
		otterConditions.splice( n, 1 );

		if ( ! Boolean( otterConditions.length ) ) {
			otterConditions = undefined;
		}

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
		window.oTrk?.set( `condition-type_${attributes?.id ?? name}_${index}_${key}`, { groupID: attributes?.id ?? name, feature: 'condition', featureComponent: 'condition-type', featureValue: value });

		const otterConditions = [ ...attributes.otterConditions ];

		const attrs = applyFilters( 'otter.blockConditions.defaults', {}, value );

		if ( 'userRoles' === value || 'postAuthor' === value ) {
			attrs.visibility = true;
		}

		if ( 'screenSize' === value ) {
			attrs['screen_sizes'] = [];
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

	/**
	 * Change the value of the condition in the nested array.
	 *
	 * @param {any}    value The value to set.
	 * @param {number} index The index of the group.
	 * @param {number} key   The index of the condition.
	 * @param {string} type  The type of the condition.
	 */
	const changeArrayValue = ( value, index, key, type ) => {
		const otterConditions = [ ...attributes.otterConditions ];
		otterConditions[ index ][ key ][ type ] = value;
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

	/**
	 * Toggle the value of the condition in the nested array.
	 *
	 * @param {any}    value The value to set.
	 * @param {number} index The index of the group.
	 * @param {number} key   The index of the condition.
	 * @param {string} type  The type of the condition.
	 */
	const toggleValueInArray = ( value, index, key, type ) => {
		const otterConditions = [ ...attributes.otterConditions ];
		if ( otterConditions[ index ][ key ][ type ]?.includes( value ) ) {
			otterConditions[ index ][ key ][ type ] = otterConditions[ index ][ key ][ type ].filter( v => v !== value );
		} else {
			otterConditions[ index ][ key ][ type ]?.push( value );
		}
		setAttributes({ otterConditions });
	};

	return (
		<PanelBody
			title={ __( 'Visibility Conditions', 'otter-blocks' ) }
			initialOpen={ false }
		>
			<p>{ __( 'Control the visibility of your blocks based on the following conditions.', 'otter-blocks' ) }</p>

			<p>{ __( 'Display the block if…', 'otter-blocks' ) }</p>

			{ attributes.otterConditions && attributes.otterConditions.map( ( group, index ) => {
				return (
					<Fragment key={ index }>
						<PanelTab
							label={ __( 'Rule Group', 'otter-blocks' ) }
							onDelete={ () => removeGroup( index ) }
						>
							{ group && group.map( ( condObj, condIdx ) => (
								<Fragment key={ `${ index }_${ condIdx }` }>
									<BaseControl
										label={ __( 'Condition', 'otter-blocks' ) }
										help={ flatConditions.find( condition => condition.value === ( condObj.type || 'none' ) )?.help }
										id={ `o-conditions-${ index }-${ condIdx }` }
									>
										<select
											value={ condObj.type || '' }
											onChange={ e => changeCondition( e.target.value, index, condIdx ) }
											className="components-select-control__input w-full"
											id={ `o-conditions-${ index }-${ condIdx }` }
										>
											<option value="none">{ __( 'Select a condition', 'otter-blocks' ) }</option>

											{ Object.keys( conditions ).map( groupKey => {
												return (
													<optgroup label={ conditions[groupKey].label } key={ groupKey }>
														{ conditions[groupKey].conditions.map( o => <option value={ o.value } key={ o.value } disabled={ o?.isDisabled }>{ o.label }</option> ) }
													</optgroup>
												);
											}) }
										</select>
									</BaseControl>

									{ 'userRoles' === condObj.type && (
										<FormTokenField
											label={ __( 'User Roles', 'otter-blocks' ) }
											value={ condObj.roles }
											suggestions={ Object.keys( window.themeisleGutenberg.userRoles ) }
											onChange={ roles => changeArrayValue( roles, index, condIdx, 'roles' ) }
											__experimentalExpandOnFocus={ true }
											__experimentalValidateInput={ newValue => Object.keys( window.themeisleGutenberg.userRoles ).includes( newValue ) }
										/>
									) }

									{ 'postAuthor' === condObj.type && (
										<AuthorsFieldToken
											label={ __( 'Post Author', 'otter-blocks' ) }
											value={ condObj.authors }
											onChange={ authors => changeArrayValue( authors, index, condIdx, 'authors' ) }
										/>
									) }

									{ 'postCategory' === condObj.type && (
										<CategoriesFieldToken
											label={ __( 'Post Category', 'otter-blocks' ) }
											value={ condObj.categories }
											onChange={ categories => changeArrayValue( categories, index, condIdx, 'categories' ) }
										/>
									) }

									{ 'postTag' === condObj.type && (
										<TagsFieldToken
											label={ __( 'Post Tag', 'otter-blocks' ) }
											value={ condObj.tags }
											onChange={ tags => changeArrayValue( tags, index, condIdx, 'tags' ) }
										/>
									) }

									{ 'postType' === condObj.type && (
										<FormTokenField
											label={ __( 'Post Types', 'otter-blocks' ) }
											value={ condObj.post_types }
											suggestions={ postTypes }
											onChange={ types => changeArrayValue( types, index, condIdx, 'post_types' ) }
											__experimentalExpandOnFocus={ true }
											__experimentalValidateInput={ newValue => postTypes.includes( newValue ) }
										/>
									) }

									{ 'screenSize' === condObj.type && (
										<Fragment>
											<ToggleControl
												label={ __( 'Hide on Mobile', 'otter-blocks' ) }
												checked={ condObj?.screen_sizes?.includes( 'mobile' ) }
												onChange={ () => toggleValueInArray( 'mobile', index, condIdx, 'screen_sizes' )}
											/>
											<ToggleControl
												label={ __( 'Hide on Tablet', 'otter-blocks' ) }
												checked={ condObj?.screen_sizes?.includes( 'tablet' ) }
												onChange={ () => toggleValueInArray( 'tablet', index, condIdx, 'screen_sizes' )}
											/>
											<ToggleControl
												label={ __( 'Hide on Desktop', 'otter-blocks' ) }
												checked={ condObj?.screen_sizes?.includes( 'desktop' ) }
												onChange={ () => toggleValueInArray( 'desktop', index, condIdx, 'screen_sizes' )}
											/>
										</Fragment>
									) }

									{ 'stripePurchaseHistory' === condObj.type && (
										<Fragment>
											{ Boolean( window.themeisleGutenberg.hasStripeAPI ) && (
												<StripeControls
													product={ condObj.product }
													onChange={ product => changeValue( product, index, condIdx, 'product' ) }
												/>
											) }

											{ ! Boolean( window.themeisleGutenberg.hasStripeAPI ) && (
												<p>
													{ __( 'You need to set your Stripe API keys in the Otter Dashboard.', 'otter-blocks' ) }
													{ ' ' }
													<ExternalLink href={ window.themeisleGutenberg.optionsPath }>{ __( 'Visit Dashboard', 'otter-blocks' ) }</ExternalLink>
												</p>
											) }
										</Fragment>
									) }

									{ applyFilters( 'otter.blockConditions.controls', '', index, condIdx, condObj, attributes.otterConditions, setAttributes, changeValue ) }

									{ toggleVisibility.includes( condObj.type ) && (
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
											value={ condObj.visibility }
											onChange={ e => changeVisibility( e, index, condIdx ) }
										/>
									) }

									<Button
										isDestructive
										className="o-conditions__add"
										onClick={ () => removeCondition( index, condIdx ) }
									>
										{ __( 'Delete Condition', 'otter-blocks' ) }
									</Button>

									{ ( 1 < group.length && condIdx !== group.length - 1 ) && (
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

			{ applyFilters( 'otter.blockConditions.notices', '' ) }

			<div className="o-fp-wrap">
				{ applyFilters( 'otter.feedback', '', 'conditions' ) }
				{ applyFilters( 'otter.poweredBy', '' ) }
			</div>
		</PanelBody>
	);
};

export default memo( Edit );
