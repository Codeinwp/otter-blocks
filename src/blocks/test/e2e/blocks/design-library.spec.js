/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { waitForEditorReady } from '../helpers/editor';
import {
	setAtomicWind,
	openLibrary,
	waitForGrid,
	firstCard,
	resultCount
} from '../helpers/design-library';

test.describe( 'Design Library', () => {

	// The library only renders its templates once the Atomic Wind blocks they
	// are built on are registered, which happens server-side at editor load —
	// so the option is flipped before createNewPost(), not after.
	test.describe( 'Atomic Wind gate', () => {
		test.beforeEach( async({ otterUtils, admin }) => {
			await setAtomicWind( otterUtils, false );
			await admin.createNewPost();
		});

		test( 'prompts to enable Atomic Wind blocks when they are disabled', async({ page }) => {
			await openLibrary( page );

			await expect(
				page.getByRole( 'heading', { name: 'Atomic Wind blocks are required' })
			).toBeVisible();

			await expect(
				page.getByRole( 'button', { name: 'Enable Atomic Wind blocks' })
			).toBeVisible();

			// The browsing UI is replaced by the gate, not just hidden behind it.
			await expect( page.locator( '.o-library__grid' ) ).toHaveCount( 0 );
			await expect( page.locator( '.o-library__sidebar' ) ).toHaveCount( 0 );
		});
	});

	test.describe( 'with Atomic Wind enabled', () => {
		test.beforeEach( async({ otterUtils, admin }) => {
			await setAtomicWind( otterUtils, true );
			await admin.createNewPost();
		});

		test.afterAll( async({ otterUtils }) => {

			// Leave the site at its default so the parallel specs that run after
			// the serial project don't inherit the enabled blocks.
			await setAtomicWind( otterUtils, false );
		});

		test( 'opens from the editor toolbar with sidebar and grid', async({ page }) => {
			const modal = await openLibrary( page );

			await expect( modal.getByRole( 'heading', { name: 'Design Library' }) ).toBeVisible();
			await expect( modal.locator( '.o-library__sidebar' ) ).toBeVisible();
			await waitForGrid( modal );

			// The default view is Sections, all categories.
			await expect(
				modal.locator( '.o-library__cat-label', { hasText: 'All Sections' })
			).toBeVisible();
			expect( await resultCount( modal ) ).toBeGreaterThan( 0 );

			// Closes from the header button.
			await modal.getByRole( 'button', { name: 'Close library' }).click();
			await expect( modal ).toHaveCount( 0 );
		});

		test( 'switches between Sections and Pages', async({ page }) => {
			const modal = await openLibrary( page );
			await waitForGrid( modal );

			await modal.getByRole( 'button', { name: 'Pages' }).click();

			await expect(
				modal.locator( '.o-library__cat-label', { hasText: 'All Pages' })
			).toBeVisible();

			// Page cards carry the dedicated portrait modifier.
			await expect( modal.locator( '.o-library__card.is-page' ).first() ).toBeVisible();
			expect( await resultCount( modal ) ).toBeGreaterThan( 0 );

			await modal.getByRole( 'button', { name: 'Sections' }).click();
			await expect(
				modal.locator( '.o-library__cat-label', { hasText: 'All Sections' })
			).toBeVisible();
		});

		test( 'filters the grid by category', async({ page }) => {
			const modal = await openLibrary( page );
			await waitForGrid( modal );

			const category = modal
				.locator( '.o-library__group-body .o-library__cat' )
				.first();

			// The sidebar count is the category total in this mode, independent of
			// search/filters — with nothing else applied the grid should match it.
			const expected = parseInt(
				await category.locator( '.o-library__count' ).innerText(),
				10
			);

			await category.click();

			await expect( category ).toHaveClass( /is-active/ );
			expect( expected ).toBeGreaterThan( 0 );
			expect( await resultCount( modal ) ).toBe( expected );
		});

		test( 'shows the empty state for an unmatched search and recovers on clear', async({ page }) => {
			const modal = await openLibrary( page );
			await waitForGrid( modal );

			const allCount = await resultCount( modal );
			const search = modal.locator( '.o-library__search' );

			await search.fill( 'zzzqqxxnotarealtemplate' );

			await expect( modal.locator( '.o-library__empty' ) ).toBeVisible();
			await expect(
				modal.getByRole( 'heading', { name: 'No templates match' })
			).toBeVisible();

			await modal.locator( '.o-library__clear' ).click();

			await expect( modal.locator( '.o-library__empty' ) ).toHaveCount( 0 );
			expect( await resultCount( modal ) ).toBe( allCount );
		});

		test( 'refines results with a smart tag', async({ page }) => {
			const modal = await openLibrary( page );
			await waitForGrid( modal );

			const before = await resultCount( modal );

			// Disabled tags would land on an empty grid, so refine with an enabled
			// one — its count is what the grid should narrow to.
			const tag = modal.locator( '.o-library__tag:not([disabled])' ).first();
			await expect( tag ).toBeVisible();

			const tagCount = parseInt(
				await tag.locator( '.o-library__tag-count' ).innerText(),
				10
			);

			await tag.click();

			await expect( tag ).toHaveClass( /is-on/ );

			const after = await resultCount( modal );
			expect( after ).toBe( tagCount );
			expect( after ).toBeGreaterThan( 0 );
			expect( after ).toBeLessThanOrEqual( before );
		});

		test( 'favorites a template and filters to favorites', async({ page }) => {
			const modal = await openLibrary( page );
			await waitForGrid( modal );

			const card = firstCard( modal );
			const title = await card.locator( '.o-library__card-name' ).innerText();

			await card.hover();
			const favButton = card.locator( '.o-library__fav' );
			await favButton.click();
			await expect( favButton ).toHaveClass( /is-on/ );

			const favChip = modal.getByRole( 'button', { name: /Favorites/ });
			await favChip.click();
			await expect( favChip ).toHaveClass( /is-on/ );

			const favoritedCard = modal
				.locator( '.o-library__card', { hasText: title })
				.first();
			await expect( favoritedCard ).toBeVisible();
			expect( await resultCount( modal ) ).toBeGreaterThanOrEqual( 1 );

			// Clean up the persisted preference so later runs start empty.
			await favoritedCard.hover();
			await favoritedCard.locator( '.o-library__fav' ).click();
			await favChip.click();
		});

		test( 'changes the column count', async({ page }) => {
			const modal = await openLibrary( page );
			const grid = await waitForGrid( modal );

			await modal.locator( '.o-library__colsbtn' ).click();
			await page.getByRole( 'menuitem', { name: '2 columns' }).click();

			await expect( grid ).toHaveAttribute( 'style', /--o-lib-cols:\s*2/ );

			// Restore the default so the column assertion is the only side effect.
			await modal.locator( '.o-library__colsbtn' ).click();
			await page.getByRole( 'menuitem', { name: '3 columns' }).click();
			await expect( grid ).toHaveAttribute( 'style', /--o-lib-cols:\s*3/ );
		});

		test( 'opens and closes the preview modal', async({ page }) => {
			const modal = await openLibrary( page );
			await waitForGrid( modal );

			const card = firstCard( modal );
			await card.hover();
			await card.getByRole( 'button', { name: 'Preview' }).click();

			const preview = page.locator( '.o-library__pv' );
			await expect( preview ).toBeVisible();
			await expect( preview.locator( '.o-library__pv-title' ) ).not.toBeEmpty();

			await preview.getByRole( 'button', { name: 'Close preview' }).click();
			await expect( preview ).toHaveCount( 0 );

			// The library itself stays open behind the preview.
			await expect( modal ).toBeVisible();
		});

		test( 'inserts a template into the canvas', async({ page, editor }) => {
			const modal = await openLibrary( page );
			await waitForGrid( modal );

			const card = firstCard( modal );
			const title = await card.locator( '.o-library__card-name' ).innerText();

			await card.hover();
			await card.getByRole( 'button', { name: 'Insert', exact: true }).click();

			// Inserting closes the library and drops the template into the editor.
			await expect( modal ).toHaveCount( 0 );

			await waitForEditorReady( page );
			const blocks = await editor.getBlocks();
			expect(
				blocks.some( ( block ) => block.name.startsWith( 'atomic-wind/' ) )
			).toBe( true );

			// The success snackbar names the inserted template.
			await expect(
				page.locator( '.components-snackbar', { hasText: title })
			).toBeVisible();
		});
	});

	test.describe( 'Pro upsells', () => {
		test.beforeEach( async({ otterUtils, admin }) => {
			await setAtomicWind( otterUtils, true );
			await admin.createNewPost();
		});

		test.afterAll( async({ otterUtils }) => {
			await setAtomicWind( otterUtils, false );
		});

		test( 'renders Pro cards and routes to the upgrade link instead of inserting', async({ page, context, editor }) => {

			// The upsell cards come from a remote preview fetch that wp-env can't
			// reach, so seed one deterministically. The library reads this object
			// when the modal mounts, so it must be set before opening.
			await page.evaluate( () => {
				window.themeisleGutenberg = window.themeisleGutenberg || {};
				window.themeisleGutenberg.proPatterns = [
					{
						name: 'otter-blocks/e2e-pro-demo',
						title: 'E2E Pro Demo Pattern',
						categories: [ 'otter-blocks', 'features' ],
						keywords: []
					}
				];
				// insertPattern routes Pro cards to patternsLink, falling back to
				// upgradeLink — pin both so the destination is deterministic
				// regardless of what the site localized.
				window.themeisleGutenberg.patternsLink =
					'https://example.com/otter-pro-upgrade';
				window.themeisleGutenberg.upgradeLink =
					'https://example.com/otter-pro-upgrade';
			});

			const modal = await openLibrary( page );
			await waitForGrid( modal );

			const proCard = modal
				.locator( '.o-library__card', { hasText: 'E2E Pro Demo Pattern' })
				.first();

			await expect( proCard ).toBeVisible();
			await expect( proCard.locator( '.o-library__pro-badge' ) ).toBeVisible();

			await proCard.hover();
			const getButton = proCard.getByRole( 'button', { name: 'Get with Pro' });
			await expect( getButton ).toBeVisible();

			// Clicking a Pro card opens the upgrade link in a new tab rather than
			// inserting anything.
			const [ popup ] = await Promise.all( [
				context.waitForEvent( 'page' ),
				getButton.click()
			] );

			expect( popup.url() ).toContain( 'example.com' );
			await popup.close();

			// The library stays open and nothing was added to the canvas.
			await expect( modal ).toBeVisible();
			const blocks = await editor.getBlocks();
			expect(
				blocks.some( ( block ) => block.name.startsWith( 'atomic-wind/' ) )
			).toBe( false );
		});
	});
});
