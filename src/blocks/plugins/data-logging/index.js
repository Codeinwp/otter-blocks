/**
 * WordPress dependencies
 */
import { debounce } from 'lodash';

import {
	select,
	subscribe
} from '@wordpress/data';

window.themeisleGutenberg.dataLogging = {};

if ( select( 'core/editor' ) ) {
	let hasEditorLoaded = false;
	let hasSaved = false;

	let otterBlocks = [];

	let blocks = [];

	const filterBlocks = block => -1 < otterBlocks.indexOf( block.name );

	const cycleInnerBlocks = block => {
		if ( block.innerBlocks ) {
			const innerBlocks = block.innerBlocks.filter( filterBlocks );
			blocks.push( ...innerBlocks );
			innerBlocks.forEach( cycleInnerBlocks );
		}
	};

	wp.api.loadPromise.then( () => {
		const settings = new wp.api.models.Settings();

		settings.fetch().then( response => {
			if ( response.otter_blocks_logger_data && Boolean( window.themeisleGutenberg.canTrack ) ) {
				window.themeisleGutenberg.dataLogging = response.otter_blocks_logger_data;
			}
		});
	});

	const saveTrackingData = debounce( async() => {
		const { getEditorBlocks } = select( 'core/editor' );

		let editorBlocks = getEditorBlocks();
		editorBlocks = editorBlocks.filter( filterBlocks );

		const cycleInnerEditorBlocks = block => {
			if ( block.innerBlocks ) {
				const innerBlocks = block.innerBlocks.filter( filterBlocks );
				editorBlocks.push( ...innerBlocks );
				innerBlocks.forEach( cycleInnerEditorBlocks );
			}
		};

		const dataLogging = { ...window.themeisleGutenberg.dataLogging };

		if ( 0 < editorBlocks.length && dataLogging.blocks ) {

			// Get list of all blocks from the posts.
			editorBlocks.forEach( cycleInnerEditorBlocks );
			editorBlocks = editorBlocks.map( block => block.name );
			const blockObject = [];

			editorBlocks.forEach( name => {
				const obj = blockObject.find( block => block.name === name );

				if ( obj ) {
					obj.instances = obj.instances + 1;
				} else {
					blockObject.push({
						name,
						instances: 1
					});
				}
			});

			const existingBlocks = [ ...blockObject ];
			const currentBlocks = [ ...blocks ];

			// Filter to remove existing blocks from total blocks.
			existingBlocks.map( block => {
				const existingBlock = currentBlocks.find( i => i.name === block.name );

				if ( existingBlock && block.instances >= existingBlock.instances ) {
					block.instances = block.instances - existingBlock.instances;
					return block;
				}

				return block;
			});

			if ( 0 === dataLogging.blocks.length ) {
				dataLogging.blocks = [ ...existingBlocks ];
			} else {
				dataLogging.blocks.map( block => {
					const existingBlock = existingBlocks.find( i => i.name === block.name );
					const existingBlockIndex = existingBlocks.findIndex( i => i.name === block.name );

					if ( existingBlock ) {
						block.instances = block.instances + existingBlock.instances;
						existingBlocks.splice( existingBlockIndex, 1 );
						return block;
					}

					return block;
				});

				if ( 0 < existingBlocks.length ) {
					dataLogging.blocks = [ ...dataLogging.blocks, ...existingBlocks ];
				}
			}
		}

		const model = new wp.api.models.Settings({
			// eslint-disable-next-line camelcase
			otter_blocks_logger_data: dataLogging
		});

		await model.save();
	}, 1000 );

	subscribe( () => {
		const { getBlockTypes } = select( 'core/blocks' );

		const {
			__unstableIsEditorReady,
			getEditorBlocks,
			isAutosavingPost,
			isCurrentPostPublished,
			isEditedPostNew,
			isPublishingPost,
			isSavingPost
		} = select( 'core/editor' );

		const isAutoSaving = isAutosavingPost();
		const isPublishing = isPublishingPost();
		const isSaving = isSavingPost();
		const postPublished = isCurrentPostPublished();
		const blocksTypes = getBlockTypes();

		otterBlocks = blocksTypes.filter( block => 'themeisle-blocks' === block.category ).map( block => block.name );

		if ( ( isPublishing || ( postPublished && isSaving ) ) && ! isAutoSaving && Boolean( window.themeisleGutenberg.canTrack ) ) {
			hasSaved = true;
			saveTrackingData();
		}

		// Get list of existing blocks from the posts.
		if ( ! hasEditorLoaded && __unstableIsEditorReady() && ! isEditedPostNew() && ! hasSaved && Boolean( window.themeisleGutenberg.canTrack ) ) {
			hasEditorLoaded = __unstableIsEditorReady();
			blocks = getEditorBlocks();
			blocks = blocks.filter( filterBlocks );
			blocks.forEach( cycleInnerBlocks );
			blocks = blocks.map( block => block.name );
			const blockObject = [];

			blocks.forEach( name => {
				const obj = blockObject.find( block => block.name === name );

				if ( obj ) {
					obj.instances = obj.instances + 1;
				} else {
					blockObject.push({
						name,
						instances: 1
					});
				}
			});

			blocks = blockObject;
		}
	});
}
