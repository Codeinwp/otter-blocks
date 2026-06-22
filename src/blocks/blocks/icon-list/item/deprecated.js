/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import themeIsleIcons from './../../../helpers/themeisle-icons.js';

const attributes = {
	id: {
		type: 'string'
	},
	content: {
		type: 'string'
	},
	contentColor: {
		type: 'string'
	},
	iconColor: {
		type: 'string'
	},
	library: {
		type: 'string'
	},
	iconPrefix: {
		type: 'string'
	},
	icon: {
		type: 'string'
	}
};

const deprecated = [{
	attributes,

	migrate: oldAttributes => ({
		...oldAttributes,
		iconAlt: ''
	}),

	save: ({
		attributes
	}) => {
		const iconClassName = `${ attributes.iconPrefix } fa-${ attributes.icon }`;
		const Icon = themeIsleIcons.icons[ attributes.icon ];

		const blockProps = useBlockProps.save({
			id: attributes.id
		});

		return (
			<div { ...blockProps }>
				{
					'image' === attributes.library && attributes.icon ? (
						// eslint-disable-next-line jsx-a11y/alt-text
						<img src={ attributes.icon } />
					) : (
						'themeisle-icons' === attributes.library && attributes.icon ? (
							<Icon
								className={ classnames(
									{ 'wp-block-themeisle-blocks-icon-list-item-icon': ! attributes.iconColor },
									{ 'wp-block-themeisle-blocks-icon-list-item-icon-custom': attributes.iconColor }
								) }
							/>
						) : (
							<i
								className={ classnames(
									iconClassName,
									{ 'wp-block-themeisle-blocks-icon-list-item-icon': ! attributes.iconColor },
									{ 'wp-block-themeisle-blocks-icon-list-item-icon-custom': attributes.iconColor }
								) }
							></i>
						)
					)
				}


				<RichText.Content
					tagName="p"
					className={ classnames(
						{ 'wp-block-themeisle-blocks-icon-list-item-content': ! attributes.contentColor },
						{ 'wp-block-themeisle-blocks-icon-list-item-content-custom': attributes.contentColor }
					) }
					value={ attributes.content }
				/>
			</div>
		);
	}
}];

export default deprecated;
