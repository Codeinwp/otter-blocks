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

import { useDispatch, useSelect } from '@wordpress/data';

import { omit } from 'lodash';

import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../../helpers/block-utility.js';
import Inspector from './inspector.js';
import { _cssBlock } from '../../../helpers/helper-functions';


const { attributes: defaultAttributes } = metadata;

const Field = ({ fieldType, label, setAttributes, position, attributes }) => {

	const id = `${attributes.id ?? ''}-field-${position}`;
	const value = label?.toLowerCase().replace( / /g, '_' );

	const onChangeLabel = label => {
		const options = attributes.options?.split( '\n' ) ?? [];
		if ( options.length < position ) {
			return;
		}

		options[ position ] = label;
		setAttributes({ options: options.join( '\n' ) });
	};

	return (
		<div className='o-form-multiple-choice-field'>
			<input type={fieldType} id={id} name={attributes.mappedName} value={value} />
			<label for={id}>
				<RichText
					placeholder={ __( 'Type here…', 'otter-blocks' ) }
					className="o-form-choice-label"
					value={ label }
					onChange={ onChangeLabel }
					tagName="div"
				/>
			</label>
		</div>
	);
};

const SelectField = ({ attributes }) => {
	return (
		<select name={attributes.mappedName} id={attributes?.id}>
			{
				( attributes?.options ?? '' )?.split( '\n' )?.map( ( label, index ) => {
					const value = label?.toLowerCase().replace( / /g, '_' );

					return <option
						key={index}
						value={value}
					> {label}</option>;
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

	const {
		parentClientId
	} = useSelect( select => {
		const {
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );

		if ( ! clientId ) {
			return {
				parentClientId: ''
			};
		}

		const parentClientId = getBlockRootClientId( clientId );

		return {
			parentClientId: parentClientId ?? ''
		};
	}, [ clientId ]);

	const { selectBlock, replaceBlock } = useDispatch( 'core/block-editor' );

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				selectParent={ () => selectBlock( parentClientId ) }
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
					'select' === attributes?.type ? <SelectField attributes={attributes} /> : ( attributes?.options ?? '' )?.split( '\n' )?.map( ( label, index ) => {
						return <Field
							key={index}
							fieldType={attributes.type}
							label={label}
							setAttributes={setAttributes}
							position={index}
							attributes={attributes}
						/>;
					})
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
