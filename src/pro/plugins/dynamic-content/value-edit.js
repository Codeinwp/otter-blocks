/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	ExternalLink,
	FormTokenField,
	Placeholder,
	SelectControl,
	Spinner,
	TextControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

const ALLOWED_ACF_TYPES = [
	'button_group',
	'checkbox',
	'color_picker',
	'date_time_picker',
	'date_picker',
	'email',
	'number',
	'password',
	'radio',
	'range',
	'select',
	'text',
	'textarea',
	'time_picker',
	'true_false',
	'url'
];

/**
 * Recursively flatten ACF fields into <option> elements for a <select> control.
 *
 * @param {Array}  fields - ACF field objects at the current nesting level.
 * @param {number} depth  - Current depth (0 = direct children of an ACF group).
 * @return {Array} Flat array of <option> React elements.
 */
const FIELD_INDENT = '\u00A0\u00A0\u00A0';

const flattenACFOptions = ( fields, depth = 0 ) => {
	if ( ! fields?.length ) {
		return [];
	}

	const indent = FIELD_INDENT.repeat( depth );

	return fields
		.filter( ({ key, label }) => key && label )
		.flatMap( ({ key, label, type, subFields }) => {
			if ( 'repeater' === type ) {
				return [
					// Disabled header option representing the repeater itself.
					<option key={ `repeater-header-${ key }` } disabled value="">
						{ `${ indent }${ label }` }
					</option>,
					// Sub-fields indented one level deeper.
					...flattenACFOptions( subFields || [], depth + 1 )
				];
			}

			if ( ALLOWED_ACF_TYPES.includes( type ) ) {
				return [
					<option key={ key } value={ key }>
						{ `${ indent }${ label }` }
					</option>
				];
			}

			return [];
		} );
};

