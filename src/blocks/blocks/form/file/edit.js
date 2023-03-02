import hash from 'object-hash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../../helpers/block-utility.js';
import Inspector from './inspector.js';
import { _cssBlock } from '../../../helpers/helper-functions';
import { select } from '@wordpress/data';
import useSettings from '../../../helpers/use-settings';


const { attributes: defaultAttributes } = metadata;

/**
 * Form Input component
 * @param {import('./types').FormFileProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId
}) => {
	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	/**
	 * Create the form identification tag for Otter Options.
	 */
	useEffect( () => {
		if ( attributes.id && select( 'core/edit-widgets' ) ) {
			setAttributes({ fieldOptionName: `widget_${ attributes.id.slice( -8 ) }` });
		} else if ( attributes.id ) {
			setAttributes({ fieldOptionName: `${ hash({ url: window.location.pathname }) }_${ attributes.id.slice( -8 ) }` });
		}
	}, [ attributes.id ]);

	const blockProps = useBlockProps();

	const [ getOption, updateOption, status ] = useSettings();

	useEffect( () => {

		if ( attributes.fieldOptionName && 'loaded' === status ) {

			/** @type{import('../common').FieldOption[]} */
			const fieldOptions = getOption?.( 'themeisle_blocks_form_fields_option' ) ?? [];

			const fieldIndex = fieldOptions.findIndex( field => field.fieldOptionName === attributes.fieldOptionName );

			const isChanged = (
				-1 !== fieldIndex && (
					fieldOptions[fieldIndex].options.allowedFileTypes !== attributes.allowedFileTypes ||
					fieldOptions[fieldIndex].options.maxFileSize !== attributes.maxFileSize ||
					fieldOptions[fieldIndex].options.saveFiles !== attributes.saveFiles
				) ||
				-1 === fieldIndex
			);

			if ( isChanged ) {
				if ( -1 !== fieldIndex ) {
					fieldOptions[fieldIndex].options.allowedFileTypes = attributes.allowedFileTypes;
					fieldOptions[fieldIndex].options.maxFileSize = attributes.maxFileSize;
					fieldOptions[fieldIndex].options.saveFiles = attributes.saveFiles;
				} else {
					fieldOptions.push({
						fieldOptionName: attributes.fieldOptionName,
						fieldOptionType: 'file',
						options: {
							allowedFileTypes: attributes.allowedFileTypes,
							maxFileSize: attributes.maxFileSize,
							saveFiles: attributes.saveFiles
						}
					});
				}

				updateOption( 'themeisle_blocks_form_fields_option', fieldOptions, __( 'Field settings saved.', 'otter-blocks' ), 'field-option' );
				console.count( 'New options' );
			}
		}
	}, [ attributes.fieldOptionName, attributes.allowedFileTypes, attributes.maxFileSize, attributes.saveFiles, status ]);

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				clientId={ clientId }
			/>

			<div { ...blockProps }>
				<style>
					{
						`#block-${clientId}` + _cssBlock([
							[ '--label-color', attributes.labelColor ]
						])
					}
				</style>
				<label
					htmlFor={ attributes.id }
					className="otter-form-input-label"
				>
					<RichText
						placeholder={ __( 'Type here…', 'otter-blocks' ) }
						className="otter-form-input-label__label"
						value={ attributes.label }
						onChange={ label => setAttributes({ label }) }
						tagName="span"
					/>

					{ attributes.isRequired && (
						<span className="required">*</span>
					) }
				</label>

				<input
					type={ 'file' }
					name={ attributes.id }
					id={ attributes.id }
					required={ attributes.isRequired }
					disabled
					className="otter-form-input components-text-control__input"
				/>
				{
					attributes.helpText && (
						<span
							className="o-form-help"
						>
							{ attributes.helpText }
						</span>
					)
				}
			</div>
		</Fragment>
	);
};

export default Edit;
