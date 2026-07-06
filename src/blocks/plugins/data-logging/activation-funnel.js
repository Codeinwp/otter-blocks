/**
 * Tracks first Otter block insert and first save activation milestones.
 */

/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';

import {
	countTrackedBlocks,
	getDepthBucket,
	persistFlag
} from './shared.js';

/** @type {{ firstSaveDone: boolean, firstInsertDone: boolean }|null} */
let state = null;

/** @type {number|null} Baseline tracked-block count at first stable editor tick. */
let insertBaseline = null;

const trackFirstInsert = () => {
	state.firstInsertDone = true;

	window.oTrk?.set( 'activation-first-insert', {
		feature: 'activation',
		featureComponent: 'first-insert',
		featureValue: 'true'
	});
};

const trackFirstSave = async otterBlockCount => {
	state.firstSaveDone = true;

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

	await persistFlag( 'otter_activation_first_save' );
};

const captureInsertBaselineIfReady = () => {
	if ( null !== insertBaseline || ! state ) {
		return;
	}

	const { __unstableIsEditorReady } = select( 'core/editor' );

	if ( __unstableIsEditorReady?.() ) {
		insertBaseline = countTrackedBlocks();
	}
};

/**
 * @param {{ firstSaveDone: boolean, firstInsertDone: boolean }} telemetryState Bootstrap state.
 */
export const startActivation = telemetryState => {
	state = telemetryState;
	insertBaseline = null;
	captureInsertBaselineIfReady();
};

/**
 * Handle editor store ticks for activation milestones.
 */
export const onActivationEditorTick = () => {
	if ( ! state ) {
		return;
	}

	const {
		isAutosavingPost,
		isSavingPost
	} = select( 'core/editor' );

	captureInsertBaselineIfReady();

	if ( isSavingPost() && ! isAutosavingPost() && ! state.firstSaveDone ) {
		const otterBlockCount = countTrackedBlocks();

		if ( 0 < otterBlockCount ) {
			trackFirstSave( otterBlockCount );
		}
	}
};

/**
 * Detect a real Otter block insertion after the baseline was captured.
 */
export const onActivationBlockTick = () => {
	if ( ! state || null === insertBaseline || state.firstInsertDone ) {
		return;
	}

	if ( countTrackedBlocks() > insertBaseline ) {
		trackFirstInsert();
	}
};