const Edit = ({
	attributes,
	changeAttributes
}) => {
	const {
		isLoaded,
		groups
	} = useSelect( select => {
		const { groups } = select( 'otter-pro' ).getACFData();
		const isLoaded = select( 'otter-pro' ).isACFLoaded();

		return {
			isLoaded,
			groups
		};
	}, []);

	const dateFormats = {
		'F j, Y': moment().format( 'MMMM d, Y' ),
		'Y-m-d': moment().format( 'Y-m-d' ),
		'm/d/Y': moment().format( 'm/d/Y' ),
		'd/m/Y': moment().format( 'd/m/Y' )
	};

	const timeFormats = {
		'g:i a': moment().format( 'h:m a' ),
		'g:i A': moment().format( 'h:m A' ),
		'H:i': moment().format( 'HH:m' )
	};

	const autocompleteData = {
		postMeta: [],
		authorMeta: [
			'description',
			'display_name',
			'first_name',
			'last_name',
			'nickname',
			'user_email',
			'user_level',
			'user_login',
			'user_nicename',
			'user_registered',
			'user_status',
			'user_url'
		],
		loggedInUserMeta: [
			'description',
			'first_name',
			'ID',
			'last_name',
			'nickname'
		]
	};

	return (
		<Fragment>
			{ [ 'postDate' ].includes( attributes.type ) && (
				<Fragment>
					<SelectControl
						label={ __( 'Type', 'otter-pro' ) }
						value={ attributes.dateType || 'published' }
						options={ [
							{
								label: __( 'Post Published', 'otter-pro' ),
								value: 'published'
							},
							{
								label: __( 'Post Modified', 'otter-pro' ),
								value: 'modified'
							}
						] }
						onChange={ dateType => changeAttributes({ dateType }) }
					/>

					<SelectControl
						label={ __( 'Format', 'otter-pro' ) }
						value={ attributes.dateFormat || 'default' }
						options={ [
							{
								label: __( 'Default', 'otter-pro' ),
								value: 'default'
							},
							...Object.keys( dateFormats ).map( key => ({
								label: dateFormats[ key ],
								value: key
							}) ),
							{
								label: __( 'Custom', 'otter-pro' ),
								value: 'custom'
							}
						] }
						onChange={ dateFormat => changeAttributes({ dateFormat }) }
					/>

					{ 'custom' === attributes.dateFormat && (
						<TextControl
							label={ __( 'Custom Format', 'otter-pro' ) }
							help={ <ExternalLink target="_blank" href="https://wordpress.org/support/article/formatting-date-and-time/">{ __( 'Formatting Date and Time in WordPress', 'otter-pro' ) }</ExternalLink> }
							type="text"
							value={ attributes.dateCustom || '' }
							onChange={ dateCustom => changeAttributes({ dateCustom }) }
						/>
					) }
				</Fragment>
			) }

			{ [ 'postTime' ].includes( attributes.type ) && (
				<Fragment>
					<SelectControl
						label={ __( 'Type', 'otter-pro' ) }
						value={ attributes.timeType || 'published' }
						options={ [
							{
								label: __( 'Post Published', 'otter-pro' ),
								value: 'published'
							},
							{
								label: __( 'Post Modified', 'otter-pro' ),
								value: 'modified'
							}
						] }
						onChange={ timeType => changeAttributes({ timeType }) }
					/>

					<SelectControl
						label={ __( 'Format', 'otter-pro' ) }
						value={ attributes.timeFormat || 'default' }
						options={ [
							{
								label: __( 'Default', 'otter-pro' ),
								value: 'default'
							},
							...Object.keys( timeFormats ).map( key => ({
								label: timeFormats[ key ],
								value: key
							}) ),
							{
								label: __( 'Custom', 'otter-pro' ),
								value: 'custom'
							}
						] }
						onChange={ timeFormat => changeAttributes({ timeFormat }) }
					/>

					{ 'custom' === attributes.timeFormat && (
						<TextControl
							label={ __( 'Custom Format', 'otter-pro' ) }
							help={ <ExternalLink target="_blank" href="https://wordpress.org/support/article/formatting-date-and-time/">{ __( 'Formatting Date and Time in WordPress', 'otter-pro' ) }</ExternalLink> }
							type="text"
							value={ attributes.timeCustom || '' }
							onChange={ timeCustom => changeAttributes({ timeCustom }) }
						/>
					) }
				</Fragment>
			) }

			{ 'postTerms' === attributes.type && (
				<Fragment>
					<SelectControl
						label={ __( 'Type', 'otter-pro' ) }
						value={ attributes.termType || 'categories' }
						options={ [
							{
								label: __( 'Categories', 'otter-pro' ),
								value: 'categories'
							},
							{
								label: __( 'Tags', 'otter-pro' ),
								value: 'tags'
							},
							{
								label: __( 'Custom', 'otter-pro' ),
								value: 'custom'
							}
						] }
						onChange={ termType => changeAttributes({ termType }) }
					/>

					{
						'custom' === attributes.termType && (
							<TextControl
								label={ __( 'Taxonomy', 'otter-pro' ) }
								type="text"
								placeholder={ __( 'Enter taxonomy slug', 'otter-pro' ) }
								value={ attributes.taxonomy }
								onChange={ taxonomy => changeAttributes({ taxonomy }) }
							/>
						)
					}

					<TextControl
						label={ __( 'Separator', 'otter-pro' ) }
						type="text"
						value={ attributes.termSeparator || ', ' }
						onChange={ termSeparator => changeAttributes({ termSeparator }) }
					/>
				</Fragment>
			) }


			{ ( 'acf' === attributes.type && Boolean( window.otterPro.hasACF ) ) && (
				<BaseControl
					label={ __( 'Meta Key', 'otter-pro' ) }
				>
					{ isLoaded ? (
						<select
							value={ attributes.metaKey || 'none' }
							onChange={ event => changeAttributes({ metaKey: event.target.value  }) }
							className="components-select-control__input"
						>
							<option value="none">{ __( 'Select a field', 'otter-pro' ) }</option>

							{ groups.map( group => {
								return (
									<optgroup
										key={ group?.data?.key }
										label={ group?.data?.title }
									>
										{ flattenACFOptions( group?.fields || [] ) }
									</optgroup>
								);
							}) }
						</select>
					) : <Placeholder><Spinner /></Placeholder> }
				</BaseControl>
			) }

			{ ( 'acf' === attributes.type && ! Boolean( window.otterPro.hasACF ) ) && (
				<p>{ __( 'You need to have Advanced Custom Fields plugin installed to use this feature.', 'otter-pro' ) }</p>
			) }

			{ ([ 'postMeta', 'authorMeta', 'loggedInUserMeta' ].includes( attributes.type ) ) && (
				<Fragment>
					<FormTokenField
						label={ __( 'Custom Meta Key', 'otter-pro' ) }
						value={ attributes.metaKey ? [ attributes.metaKey ] : [] }
						maxLength={ 1 }
						suggestions={ autocompleteData[ attributes.type ] }
						onChange={ metaKey => changeAttributes({ metaKey: metaKey[0] }) }
						__experimentalExpandOnFocus={ attributes.metaKey ? false : true }
						__experimentalShowHowTo={ false }
					/>

					<p>{ __( 'Type your own or select a pre-defined value. Press Enter to confirm.', 'otter-pro' ) }</p>
				</Fragment>
			) }

			{ ([ 'queryString' ].includes( attributes.type ) ) && (
				<Fragment>
					<TextControl
						label={ __( 'Parameter', 'otter-pro' ) }
						placeholder={ __( 'A query string parameter from your URL, ie utm_source.', 'otter-pro' ) }
						type="text"
						value={ attributes.parameter }
						onChange={ parameter => changeAttributes({ parameter }) }
					/>

					<SelectControl
						label={ __( 'Format', 'otter-pro' ) }
						value={ attributes.format || 'default' }
						options={ [
							{
								label: __( 'Default', 'otter-pro' ),
								value: 'default'
							},
							{
								label: __( 'Capitalize', 'otter-pro' ),
								value: 'capitalize'
							},
							{
								label: __( 'Uppercase', 'otter-pro' ),
								value: 'uppercase'
							},
							{
								label: __( 'Lowercase', 'otter-pro' ),
								value: 'lowercase'
							}
						] }
						onChange={ format => changeAttributes({ format }) }
					/>
				</Fragment>
			) }

			{ ( 'country' === attributes.type && ! Boolean( window.otterPro.hasIPHubAPI ) ) && (
				<ExternalLink href={ window.themeisleGutenberg.optionsPath }>{ __( 'Setup API to use this feature.', 'otter-pro' ) }</ExternalLink>
			) }
		</Fragment>
	);
};

export default Edit;
