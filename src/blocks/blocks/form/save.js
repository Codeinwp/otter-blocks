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

	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: classnames({
			'can-submit-and-subscribe': 'submit-subscribe' === attributes.action,
			'has-captcha': attributes.hasCaptcha
		}),
		'data-option-name': attributes.optionName
	});

	return (
		<div { ...blockProps }>
			<form className="otter-form__container">
				<InnerBlocks.Content />

				<div className={
					classnames(
						'wp-block-button',
						{ 'right': 'right' === attributes.submitStyle },
						{ 'full': 'full' === attributes.submitStyle },
						{ 'full-tablet': 'full' === attributes.submitStyleTablet },
						{ 'right-tablet': 'right' === attributes.submitStyleTablet },
						{ 'full-mobile': 'full' === attributes.submitStyleMobile },
						{ 'right-mobile': 'right' === attributes.submitStyleMobile }
					)}
				>
					<button
						className='wp-block-button__link'
						type='submit'
					>
						{ attributes.submitLabel ? attributes.submitLabel : __( 'Submit', 'otter-blocks' ) }
					</button>
				</div>
			</form>
		</div>
	);
};

export default Save;
