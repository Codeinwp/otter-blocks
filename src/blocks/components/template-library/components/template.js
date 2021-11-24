/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

const Template = ({
	template,
	importPreview,
	importTemplate
}) => {
	return (
		<div
			aria-label={ template.title || __( 'Untitled Gutenberg Template', 'otter-blocks' ) }
			className="library-modal-content__item"
			tabIndex="0"
		>
			<div className="library-modal-content__preview">
				<img src={ template.screenshot_url || 'https://raw.githubusercontent.com/Codeinwp/gutenberg-templates/master/assets/images/default.jpg' } />
			</div>

			<div className="library-modal-content__footer">
				<div className="library-modal-content__footer_meta">
					<h4 className="library-modal-content__footer_meta_area">
						{ ( template.title ) && (
							template.title + ( template.author && __( ' by ', 'otter-blocks' ) + template.author )
						) }

						{ ( ! template.title && template.author ) && (
							__( 'Author: ', 'otter-blocks' ) + template.author
						) }
					</h4>
				</div>

				<div className="library-modal-content__footer_actions">
					<Button
						isSecondary
						className="library-modal-overlay__actions"
						onClick={ () => importPreview( template ) }
						tabIndex="0"
					>
						{ __( 'Preview', 'otter-blocks' ) }
					</Button>

					<Button
						isPrimary
						className="library-modal-overlay__actions"
						onClick={ () => importTemplate( template.template_url ) }
						tabIndex="0"
					>
						{ __( 'Insert', 'otter-blocks' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Template;
