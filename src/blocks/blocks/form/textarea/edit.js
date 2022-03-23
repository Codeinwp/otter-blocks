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
	useRef
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../../helpers/block-utility.js';
import Inspector from './inspector.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Form Textarea component
 * @param {import('./types').FormTextareaProps} props
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

	const blockProps = useBlockProps();

	const labelRef = useRef( null );
	const inputRef = useRef( null );
	const helpRef = useRef( null );


	useEffect( () => {
		const per = x => x ? x + '%' : x;

		/**
		 * TODO: Refactor this based on #748
		 */

		if ( inputRef.current ) {
			inputRef.current?.style?.setProperty( '--inputWidth', per( attributes.inputWidth ) );
		}
		if ( labelRef.current ) {
			labelRef.current?.style?.setProperty( '--labelColor',  attributes.labelColor || null );
		}
		if ( helpRef.current ) {
			helpRef.current?.style?.setProperty( '--labelColor', attributes.labelColor || null );
		}
	}, [ inputRef.current, labelRef.current, attributes ]);

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				<label
					ref={labelRef}
					htmlFor={ attributes.id ? attributes.id + '-input' : '' }
					className="otter-form-textarea-label"
				>
					<RichText
						placeholder={ __( 'Type here…', 'otter-blocks' ) }
						className="otter-form-textarea-label__label"
						value={ attributes.label }
						onChange={ label => setAttributes({ label }) }
						tagName="span"
					/>

					{ attributes.isRequired && (
						<span className="required">*</span>
					) }
				</label>

				<textarea
					ref={inputRef}
					placeholder={ attributes.placeholder }
					name={ attributes.id }
					id={ attributes.id ? attributes.id + '-input' : '' }
					required={ attributes.isRequired }
					disabled
					rows={ 10 }
					className="otter-form-textarea-input components-textarea-control__input"
				>
				</textarea>
				{
					attributes.helpText && (
						<span
							className="o-form-help"
							ref={helpRef}
						>
							{attributes.helpText}
						</span>
					)
				}
			</div>
		</Fragment>
	);
};

export default Edit;
