/**
 * Helpers shared across the editor telemetry modules.
 */

/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

export const TRACKED_CATEGORIES = [ 'themeisle-blocks', 'atomic-wind' ];

/**
 * @return {string[]} Registered block names in tracked categories.
 */
export const getTrackedBlockNames = () =>
	select( 'core/blocks' )
		.getBlockTypes()
		.filter( blockType => TRACKED_CATEGORIES.includes( blockType.category ) )
		.map( blockType => blockType.name );

/**
 * Count tracked block instances in the editor (includes inner blocks).
 *
 * @return {number}
 */
export const countTrackedBlocks = () => {
	if ( ! select( blockEditorStore ) ) {
		return 0;
	}

	const { getGlobalBlockCount } = select( blockEditorStore );

	return getTrackedBlockNames().reduce(
		( sum, blockName ) => sum + getGlobalBlockCount( blockName ),
		0
	);
};

/**
 * Bucket a block count into a closed enum for non-PII reporting.
 *
 * @param {number} count Block count.
 * @return {string}
 */
export const getDepthBucket = count => {
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
 * Read telemetry bootstrap state localized from PHP when consent is on.
 *
 * @return {{ loggerData: Object|null, firstSaveDone: boolean, firstInsertDone: boolean }}
 */
export const getTelemetryBootstrap = () => {
	const telemetry = window.themeisleGutenberg?.telemetry || {};

	return {
		loggerData: telemetry.loggerData || null,
		firstSaveDone: Boolean( telemetry.firstSaveDone ),
		firstInsertDone: false
	};
};

/**
 * Persist a boolean site option via the Settings REST API.
 *
 * @param {string} optionName Option key.
 * @return {Promise<void>}
 */
export const persistFlag = async optionName => {
	const model = new window.wp.api.models.Settings({
		[ optionName ]: true
	});

	await model.save().catch( () => {} );
};
