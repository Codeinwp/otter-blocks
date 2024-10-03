/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import themeIsleIcons from './../../../helpers/themeisle-icons';

const Save = ({
	attributes
}) => {
	const Icon = themeIsleIcons.icons[ attributes.icon ];

	// Border radius
	if ( ! isNaN( attributes?.borderRadius?.top ) ) {
		attributes.borderRadius.top += 'px';
	}
	if ( ! isNaN( attributes?.borderRadius?.right ) ) {
		attributes.borderRadius.right += 'px';
	}
	if ( ! isNaN( attributes?.borderRadius?.left ) ) {
		attributes.borderRadius.left += 'px';
	}
	if ( ! isNaN( attributes?.borderRadius?.bottom ) ) {
		attributes.borderRadius.bottom += 'px';
	}

	// border size
	if ( ! isNaN( attributes?.borderSize?.top ) ) {
		attributes.borderSize.top += 'px';
	}
	if ( ! isNaN( attributes?.borderSize?.right ) ) {
		attributes.borderSize.right += 'px';
	}
	if ( ! isNaN( attributes?.borderSize?.left ) ) {
		attributes.borderSize.left += 'px';
	}
	if ( ! isNaN( attributes?.borderSize?.bottom ) ) {
		attributes.borderSize.bottom += 'px';
	}

	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: 'wp-block-button'
	});

	return (
		<div { ...blockProps }>
			<a
				href={ attributes.link }
				target={ attributes.newTab ? '_blank' : '_self' }
				rel={ attributes.noFollow ? 'noopener noreferrer' : 'noopener' }
				className="wp-block-button__link"
			>
				{ ( 'left' === attributes.iconType || 'only' === attributes.iconType ) && (
					'themeisle-icons' === attributes.library && attributes.icon ? (
						<Icon
							className={ classnames(
								{ 'margin-right': 'left' === attributes.iconType }
							) }
						/>
					) : (
						<i className={ classnames(
							attributes.prefix,
							'fa-fw',
							`fa-${ attributes.icon }`,
							{ 'margin-right': 'left' === attributes.iconType }
						) }>
						</i>
					)
				) }

				{ 'only' !== attributes.iconType && (
					<RichText.Content
						tagName="span"
						value={ attributes.text }
					/>
				) }

				{ 'right' === attributes.iconType && (
					'themeisle-icons' === attributes.library && attributes.icon ? (
						<Icon className="margin-left" />
					) : (
						<i className={ `${ attributes.prefix } fa-fw fa-${ attributes.icon } margin-left` }></i>
					)
				) }
			</a>
		</div>
	);
};

export default Save;
