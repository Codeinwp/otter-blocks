/**
 * Internal dependencies
 */
import themeIsleIcons from './../../helpers/themeisle-icons';

const Save = ({
	attributes,
	className
}) => {
	const Icon = themeIsleIcons.icons[ attributes.icon ];

	return (
		<p
			className={ className }
			id={ attributes.id }
		>
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
