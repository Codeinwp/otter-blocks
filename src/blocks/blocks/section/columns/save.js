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
import Separators from '../components/separators/index.js';

const Save = ({
	attributes
}) => {
	const Tag = attributes.columnsHTMLTag;

	const desktopLayout = attributes.hide ? '' : `has-desktop-${ attributes.layout }-layout`;
	const tabletLayout = attributes.hideTablet ? '' : `has-tablet-${ attributes.layoutTablet }-layout`;
	const mobileLayout = attributes.hideMobile ? '' : `has-mobile-${ attributes.layoutMobile }-layout`;

	const classes = classnames(
		`has-${ attributes.columns }-columns`,
		desktopLayout,
		tabletLayout,
		mobileLayout,
		{ 'hide-in-desktop': attributes.hide },
		{ 'hide-in-tablet': attributes.hideTablet },
		{ 'hide-in-mobile': attributes.hideMobile },
		{ 'has-reverse-columns-tablet': ( attributes.reverseColumnsTablet && ! attributes.hideTablet && 'collapsedRows' === attributes.layoutTablet ) },
		{ 'has-reverse-columns-mobile': ( attributes.reverseColumnsMobile && ! attributes.hideMobile && 'collapsedRows' === attributes.layoutMobile ) },
		`has-vertical-${ attributes.verticalAlign }`
	);

	const blockProps = useBlockProps.save({
		id: attributes.id,
		className: classes
	});

	return (
		<Tag { ...blockProps }>
			<div className="wp-block-themeisle-blocks-advanced-columns-overlay"></div>

			<Separators
				type="top"
				front={ true }
				style={ attributes.dividerTopType }
				fill={ attributes.dividerTopColor }
				invert={ attributes.dividerTopInvert }
			/>

			<div className="innerblocks-wrap">
				<InnerBlocks.Content />
			</div>

			<Separators
				type="bottom"
				front={ true }
				style={ attributes.dividerBottomType }
				fill={ attributes.dividerBottomColor }
				invert={ attributes.dividerBottomInvert }
			/>
		</Tag>
	);
};

export default Save;
