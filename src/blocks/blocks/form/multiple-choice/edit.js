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

	const switchToTextarea = () => {
		const block = createBlock( 'themeisle-blocks/form-textarea', { ...omit( attributes, [ 'type', 'multipleSelection', 'options' ]) });
		replaceBlock( clientId, block );
	};

	const switchToInput = ( inputType ) => {
		const block = createBlock( 'themeisle-blocks/form-input', { ...omit( attributes, [ 'type', 'multipleSelection', 'options' ]), type: inputType });
		replaceBlock( clientId, block );
	};


	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				selectParent={ () => selectBlock( parentClientId ) }
				switchToTextarea={ switchToTextarea }
				switchToInput={ switchToInput }
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
					( attributes?.options ?? '' )?.split( '\n' )?.map( ( label, index ) => {
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
