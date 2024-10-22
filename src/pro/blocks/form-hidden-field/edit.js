/**
 * WordPress dependencies
 */

import { Fragment, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { RichText, useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */

import { _cssBlock } from '../../../blocks/helpers/helper-functions';
import { blockInit } from '../../../blocks/helpers/block-utility';
import metadata from '../../../blocks/blocks/form/block.json';
import Inspector from './inspector';

const { attributes: defaultAttributes } = metadata;

/**
 * Form Nonce component
 * @param {import('./types').FormHiddenFieldProps} props
 * @return
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	name
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );

		if ( undefined === attributes.id ) {
			window.oTrk?.add({ block: name, action: 'block-created', groupID: attributes.id });
		}

		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);


	const blockProps = useBlockProps({
		className: 'wp-block wp-block-themeisle-blocks-form-input'
	});

	const placeholder = attributes.paramName ? sprintf(
		/* translators: %s: URL parameter name */
		__( 'Get the value of the URL param: %s', 'otter-blocks' ),
		attributes.paramName
	) : '';

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				clientId={ clientId}
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
					htmlFor={ attributes.mappedName ?? attributes.id }
					className="otter-form-input-label"
				>
					<span className="o-hidden-field-mark">
						{ __( 'Hidden Field', 'otter-blocks' ) }
					</span>
					<RichText
						placeholder={ __( 'Type here…', 'otter-blocks' ) }
						className="otter-form-input-label__label"
						value={ attributes.label }
						onChange={ label  => setAttributes({ label }) }
						tagName="span"
					/>
				</label>

				<input
					type="text"
					placeholder={ placeholder }
					name={ attributes.mappedName ?? attributes.id }
					id={ attributes.id }
					required={ attributes.isRequired }
					disabled
					className="otter-form-input components-text-control__input"
					value={ attributes.defaultValue }
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
