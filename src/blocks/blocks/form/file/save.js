/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

const Save = ({
	attributes
}) => {
	const blockProps = useBlockProps.save({
		id: attributes.id
	});

	return (
		<div { ...blockProps }>
			<label
				htmlFor={ attributes.id ? attributes.id + '-input' : '' }
				className="otter-form-input-label"
			>
				<RichText.Content
					value={ attributes.label }
					className="otter-form-input-label__label"
					tagName="span"
				/>

				{ attributes.isRequired && (
					<span className="required">*</span>
				) }
			</label>

			<input
				type={ attributes.type }
				name={ attributes.mappedName }
				id={ attributes.id ? attributes.id + '-input' : '' }
				required={ attributes.isRequired }
				placeholder={ attributes.placeholder }
				className="otter-form-input"
			/>
			{
				attributes.helpText && (
					<span className="o-form-help">
						{ attributes.helpText }
					</span>
				)
			}
		</div>
	);
};

export default Save;
