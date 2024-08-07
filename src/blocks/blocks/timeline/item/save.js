/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';
import classnames from 'classnames';
import themeisleIcons from '../../../helpers/themeisle-icons';

const Save = ({
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
			<div class="o-timeline-container">
				<div class="o-timeline-icon">
					{
						attributes.hasIcon && (
							'image' === attributes.iconType && isURL ? (
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
				<div class="o-timeline-content">
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	);
};

export default Save;
