/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { debounce } from 'lodash';

import apiFetch from '@wordpress/api-fetch';

import {
	dispatch,
	select,
	subscribe
} from '@wordpress/data';

let isSavingCSS = false;

const { createNotice } = dispatch( 'core/notices' );

const savePostMeta = debounce( async() => {
	const { getCurrentPostId } = select( 'core/editor' );
	const postId = getCurrentPostId();

	createNotice(
		'info',
		__( 'Saving CSS…', 'otter-blocks' ),
		{
			isDismissible: true,
			type: 'snackbar',
			id: 'saving-css'
		}
	);

	await apiFetch({ path: `otter/v1/post_styles/${ postId }`, method: 'POST' });

	createNotice(
		'info',
		__( 'CSS saved.', 'otter-blocks' ),
		{
			isDismissible: true,
			type: 'snackbar',
			id: 'saving-css'
		}
	);

	isSavingCSS = false;
}, 1000 );

const saveWidgets = debounce( async() => {
	createNotice(
		'info',
		__( 'Saving CSS…', 'otter-blocks' ),
		{
			isDismissible: true,
			type: 'snackbar',
			id: 'saving-css'
		}
	);

	await apiFetch({ path: 'otter/v1/widget_styles', method: 'POST' });

	createNotice(
		'info',
		__( 'CSS saved.', 'otter-blocks' ),
		{
			isDismissible: true,
			type: 'snackbar',
			id: 'saving-css'
		}
	);

	isSavingCSS = false;
}, 1000 );

const reusableBlocks = {};

const checkReviewBlock = blocks => {
	return blocks.some( block => {
		if ( 'themeisle-blocks/review' === block.name ) {
			return true;
		}

		if ( 0 < block?.innerBlocks?.length ) {
			return checkReviewBlock( block.innerBlocks );
		}
	});
};

subscribe( () => {
	if ( select( 'core/edit-widgets' ) ) {
		const {
			isSavingWidgetAreas,
			getEditedWidgetAreas
		} = select( 'core/edit-widgets' );
		const editedAreas = getEditedWidgetAreas();

		if ( 0 < editedAreas.length && ! isSavingCSS ) {

			// Don't move this condition out of here. Widgets throw error in Chrome. See https://github.com/Codeinwp/otter-blocks/issues/1332
			if ( isSavingWidgetAreas() ) {
				isSavingCSS = true;
				saveWidgets();
			}
		}
	}

	if ( Boolean( window.themeisleGutenberg.isBlockEditor ) && select( 'core/editor' ) ) {
		const {
			isCurrentPostPublished,
			getEditedPostAttribute,
			isSavingPost,
			isPublishingPost,
			isAutosavingPost,
			__experimentalIsSavingReusableBlock
		} = select( 'core/editor' );

		const { __experimentalReusableBlocks } = select( 'core/block-editor' ).getSettings();

		const { isSavingEntityRecord } = select( 'core' );

		const { getBlocks } = select( 'core/block-editor' );

		const { editPost } = dispatch( 'core/editor' );

		const meta = getEditedPostAttribute( 'meta' ) || {};

		if ( undefined !== meta._themeisle_gutenberg_block_has_review ) {
			const blocks = getBlocks();
			const hasReview = checkReviewBlock( blocks );

			if ( meta._themeisle_gutenberg_block_has_review !== hasReview ) {
				editPost({
					meta: {
						'_themeisle_gutenberg_block_has_review': hasReview
					}
				});
			}
		}

		let isSavingReusableBlock;

		if ( __experimentalIsSavingReusableBlock ) {
			isSavingReusableBlock = id => __experimentalIsSavingReusableBlock( id );
		} else {
			isSavingReusableBlock = id => isSavingEntityRecord( 'postType', 'wp_block', id );
		}

		const isAutoSaving = isAutosavingPost();
		const isPublishing = isPublishingPost();
		const isSaving = isSavingPost();
		const getReusableBlocks = __experimentalReusableBlocks || [];
		const postPublished = isCurrentPostPublished();

		getReusableBlocks.forEach( block => {
			if ( block ) {
				const isBlockSaving = isSavingReusableBlock( block.id );

				if ( isBlockSaving && ! block.isTemporary ) {
					reusableBlocks[ block.id ] = {
						id: block.id,
						isSaving: true
					};
				}

				if ( ! isBlockSaving && ! block.isTemporary && !! reusableBlocks[ block.id ]) {
					if ( block.id === reusableBlocks[ block.id ].id && ( ! isBlockSaving && reusableBlocks[ block.id ].isSaving ) ) {
						reusableBlocks[ block.id ].isSaving = false;
						apiFetch({ path: `otter/v1/block_styles/${ block.id }`, method: 'POST' });
					}
				}
			}
		});

		if ( ( isPublishing || ( postPublished && isSaving ) ) && ! isAutoSaving && ! isSavingCSS ) {
			isSavingCSS = true;
			savePostMeta();
		}
	}
});
