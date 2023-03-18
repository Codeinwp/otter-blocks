/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalToolsPanelItem as ToolsPanelItem,
	TextControl
} from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Notice } from '../../../blocks/components';
import { RichTextEditor } from '../../../blocks/components';

const FormOptions = ( Options, formOptions, setFormOption ) => {
	return (
		<Fragment>
			{ Options }

			<ToolsPanelItem
				hasValue={ () => undefined !== formOptions.autoresponderSubject && undefined !== formOptions.autoresponderBody }
				label={ __( 'Autoresponder', 'otter-blocks' ) }
				onDeselect={ () => setFormOption({ autoresponderSubject: undefined, autoresponderBody: undefined }) }
			>
				{ Boolean( window.otterPro.isActive ) ? (
					<Fragment>
						<TextControl
							label={ __( 'Autoresponder Subject', 'otter-blocks' ) }
							placeholder={ __( 'Confirmation of your subscription', 'otter-blocks' ) }
							value={ formOptions.autoresponderSubject }
							onChange={ autoresponderSubject => setFormOption({ autoresponderSubject }) }
							help={ __( 'Enter the subject of the autoresponder email.', 'otter-blocks' ) }
						/>

						<RichTextEditor
							label={ __( 'Autoresponder Body', 'otter-blocks' ) }
							value={ formOptions.autoresponderBody }
							onChange={ autoresponderBody => setFormOption({ autoresponderBody }) }
							help={ __( 'Enter the body of the autoresponder email.', 'otter-blocks' ) }
							allowRawHTML
						/>
					</Fragment>
				) : (
					<div>
						<Notice
							notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
							instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Form Block.', 'otter-blocks' ) }
						/>
					</div>
				) }
			</ToolsPanelItem>
		</Fragment>
	);
};

addFilter( 'otter.formBlock.options', 'themeisle-gutenberg/form-block-options', FormOptions );
