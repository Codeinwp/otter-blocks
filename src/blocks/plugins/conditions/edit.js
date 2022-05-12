/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { isEmpty } from 'lodash';

import { InspectorControls } from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	ExternalLink,
	FormTokenField,
	PanelBody,
	SelectControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	memo,
	useEffect
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import PanelTab from '../../components/panel-tab/index.js';
import Notice from '../../components/notice/index.js';

const hasPro = Boolean( window.themeisleGutenberg.hasPro );
const postTypes = Object.keys( window.themeisleGutenberg.postTypes );

const Edit = ({
	attributes,
	setAttributes
}) => {
	useEffect( () => {
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
	}, []);

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
	}, []);

	const addGroup = () => {
		const otterConditions = [ ...( attributes.otterConditions || []) ];
		otterConditions.push([ {} ]);
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

	let conditions = {
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

	conditions = applyFilters( 'otter.blockConditions.conditions', conditions );

	const getConditions = () => {
		const flatConditions = [
			{
				value: 'none',
				label: __( 'Select a condition', 'otter-blocks' ),
				help: __( 'Select a condition to control the visibility of your block.', 'otter-blocks' )
			},
			...Object.keys( conditions ).map( i => conditions[i].conditions ).flat()
		];

		return flatConditions;
	};

	const toogleVisibility = getConditions().filter( i => i.toogleVisibility )?.map( i => i.value );

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

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Visibility Conditions', 'otter-blocks' ) }
				initialOpen={ false }
				className="o-is-new"
			>
				<Notice
					notice={ <ExternalLink href={ window.themeisleGutenberg.optionsPath }>{ __( 'Disable in Otter Settings', 'otter-blocks' ) }</ExternalLink> }
				/>

				<p>{ __( 'Control the visibility of your blocks based on the following conditions.', 'otter-blocks' ) }</p>

				{ ( ! hasPro ) && (
					<Notice
						notice={ <ExternalLink href={ window.themeisleGutenberg.upgradeLink }>{ __( 'Unlock more options with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
						variant="upsell"
					/>
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
											help={ getConditions().find( condition => condition.value === ( i.type || 'none' ) )?.help }
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
											<FormTokenField
												label={ __( 'Post Authors', 'otter-blocks' ) }
												value={ i.authors }
												suggestions={ postAuthors }
												onChange={ authors => changeArrayValue( authors, index, n, 'authors' ) }
												__experimentalExpandOnFocus={ true }
												__experimentalValidateInput={ newValue => postAuthors.includes( newValue ) }
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

										{ toogleVisibility.includes( i.type ) && (
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
			</PanelBody>
		</InspectorControls>
	);
};

export default memo( Edit );
