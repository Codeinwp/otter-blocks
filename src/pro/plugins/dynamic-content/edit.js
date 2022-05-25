/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	ExternalLink,
	FormTokenField,
	SelectControl,
	TextControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

const Edit = ({
	attributes,
	changeAttributes
}) => {
	const { fields } = useSelect( select => {

		const { fields } = select( 'otter-pro' ).getACFData();

		return {
			fields
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
		postMeta: Object.keys( fields ),
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
						label={ __( 'Type', 'otter-blocks' ) }
						value={ attributes.dateType || 'published' }
						options={ [
							{
								label: __( 'Post Published', 'otter-blocks' ),
								value: 'published'
							},
							{
								label: __( 'Post Modified', 'otter-blocks' ),
								value: 'modified'
							}
						] }
						onChange={ dateType => changeAttributes({ dateType }) }
					/>

					<SelectControl
						label={ __( 'Format', 'otter-blocks' ) }
						value={ attributes.dateFormat || 'default' }
						options={ [
							{
								label: __( 'Default', 'otter-blocks' ),
								value: 'default'
							},
							...Object.keys( dateFormats ).map( key => ({
								label: dateFormats[ key ],
								value: key
							}) ),
							{
								label: __( 'Custom', 'otter-blocks' ),
								value: 'custom'
							}
						] }
						onChange={ dateFormat => changeAttributes({ dateFormat }) }
					/>

					{ 'custom' === attributes.dateFormat && (
						<TextControl
							label={ __( 'Custom Format', 'otter-blocks' ) }
							help={ <ExternalLink target="_blank" href="https://wordpress.org/support/article/formatting-date-and-time/">{ __( 'Formatting Date and Time in WordPress', 'otter-blocks' ) }</ExternalLink> }
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
						label={ __( 'Type', 'otter-blocks' ) }
						value={ attributes.timeType || 'published' }
						options={ [
							{
								label: __( 'Post Published', 'otter-blocks' ),
								value: 'published'
							},
							{
								label: __( 'Post Modified', 'otter-blocks' ),
								value: 'modified'
							}
						] }
						onChange={ timeType => changeAttributes({ timeType }) }
					/>

					<SelectControl
						label={ __( 'Format', 'otter-blocks' ) }
						value={ attributes.timeFormat || 'default' }
						options={ [
							{
								label: __( 'Default', 'otter-blocks' ),
								value: 'default'
							},
							...Object.keys( timeFormats ).map( key => ({
								label: timeFormats[ key ],
								value: key
							}) ),
							{
								label: __( 'Custom', 'otter-blocks' ),
								value: 'custom'
							}
						] }
						onChange={ timeFormat => changeAttributes({ timeFormat }) }
					/>

					{ 'custom' === attributes.timeFormat && (
						<TextControl
							label={ __( 'Custom Format', 'otter-blocks' ) }
							help={ <ExternalLink target="_blank" href="https://wordpress.org/support/article/formatting-date-and-time/">{ __( 'Formatting Date and Time in WordPress', 'otter-blocks' ) }</ExternalLink> }
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
						label={ __( 'Type', 'otter-blocks' ) }
						value={ attributes.termType || 'categories' }
						options={ [
							{
								label: __( 'Categories', 'otter-blocks' ),
								value: 'categories'
							},
							{
								label: __( 'Tags', 'otter-blocks' ),
								value: 'tags'
							}
						] }
						onChange={ termType => changeAttributes({ termType }) }
					/>

					<TextControl
						label={ __( 'Separator', 'otter-blocks' ) }
						type="text"
						value={ attributes.termSeparator || ', ' }
						onChange={ termSeparator => changeAttributes({ termSeparator }) }
					/>
				</Fragment>
			) }

			{ ([ 'postMeta', 'authorMeta', 'loggedInUserMeta' ].includes( attributes.type ) ) && (
				<Fragment>
					<FormTokenField
						label={ __( 'Meta', 'otter-blocks' ) }
						value={ attributes.metaKey ? [ attributes.metaKey ] : [] }
						maxLength={ 1 }
						suggestions={ autocompleteData[ attributes.type ] }
						onChange={ metaKey => changeAttributes({ metaKey: metaKey[0] }) }
						__experimentalExpandOnFocus={ true }
						__experimentalShowHowTo={ false }
					/>

					<p>{ __( 'Type your own or select a pre-defined value. Press Enter to confirm.', 'otter-blocks' ) }</p>
				</Fragment>
			) }
		</Fragment>
	);
};

export default Edit;
