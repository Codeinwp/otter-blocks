/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import themeisleIcons from '../../../helpers/themeisle-icons';

const attributes = {
	id: {
		type: 'string'
	},
	containerBorder: {
		type: 'object'
	},
	containerRadius: {
		type: [ 'object' ]
	},
	containerBackgroundColor: {
		type: 'string'
	},
	containerBorderColor: {
		type: 'string'
	},
	iconColor: {
		type: 'string'
	},
	hasIcon: {
		type: 'boolean',
		default: true
	},
	iconType: {
		type: 'string',
		default: 'fontawesome'
	},
	iconPrefix: {
		type: 'string',
		default: 'fas'
	},
	icon: {
		type: 'string',
		default: 'circle'
	}
};

const deprecated = [{
	attributes,

	supports: {
		align: [ 'wide', 'full' ]
	},

	migrate: oldAttributes => ({
		...oldAttributes,
		iconAlt: ''
	}),

	save: ({
		attributes,
		className
	}) => {
		const blockProps = useBlockProps.save({
			id: attributes.id,
			className: classnames( className )
		});

		const Icon = themeisleIcons.icons[ attributes.icon ];

		return (
			<div { ...blockProps }>
				<div className="o-timeline-container">
					<div className="o-timeline-icon">
						{
							attributes.hasIcon && (
								'image' === attributes.iconType && attributes.icon ? (
									// eslint-disable-next-line jsx-a11y/alt-text
									<img src={ attributes.icon } />
								) : (
									'themeisle-icons' === attributes.iconType && attributes.icon && Icon !== undefined ? (
										<Icon/>
									) : (
										<i
											className={
												`${ attributes.iconPrefix } fa-${ attributes.icon }`
											}
										></i>
									)
								)
							)
						}
					</div>
					<div className="o-timeline-content">
						<InnerBlocks.Content />
					</div>
				</div>
			</div>
		);
	}
}];

export default deprecated;
