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
import { dispatch, select, useSelect } from '@wordpress/data';
import DeferedWpOptionsSave from '../../../blocks/helpers/defered-wp-options-save';


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

	const { canSaveData } = useSelect( select => {
		const isSavingPost = select( 'core/editor' )?.isSavingPost();
		const isPublishingPost = select( 'core/editor' )?.isPublishingPost();
		const isAutosaving = select( 'core/editor' )?.isAutosavingPost();
		const widgetSaving = select( 'core/edit-widgets' )?.isSavingWidgetAreas();

		return {
			canSaveData: ( ! isAutosaving && ( isSavingPost || isPublishingPost ) ) || widgetSaving
		};
	});

	const { createNotice } = dispatch( 'core/notices' );

	/**
	 * Prevent saving data if the block is inside an AI block. This will prevent polluting the wp_options table.
	 */
	const isInsideAiBlock = useSelect( select => {
		const {
			getBlockParentsByBlockName
		} = select( 'core/block-editor' );

		const parents = getBlockParentsByBlockName( clientId, 'themeisle-blocks/content-generator' );
		return 0 < parents?.length;
	}, [ clientId ]);

	useEffect( () => {
		if ( canSaveData && ! isInsideAiBlock ) {
			( new DeferedWpOptionsSave() ).save( 'field_options', {
				fieldOptionName: attributes.fieldOptionName,
				fieldOptionType: 'file',
				options: {
					allowedFileTypes: attributes.allowedFileTypes ? attributes.allowedFileTypes : undefined,
					maxFileSize: Boolean( attributes.multipleFiles ) ? ( attributes.maxFileSize ?? 10 ) : undefined,
					saveFiles: attributes.saveFiles ? attributes.saveFiles : undefined,
					maxFilesNumber: attributes.multipleFiles ? ( attributes.maxFilesNumber ?? 10 ) : undefined
				}
			}, ( res, error ) => {
				if ( error ) {
					createNotice( 'error', __( 'Error saving File Field settings.', 'otter-blocks' ), {
						isDismissible: true,
						type: 'snackbar',
						id: 'file-field-option-error'
					});
				} else {
					createNotice( 'info', __( 'File Field settings saved.', 'otter-blocks' ), {
						isDismissible: true,
						type: 'snackbar',
						id: 'file-field-option-success'
					});
				}
			});
		}
	}, [ canSaveData ]);

	const blockProps = useBlockProps();

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
