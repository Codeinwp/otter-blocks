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
	Placeholder
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
import PanelTab from '../../components/panel-tab/index.js';
import Notice from '../../components/notice/index.js';
import { setUtm } from '../../helpers/helper-functions.js';
import { useInspectorSlot } from '../../components/inspector-slot-fill/index.js';

const hasPro = Boolean( window.themeisleGutenberg.hasPro );
const postTypes = Object.keys( window.themeisleGutenberg.postTypes );

const defaultConditions = {
	'users': {
		label: __( 'Users', 'otter-blocks' ),
		conditions: [
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
				help: __( 'The selected block will be visible based on user roles.' ),
				toogleVisibility: true
			},
			{
				value: 'loggedInUserMeta',
				label: __( 'Logged-in User Meta (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on meta of the logged-in user condition.' ),
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
				help: __( 'The selected block will be visible based on post author.' ),
				toogleVisibility: true
			},
			{
				value: 'postType',
				label: __( 'Post Type', 'otter-blocks' ),
				help: __( 'The selected block will be visible if post becomes to one of the selected post types.' ),
				toogleVisibility: true
			},
			{
				value: 'postCategory',
				label: __( 'Post Category', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on selected post categories.' ),
				toogleVisibility: true
			},
			{
				value: 'postMeta',
				label: __( 'Post Meta (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on post meta condition.' ),
				isDisabled: true
			}
		]
	},
	'url': {
		label: __( 'URL', 'otter-blocks' ),
		conditions: [
			{
				value: 'queryString',
				label: __( 'Query String (Pro)', 'otter-blocks' ),
				help: __( 'The condition will be met if the URL contains specified parameters.' ),
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
				help: __( 'The selected block will be visible based on the date range. Timezone is used based on your WordPress settings.' ),
				isDisabled: true
			},
			{
				value: 'dateRecurring',
				label: __( 'Date Recurring (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the selected days. Timezone is used based on your WordPress settings.' ),
				isDisabled: true
			},
			{
				value: 'timeRecurring',
				label: __( 'Time Recurring (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible during the selected time. Timezone is used based on your WordPress settings.' ),
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
				help: __( 'The selected block will be visible based on the products added to WooCommerce cart.' ),
				isDisabled: true
			},
			{
				value: 'wooTotalCartValue',
				label: __( 'Total Cart Value (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on the total value of WooCommerce cart.' ),
				isDisabled: true
			},
			{
				value: 'wooPurchaseHistory',
				label: __( 'Purchase History (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s WooCommerce purchase history.' ),
				isDisabled: true
			},
			{
				value: 'wooTotalSpent',
				label: __( 'Total Spent (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on how much the user spent during lifetime.' ),
				isDisabled: true
			}
		]
	},
	'learndash': {
		label: __( 'LearnDash', 'otter-blocks' ),
		conditions: [
			{
				value: 'learnDashPurchaseHistory',
				label: __( 'Purchase History (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s LearnDash purchase history.' ),
				isDisabled: true
			},
			{
				value: 'learnDashCourseStatus',
				label: __( 'Course Status (Pro)', 'otter-blocks' ),
				help: __( 'The selected block will be visible based on user\'s LearnDash course status.' ),
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
			postAuthors: ( getUsers({ who: 'authors', context: 'view' }) ?? []).map( author => author.username ),
			isLoading: isResolving( 'getUsers', [{ who: 'authors', context: 'view' }])
		};
	}, [ ]);

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

const CategoriesFieldToken = ( props ) => {
	const {
		postCategories,
		isLoading
	} = useSelect( select => {
		const { getEntityRecords, isResolving } = select( 'core' );

		return {
			postCategories: ( getEntityRecords( 'taxonomy', 'category', { 'per_page': 100, context: 'view' }) ?? []).map( category => category.slug ),
			isLoading: isResolving( 'getEntityRecords', [ 'taxonomy', 'category', { 'per_page': 100, context: 'view' }])
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
	name,
	attributes,
	setAttributes: _setAttributes
}) => {
	const Inspector = useInspectorSlot( name );

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

		const flat = defaultConditionsKeys.map( i => c?.[i].conditions ).flat();
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
		const otterConditions = [ ...attributes.otterConditions ];

		const attrs = applyFilters( 'otter.blockConditions.defaults', {}, value );

		if ( 'userRoles' === value || 'postAuthor' === value ) {
			attrs.visibility = true;
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

	return (
		<Inspector>
			<PanelBody
				title={ __( 'Visibility Conditions', 'otter-blocks' ) }
				initialOpen={ false }
				className="o-is-new"
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
								{ group && group.map( ( i, n ) => (
									<Fragment key={ `${ index }_${ n }` }>
										<BaseControl
											label={ __( 'Condition', 'otter-blocks' ) }
											help={ flatConditions.find( condition => condition.value === ( i.type || 'none' ) )?.help }
											id={ `o-conditions-${ index }-${ n }` }
										>
											<select
												value={ i.type || '' }
												onChange={ e => changeCondition( e.target.value, index, n ) }
												className="components-select-control__input"
												id={ `o-conditions-${ index }-${ n }` }
											>
												<option value="none">{ __( 'Select a condition', 'otter-blocks' ) }</option>

												{ Object.keys( conditions ).map( i => {
													return (
														<optgroup label={ conditions[i].label } key={ i }>
															{ conditions[i].conditions.map( o => <option value={ o.value } key={ o.value } disabled={ o?.isDisabled }>{ o.label }</option> ) }
														</optgroup>
													);
												}) }
											</select>
										</BaseControl>

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
											<AuthorsFieldToken
												label={ __( 'Post Author', 'otter-blocks' ) }
												value={ i.authors }
												onChange={ authors => changeArrayValue( authors, index, n, 'authors' ) }
											/>
										) }

										{ 'postCategory' === i.type && (
											<CategoriesFieldToken
												label={ __( 'Post Category', 'otter-blocks' ) }
												value={ i.categories }
												onChange={ categories => changeArrayValue( categories, index, n, 'categories' ) }
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

										{ applyFilters( 'otter.blockConditions.controls', '', index, n, i, attributes.otterConditions, setAttributes, changeValue ) }

										{ toggleVisibility.includes( i.type ) && (
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

				{ applyFilters( 'otter.blockConditions.notices', '' ) }

				{ ( ! hasPro ) && (
					<Notice
						notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'blockconditions' ) }>{ __( 'Get more options with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
						variant="upsell"
					/>
				) }

				<div className="o-fp-wrap">
					{ applyFilters( 'otter.feedback', '', 'conditions' ) }
					{ applyFilters( 'otter.poweredBy', '' ) }
				</div>
			</PanelBody>
		</Inspector>
	);
};

export default memo( Edit );
