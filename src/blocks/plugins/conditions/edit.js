/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { cloneDeep, isEmpty } from 'lodash';

import {
	Button,
	ExternalLink,
	FormTokenField,
	PanelBody,
	Placeholder,
	SelectControl,
	Spinner,
	ToggleControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	memo,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

import { plus } from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import StripeControls from './components/stripe-controls';
import RuleGroup, { Separator } from './components/rule-group.js';

const postTypes = Object.keys( window.themeisleGutenberg.postTypes );

const defaultConditions = {
	'users': {
		label: __( 'Users', 'otter-blocks' ),
		conditions: [
			{
				value: 'screenSize',
				label: __( 'Screen Size', 'otter-blocks' ),
				help: __( 'The selected block will be invisible based on the screen size.', 'otter-blocks'  ),
				toggleVisibility: true
			},
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

const computeConditionsCatalog = () => {
	const conditions = applyFilters( 'otter.blockConditions.conditions', defaultConditions );

	// Labels need to resolve for every catalog group, including third-party ones.
	const flatConditions = Object.keys( conditions ).map( i => conditions?.[i].conditions ).flat();
	const defaultFlatConditions = Object.keys( conditions )
		.filter( key => defaultConditionsKeys.includes( key ) )
		.map( i => conditions?.[i].conditions )
		.flat();

	return {
		conditions,
		flatConditions,
		toggleVisibility: defaultFlatConditions.filter( i => i.toogleVisibility )?.map( i => i.value )
	};
};

const getConditionDefaults = value => {
	const attrs = applyFilters( 'otter.blockConditions.defaults', {}, value );

	if ( 'userRoles' === value || 'postAuthor' === value ) {
		attrs.visibility = true;
	}

	if ( 'screenSize' === value ) {
		attrs['screen_sizes'] = [];
	}

	return attrs;
};

const Edit = ({
	attributes,
	setAttributes: _setAttributes,
	name
}) => {
	const [ buffer, setBuffer ] = useState( null );
	const [ catalog, setCatalog ] = useState( computeConditionsCatalog );

	const { conditions, flatConditions, toggleVisibility } = catalog;

	/**
	 * The conditions have no stable IDs, so keep a parallel list of generated keys.
	 * Keys are spliced on group removal so React state stays with the right group.
	 */
	const groupUid = useRef( 0 );
	const groupKeys = useRef([]);

	const groupsCount = attributes.otterConditions?.length ?? 0;
	while ( groupKeys.current.length < groupsCount ) {
		groupKeys.current.push( ++groupUid.current );
	}
	if ( groupKeys.current.length > groupsCount ) {
		groupKeys.current = groupKeys.current.slice( 0, groupsCount );
	}

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
		if ( buffer && window.wp.hasOwnProperty( 'customize' ) && window.wp.customize ) {
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
		setCatalog( computeConditionsCatalog() );
	}, [ attributes.otterConditions ]);

	const addGroup = () => {
		const otterConditions = cloneDeep( attributes.otterConditions || [] );
		otterConditions.push([]);
		setAttributes({ otterConditions });
	};

	const removeGroup = n => {
		groupKeys.current.splice( n, 1 );

		let otterConditions = cloneDeep( attributes.otterConditions );
		otterConditions.splice( n, 1 );

		if ( ! Boolean( otterConditions.length ) ) {
			otterConditions = undefined;
		}

		setAttributes({ otterConditions });
	};

	const addCondition = ( index, value ) => {
		const otterConditions = cloneDeep( attributes.otterConditions );
		const condIdx = otterConditions[ index ].length;

		window.oTrk?.set( `condition-type_${attributes?.id ?? name}_${index}_${condIdx}`, { groupID: attributes?.id ?? name, feature: 'condition', featureComponent: 'condition-type', featureValue: value });

		otterConditions[ index ].push({
			type: value,
			...getConditionDefaults( value )
		});

		setAttributes({ otterConditions });
	};

	const removeCondition = ( index, key ) => {
		const otterConditions = cloneDeep( attributes.otterConditions );
		otterConditions[ index ].splice( key, 1 );

		setAttributes({ otterConditions });
	};

	const changeCondition = ( value, index, key ) => {
		window.oTrk?.set( `condition-type_${attributes?.id ?? name}_${index}_${key}`, { groupID: attributes?.id ?? name, feature: 'condition', featureComponent: 'condition-type', featureValue: value });

		const otterConditions = cloneDeep( attributes.otterConditions );

		if ( 'none' === value ) {
			otterConditions[ index ][ key ] = {};
		} else {
			otterConditions[ index ][ key ] = {
				type: value,
				...getConditionDefaults( value )
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
		const otterConditions = cloneDeep( attributes.otterConditions );
		otterConditions[ index ][ key ][ type ] = value;
		setAttributes({ otterConditions });
	};

	const changeVisibility = ( value, index, key ) => {
		const otterConditions = cloneDeep( attributes.otterConditions );
		otterConditions[ index ][ key ].visibility = 'true' === value ? true : false;
		setAttributes({ otterConditions });
	};

	const changeValue = ( value, index, key, field ) => {
		const otterConditions = cloneDeep( attributes.otterConditions );
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
		const otterConditions = cloneDeep( attributes.otterConditions );
		if ( otterConditions[ index ][ key ][ type ]?.includes( value ) ) {
			otterConditions[ index ][ key ][ type ] = otterConditions[ index ][ key ][ type ].filter( v => v !== value );
		} else {
			otterConditions[ index ][ key ][ type ]?.push( value );
		}
		setAttributes({ otterConditions });
	};

	const renderConditionControls = ( condObj, index, condIdx ) => (
		<Fragment>
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
		</Fragment>
	);

	const hasActiveConditions = Boolean( attributes.otterConditions?.some( group => group?.some?.( condition => condition?.type ) ) );

	return (
		<PanelBody
			title={(
				<Fragment>
					{ __( 'Visibility Conditions', 'otter-blocks' ) }

					{ hasActiveConditions && (
						<span className="o-conditions__indicator">
							<span className="screen-reader-text">{ __( '(has active conditions)', 'otter-blocks' ) }</span>
						</span>
					) }
				</Fragment>
			)}
			initialOpen={ false }
		>
			<p className="o-conditions__intro">{ __( 'Display the block if…', 'otter-blocks' ) }</p>

			{ attributes.otterConditions && attributes.otterConditions.map( ( group, index ) => (
				<Fragment key={ groupKeys.current[ index ] }>
					{ 0 < index && <Separator label={ __( 'OR', 'otter-blocks' ) } /> }

					<RuleGroup
						group={ group }
						index={ index }
						conditions={ conditions }
						flatConditions={ flatConditions }
						onDelete={ () => removeGroup( index ) }
						onAddCondition={ value => addCondition( index, value ) }
						onChangeCondition={ ( value, condIdx ) => changeCondition( value, index, condIdx ) }
						onRemoveCondition={ condIdx => removeCondition( index, condIdx ) }
						renderConditionControls={ ( condObj, condIdx ) => renderConditionControls( condObj, index, condIdx ) }
					/>
				</Fragment>
			) ) }

			<Button
				isSecondary
				icon={ plus }
				className="o-conditions__add-group"
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
