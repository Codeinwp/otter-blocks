/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	TextControl
} from '@wordpress/components';

import { useState } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

import { MediaUpload } from '@wordpress/media-utils';

const SiteInfo = () => {
	const [ siteTitle, setSiteTitle ] = useState( '' );
	const [ siteLogo, setSiteLogo ] = useState({});

	const replaceMediaUpload = () => MediaUpload;

	addFilter(
		'editor.MediaUpload',
		'themeisle-blocks/onboarding/replace-media-upload',
		replaceMediaUpload()
	);

	return (
		<div className="o-sidebar__controls">
			<TextControl
				label={ __( 'Site Title', 'otter-blocks' ) }
				placeholder={ __( 'Acme Corporation', 'otter-blocks' ) }
				value={ siteTitle }
				onChange={ setSiteTitle }
			/>

			<BaseControl
				label={ __( 'Upload a Logo', 'otter-blocks' ) }
			>
				<MediaUpload
					onSelect={ setSiteLogo }
					allowedTypes={ [ 'image' ] }
					value={ siteLogo?.id || '' }
					render={ ({ open }) => (
						<>
							{ ! siteLogo?.id && (
								<div
									className="o-logo__placeholder"
									onClick={ open }
								>
									{  __( 'Select or upload image', 'otter-blocks' ) }
								</div>
							) }

							{ siteLogo?.id && (
								<>
									<div
										className="o-logo__image"
										onClick={ open }
									>
										<img
											src={ siteLogo?.url }
											alt={ __( 'Site Logo', 'otter-blocks' ) }
											title={ __( 'Click to replace', 'otter-blocks' ) }
										/>
									</div>

									<div
										className="o-logo__image__controls"
									>
										<Button
											variant="secondary"
											onClick={ () => setSiteLogo({}) }
										>
											{ __( 'Remove', 'otter-blocks' ) }
										</Button>

										<Button
											variant="secondary"
											onClick={ open }
										>
											{ __( 'Replace Logo', 'otter-blocks' ) }
										</Button>
									</div>
								</>
							) }
						</>
					) }
				/>
			</BaseControl>
		</div>
	);
};

export default SiteInfo;
