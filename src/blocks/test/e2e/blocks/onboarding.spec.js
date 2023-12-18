/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'FSE Onboarding', () => {
	test.beforeEach( async({ admin, page }) => {
		const slug = 'raft';

		await admin.visitAdminPage( 'themes.php' );

		const activateButton = await page.$(
			`div[data-slug="${ slug }"] .button.activate`
		);

		if ( activateButton ) {
			await page.click( `div[data-slug="${ slug }"] .button.activate` );
			await page.waitForSelector( `div[data-slug="${ slug }"].active` );
		}

		await admin.visitAdminPage( 'site-editor.php?onboarding=true' );

		const hasWelcomeNotice = async() => {
			return await page.evaluate( () => {
				return wp.data.select( 'otter/onboarding' ).isWelcomeScreen();
			});
		};

		if ( hasWelcomeNotice ) {
			await page.getByRole( 'button', { name: 'Set up my theme' }).click();
		}

		const checkSpinnerGone = async() => {
			return await page.evaluate( () => {

				return 0 === document.querySelectorAll( '.components-spinner' ).length;
			});
		};

		// Polling loop to wait for the spinners to disappear
		while ( ! await checkSpinnerGone() ) {
			await page.waitForTimeout( 100 );
		}

		await page.waitForSelector( '.o-main iframe' );
	});

	test( 'onboarding is available in site Editor', async({ page }) => {
		await page.waitForSelector( '#otter-onboarding' );
		expect( await page.isVisible( '#otter-onboarding' ) ).toBe( true );
	});

	test( 'test onboarding flow', async({ page }) => {
		const getCurrentStep = async() => {
			return await page.evaluate( () => {
				return wp.data.select( 'otter/onboarding' ).getStep()?.id;
			});
		};

		expect( await getCurrentStep() ).toBe( 'site_info' );

		const siteTitle = page.getByPlaceholder( 'Acme Corporation' );
		const ourTitle = 'Test Title';
		await siteTitle.clear();
		await siteTitle.type( ourTitle );

		const title = await page.evaluate( () => {
			const title = document.querySelector( '.o-main iframe' ).contentWindow.document.querySelector( '[aria-label="Site title text"]' ).innerHTML;
			return title;
		});

		expect( title ).toBe( ourTitle );

		const next = page.getByRole( 'button', { name: 'Continue' });
		await next.click();

		const checkSpinnerGone = async() => {
			return await page.evaluate( () => {

				return 0 === document.querySelectorAll( '.components-spinner' ).length;
			});
		};

		// Polling loop to wait for the spinners to disappear
		while ( ! await checkSpinnerGone() ) {
			await page.waitForTimeout( 100 );
		}

		expect( await getCurrentStep() ).toBe( 'appearance' );

		await page.evaluate( () => {
			const palette = document.querySelectorAll( '.o-palettes .o-palette' )[2];
			palette.click();
		});

		const isSelectedPalette = await page.evaluate( () => {
			const palette = document.querySelectorAll( '.o-palettes .o-palette' )[2];
			return palette.classList.contains( 'is-selected' );
		});

		expect( isSelectedPalette ).toBe( true );

		await next.click();

		while ( ! await checkSpinnerGone() ) {
			await page.waitForTimeout( 100 );
		}

		expect( await getCurrentStep() ).toBe( 'front-page_template' );

		await page.waitForTimeout( 1000 );

		await page.evaluate( () => {
			const template = document.querySelectorAll( '.o-templates .o-templates__item' )[1];
			template.click();
		});

		const isSelectedFPTemplate = await page.evaluate( () => {
			const template = document.querySelectorAll( '.o-templates .o-templates__item' )[1];
			return template.querySelector( '.o-templates__item__container' ).classList.contains( 'is-selected' );
		});

		expect( isSelectedFPTemplate ).toBe( true );

		await next.click();

		while ( ! await checkSpinnerGone() ) {
			await page.waitForTimeout( 100 );
		}

		expect( await getCurrentStep() ).toBe( 'archive_template' );

		await page.waitForTimeout( 1000 );

		await page.evaluate( () => {
			const template = document.querySelectorAll( '.o-templates .o-templates__item' )[1];
			template.click();
		});

		const isSelectedArchive = await page.evaluate( () => {
			const template = document.querySelectorAll( '.o-templates .o-templates__item' )[1];
			return template.querySelector( '.o-templates__item__container' ).classList.contains( 'is-selected' );
		});

		expect( isSelectedArchive ).toBe( true );

		await next.click();

		while ( ! await checkSpinnerGone() ) {
			await page.waitForTimeout( 100 );
		}

		expect( await getCurrentStep() ).toBe( 'single_template' );

		await page.waitForTimeout( 1000 );

		await page.evaluate( () => {
			const template = document.querySelectorAll( '.o-templates .o-templates__item' )[1];
			template.click();
		});

		const isSelectedSingle = await page.evaluate( () => {
			const template = document.querySelectorAll( '.o-templates .o-templates__item' )[1];
			return template.querySelector( '.o-templates__item__container' ).classList.contains( 'is-selected' );
		});

		expect( isSelectedSingle ).toBe( true );

		await next.click();

		while ( ! await checkSpinnerGone() ) {
			await page.waitForTimeout( 100 );
		}

		await page.waitForTimeout( 1000 );

		expect( await getCurrentStep() ).toBe( 'additional_templates' );

		await page.waitForTimeout( 1000 );

		const getSelectedTemplates = async() => {
			return await page.evaluate( () => {
				return wp.data.select( 'otter/onboarding' ).getSelectedTemplate( 'pageTemplates' );
			});
		};

		const templates = await page.evaluate( () => {
			const templates = document.querySelectorAll( '.o-templates .o-templates__item' );

			for ( let i = 0; i < templates.length; i++ ) {
				templates[i].click();
			}

			return templates;
		});

		expect( await getSelectedTemplates()?.length ).toBe( templates.length );

		await next.click();

		while ( ! await checkSpinnerGone() ) {
			await page.waitForTimeout( 100 );
		}

		await page.waitForTimeout( 1000 );

		const button = await page.getByRole( 'button', { name: 'Visit your website' });

		expect( await button.isVisible() ).toBe( true );
	});
});
