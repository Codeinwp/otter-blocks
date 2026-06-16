/**
 * WordPress dependencies
 */
import { debounce } from 'lodash';

import {
	select,
	subscribe
} from '@wordpress/data';

window.themeisleGutenberg.dataLogging = {};

if ( Boolean( window.themeisleGutenberg.isBlockEditor ) && select( 'core/editor' ) ) {
	let hasEditorLoaded = false;
	let hasSaved = false;

	// Activation funnel state.
	// `activationFirstSaveDone` is persisted per-site via the `otter_activation_first_save`
	// option so the first-save milestone fires exactly once per site (not once per browser).
	// `activationFirstInsertFired` is a once-per-session guard for the first-insert milestone.
	let activationFirstSaveDone = false;
	let activationFirstInsertFired = false;

	let otterBlocks = [];

	let blocks = [];

	/**
	 * Bucket a count of Otter blocks into a closed enum for non-PII reporting.
	 *
	 * @param {number} count Number of Otter blocks present.
	 * @return {string} One of '1', '2-3', '4-10', '10+'.
	 */
	const getDepthBucket = count => {
		if ( 1 >= count ) {
			return '1';
		}
		if ( 3 >= count ) {
			return '2-3';
		}
		if ( 10 >= count ) {
			return '4-10';
		}
		return '10+';
	};

	/**
	 * Count Otter blocks (themeisle-blocks category) currently in the editor, including inner blocks.
	 *
	 * @return {number} Total number of Otter block instances present.
	 */
	const countOtterBlocks = () => {
		const { getEditorBlocks } = select( 'core/editor' );

		let count = 0;

		const cycle = block => {
			if ( filterBlocks( block ) ) {
				count++;
			}
			if ( block.innerBlocks ) {
				block.innerBlocks.forEach( cycle );
			}
		};

		getEditorBlocks().forEach( cycle );

		return count;
	};

	const filterBlocks = block => -1 < otterBlocks.indexOf( block.name );

	const cycleInnerBlocks = block => {
		if ( block.innerBlocks ) {
			const innerBlocks = block.innerBlocks.filter( filterBlocks );
			blocks.push( ...innerBlocks );
			innerBlocks.forEach( cycleInnerBlocks );
		}
	};

	window.wp.api.loadPromise.then( () => {
		const settings = new window.wp.api.models.Settings();

		settings.fetch().then( response => {
			if ( response.otter_blocks_logger_data && Boolean( window.themeisleGutenberg.canTrack ) ) {
				window.themeisleGutenberg.dataLogging = response.otter_blocks_logger_data;
			}

			// Persisted per-site marker so the first-save milestone fires once per site.
			if ( response.otter_activation_first_save ) {
				activationFirstSaveDone = true;
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

		const model = new window.wp.api.models.Settings({
			 
			otter_blocks_logger_data: dataLogging
		});

		await model.save();
	}, 1000 );

	/**
	 * Fire the per-site first-save activation milestone and persist the marker.
	 *
	 * Mirrors the `otter_blocks_logger_data` mechanism: the `already fired` state lives in
	 * the `otter_activation_first_save` WordPress option (written via the Settings store),
	 * so this fires exactly once per site rather than once per browser.
	 *
	 * @param {number} otterBlockCount Number of Otter blocks present at save time.
	 */
	const trackActivationFirstSave = async otterBlockCount => {

		// Guard immediately so concurrent subscribe ticks before the save resolves cannot re-fire.
		activationFirstSaveDone = true;

		window.oTrk?.set( 'activation-first-save', {
			feature: 'activation',
			featureComponent: 'first-save',
			featureValue: 'true'
		});

		window.oTrk?.set( 'activation-first-save-depth', {
			feature: 'activation',
			featureComponent: 'first-save-depth',
			featureValue: getDepthBucket( otterBlockCount )
		});

		const model = new window.wp.api.models.Settings({

			otter_activation_first_save: true
		});

		await model.save();
	};

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

		// PART B: first-insert milestone. Detect, via the store subscription, the first time an
		// Otter-category block exists in the editor and fire once (once-per-session guard). This is
		// intentionally NOT gated on save so the insert -> save drop-off remains computable.
		if ( ! activationFirstInsertFired && Boolean( window.themeisleGutenberg.canTrack ) && 0 < otterBlocks.length && 0 < countOtterBlocks() ) {
			activationFirstInsertFired = true;
			window.oTrk?.set( 'activation-first-insert', {
				feature: 'activation',
				featureComponent: 'first-insert',
				featureValue: 'true'
			});
		}

		if ( ( isPublishing || ( postPublished && isSaving ) ) && ! isAutoSaving && Boolean( window.themeisleGutenberg.canTrack ) ) {
			hasSaved = true;
			saveTrackingData();

			// PART A: first-save milestone. On the first non-autosave publish/save of a post that
			// contains at least one Otter block, fire the per-site once milestone + depth bucket.
			if ( ! activationFirstSaveDone ) {
				const otterBlockCount = countOtterBlocks();

				if ( 0 < otterBlockCount ) {
					trackActivationFirstSave( otterBlockCount );
				}
			}
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
