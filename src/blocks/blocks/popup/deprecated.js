/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';
import classnames from 'classnames';

const v1 = {
	attributes: {
		id: {
			type: 'string'
		},
		minWidth: {
			type: [ 'number', 'string' ]
		},
		maxWidth: {
			type: [ 'number', 'string' ]
		},
		trigger: {
			type: 'string'
		},
		wait: {
			type: 'number'
		},
		anchor: {
			type: 'string'
		},
		scroll: {
			type: 'number'
		},
		showClose: {
			type: 'boolean',
			default: true
		},
		outsideClose: {
			type: 'boolean',
			default: true
		},
		anchorClose: {
			type: 'boolean',
			default: false
		},
		closeAnchor: {
			type: 'string'
		},
		recurringClose: {
			type: 'boolean',
			default: false
		},
		recurringTime: {
			type: 'number'
		},
		backgroundColor: {
			type: 'string'
		},
		closeColor: {
			type: 'string'
		},
		overlayColor: {
			type: 'string'
		},
		overlayOpacity: {
			type: 'number'
		},
		lockScrolling: {
			type: 'boolean'
		},
		padding: {
			type: 'object'
		},
		paddingTablet: {
			type: 'object'
		},
		paddingMobile: {
			type: 'object'
		},
		borderWidth: {
			type: 'object'
		},
		borderRadius: {
			type: 'object'
		},
		borderColor: {
			type: 'string'
		},
		borderStyle: {
			type: 'string'
		},
		width: {
			type: 'string'
		},
		widthTablet: {
			type: 'string'
		},
		widthMobile: {
			type: 'string'
		},
		heightMode: {
			type: 'string'
		},
		height: {
			type: 'string'
		},
		heightTablet: {
			type: 'string'
		},
		heightMobile: {
			type: 'string'
		},
		verticalPosition: {
			type: 'string'
		},
		horizontalPosition: {
			type: 'string'
		},
		verticalPositionTablet: {
			type: 'string'
		},
		horizontalPositionTablet: {
			type: 'string'
		},
		verticalPositionMobile: {
			type: 'string'
		},
		horizontalPositionMobile: {
			type: 'string'
		},
		closeButtonType: {
			type: 'string'
		},
		boxShadow: {
			type: 'object',
			default: {
				active: false,
				colorOpacity: 50,
				blur: 5,
				spread: 1,
				horizontal: 0,
				vertical: 0
			}
		},
		disableOn: {
			type: 'string'
		}
	},
	save: ({ attributes, className }) => {
		const blockProps = useBlockProps.save({
			id: attributes.id,
			className: classnames( className, 'is-front', { 'with-outside-button': 'outside' === attributes.closeButtonType }),
			'data-open': attributes.trigger,
			'data-dismiss': attributes.recurringClose ? attributes.recurringTime : '',
			'data-time': ( undefined === attributes.trigger || 'onLoad' === attributes.trigger ) ? ( attributes.wait || 0 ) : '',
			'data-anchor': 'onClick' === attributes.trigger ? attributes.anchor : '',
			'data-offset': 'onScroll' === attributes.trigger ? attributes.scroll : '',
			'data-outside': attributes.outsideClose ? attributes.outsideClose : '',
			'data-anchorclose': attributes.anchorClose ? attributes.closeAnchor : '',
			'data-lock-scrolling': attributes.lockScrolling ? '1' : undefined,
			'data-disable-on': attributes.disableOn ? attributes.disableOn : undefined
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
								<button type="button" className="components-button has-icon"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z"></path></svg></button>
							</div>
						) }

						<div className="otter-popup__modal_body">
							<InnerBlocks.Content />
						</div>
					</div>
				</div>
			</div>
		);
	}
};

export default [ v1 ];
