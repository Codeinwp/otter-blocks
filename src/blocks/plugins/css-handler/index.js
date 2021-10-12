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

const { createNotice } = dispatch( 'core/notices' );

const savePostMeta = debounce( async() => {
	const { getCurrentPostId } = select( 'core/editor' );
	const postId = getCurrentPostId();

	createNotice(
		'info',
		__( 'Saving CSS…', 'otter-blocks' ),
		{
			isDismissible: true,
			type: 'snackbar'
		}
	);

	await apiFetch({ path: `themeisle-gutenberg-blocks/v1/save_post_meta/${ postId }`, method: 'POST' });

	createNotice(
		'info',
		__( 'CSS saved.', 'otter-blocks' ),
		{
			isDismissible: true,
			type: 'snackbar'
		}
	);
}, 5000 );

const saveWidgets = debounce( async() => {
	createNotice(
		'info',
		__( 'Saving CSS…', 'otter-blocks' ),
		{
			isDismissible: true,
			type: 'snackbar'
		}
	);

	await apiFetch({ path: 'themeisle-gutenberg-blocks/v1/save_widgets_styles', method: 'POST' });

	createNotice(
		'info',
		__( 'CSS saved.', 'otter-blocks' ),
		{
			isDismissible: true,
			type: 'snackbar'
		}
	);
}, 5000 );

let reusableBlocks = {};

subscribe( () => {
	if ( select( 'core/edit-widgets' ) ) {
		const {
			isSavingWidgetAreas,
			getEditedWidgetAreas
		} = select( 'core/edit-widgets' );

		const isSavingWidgets = isSavingWidgetAreas();
		const editedAreas = getEditedWidgetAreas();

		if ( isSavingWidgets && 0 < editedAreas.length ) {
			saveWidgets();
		}
	}

	if ( select( 'core/editor' ) ) {
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
			const hasReview = getBlocks().some( block => 'themeisle-blocks/review' === block.name );

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

		getReusableBlocks.map( block => {
			if ( block ) {
				const isBlockSaving = isSavingReusableBlock( block.id );

				if  ( isBlockSaving && ! block.isTemporary ) {
					reusableBlocks[ block.id ] = {
						id: block.id,
						isSaving: true
					};
				}

				if  ( ! isBlockSaving && ! block.isTemporary && !! reusableBlocks[ block.id ]) {
					if ( block.id === reusableBlocks[ block.id ].id && ( ! isBlockSaving && reusableBlocks[ block.id ].isSaving ) ) {
						reusableBlocks[ block.id ].isSaving = false;
						apiFetch({ path: `themeisle-gutenberg-blocks/v1/save_block_meta/${ block.id }`, method: 'POST' });
					}
				}
			}
		});

		if ( ( isPublishing || ( postPublished && isSaving ) ) && ! isAutoSaving ) {
			savePostMeta();
		}
	}
});
