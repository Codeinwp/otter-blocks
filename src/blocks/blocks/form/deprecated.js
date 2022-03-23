import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import classnames from 'classnames';

import { __ } from '@wordpress/i18n';

const deprecated = [ {
	attributes: {
		id: {
			type: 'string'
		},
		subject: {
			type: 'string'
		},
		emailTo: {
			type: 'string'
		},
		optionName: {
			type: 'string'
		},
		hasCaptcha: {
			type: 'boolean'
		},
		provider: {
			type: 'string',
			default: ''
		},
		apiKey: {
			type: 'string'
		},
		listId: {
			type: 'string'
		},
		action: {
			type: 'string',
			default: 'subscribe'
		}
	},

	supports: {
		align: [ 'wide', 'full' ]
	},

	save: ({
		attributes
	}) => {
		const hasIntegrationActive = attributes.provider && attributes.apiKey && attributes.listId;

		const blockProps = useBlockProps.save({
			id: attributes.id,
			className: classnames({
				'is-subscription': hasIntegrationActive && 'subscribe' === attributes.action,
				'can-submit-and-subscribe': hasIntegrationActive && 'submit-subscribe' === attributes.action,
				'has-captcha': attributes.hasCaptcha
			}),
			'data-email-subject': attributes.subject,
			'data-option-name': attributes.optionName
		});

		return (
			<div { ...blockProps }>
				<div className="otter-form__container">
					<InnerBlocks.Content />

					<div className="wp-block-button">
						<button className="wp-block-button__link">
							{ 'subscribe' === attributes.action ? __( 'Subscribe', 'otter-blocks' ) : __( 'Submit', 'otter-blocks' ) }
						</button>
					</div>
				</div>
			</div>
		);
	}
} ];

export default deprecated;
