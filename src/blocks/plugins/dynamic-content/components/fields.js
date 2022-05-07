/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	isEqual,
	isEmpty
} from 'lodash';

import {
	BaseControl,
	Button,
	ExternalLink,
	SelectControl,
	TextControl,
	PanelBody
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import moment from 'moment';

const options = {
	'posts': {
		label: __( 'Posts', 'otter-blocks' ),
		options: [
			{
				label: __( 'Post ID', 'otter-blocks' ),
				value: 'postID'
			},
			{
				label: __( 'Post Title', 'otter-blocks' ),
				value: 'postTitle'
			},
			{
				label: __( 'Post Excerpt', 'otter-blocks' ),
				value: 'postExcerpt'
			},
			{
				label: __( 'Post Date', 'otter-blocks' ),
				value: 'postDate'
			},
			{
				label: __( 'Post Time', 'otter-blocks' ),
				value: 'postTime'
			},
			{
				label: __( 'Post Terms', 'otter-blocks' ),
				value: 'postTerms'
			},
			{
				label: __( 'Post Custom Field', 'otter-blocks' ),
				value: 'postMeta'
			}
		]
	},
	'site': {
		label: __( 'Site', 'otter-blocks' ),
		options: [
			{
				label: __( 'Site Title', 'otter-blocks' ),
				value: 'siteTitle'
			},
			{
				label: __( 'Site Tagline', 'otter-blocks' ),
				value: 'siteTagline'
			}
		]
	}
};

const hasSettingsPanel = [
	'postExcerpt',
	'postDate',
	'postTime',
	'postTerms',
	'postMeta'
];

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

const Fields = ({
	activeAttributes,
	attributes,
	changeAttributes,
	onChange,
	changeType
}) => {
	return (
		<Fragment>
			<PanelBody>
				<BaseControl
					label={ __( 'Data Type', 'otter-blocks' ) }
					id="o-dynamic-select"
				>
					<select
						value={ attributes.type || '' }
						onChange={ e => changeType( e.target.value ) }
						id="o-dynamic-select"
						className="components-select-control__input"
					>
						<option value="none">{ __( 'Select an option', 'otter-blocks' ) }</option>

						{ Object.keys( options ).map( i => {
							return (
								<optgroup key={ i } label={ options[i].label }>
									{ options[i].options.map( o => <option key={ o.value } value={ o.value }>{ o.label }</option> ) }
								</optgroup>
							);
						}) }
					</select>
				</BaseControl>
			</PanelBody>

			{ hasSettingsPanel.includes( attributes.type ) && (
				<PanelBody
					title={ __( 'Settings', 'otter-blocks' ) }
					initialOpen={ false }
				>
					{ 'postExcerpt' === attributes.type && (
						<TextControl
							label={ __( 'Excerpt Length', 'otter-blocks' ) }
							type="number"
							value={ attributes.length || '' }
							onChange={ length => changeAttributes({ length }) }
						/>
					) }

					{ 'postDate' === attributes.type && (
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
									instructions={ <ExternalLink target="_blank" href="https://wordpress.org/support/article/formatting-date-and-time/">{ __( 'Formatting Date and Time in WordPress', 'otter-blocks' ) }</ExternalLink> }
									type="text"
									value={ attributes.dateCustom || '' }
									onChange={ dateCustom => changeAttributes({ dateCustom }) }
								/>
							) }
						</Fragment>
					) }

					{ 'postTime' === attributes.type && (
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
									instructions={ <ExternalLink target="_blank" href="https://wordpress.org/support/article/formatting-date-and-time/">{ __( 'Formatting Date and Time in WordPress', 'otter-blocks' ) }</ExternalLink> }
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

					{ 'postMeta' === attributes.type && (
						<TextControl
							label={ __( 'Meta Key', 'otter-blocks' ) }
							type="text"
							value={ attributes.metaKey || '' }
							onChange={ metaKey => changeAttributes({ metaKey }) }
						/>
					) }
				</PanelBody>
			) }

			<PanelBody
				title={ __( 'Advanced', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Before', 'otter-blocks' ) }
					type="text"
					value={ attributes.before || '' }
					onChange={ before => changeAttributes({ before }) }
				/>

				<TextControl
					label={ __( 'After', 'otter-blocks' ) }
					type="text"
					value={ attributes.after || '' }
					onChange={ after => changeAttributes({ after }) }
				/>
			</PanelBody>

			<PanelBody>
				<Button
					isPrimary
					variant="primary"
					disabled={ isEmpty( attributes ) || isEqual( attributes, activeAttributes ) }
					onClick={ onChange }
				>
					{ __( 'Apply', 'otter-blocks' ) }
				</Button>
			</PanelBody>
		</Fragment>
	);
};

export default Fields;
