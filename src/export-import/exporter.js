/**
 * External dependencies.
 */
import { external } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { kebabCase } from 'lodash';

import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import { serialize } from '@wordpress/blocks';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import { PluginBlockSettingsMenuItem } from '@wordpress/edit-post';
import { Fragment } from '@wordpress/element';
import { MenuGroup, MenuItem } from '@wordpress/components';

const BlocksExporter = () => {
	const OtterControlTools = window?.otterComponents?.OtterControlTools;
	const { blocks, count } = useSelect( ( select ) => {
		const {
			getSelectedBlockCount,
			getSelectedBlock,
			getMultiSelectedBlocks
		} = select( 'core/block-editor' );

		return {
			blocks:
				1 === getSelectedBlockCount() ?
					getSelectedBlock() :
					getMultiSelectedBlocks(),
			count: getSelectedBlockCount()
		};
	}, []);

	const { createNotice } = useDispatch( 'core/notices' );

	const download = ( fileName, content, contentType ) => {
		const file = new window.Blob([ content ], { type: contentType });

		// IE11 can't use the click to download technique
		// we use a specific IE11 technique instead.
		if ( window.navigator.msSaveOrOpenBlob ) {
			window.navigator.msSaveOrOpenBlob( file, fileName );
		} else {
			const a = document.createElement( 'a' );
			a.href = URL.createObjectURL( file );
			a.download = fileName;
			a.style.display = 'none';
			document.body.appendChild( a );
			a.click();
			document.body.removeChild( a );
		}
	};

	const exportBlocks = async() => {
		if ( ! blocks ) {
			return;
		}

		let data, fileName;

		if ( 1 === count && 'core/block' === blocks.name ) {
			const id = blocks.attributes.ref;
			const postType = await apiFetch({
				path: '/wp/v2/types/wp_block'
			});
			let post;

			try {
				post = await apiFetch({
					path: `/wp/v2/${ postType.rest_base }/${ id }?context=edit`
				});
			} catch ( error ) {
				if ( error.message ) {
					createNotice( 'error', error.message, {
						type: 'snackbar'
					});
				}
				return;
			}

			const title = post.title.raw;
			const content = post.content.raw;
			fileName = kebabCase( title ) + '.json';

			data = {
				__file: 'wp_block',
				title,
				content
			};
		} else {
			fileName = 'blocks-export.json';

			data = {
				__file: 'wp_export',
				version: 2,
				content: serialize( blocks )
			};
		}

		const fileContent = JSON.stringify({ ...data }, null, 2 );

		createNotice(
			'success',
			__( 'Blocks exported.', 'otter-blocks' ),
			{
				type: 'snackbar'
			}
		);

		download( fileName, fileContent, 'application/json' );
	};

	return (
		<Fragment>
			{
				OtterControlTools === undefined && (
					<PluginBlockSettingsMenuItem
						icon={ external }
						label={ __( 'Export as JSON', 'otter-blocks' ) }
						onClick={ exportBlocks }
					/>
				)
			}

			{
				OtterControlTools !== undefined && (
					<OtterControlTools order={3}>
						<MenuGroup>
							<MenuItem
								icon={ external }
								onClick={ exportBlocks }
							>
								{ __( 'Export as JSON', 'otter-blocks' ) }
							</MenuItem>
						</MenuGroup>
					</OtterControlTools>
				)
			}
		</Fragment>
	);
};

export default BlocksExporter;
