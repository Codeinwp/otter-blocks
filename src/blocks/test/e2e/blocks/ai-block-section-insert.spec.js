/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { insertParagraphAndOpenAiToolbar } from '../helpers/ai-toolbar';

/**
 * Regression test for the AI "Insert section" crash.
 *
 * The AI block generator builds a tree with `createBlock`, renders it in a
 * `BlockPreview`, then on "Insert section" hands the SAME instances to
 * `replaceBlocks`. `modal.tsx#handleApply` clones them first so the editor owns
 * fresh blocks. This spec reproduces those exact final steps with a realistic,
 * core-only generated tree (captured from a real run) and asserts the editor
 * survives the insertion instead of silently crashing the React runtime.
 *
 * Core-only on purpose: `atomic-wind/*` and `core/icon` may not be registered
 * in the test environment, so the tree below uses only blocks that always exist.
 */

// A faithful slice of a real `[AI][phase3] filledRoot` payload: a full-width
// section → heading + intro → three columns, each a card group wrapping a quote
// (with the deprecated `value`/`citation` plus inner paragraphs) and a name.
const GENERATED_TREE = {
	name: 'core/group',
	attributes: {
		tagName: 'section',
		align: 'full',
		className: 'cat-shop-testimonials-section',
		backgroundColor: 'accent-5',
		textColor: 'contrast',
		ariaLabel: 'Customer testimonials for the cat shop',
		customCSS: 'padding-top:clamp(3.5rem,7vw,6rem);padding-bottom:clamp(3.5rem,7vw,6rem);'
	},
	innerBlocks: [
		{
			name: 'core/heading',
			attributes: {
				content: 'Loved by Cats, Trusted by Their People',
				align: 'center',
				className: 'cat-shop-testimonials-heading',
				textColor: 'accent-3',
				fontSize: 'x-large',
				customCSS: 'margin-top:0;margin-bottom:0.75rem;font-weight:800;'
			},
			innerBlocks: []
		},
		{
			name: 'core/paragraph',
			attributes: {
				content: 'Real words from cat parents who found essentials their companions adore.',
				className: 'cat-shop-testimonials-intro',
				textColor: 'contrast',
				fontSize: 'medium',
				customCSS: 'max-width:720px;margin:0 auto 2.25rem;text-align:center;'
			},
			innerBlocks: []
		},
		{
			name: 'core/columns',
			attributes: {
				verticalAlignment: 'stretch',
				align: 'wide',
				className: 'cat-shop-testimonials-cards',
				customCSS: 'gap:1.5rem;'
			},
			innerBlocks: [ 'Maya Rivera', 'Oliver Bennett', 'Priya Shah' ].map( ( name ) => ({
				name: 'core/column',
				attributes: {
					verticalAlignment: 'stretch',
					className: 'cat-shop-testimonial-column'
				},
				innerBlocks: [
					{
						name: 'core/group',
						attributes: {
							tagName: 'article',
							className: 'cat-shop-testimonial-card',
							backgroundColor: 'base',
							textColor: 'contrast',
							borderColor: 'accent-1',
							ariaLabel: `Testimonial from ${ name }`,
							customCSS: 'height:100%;padding:1.65rem;border-radius:28px;border-top:6px solid;'
						},
						innerBlocks: [
							{
								name: 'core/quote',
								attributes: {
									value: '“The first toy box that actually made my cat sprint across the room.”',
									citation: `${ name }'s favorite`,
									textAlign: 'left',
									className: 'cat-shop-testimonial-quote',
									backgroundColor: 'base',
									textColor: 'contrast',
									fontSize: 'medium',
									customCSS: 'margin:0;border-left:0;padding:0;'
								},
								innerBlocks: [
									{
										name: 'core/paragraph',
										attributes: {
											content: 'I bought a little bundle for my shy rescue, and by bedtime he was batting the toys under every chair.',
											textColor: 'contrast',
											customCSS: 'margin-top:0.75rem;'
										},
										innerBlocks: []
									}
								]
							},
							{
								name: 'core/paragraph',
								attributes: {
									content: `— ${ name }`,
									className: 'cat-shop-testimonial-name',
									textColor: 'accent-3',
									fontSize: 'small',
									customCSS: 'margin-top:1.25rem;font-weight:800;'
								},
								innerBlocks: []
							}
						]
					}
				]
			}) )
		}
	]
};

