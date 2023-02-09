/**
 * External dependencies
 */
import classnames from 'classnames';
import { isNumber } from 'lodash';

/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import themeIsleIcons from './../../helpers/themeisle-icons';

const Save = ({
	attributes
}) => {
	const Icon = themeIsleIcons.icons[ attributes.icon ];

	const blockProps = useBlockProps.save({
		id: attributes.id
	});

	const classes = classnames(
		`${ attributes.prefix }`,
		`fa-${ attributes.icon }`,
		{ 'fa-fw': ! isNumber( attributes.padding ) }
	);

	return (
		<div { ...blockProps }>
			<span className={ classnames(
				'wp-block-themeisle-blocks-font-awesome-icons-container',
				{ 'nan-padding': ! isNumber( attributes.padding ) }
			)}>
				{ ( attributes.link ) ? (
					<a
						href={ attributes.link }
						target={ attributes.newTab ? '_blank' : '_self' }
						rel="noopener noreferrer"
					>
						{ 'themeisle-icons' === attributes.library ?
							<Icon/> :
							<i className={ classes }></i>
						}
					</a>
				) : (
					'themeisle-icons' === attributes.library ?
						<Icon/> :
						<i className={ classes }></i>
				) }
			</span>
		</div>
	);
};

export default Save;
