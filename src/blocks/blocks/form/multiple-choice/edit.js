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
import { Disabled } from '@wordpress/components';
import { isString } from 'lodash';


const { attributes: defaultAttributes } = metadata;

const Field = ({ fieldType, label, position, attributes, checked, onChange }) => {

	const id = `${attributes.id ?? ''}-field-${position}`;
	const value = label?.toLowerCase().replace( / /g, '_' );

	return (
		<div className='o-form-multiple-choice-field'>
			<Disabled>
				<input type={fieldType} id={id} name={attributes.mappedName} value={value} checked={checked} />
			</Disabled>
			<label for={id}>
				<RichText
					placeholder={ __( 'Type here…', 'otter-blocks' ) }
					className="o-form-choice-label"
					value={ label }
					onChange={ onChange }
					tagName="div"
				/>
			</label>
		</div>
	);
};

const SelectField = ({ attributes, options }) => {
	return (
		<select name={attributes.mappedName} id={attributes?.id} multiple={attributes.multipleSelection}>
			{
				options?.map( ( choice, index ) => {
					const value = choice?.content?.toLowerCase().replace( / /g, '_' );

					return <option
						key={index}
						value={value}
						selected={choice.isDefault}
					> {choice.content}</option>;
				})
			}
		</select>
	);
};

/**
 * Form Input component
 * @param {import('./types').FormMultipleChoiceInputProps} props
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

	const options = ( isString( attributes.options ) ? attributes.options?.split( '\n' )?.map( x => ({ isDefault: false, content: x }) ) : attributes.options ) ?? [];

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
					className="otter-form-input-label"
				>
					<RichText
						placeholder={ __( 'Type here..', 'otter-blocks' ) }
						className="otter-form-input-label__label"
						value={ attributes.label }
						onChange={ label => setAttributes({ label }) }
						tagName="span"
					/>

					{ attributes.isRequired && (
						<span className="required">*</span>
					) }
				</label>

				{
					'select' === attributes?.type ? <SelectField attributes={attributes} options={options} /> : (
						<div className='o-form-choices'>
							{
								options?.map( ( c, index ) => {
									return <Field
										key={index}
										fieldType={attributes.type}
										label={c.content}
										setAttributes={setAttributes}
										position={index}
										attributes={attributes}
										checked={c.isDefault}
										onChange={ ( label ) => {
											const o = [ ...options ];
											o[index] = { ...o[index], content: label };
											setAttributes({ options: o });
										}}
									/>;
								})
							}
						</div>
					)
				}

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