test.describe( 'AI Block — Insert section', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test.afterEach( async({ otterUtils }) => {

		// Leave the shared instance as found for any other run/agent.
		await otterUtils.setAtomicWindBlocks( false ).catch( () => null );
	});

	test( 'inserting a generated section does not crash the editor', async({ editor, page }) => {

		// A target block to replace, mirroring the AI block's `replaceClientIds`.
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: { content: 'Target block.' }
		});

		// Reproduce modal.tsx#handleApply's final steps: build the tree with
		// createBlock, clone for fresh clientIds, then replaceBlocks.
		const inserted = await page.evaluate( ( tree ) => {
			const { createBlock, cloneBlock } = window.wp.blocks;

			const build = ( node ) => createBlock(
				node.name,
				node.attributes || {},
				( node.innerBlocks || [] ).map( build )
			);

			const blocks = [ build( tree ) ].map( ( block ) => cloneBlock( block ) );

			const target = window.wp.data.select( 'core/block-editor' ).getBlocks()[ 0 ];
			window.wp.data.dispatch( 'core/block-editor' ).replaceBlocks( target.clientId, blocks );

			// If the store is still alive, return the inserted root block name.
			const roots = window.wp.data.select( 'core/block-editor' ).getBlocks();
			return { count: roots.length, rootName: roots[ 0 ]?.name };
		}, GENERATED_TREE );

		// The store accepted the insertion.
		expect( inserted.rootName ).toBe( 'core/group' );

		// The editor did not fall into its top-level error boundary.
		await expect(
			page.getByText( 'The editor has encountered an unexpected error', { exact: false })
		).toBeHidden();

		// The generated content actually rendered in the (iframed) canvas — a
		// silent crash would leave the canvas blank and this would time out.
		await expect(
			editor.canvas.getByText( 'Loved by Cats, Trusted by Their People' )
		).toBeVisible();

		await expect(
			editor.canvas.getByText( '— Priya Shah' )
		).toBeVisible();
	});

	test( 'inserting generated form content does not trigger a Form inspector hook warning', async({ editor, page }) => {
		const hookWarnings = [];
		const pageErrors = [];

		page.on( 'console', message => {
			const text = message.text();
			if ( text.includes( 'React has detected a change in the order of Hooks' ) ) {
				hookWarnings.push( text );
			}
		});
		page.on( 'pageerror', error => pageErrors.push( error.message ) );

		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: { content: 'Target block.' }
		});

		const inserted = await page.evaluate( () => {
			const { createBlock, cloneBlock } = window.wp.blocks;
			const blockEditor = window.wp.data.dispatch( 'core/block-editor' );
			const target = window.wp.data.select( 'core/block-editor' ).getBlocks()[ 0 ];

			const form = createBlock(
				'themeisle-blocks/form',
				{},
				[
					createBlock( 'themeisle-blocks/form-input', { label: 'Name', type: 'text' }),
					createBlock( 'themeisle-blocks/form-input', { label: 'Email', type: 'email' }),
					createBlock( 'themeisle-blocks/form-textarea', { label: 'Message' })
				]
			);
			const formToInsert = cloneBlock( form );

			blockEditor.replaceBlocks( target.clientId, [ formToInsert ]);
			blockEditor.selectBlock( formToInsert.clientId );

			return { rootName: formToInsert.name };
		});

		expect( inserted.rootName ).toBe( 'themeisle-blocks/form' );

		await expect( page.getByText( 'Form Options' ) ).toBeVisible({ timeout: 20000 });
		await expect( page.getByText( 'Email To' ).first() ).toBeVisible();

		await expect(
			page.getByText( 'The editor has encountered an unexpected error', { exact: false })
		).toBeHidden();
		expect( hookWarnings ).toEqual([]);
		expect( pageErrors ).toEqual([]);
	});

	test( 'inserting a generated section with icon/atomic blocks does not crash the editor', async({ editor, page, admin, otterUtils }) => {

		// Atomic Wind blocks only register when their option is on. Flip it, then
		// reload the editor so they are available. Skip cleanly on environments
		// whose e2e mu-plugin predates the option (it can't be toggled there).
		const atomicWindEnabled = await otterUtils.setAtomicWindBlocks( true )
			.then( () => true )
			.catch( () => false );

		test.skip( ! atomicWindEnabled, 'Atomic Wind option is not settable in this environment (e2e mu-plugin out of sync).' );

		await admin.createNewPost();

		// A features tree captured from a real run: each card has an icon block
		// whose slug (zap/shield-check/sparkles) resolves via /wp/v2/icons — the
		// slugs seen 404-ing in the console. Icon + atomic-wind blocks carry large
		// attribute sets and are the prime suspects for the post-insert crash.
		const FEATURES_TREE = {
			name: 'core/group',
			attributes: {
				tagName: 'section',
				align: 'full',
				className: 'features-section',
				backgroundColor: 'accent-5',
				textColor: 'contrast'
			},
			innerBlocks: [
				{
					name: 'core/heading',
					attributes: { content: 'Three key product benefits', level: 2, align: 'center' },
					innerBlocks: []
				},
				{
					name: 'core/columns',
					attributes: { verticalAlignment: 'top', align: 'wide' },
					innerBlocks: [
						{ icon: 'zap', title: 'Faster everyday workflows' },
						{ icon: 'shield-check', title: 'Built-in confidence' },
						{ icon: 'sparkles', title: 'A smoother experience' }
					].map( ( card ) => ({
						name: 'core/column',
						attributes: { verticalAlignment: 'top', width: '33.33%' },
						innerBlocks: [
							{
								name: 'atomic-wind/box',
								attributes: { tagName: 'article', className: 'flex h-full flex-col gap-6 rounded-[22px] bg-[#FFFFFF] p-8' },
								innerBlocks: [
									{
										name: 'atomic-wind/icon',
										attributes: { icon: card.icon, className: 'h-14 w-14 rounded-[18px] p-3' },
										innerBlocks: []
									},
									{
										name: 'core/icon',
										attributes: { icon: card.icon, align: 'left', backgroundColor: 'accent-6', textColor: 'accent-3' },
										innerBlocks: []
									},
									{
										name: 'core/heading',
										attributes: { content: card.title, level: 3 },
										innerBlocks: []
									},
									{
										name: 'core/paragraph',
										attributes: { content: 'Bring routine tasks into one clear flow.' },
										innerBlocks: []
									}
								]
							}
						]
					}) )
				}
			]
		};

		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: { content: 'Target block.' }
		});

		// Build the tree, but substitute any block not registered in this env with
		// a paragraph placeholder so the test adapts instead of asserting on a
		// "missing block". Report which AI-shaped blocks were actually exercised.
		const result = await page.evaluate( ( tree ) => {
			const { createBlock, cloneBlock, getBlockType } = window.wp.blocks;
			const exercised = new Set();

			const build = ( node ) => {
				const registered = Boolean( getBlockType( node.name ) );
				if ( registered ) {
					exercised.add( node.name );
				}
				const name = registered ? node.name : 'core/paragraph';
				const attributes = registered ? ( node.attributes || {}) : { content: '' };
				return createBlock( name, attributes, ( node.innerBlocks || [] ).map( build ) );
			};

			const blocks = [ build( tree ) ].map( ( block ) => cloneBlock( block ) );
			const target = window.wp.data.select( 'core/block-editor' ).getBlocks()[ 0 ];
			window.wp.data.dispatch( 'core/block-editor' ).replaceBlocks( target.clientId, blocks );

			return {
				exercised: Array.from( exercised ),
				count: window.wp.data.select( 'core/block-editor' ).getBlocks().length
			};
		}, FEATURES_TREE );

		// Surface which AI-shaped blocks this env actually exercised (icon /
		// atomic-wind only count when registered).
		// eslint-disable-next-line no-console
		console.log( '[e2e] exercised blocks:', result.exercised.join( ', ' ) );

		// The fixture must have registered the Atomic Wind blocks, otherwise this
		// case silently degrades to core-only and would not reproduce the crash.
		expect( result.exercised ).toContain( 'atomic-wind/box' );
		expect( result.exercised ).toContain( 'atomic-wind/icon' );

		await expect(
			page.getByText( 'The editor has encountered an unexpected error', { exact: false })
		).toBeHidden();

		// A silent crash blanks the canvas; this heading must still render.
		await expect(
			editor.canvas.getByText( 'Three key product benefits' )
		).toBeVisible();
	});
});

