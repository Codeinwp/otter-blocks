/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { expectBlockByName, insertBlockBySlash, publishAndViewPost } from '../helpers/editor';
import { expectFormOptionSavedNotice, findSavedFormEmail, getSavedFormEmails, insertContactForm, openFormOptions, showFormOption } from '../helpers/forms';
import { expectSuccessMessage, visibleText } from '../helpers/frontend';

test.describe( 'Form Block', () => {

	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/form"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/form',
			blockName: 'themeisle-blocks/form'
		});
	});

	test( 'click on the first variation and check if it has content', async({ editor, page }) => {
		await insertContactForm({ editor, page });

		// Check if the blocks has innerBlocks

		const updatedFormBlock = await expectBlockByName( editor, 'themeisle-blocks/form' );

		expect( updatedFormBlock.innerBlocks.length ).toBeGreaterThan( 0 );
	});

	test( 'add a value to CC field and save', async({ editor, page }) => {
		const ccValue = 'otter@test-form.com';

		/*
		 * Create a form block and insert the CC value using the Inspector Controls.
		 */

		let formBlock = await insertContactForm({ editor, page });
		await showFormOption( page, 'Show CC' );

		const cc = page.getByPlaceholder( 'Send copies to' );

		await cc.fill( ccValue );

		expect( await cc.inputValue() ).toBe( ccValue );

		await editor.publishPost();

		await expectFormOptionSavedNotice( page );

		/*
		 * Check if the value is saved in the database.
		 */

		formBlock = await expectBlockByName( editor, 'themeisle-blocks/form' );

		expect( formBlock ).toBeTruthy();
		expect( formBlock.attributes.optionName ).toBeTruthy();

		const databaseEmails = await getSavedFormEmails( page );

		expect( databaseEmails ).toBeTruthy();
		expect( databaseEmails.length ).toBeGreaterThan( 0 );

		const savedEmail = findSavedFormEmail( databaseEmails, formBlock.attributes.optionName );

		expect( savedEmail ).toBeTruthy();
		expect( savedEmail?.cc ).toBe( ccValue );
	});


	test( 'add a value to From Email field and save', async({ editor, page }) => {
		const fromEmail = 'otter@test-form.com';

		/*
		 * Create a form block and insert the From Email value using the Inspector Controls.
		 */

		let formBlock = await insertContactForm({ editor, page });
		await showFormOption( page, 'Show From Email' );

		const from = page.getByPlaceholder( 'e.g. noreply@example.com' );

		await from.fill( fromEmail );

		expect( await from.inputValue() ).toBe( fromEmail );

		await editor.publishPost();

		await expectFormOptionSavedNotice( page );

		/*
		 * Check if the value is saved in the database.
		 */

		formBlock = await expectBlockByName( editor, 'themeisle-blocks/form' );

		expect( formBlock ).toBeTruthy();
		expect( formBlock.attributes.optionName ).toBeTruthy();

		const databaseEmails = await getSavedFormEmails( page );

		expect( databaseEmails ).toBeTruthy();
		expect( databaseEmails.length ).toBeGreaterThan( 0 );

		const savedEmail = findSavedFormEmail( databaseEmails, formBlock.attributes.optionName );

		expect( savedEmail ).toBeTruthy();
		expect( savedEmail?.fromEmail ).toBe( fromEmail );
	});

	test( 'check if the form is rendered in frontend', async({ page, editor }) => {
		const formBlock = await insertContactForm({ editor, page });

		const { attributes } = formBlock;
		const otterId = attributes?.id;

		expect( otterId ).toBeTruthy();

		await publishAndViewPost({ editor, page });

		const form = page.locator( `#${otterId}` );

		await expect( form ).toBeVisible();

		const submitArea = visibleText( page, 'Submit' );

		await expect( submitArea ).toBeVisible();

		const submitBtn = submitArea.getByRole( 'button', { name: 'Submit' });

		await expect( submitBtn ).toBeVisible();
	});

	test( 'insert a file field and check if it renders in frontend', async({ page, editor }) => {

		await editor.insertBlock({ name: 'themeisle-blocks/form', innerBlocks: [
			{
				name: 'themeisle-blocks/form-file',
				attributes: {
					label: 'File Field Test',
					helpText: 'This is a help text',
					allowedFileTypes: [ 'text/plain', 'image/*' ]
				}
			},
			{
				name: 'themeisle-blocks/form-nonce'
			}
		] });

		const formBlock = await expectBlockByName( editor, 'themeisle-blocks/form' );

		const fileInputBlock = formBlock.innerBlocks.find( ( block ) => 'themeisle-blocks/form-file' === block.name );
		expect( fileInputBlock ).toBeTruthy();

		const { attributes } = fileInputBlock;

		expect( attributes.id ).toBeTruthy();

		await publishAndViewPost({ editor, page, waitAfterPublish: 1700 });

		const fileInput = page.locator( `#${attributes.id} input[type="file"]` );

		await expect( fileInput ).toBeVisible();

		// This is a base64 representation of a 1x1 red pixel in PNG format
		const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAA1JREFUCNdjYGBgYAAAAAUAAXhP/o8AAAAASUVORK5CYII=';

		await page.locator( 'input[type="file"]' ).setInputFiles(
			{
				name: 'test.png',
				mimeType: 'image/png',
				buffer: Buffer.from( base64Image, 'base64' )
			}
		);

		await page.waitForTimeout( 5000 );

		// Click the submit button
		await page.getByRole( 'button', { name: 'Submit' }).click();

		// Check if Success message div is visible
		await expectSuccessMessage( page );

	});

	test( 'insert a hidden field and check if it renders in frontend', async({ page, editor }) => {

		await editor.insertBlock({ name: 'themeisle-blocks/form', innerBlocks: [
			{
				name: 'themeisle-blocks/form-hidden-field',
				attributes: {
					label: 'Hidden Field Test',
					paramName: 'test'
				}
			},
			{
				name: 'themeisle-blocks/form-nonce'
			}
		] });

		const formBlock = await expectBlockByName( editor, 'themeisle-blocks/form' );

		const fileHiddenBlock = formBlock.innerBlocks.find( ( block ) => 'themeisle-blocks/form-hidden-field' === block.name );

		expect( fileHiddenBlock ).toBeTruthy();

		const { attributes } = fileHiddenBlock;

		expect( attributes.id ).toBeTruthy();

		await publishAndViewPost({ editor, page, query: '&test=123' });

		const hiddenInput = page.locator( `#${attributes.id} input[type="hidden"]` );

		await expect( hiddenInput ).toBeAttached();

		await expect( hiddenInput ).toHaveAttribute( 'data-param-name', 'test' );

	});

	test( 'redirect to a page after form submission', async({ page, editor }) => {

		/*
		 * Create a form block and insert the Redirect value using the Inspector Controls.
		 */

		await insertContactForm({ editor, page });
		await openFormOptions( page );
		await page.getByRole( 'menuitemcheckbox', { name: 'Redirect on Submit' }).click();

		const redirectField = page.getByPlaceholder( 'https://example.com' );

		const REDIRECT_URL = page.url();

		await redirectField.fill( REDIRECT_URL );

		expect( await redirectField.inputValue() ).toBe( REDIRECT_URL );

		await publishAndViewPost({ editor, page, waitAfterPublish: 2000 });

		await page.getByLabel( 'Name*' ).fill( 'John Doe' );
		await page.getByLabel( 'Email*' ).fill( 'test@otter.com' );

		await page.waitForTimeout( 5000 ); // Wait to prevent the anti-spam check from blocking the request.

		await page.getByRole( 'button', { name: 'Submit' }).click();

		await expect( page.locator( `[data-redirect="${REDIRECT_URL}"]` ) ).toBeAttached();
		await expectSuccessMessage( page );

		// check for a element with the attribute data-redirect-url
	});

	test( 'errors on invalid API Key for Market Integration', async({ page, editor }) => {

		await insertContactForm({ editor, page });

		await page.getByRole( 'button', { name: 'Marketing Integration' }).click();

		// Select the Mailchimp option on the select with label Provider
		await page.getByLabel( 'Provider' ).selectOption( 'mailchimp' );

		await page.getByLabel( 'API Key' ).fill( 'invalid-api-key' );

		await expect( page.getByLabel( 'Dismiss this notice' ) ).toBeVisible();
	});

	test( 'enable post save button on options changed', async({ page, editor }) => {
		const ccValue = 'otter@test-form.com';

		/*
		 * Create a form block and insert the CC value using the Inspector Controls.
		 */

		await insertContactForm({ editor, page });
		await showFormOption( page, 'Show CC' );

		const cc = page.getByPlaceholder( 'Send copies to' );

		await cc.fill( ccValue );

		await editor.publishPost();

		await page.getByLabel( 'Close panel' ).click();

		await page.getByPlaceholder( 'Default is to admin site' ).fill( ccValue );

		// WP 7.0 renamed the post save button from "Update" to "Save". Scope to the top-bar
		// publish button so we don't match the form-options "Save" button.
		const saveBtn = page.locator( '.editor-post-publish-button__button', { hasText: 'Save' });

		// enableSaveBtn is debounced 3s after form option changes.
		await expect( saveBtn ).toBeEnabled({ timeout: 10_000 });
	});

	test( 'default values for fields', async({ page, editor }) => {
		await editor.insertBlock(
			{
				name: 'themeisle-blocks/form',
				innerBlocks: [
					{
						name: 'themeisle-blocks/form-input',
						attributes: {
							label: 'Name',
							defaultValue: 'John Doe'
						}
					},
					{
						name: 'themeisle-blocks/form-textarea',
						attributes: {
							label: 'Message',
							defaultValue: 'Hello World'
						}
					},
					{
						name: 'themeisle-blocks/form-multiple-choice',
						attributes: {
							label: 'Checkbox',
							type: 'checkbox',
							options: [
								{ isDefault: true, content: 'Checkbox Option 1' },
								{ isDefault: true, content: 'Checkbox Option 2' },
								{ isDefault: false, content: 'Checkbox Option 3' }
							]
						}
					},
					{
						name: 'themeisle-blocks/form-multiple-choice',
						attributes: {
							label: 'Radio',
							type: 'radio',
							options: [
								{ isDefault: false, content: 'Radio Option 1' },
								{ isDefault: true, content: 'Radio Option 2' }
							]
						}
					}, {
						name: 'themeisle-blocks/form-multiple-choice',
						attributes: {
							label: 'Select',
							type: 'select',
							options: [
								{ isDefault: false, content: 'Select Option 1' },
								{ isDefault: true, content: 'Select Option 2' }
							]
						}
					},
					{
						name: 'themeisle-blocks/form-hidden-field',
						attributes: {
							label: 'Hidden Field Test',
							paramName: 'test',
							defaultValue: '123'
						}
					}
				]
			}
		);

		await publishAndViewPost({ editor, page });

		// Text input.
		await expect( page.getByLabel( 'Name' ) ).toHaveValue( 'John Doe' );

		// Textarea.
		await expect( page.getByLabel( 'Message' ) ).toHaveValue( 'Hello World' );

		// Checkboxes.
		await expect( page.getByLabel( 'Checkbox Option 1' ) ).toBeChecked();
		await expect( page.getByLabel( 'Checkbox Option 2' ) ).toBeChecked();
		await expect( page.getByLabel( 'Checkbox Option 3' ) ).not.toBeChecked();

		// Radio.
		await expect( page.getByLabel( 'Radio Option 1' ) ).not.toBeChecked();
		await expect( page.getByLabel( 'Radio Option 2' ) ).toBeChecked();

		// Select.
		await expect( page.getByRole( 'combobox' ) ).toHaveValue( 'select-option-2' );

		// Hidden field.
		await expect( page.locator( '.otter-form-input[type="hidden"]' ) ).toHaveValue( '123' );
	});

	test( 'can export form data', async({ page }) => {
		await page.goto( '/wp-admin/edit.php?post_type=otter_form_record' );

		const exportBtn = page.getByRole( 'button', { name: 'Export' });

		await expect( exportBtn ).toBeVisible();

		const downloadPromise = page.waitForEvent( 'download' );
		await exportBtn.click();
		const download = await downloadPromise;

		await download.path(); // Wait for download to complete.
		expect( download.suggestedFilename().startsWith( 'otter_form_submissions' ) ).toBeTruthy();
	});
});
