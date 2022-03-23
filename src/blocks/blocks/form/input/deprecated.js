import {
	useBlockProps,
	RichText
} from '@wordpress/block-editor';

import { __ } from '@wordpress/i18n';

const deprecated = [ {
	attributes: {
		id: {
			type: 'string'
		},
		type: {
			type: 'string',
			default: 'text'
		},
		'label': {
			'type': 'string'
		},
		'placeholder': {
			'type': 'string'
		},
		'isRequired': {
			'type': 'boolean'
		},
		'mappedName': {
			'type': 'string'
		}
	},

	supports: {
		align: [ 'wide', 'full' ]
	},

	save: ({
		attributes
	}) => {
		const blockProps = useBlockProps.save();

		return (
			<div { ...blockProps }>
				<label
					htmlFor={ attributes.id }
					className="otter-form-input-label"
				>
					<RichText.Content
						value={ attributes.label }
						className="otter-form-input-label__label"
						tagName="span"
					/>

					{ attributes.isRequired && (
						<span className="required">{ __( '(required)', 'otter-blocks' ) }</span>
					) }
				</label>

				<input
					type={ attributes.type }
					name={ attributes.mappedName }
					id={ attributes.id }
					required={ attributes.isRequired }
					placeholder={ attributes.placeholder }
					className="otter-form-input"
				/>
			</div>
		);
	}
} ];

export default deprecated;
