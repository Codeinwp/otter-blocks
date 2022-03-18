/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

const Save = ({
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
		'data-option-name': attributes.optionName
	});

	return (
		<div { ...blockProps }>
			<form className="otter-form__container">
				<InnerBlocks.Content />

				<div className="wp-block-button">
					<button className="wp-block-button__link">
						{ attributes.submitLabel ? attributes.submitLabel : __( 'Submit', 'otter-blocks' ) }
					</button>
				</div>
			</form>
		</div>
	);
};

export default Save;
