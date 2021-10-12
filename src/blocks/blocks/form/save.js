/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InnerBlocks } from '@wordpress/block-editor';

const Save = ({
	attributes,
	className
}) => {
	const hasIntegrationActive = attributes.provider && attributes.apiKey && attributes.listId;

	return (
		<div
			id={ attributes.id }
			className={
				classnames(
					className,
					{
						'is-subscription': hasIntegrationActive && 'subscribe' === attributes.action,
						'can-submit-and-subscribe': hasIntegrationActive && 'submit-subscribe' === attributes.action,
						'has-captcha': attributes.hasCaptcha
					}
				)
			}
			data-email-subject={ attributes.subject }
			data-option-name={ attributes.optionName }
		>
			<div className="otter-form__container">
				<InnerBlocks.Content />

				<div className="wp-block-button">
					<button className="wp-block-button__link">
						{ 'subscribe' === attributes.action ? __( 'Subscribe', 'otter-blocks' )  : __( 'Submit', 'otter-blocks' )  }
					</button>
				</div>
			</div>
		</div>
	);
};

export default Save;
