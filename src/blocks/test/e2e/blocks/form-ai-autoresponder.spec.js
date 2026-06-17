/**
 * WordPress dependencies
 */
import { expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { test } from '../fixtures';
import { expectBlockByName, publishPostReliable } from '../helpers/editor';
import { expectFormOptionSavedNotice, findSavedFormEmail, getSavedFormEmails, showFormOption } from '../helpers/forms';

const FORM_BLOCK = 'themeisle-blocks/form';

/**
 * Insert a Form block with a deterministic set of inner fields so the magic-tag
 * chips (built from the form fields) are predictable.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor The editor utils.
 * @return {Promise<Object>} The inserted form block.
 */
async function insertFormWithFields( editor ) {
	await editor.insertBlock({
		name: FORM_BLOCK,
		innerBlocks: [
			{
				name: 'themeisle-blocks/form-input',
				attributes: { label: 'Name', type: 'text' }
			},
			{
				name: 'themeisle-blocks/form-input',
				attributes: { label: 'Email', type: 'email' }
			},
			{
				name: 'themeisle-blocks/form-nonce'
			}
		]
	});

	return expectBlockByName( editor, FORM_BLOCK );
}

/**
 * Reveal the Autoresponder ToolsPanelItem (hidden by default) and scope a
 * locator to the Form Options panel.
 *
 * @param {import('@playwright/test').Page} page The page.
 * @return {Promise<import('@playwright/test').Locator>} The Form Options panel locator.
 */
async function openAutoresponderPanel( page ) {
	await showFormOption( page, 'Autoresponder' );

	return page.locator( '.o-form-options' );
}

test.describe( 'Form Block - AI Autoresponder', () => {

	test.beforeEach( async({ admin, otterUtils }) => {
		// Otter Pro gates the whole Autoresponder UI; make sure the stub is active.
		await otterUtils.activatePro();

		// Start from a clean form-options state so the emails option does not
		// accumulate across runs (see form.spec.js for the rationale).
		await otterUtils.setOptions({
			themeisle_blocks_form_emails: [],
			themeisle_blocks_form_fields_option: []
		});

		await admin.createNewPost();
	});

	test( '"Reply with AI" toggle is present and defaults off', async({ editor, page }) => {
		await insertFormWithFields( editor );

		const panel = await openAutoresponderPanel( page );

		const toggle = panel.getByRole( 'checkbox', { name: 'Reply with AI' });

		await expect( toggle ).toBeVisible();
		await expect( toggle ).not.toBeChecked();
	});

	test( 'with AI off, the modal is still tabbed and the AI Prompt tab shows an off notice', async({ editor, page }) => {
		await insertFormWithFields( editor );

		const panel = await openAutoresponderPanel( page );

		// AI is off by default.
		await expect( panel.getByRole( 'checkbox', { name: 'Reply with AI' }) ).not.toBeChecked();

		await panel.getByRole( 'button', { name: 'Edit Autoresponder Message' }).click();

		const dialog = page.getByRole( 'dialog', { name: 'Autoresponder Message' });

		await expect( dialog ).toBeVisible();

		// Both tabs are always present; the AI Prompt tab is the second tab.
		await expect( dialog.getByRole( 'tab', { name: 'Message' }) ).toBeVisible();
		await expect( dialog.getByRole( 'tab', { name: 'AI Prompt' }) ).toBeVisible();

		// First tab (default) shows the body editor.
		await expect( dialog.getByText( 'Enter the body of the autoresponder email.' ) ).toBeVisible();

		// The AI Prompt tab warns that AI is off, but still exposes the prompt input.
		await dialog.getByRole( 'tab', { name: 'AI Prompt' }).click();
		await expect( dialog.getByText( '“Reply with AI” is off', { exact: false }) ).toBeVisible();
		await expect( dialog.locator( '.o-ar-input' ) ).toBeVisible();
	});

	test( 'toggling Reply with AI on relabels the first tab to Fallback message', async({ editor, page }) => {
		await insertFormWithFields( editor );

		const panel = await openAutoresponderPanel( page );

		await panel.getByRole( 'checkbox', { name: 'Reply with AI' }).click();

		await panel.getByRole( 'button', { name: 'Edit Autoresponder Message' }).click();

		const dialog = page.getByRole( 'dialog', { name: 'Autoresponder Message' });

		await expect( dialog ).toBeVisible();

		await expect( dialog.getByRole( 'tab', { name: 'AI Prompt' }) ).toBeVisible();
		await expect( dialog.getByRole( 'tab', { name: 'Fallback message' }) ).toBeVisible();

		// With AI on, the AI Prompt tab no longer shows the off notice.
		await dialog.getByRole( 'tab', { name: 'AI Prompt' }).click();
		await expect( dialog.getByText( '“Reply with AI” is off', { exact: false }) ).toHaveCount( 0 );
	});

	test( 'AI Prompt tab: typing works and a magic-tag chip inserts a %...% token', async({ editor, page }) => {
		const formBlock = await insertFormWithFields( editor );

		// Resolve the first eligible field id (Name) so we can assert the token format.
		const nameField = formBlock.innerBlocks.find(
			( block ) => 'themeisle-blocks/form-input' === block.name && 'Name' === block.attributes.label
		);

		expect( nameField ).toBeTruthy();
		expect( nameField.attributes.id ).toBeTruthy();

		const panel = await openAutoresponderPanel( page );

		await panel.getByRole( 'checkbox', { name: 'Reply with AI' }).click();
		await panel.getByRole( 'button', { name: 'Edit Autoresponder Message' }).click();

		const dialog = page.getByRole( 'dialog', { name: 'Autoresponder Message' });

		await dialog.getByRole( 'tab', { name: 'AI Prompt' }).click();

		// The prompt is a custom contentEditable input (not a textarea).
		const promptField = dialog.locator( '.o-ar-input' );

		await expect( promptField ).toBeVisible();

		// Typing works.
		await promptField.click();
		await page.keyboard.type( 'Thank you ' );
		await expect( promptField ).toHaveText( 'Thank you' );

		// The tag-row chip shows the friendly label; clicking it inserts an
		// inline chip (also showing the label) into the input at the caret.
		const chip = dialog.locator( '.o-autoresponder-magic-tags__chip', { hasText: nameField.attributes.label });

		await expect( chip ).toBeVisible();
		await chip.click();

		await expect(
			promptField.locator( '.o-ar-chip', { hasText: nameField.attributes.label })
		).toBeVisible();
		await expect( promptField ).toContainText( 'Thank you' );
		await expect( promptField ).toContainText( nameField.attributes.label );
	});

	test( 'Fallback message tab shows the info notice and the body editor', async({ editor, page }) => {
		await insertFormWithFields( editor );

		const panel = await openAutoresponderPanel( page );

		await panel.getByRole( 'checkbox', { name: 'Reply with AI' }).click();
		await panel.getByRole( 'button', { name: 'Edit Autoresponder Message' }).click();

		const dialog = page.getByRole( 'dialog', { name: 'Autoresponder Message' });

		await dialog.getByRole( 'tab', { name: 'Fallback message' }).click();

		await expect(
			dialog.getByText( 'Sent as-is if an AI reply can\'t be generated.' )
		).toBeVisible();

		await expect(
			dialog.getByText( 'Enter the body of the autoresponder email.' )
		).toBeVisible();
	});

	test( 'round-trip: enabled flag and prompt (with an inserted tag) persist to the saved form option', async({ editor, page }) => {
		const PROMPT_PREFIX = 'Write a friendly thank-you reply to ';

		let formBlock = await insertFormWithFields( editor );

		const nameField = formBlock.innerBlocks.find(
			( block ) => 'themeisle-blocks/form-input' === block.name && 'Name' === block.attributes.label
		);

		expect( nameField?.attributes?.id ).toBeTruthy();
		const expectedToken = `%${ nameField.attributes.id }%`;

		const panel = await openAutoresponderPanel( page );

		await panel.getByRole( 'checkbox', { name: 'Reply with AI' }).click();
		await panel.getByRole( 'button', { name: 'Edit Autoresponder Message' }).click();

		const dialog = page.getByRole( 'dialog', { name: 'Autoresponder Message' });

		await dialog.getByRole( 'tab', { name: 'AI Prompt' }).click();

		const promptField = dialog.locator( '.o-ar-input' );

		// Type prose, then insert a tag chip — the chip must serialize to %id%.
		await promptField.click();
		await page.keyboard.type( PROMPT_PREFIX );
		await dialog.locator( '.o-autoresponder-magic-tags__chip', { hasText: nameField.attributes.label }).click();

		// Close the modal before publishing.
		await dialog.getByRole( 'button', { name: 'Close' }).click();

		await publishPostReliable( editor, page );

		await expectFormOptionSavedNotice( page );

		// The form options round-trip into the `themeisle_blocks_form_emails` option.
		formBlock = await expectBlockByName( editor, FORM_BLOCK );

		expect( formBlock ).toBeTruthy();
		expect( formBlock.attributes.optionName ).toBeTruthy();

		const databaseEmails = await getSavedFormEmails( page );

		expect( databaseEmails ).toBeTruthy();
		expect( databaseEmails.length ).toBeGreaterThan( 0 );

		const savedEmail = findSavedFormEmail( databaseEmails, formBlock.attributes.optionName );

		expect( savedEmail ).toBeTruthy();
		expect( savedEmail?.aiAutoresponder?.enabled ).toBe( true );

		// The custom input serializes the inline chip back to its %id% token.
		expect( savedEmail?.aiAutoresponder?.prompt ).toContain( PROMPT_PREFIX.trim() );
		expect( savedEmail?.aiAutoresponder?.prompt ).toContain( expectedToken );
	});

	test( 'without Otter Pro, the autoresponder renders as a disabled preview with an upsell', async({ editor, page, otterUtils }) => {
		await otterUtils.deactivatePro();
		await page.reload();

		try {
			await insertFormWithFields( editor );

			const panel = await openAutoresponderPanel( page );

			// The real controls render (not a bare "need Pro" wall) but disabled,
			// with an upgrade link.
			await expect( panel.getByRole( 'textbox', { name: 'Autoresponder Subject' }) ).toBeVisible();
			await expect( panel.getByRole( 'link', { name: 'Unlock this with Otter Pro.' }) ).toBeVisible();

			// The trigger still opens the modal so the feature can be previewed.
			await panel.getByRole( 'button', { name: 'Edit Autoresponder Message' }).click();

			const dialog = page.getByRole( 'dialog', { name: 'Autoresponder Message' });

			await expect( dialog.getByText( 'This is a preview.', { exact: false }) ).toBeVisible();

			// Tabs stay switchable even though the contents are disabled.
			await dialog.getByRole( 'tab', { name: 'AI Prompt' }).click();
			await expect( dialog.locator( '.o-ar-input' ) ).toBeVisible();
		} finally {
			await otterUtils.activatePro();
		}
	});
});
