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

	return (
		<p { ...blockProps }>
			<span className="wp-block-themeisle-blocks-font-awesome-icons-container">
				{ ( attributes.link ) ? (
					<a
						href={ attributes.link }
						target={ attributes.newTab ? '_blank' : '_self' }
						rel="noopener noreferrer"
					>
						{ 'themeisle-icons' === attributes.library ?
							<Icon/> :
							<i className={ `${ attributes.prefix } fa-${ attributes.icon }` }></i>
						}
					</a>
				) : (
					'themeisle-icons' === attributes.library ?
						<Icon/> :
						<i className={ `${ attributes.prefix } fa-${ attributes.icon }` }></i>
				) }
			</span>
		</p>
	);
};

export default Save;
