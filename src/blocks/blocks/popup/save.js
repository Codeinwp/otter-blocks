/**
 * External dependencies
 */
import { closeSmall } from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import { Button } from '@wordpress/components';

const Save = ({
	attributes
}) => {
	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: 'is-front',
		'data-open': attributes.trigger,
		'data-dismiss': attributes.recurringClose ? attributes.recurringTime : '',
		'data-time': ( undefined === attributes.trigger || 'onLoad' === attributes.trigger ) ? ( attributes.wait || 0 ) : '',
		'data-anchor': 'onClick' === attributes.trigger ? attributes.anchor : '',
		'data-offset': 'onScroll' === attributes.trigger ? attributes.scroll : '',
		'data-outside': attributes.outsideClose ? attributes.outsideClose : '',
		'data-anchorclose': attributes.anchorClose ? attributes.closeAnchor : ''
	});

	return (
		<div { ...blockProps }>
			<div className="otter-popup__modal_wrap">
				<div
					role="presentation"
					className="otter-popup__modal_wrap_overlay"
				/>

				<div className="otter-popup__modal_content">
					{ attributes.showClose && (
						<div className="otter-popup__modal_header">
							<Button icon={ closeSmall } />
						</div>
					) }

					<div className="otter-popup__modal_body">
						<InnerBlocks.Content />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Save;
