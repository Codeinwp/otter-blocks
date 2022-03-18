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
 * Form Input component
 * @param {import('./types').FormInputProps} props
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


	useEffect( () => {
		const per = x => x ? x + '%' : x;

		/**
		 * TODO: Refactor this based on #748
		 */

		if ( inputRef.current ) {
			inputRef.current?.style?.setProperty( '--inputWidth', per( attributes.inputWidth ) );
		}
		if ( labelRef.current ) {
			labelRef.current?.style?.setProperty( '--labelColor', per( attributes.labelColor ) );
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
						<span className="required">{ __( '(required)', 'otter-blocks' ) }</span>
					) }
				</label>

				<input
					ref={inputRef}
					type={ attributes.type }
					placeholder={ attributes.placeholder }
					name={ attributes.id }
					id={ attributes.id }
					required={ attributes.isRequired }
					disabled
					className="otter-form-input components-text-control__input"
				/>
			</div>
		</Fragment>
	);
};

export default Edit;
