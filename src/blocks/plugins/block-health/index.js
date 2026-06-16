/**
 * Block-health telemetry.
 *
 * Detects Otter blocks that fail to render (invalid markup after an update, or
 * a missing block whose original was an Otter block) and reports the affected
 * block-type slug. This surfaces the cohort whose editor is partially broken
 * after an Otter or WordPress update. Only block-type slugs are sent — never
 * any attribute values.
 */

/**
 * WordPress dependencies
 */
import {
	select,
	subscribe
} from '@wordpress/data';

if ( Boolean( window.themeisleGutenberg?.isBlockEditor ) && select( 'core/editor' ) ) {
	let hasRun = false;

	const collectBlocks = ( blocks, acc ) => {
		blocks.forEach( block => {
			acc.push( block );

			if ( block.innerBlocks && block.innerBlocks.length ) {
				collectBlocks( block.innerBlocks, acc );
			}
		});

		return acc;
	};

	const checkBlockHealth = () => {
		const { getBlockTypes } = select( 'core/blocks' );
		const { getBlocks } = select( 'core/block-editor' );

		// Set of Otter block names.
		const otterBlocks = new Set(
			getBlockTypes()
				.filter( blockType => 'themeisle-blocks' === blockType.category )
				.map( blockType => blockType.name )
		);

		const allBlocks = collectBlocks( getBlocks(), []);

		const erroredOtterBlocks = new Set();

		allBlocks.forEach( block => {
			// Invalid Otter block (markup no longer matches the saved content).
			if ( false === block.isValid && otterBlocks.has( block.name ) ) {
				erroredOtterBlocks.add( block.name );
				return;
			}

			// Missing block whose original type was an Otter block.
			if ( 'core/missing' === block.name ) {
				const originalName = block.attributes?.originalName;

				if ( originalName && otterBlocks.has( originalName ) ) {
					erroredOtterBlocks.add( originalName );
				}
			}
		});

		erroredOtterBlocks.forEach( blockSlug => {
			window.oTrk?.set( `block-render-error-${ blockSlug }`, {
				feature: 'block-health',
				featureComponent: 'render-error',
				featureValue: blockSlug
			});
		});

		if ( 0 < erroredOtterBlocks.size ) {
			window.oTrk?.set( 'page-has-errored-block', {
				feature: 'block-health',
				featureComponent: 'page-error',
				featureValue: '1'
			});
		}
	};

	// Run once per editor session, after the editor is ready.
	const unsubscribe = subscribe( () => {
		if ( hasRun ) {
			return;
		}

		const { __unstableIsEditorReady } = select( 'core/editor' );

		if ( ! ( __unstableIsEditorReady && __unstableIsEditorReady() ) ) {
			return;
		}

		hasRun = true;
		unsubscribe();
		checkBlockHealth();
	});
}
