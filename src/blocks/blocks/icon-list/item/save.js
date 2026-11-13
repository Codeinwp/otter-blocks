/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import themeIsleIcons from './../../../helpers/themeisle-icons.js';

const Save = ({
	attributes,
	innerBlocks
}) => {
	const iconClassName = `${ attributes.iconPrefix } fa-${ attributes.icon }`;
	const Icon = themeIsleIcons.icons[ attributes.icon ];

	// The class is only present on items that hold a sub-list, so flat items keep serializing the same markup.
	const hasSubList = Array.isArray( innerBlocks ) && 0 < innerBlocks.length;

	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: hasSubList ? 'has-sublist' : undefined,
		role: 'listitem'
	});

	return (
		<div { ...blockProps }>
			{
				'image' === attributes.library && attributes.icon ? (
					<img src={ attributes.icon } alt={ attributes.iconAlt || '' } />
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

			<InnerBlocks.Content />
		</div>
	);
};

export default Save;