/**
 * The faithful reproduction: drive the real AI toolbar → generate → Insert
 * section flow. This replaces the *selected block* while the modal and its live
 * BlockPreview unmount — the one interaction the store-only cases above can't
 * cover. The AI stub returns an Atomic Wind features tree (see the e2e
 * bootstrap), so the inserted blocks match what the model produces in prod.
 */
test.describe( 'AI Toolbar — section insertion (full modal)', () => {
	const PRESEEDED_OPENAI_KEY = 'sk_XXXXXXXXXXXXXXXXXXXXXXxx';

	test.beforeEach( async({ admin, otterUtils }) => {
		await otterUtils.reset();
		await otterUtils.setAtomicWindBlocks( true ).catch( () => null );
		await otterUtils.setOptions({
			themeisle_open_ai_api_key: PRESEEDED_OPENAI_KEY,
			themeisle_blocks_settings_block_ai_toolbar_module: true,

			// An "any" action makes the modal render the section-generation UI.
			themeisle_blocks_settings_ai_toolbar_actions: [
				{
					id: 'generate-section',
					title: 'Generate Section',
					prompt: 'Create a features section about our product.',
					enabled: true,
					custom: true,
					availability: 'any',
					type: 'prompt'
				}
			]
		});
		await otterUtils.seedPrompts();
		await admin.createNewPost();
	});

	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setAtomicWindBlocks( false ).catch( () => null );
	});

	test( 'generating and inserting an Atomic Wind section does not crash the editor', async({ editor, page }) => {

		// Skip cleanly where Atomic Wind could not be registered (env mu-plugin
		// out of sync / option not settable).
		const atomicRegistered = await page.evaluate(
			() => Boolean( window.wp?.blocks?.getBlockType?.( 'atomic-wind/box' ) )
		);
		test.skip( ! atomicRegistered, 'Atomic Wind blocks are not registered in this environment.' );

		await insertParagraphAndOpenAiToolbar( page, editor, 'Replace me with a section.' );
		await page.getByRole( 'menuitem', { name: 'Generate Section' }).click();

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		await dialog.getByRole( 'button', { name: 'Generate', exact: true }).click();

		// Result ready → Insert section enables. Generation is two stubbed phases.
		const insertButton = dialog.getByRole( 'button', { name: 'Insert section' });
		await expect( insertButton ).toBeEnabled({ timeout: 30000 });
		await insertButton.click();

		// The modal closes and the editor stays alive.
		await expect( dialog ).toBeHidden();
		await expect(
			page.getByText( 'The editor has encountered an unexpected error', { exact: false })
		).toBeHidden();

		// The selected block was replaced and the generated section rendered.
		await expect( editor.canvas.getByText( 'Replace me with a section.' ) ).toBeHidden();
		await expect(
			editor.canvas.getByText( 'Rewritten content for testing.' ).first()
		).toBeVisible();
	});

	test( 'closing the AI Block generator after generation does not crash the editor', async({ editor, page }) => {
		const pageErrors = [];
		page.on( 'pageerror', error => pageErrors.push( error.message ) );

		await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'section'
			}
		});

		await editor.canvas
			.getByPlaceholder( 'e.g. A hero section for a dental clinic with a heading and two buttons' )
			.fill( 'A feature section for a project management app.' );

		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		const insertButton = dialog.getByRole( 'button', { name: 'Insert section' });
		await expect( insertButton ).toBeEnabled({ timeout: 30000 });

		await dialog.getByRole( 'button', { name: 'Discard' }).click();

		await expect( dialog ).toBeHidden();
		await expect(
			page.getByText( 'The editor has encountered an unexpected error', { exact: false })
		).toBeHidden();

		const blocks = await editor.getBlocks();
		expect( blocks.every( block => 'themeisle-blocks/content-generator' !== block.name ) ).toBe( true );
		expect( pageErrors ).toEqual([]);
	});

	test( 'inserting from the AI Block generator does not run discard cleanup after apply', async({ editor, page }) => {
		const pageErrors = [];
		page.on( 'pageerror', error => pageErrors.push( error.message ) );

		await editor.insertBlock({
			name: 'themeisle-blocks/content-generator',
			attributes: {
				promptID: 'section'
			}
		});

		await editor.canvas
			.getByPlaceholder( 'e.g. A hero section for a dental clinic with a heading and two buttons' )
			.fill( 'A feature section for a project management app.' );

		await editor.canvas.getByRole( 'button', { name: 'Generate' }).click();

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		const insertButton = dialog.getByRole( 'button', { name: 'Insert section' });
		await expect( insertButton ).toBeEnabled({ timeout: 30000 });
		await insertButton.click();

		await expect( dialog ).toBeHidden();
		await expect(
			page.getByText( 'The editor has encountered an unexpected error', { exact: false })
		).toBeHidden();

		const blocks = await editor.getBlocks();
		expect( blocks.every( block => 'themeisle-blocks/content-generator' !== block.name ) ).toBe( true );
		await expect(
			editor.canvas.getByText( 'Rewritten content for testing.' ).first()
		).toBeVisible();
		expect( pageErrors ).toEqual([]);
	});
});
