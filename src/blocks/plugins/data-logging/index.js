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

	// Post-deploy activation funnel. Both milestones are persisted per-site (otter_activation_first_save /
	// otter_activation_first_insert), and established sites are treated as already-activated (see fetch below).
	let activationFirstSaveDone = false;
	let activationFirstInsertFired = false;

	// Guard the milestones until the per-site state is loaded, so a fast publish can't double-fire.
	let settingsResolved = false;

	// Baseline Otter-block count at load; first-insert fires only when the count later EXCEEDS it.
	let activationInsertBaseline = null;

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

			// Per-site markers so each milestone fires once per site.
			if ( response.otter_activation_first_save ) {
				activationFirstSaveDone = true;
			}

			if ( response.otter_activation_first_insert ) {
				activationFirstInsertFired = true;
			}

			// Treat sites with prior Otter usage as already-activated, so long-time users aren't counted.
			const loggerData = response.otter_blocks_logger_data;
			const hasPriorUsage = loggerData && (
				( Array.isArray( loggerData.blocks ) && 0 < loggerData.blocks.length ) ||
				( Array.isArray( loggerData.templates ) && 0 < loggerData.templates.length )
			);

			if ( hasPriorUsage ) {
				activationFirstSaveDone = true;
				activationFirstInsertFired = true;
			}

			settingsResolved = true;
		}).catch( () => {
			settingsResolved = true;
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

		// Fail-open: a rare persist failure may slightly over-count rather than lose the milestone.
		await model.save().catch( () => {} );
	};

	/**
	 * Fire the per-site first-insert milestone and persist the marker (mirrors trackActivationFirstSave).
	 */
	const trackActivationFirstInsert = async() => {

		// Guard before the async save so concurrent ticks can't re-fire.
		activationFirstInsertFired = true;

		window.oTrk?.set( 'activation-first-insert', {
			feature: 'activation',
			featureComponent: 'first-insert',
			featureValue: 'true'
		});

		const model = new window.wp.api.models.Settings({

			otter_activation_first_insert: true
		});

		// Fail-open: a rare persist failure may slightly over-count rather than lose the milestone.
		await model.save().catch( () => {} );
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

		// PART B: first-insert. Record a baseline of Otter blocks already in the post on the first stable
		// tick; fire only when the count later exceeds it (a real insert this session), not on open.
		if ( settingsResolved && __unstableIsEditorReady() && 0 < otterBlocks.length ) {
			if ( null === activationInsertBaseline ) {
				activationInsertBaseline = countOtterBlocks();
			} else if ( ! activationFirstInsertFired && Boolean( window.themeisleGutenberg.canTrack ) && countOtterBlocks() > activationInsertBaseline ) {
				trackActivationFirstInsert();
			}
		}

		if ( ( isPublishing || ( postPublished && isSaving ) ) && ! isAutoSaving && Boolean( window.themeisleGutenberg.canTrack ) ) {
			hasSaved = true;
			saveTrackingData();

			// PART A: first-save. First non-autosave publish/save of a post with an Otter block; per-site.
			if ( settingsResolved && ! activationFirstSaveDone ) {
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
