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
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import { blockInit } from '../../../blocks/helpers/block-utility';
import { _cssBlock, pullSavedState, setSavedState } from '../../../blocks/helpers/helper-functions';
import useSettings from '../../../blocks/helpers/use-settings';
import { select } from '@wordpress/data';


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
		if ( attributes.id === undefined ) {

			// Set the default value for newly created blocks.
			setAttributes({ saveFiles: 'media-library' });
		}
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
		const fieldOptions = getOption?.( 'themeisle_blocks_form_fields_option' ) ?? [];
		const fieldIndex = fieldOptions?.findIndex( field => field.fieldOptionName === attributes.fieldOptionName );
		console.log( fieldOptions[fieldIndex]);

		if ( Boolean( window.themeisleGutenberg?.hasPro ) && attributes.fieldOptionName && 'loaded' === status ) {

			/** @type{import('../../../blocks/blocks/form/common').FieldOption[]} */
			const fieldOptions = getOption?.( 'themeisle_blocks_form_fields_option' ) ?? [];

			const fieldIndex = fieldOptions?.findIndex( field => field.fieldOptionName === attributes.fieldOptionName );

			if ( fieldIndex === undefined ) {
				return;
			}

			const isChanged = pullSavedState( attributes.id, false ) || -1 === fieldIndex;

			if ( isChanged ) {
				if ( -1 !== fieldIndex ) {
					fieldOptions[fieldIndex].options.allowedFileTypes = attributes.allowedFileTypes ? attributes.allowedFileTypes : undefined;
					fieldOptions[fieldIndex].options.maxFileSize = attributes.maxFileSize ? attributes.maxFileSize : undefined;
					fieldOptions[fieldIndex].options.saveFiles = attributes.saveFiles ? attributes.saveFiles : undefined;
					fieldOptions[fieldIndex].options.maxFilesNumber = attributes.multipleFiles ? ( attributes.maxFilesNumber ?? 10 ) : undefined;
				} else {
					fieldOptions.push({
						fieldOptionName: attributes.fieldOptionName,
						fieldOptionType: 'file',
						options: {
							allowedFileTypes: attributes.allowedFileTypes ? attributes.allowedFileTypes : undefined,
							maxFileSize: Boolean( attributes.multipleFiles ) ? ( attributes.maxFileSize ?? 10 ) : undefined,
							saveFiles: attributes.saveFiles ? attributes.saveFiles : undefined,
							maxFilesNumber: attributes.multipleFiles ? ( attributes.maxFilesNumber ?? 10 ) : undefined
						}
					});
				}

				updateOption( 'themeisle_blocks_form_fields_option', fieldOptions, __( 'Field settings saved.', 'otter-blocks' ), 'field-option' );

				setSavedState( attributes.id, false );
			}
		}
	}, [ attributes.fieldOptionName, attributes.allowedFileTypes, attributes.maxFileSize, attributes.saveFiles, attributes.multipleFiles, status ]);

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
					( attributes.helpText ) && (
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
