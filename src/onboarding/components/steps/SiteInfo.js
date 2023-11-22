/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	TextControl
} from '@wordpress/components';

import {
	useDispatch,
	useSelect,
	select
} from '@wordpress/data';

import { MediaUpload } from '@wordpress/media-utils';

const SiteInfo = () => {
	const {
		title,
		siteLogo,
		siteLogoURL
	} = useSelect( select => {
		const {
			getEditedEntityRecord,
			getMedia
		} = select( 'core' );

		const settings = getEditedEntityRecord( 'root', 'site' );
		const siteLogoURL = settings?.site_logo ? getMedia( settings?.site_logo, { context: 'view' }) : null;

		return {
			title: settings?.title,
			siteLogo: settings?.site_logo,
			siteLogoURL: siteLogoURL?.source_url
		};
	}, []);

	const { editEntityRecord } = useDispatch( 'core' );
	const { replaceBlock } = useDispatch( 'core/block-editor' );
	const { setEditedEntity } = useDispatch( 'core/edit-site' );

	const setTitle = newTitle => {
		editEntityRecord( 'root', 'site', undefined, {
			title: newTitle
		});
	};

	const findBlock = ( blocksAr, name ) => {
		const foundBlock = blocksAr.find( block => block.name === name );

		if ( foundBlock ) {
			return foundBlock;
		}

		return blocksAr.reduce( ( found, block ) => {
			if ( found ) {
				return found;
			}

			if ( block.innerBlocks && Array.isArray( block.innerBlocks ) ) {
				return findBlock( block.innerBlocks, name );
			}

			return undefined;
		}, undefined );
	};

	const onOpenMedia = open => {
		setEditedEntity( 'wp_template_part', 'raft//header', 'edit' );
		open();
	};

	const setLogo = ( newLogo ) => {
		const blocks = select( 'core/block-editor' ).getBlocks();

		let siteLogoBlock = findBlock( blocks, 'core/site-logo' );

		if ( ! siteLogoBlock ) {
			const siteTitleBlock = findBlock( blocks, 'core/site-title' );

			if ( siteTitleBlock ) {

				replaceBlock( siteTitleBlock.clientId, wp.blocks.createBlock(
					'core/site-logo',
					{
						attributes: {
							...siteTitleBlock.attributes
						}
					}
				) );
			}
		}

		editEntityRecord( 'root', 'site', undefined, {
			'site_logo': newLogo?.id
		});
	};

	const removeLogo = () => {
		const blocks = select( 'core/block-editor' ).getBlocks();

		let siteLogoBlock = findBlock( blocks, 'core/site-logo' );

		if ( siteLogoBlock ) {
			replaceBlock( siteLogoBlock.clientId, wp.blocks.createBlock(
				'core/site-title',
				{
					attributes: {
						...siteLogoBlock.attributes
					}
				}
			) );
		}

		editEntityRecord( 'root', 'site', undefined, {
			'site_logo': null
		});
	};

	return (
		<div className="o-sidebar__controls">
			<TextControl
				label={ __( 'Site Title', 'otter-blocks' ) }
				placeholder={ __( 'Acme Corporation', 'otter-blocks' ) }
				value={ title }
				onChange={ setTitle }
			/>

			<BaseControl
				label={ __( 'Upload a Logo', 'otter-blocks' ) }
			>
				<MediaUpload
					onSelect={ setLogo }
					allowedTypes={ [ 'image' ] }
					value={ siteLogo || '' }
					render={ ({ open }) => (
						<>
							{ ! siteLogo && (
								<div
									className="o-logo__placeholder"
									onClick={ () => onOpenMedia( open ) }
								>
									{  __( 'Select or upload image', 'otter-blocks' ) }
								</div>
							) }

							{ siteLogo && (
								<>
									<div
										className="o-logo__image"
										onClick={ () => onOpenMedia( open ) }
									>
										<img
											src={ siteLogoURL }
											alt={ __( 'Site Logo', 'otter-blocks' ) }
											title={ __( 'Click to replace', 'otter-blocks' ) }
										/>
									</div>

									<div
										className="o-logo__image__controls"
									>
										<Button
											variant="secondary"
											onClick={ removeLogo }
										>
											{ __( 'Remove', 'otter-blocks' ) }
										</Button>

										<Button
											variant="secondary"
											onClick={ () => onOpenMedia( open ) }
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
