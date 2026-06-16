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

const CHECK_DEBOUNCE_MS = 750;

// Gate on the block-editor store, not window.themeisleGutenberg.isBlockEditor (which is post-editor only),
// so the Site Editor / FSE / widgets — where broken blocks also surface — are covered.
if ( select( 'core/block-editor' ) && select( 'core/blocks' ) ) {

	const reportedSlugs = new Set();

	let pageErrorReported = false;
	let timeoutId = null;

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

		const otterBlocks = new Set(
			getBlockTypes()
				.filter( blockType => 'themeisle-blocks' === blockType.category )
				.map( blockType => blockType.name )
		);

		const allBlocks = collectBlocks( getBlocks(), []);

		const erroredOtterBlocks = new Set();

		allBlocks.forEach( block => {
			if ( false === block.isValid && otterBlocks.has( block.name ) ) {
				erroredOtterBlocks.add( block.name );
				return;
			}

			// A core/missing block whose original type was an Otter block.
			if ( 'core/missing' === block.name ) {
				const originalName = block.attributes?.originalName;

				if ( originalName && otterBlocks.has( originalName ) ) {
					erroredOtterBlocks.add( originalName );
				}
			}
		});

		const newlyErrored = [ ...erroredOtterBlocks ].filter(
			blockSlug => ! reportedSlugs.has( blockSlug )
		);

		if ( 0 === newlyErrored.length ) {
			return;
		}

		newlyErrored.forEach( blockSlug => {
			reportedSlugs.add( blockSlug );

			window.oTrk?.set( `block-render-error-${ blockSlug }`, {
				feature: 'block-health',
				featureComponent: 'render-error',
				featureValue: blockSlug
			});
		});

		if ( ! pageErrorReported ) {
			pageErrorReported = true;

			window.oTrk?.set( 'page-has-errored-block', {
				feature: 'block-health',
				featureComponent: 'page-error',
				featureValue: '1'
			});
		}
	};

	// Stay subscribed (debounced) so late/async-resolved breakage — Otter blocks inside reusable blocks
	// or template-parts that resolve after first ready — is still caught; reportedSlugs prevents respam.
	subscribe( () => {
		const { getBlocks, __unstableIsEditorReady } = select( 'core/block-editor' );

		// Don't depend solely on the unstable __unstableIsEditorReady: treat "has blocks" as ready too.
		const blocks = getBlocks();
		const hasBlocks = Array.isArray( blocks ) && 0 < blocks.length;
		const editorReady = __unstableIsEditorReady ? __unstableIsEditorReady() : false;

		if ( ! ( hasBlocks || editorReady ) ) {
			return;
		}

		if ( 'undefined' === typeof window.oTrk ) {
			return;
		}

		if ( null !== timeoutId ) {
			clearTimeout( timeoutId );
		}

		timeoutId = setTimeout( () => {
			timeoutId = null;
			checkBlockHealth();
		}, CHECK_DEBOUNCE_MS );
	});
}
