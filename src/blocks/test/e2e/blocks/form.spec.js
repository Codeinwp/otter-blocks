/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Form Block', () => {

	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	// test( 'check if Otter Pro is active', async({ page }) => {
	// 	await page.goto( '/wp-admin/admin.php?page=otter' );
	//
	// 	await page.waitForTimeout( 1000 );
	//
	// 	const activateInputField = page.getByPlaceholder( 'Enter license key' );
	//
	// 	expect( activateInputField ).toBeVisible();
	//
	// 	const activateBtn = page.getByRole( 'button', { name: 'Deactivate' });
	//
	// 	expect( activateBtn ).toBeVisible();
	//
	// 	await activateBtn.click();
	// });

	test( 'can be created by typing "/form"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/form' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasProgressBar = blocks.some( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( hasProgressBar ).toBeTruthy();
	});

	test( 'click on the first variation and check if it has content', async({ editor, page }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/form' });

		const blocks = await editor.getBlocks();

		const formBlock = blocks.find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( formBlock ).toBeTruthy();

		await page.getByRole( 'button', { name: 'Contact form for clients' }).click();

		// Check if the blocks has innerBlocks

		const updateBlocks = await editor.getBlocks();

		const updatedFormBlock = updateBlocks.find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( updatedFormBlock.innerBlocks.length ).toBeGreaterThan( 0 );
	});

	test( 'add a value to CC field and save', async({ editor, page }) => {
		const ccValue = 'otter@test-form.com';

		/*
		 * Create a form block and insert the CC value using the Inspector Controls.
		 */

		await editor.insertBlock({ name: 'themeisle-blocks/form' });

		let formBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( formBlock ).toBeTruthy();

		await page.getByRole( 'button', { name: 'Contact form for clients' }).click();

		// Open the options panel
		await page.getByRole( 'button', { name: 'Form Options options' }).click();

		// activate the option
		await page.getByRole( 'menuitemcheckbox', { name: 'Show CC' }).click();

		// Close the options panel
		await page.getByRole( 'button', { name: 'Form Options options' }).click();

		const cc = page.getByPlaceholder( 'Send copies to' );

		await cc.fill( ccValue );

		expect( await cc.inputValue() ).toBe( ccValue );

		await editor.publishPost();

		await page.waitForTimeout( 1000 );

		// Check if the notice is visible
		const msg = page.getByRole( 'button', { name: 'Dismiss this notice' }).filter({
			hasText: 'Form options have been saved.'
		});

		await page.waitForTimeout( 1500 );

		expect( await msg.isVisible() ).toBeTruthy();

		/*
		 * Check if the value is saved in the database.
		 */

		formBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( formBlock ).toBeTruthy();
		expect( formBlock.attributes.optionName ).toBeTruthy();

		const databaseEmails = await page.evaluate( async() => {
			// eslint-disable-next-line camelcase
			const { themeisle_blocks_form_emails } = await ( new wp.api.models.Settings() ).fetch();

			// eslint-disable-next-line camelcase
			return themeisle_blocks_form_emails;
		});

		expect( databaseEmails ).toBeTruthy();
		expect( databaseEmails.length ).toBeGreaterThan( 0 );

		const savedEmail = databaseEmails.find( email => email?.form === formBlock.attributes.optionName );

		expect( savedEmail ).toBeTruthy();
		expect( savedEmail?.cc ).toBe( ccValue );
	});

	test( 'check if the form is rendered in frontend', async({ page, editor }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/form' });

		const blocks = await editor.getBlocks();

		const formBlock = blocks.find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( formBlock ).toBeTruthy();

		const { clientId, attributes } = formBlock;
		const otterId = attributes?.id;

		expect( otterId ).toBeTruthy();

		await page.getByRole( 'button', { name: 'Contact form for clients' }).click();

		const postId = await editor.publishPost();

		await page.goto( `/?p=${postId}` );

		const form = await page.$( `#${otterId}` );

		expect( form ).toBeTruthy();

		const submitArea = page.locator( 'div' ).filter({ hasText: /^Submit$/ });

		expect( await submitArea.isVisible() ).toBeTruthy();

		const submitBtn = submitArea.getByRole( 'button', { name: 'Submit' });

		expect( await submitBtn.isVisible() ).toBeTruthy();
	});

	test( 'insert a file field and check if it renders in frontend', async({ page, editor }) => {

		await page.waitForTimeout( 1000 );
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

		const blocks = await editor.getBlocks();

		const formBlock = blocks.find( ( block ) => 'themeisle-blocks/form' === block.name );
		expect( formBlock ).toBeTruthy();

		const fileInputBlock = formBlock.innerBlocks.find( ( block ) => 'themeisle-blocks/form-file' === block.name );
		expect( fileInputBlock ).toBeTruthy();

		const { attributes } = fileInputBlock;

		expect( attributes.id ).toBeTruthy();

		const postId = await editor.publishPost();

		await page.waitForTimeout( 1700 );

		await page.goto( `/?p=${postId}` );

		const fileInput = await page.$( `#${attributes.id} input[type="file"]` );

		expect( fileInput ).toBeTruthy();

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

		await page.waitForTimeout( 1000 );

		// Check if Success message div is visible
		const successMsg = page.locator( 'div' ).filter({ hasText: /^Success$/ });

		expect( await successMsg.isVisible() ).toBeTruthy();

	});

	test( 'insert a hidden field and check if it renders in frontend', async({ page, editor }) => {

		await page.waitForTimeout( 1000 );
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

		const blocks = await editor.getBlocks();

		const formBlock = blocks.find( ( block ) => 'themeisle-blocks/form' === block.name );
		expect( formBlock ).toBeTruthy();

		const fileHiddenBlock = formBlock.innerBlocks.find( ( block ) => 'themeisle-blocks/form-hidden-field' === block.name );

		expect( fileHiddenBlock ).toBeTruthy();

		const { attributes } = fileHiddenBlock;

		expect( attributes.id ).toBeTruthy();

		const postId = await editor.publishPost();

		await page.waitForTimeout( 1500 );

		await page.goto( `/?p=${postId}&test=123` );

		const hiddenInput = await page.locator( `#${attributes.id} input[type="hidden"]` );

		expect( hiddenInput ).toBeTruthy();

		await expect( hiddenInput ).toHaveAttribute( 'data-param-name', 'test' );

	});

	test( 'redirect to a page after form submission', async({ page, editor, browser }) => {

		/*
		 * Create a form block and insert the Redirect value using the Inspector Controls.
		 */

		await editor.insertBlock({ name: 'themeisle-blocks/form' });

		const formBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( formBlock ).toBeTruthy();

		const { clientId } = formBlock;

		await page.getByRole( 'button', { name: 'Contact form for clients' }).click();

		// Open the options panel
		await page.getByRole( 'button', { name: 'Form Options options' }).click();

		// activate the option
		await page.getByRole( 'menuitemcheckbox', { name: 'Redirect on Submit' }).click();

		const redirectField = page.getByPlaceholder( 'https://example.com' );

		const REDIRECT_URL = page.url();

		await redirectField.fill( REDIRECT_URL );

		expect( await redirectField.inputValue() ).toBe( REDIRECT_URL );

		const postId = await editor.publishPost();

		await page.waitForTimeout( 2000 );

		await page.goto( `/?p=${postId}` );

		await page.getByLabel( 'Name*' ).fill( 'John Doe' );
		await page.getByLabel( 'Email*' ).fill( 'test@otter.com' );

		page.on( 'response', ( response ) =>
			console.log( '<<', response.status(), response.url() )
		);

		await page.waitForTimeout( 5000 ); // Wait to prevent the anti-spam check from blocking the request.

		await page.getByRole( 'button', { name: 'Submit' }).click();

		await page.waitForTimeout( 500 );

		await expect( await page.$( `[data-redirect="${REDIRECT_URL}"]` ) ).toBeTruthy();
		await expect( await page.getByText( 'Success' ) ).toBeVisible();

		// check for a element with the attribute data-redirect-url
	});

	test( 'errors on invalid API Key for Market Integration', async({ page, editor, browser }) => {

		await editor.insertBlock({ name: 'themeisle-blocks/form' });

		const formBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( formBlock ).toBeTruthy();

		await page.getByRole( 'button', { name: 'Contact form for clients' }).click();

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

		await editor.insertBlock({ name: 'themeisle-blocks/form' });

		const formBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/form' === block.name );

		expect( formBlock ).toBeTruthy();

		const { clientId } = formBlock;

		await page.getByRole( 'button', { name: 'Contact form for clients' }).click();

		// Open the options panel
		await page.getByRole( 'button', { name: 'Form Options options' }).click();

		// activate the option
		await page.getByRole( 'menuitemcheckbox', { name: 'Show CC' }).click();

		// Close the options panel
		await page.getByRole( 'button', { name: 'Form Options options' }).click();

		const cc = page.getByPlaceholder( 'Send copies to' );

		await cc.fill( ccValue );

		await editor.publishPost();

		await page.getByLabel( 'Close panel' ).click();

		await page.getByPlaceholder( 'Default is to admin site' ).fill( ccValue );

		const saveBtn = page.getByRole( 'button', { name: 'Update', disabled: false });

		await saveBtn.waitFor({
			timeout: 4000
		});

		expect( await saveBtn.isEnabled() ).toBeTruthy();
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

		const postId = await editor.publishPost();

		await page.goto( `/?p=${postId}` );

		// Text input.
		expect( await page.getByLabel( 'Name' ).inputValue() ).toBe( 'John Doe' );

		// Textarea.
		expect( await page.getByLabel( 'Message' ).inputValue() ).toBe( 'Hello World' );

		// Checkboxes.
		expect( await page.getByLabel( 'Checkbox Option 1' ).isChecked() ).toBeTruthy();
		expect( await page.getByLabel( 'Checkbox Option 2' ).isChecked() ).toBeTruthy();
		expect( await page.getByLabel( 'Checkbox Option 3' ).isChecked() ).toBeFalsy();

		// Radio.
		expect( await page.getByLabel( 'Radio Option 1' ).isChecked() ).toBeFalsy();
		expect( await page.getByLabel( 'Radio Option 2' ).isChecked() ).toBeTruthy();

		// Select.
		expect( await page.getByRole( 'combobox' ).inputValue() ).toBe( 'select-option-2' );

		// Hidden field.
		expect( await page.locator( '.otter-form-input[type="hidden"]' ).inputValue() ).toBe( '123' );
	});

	test( 'can export form data', async({ page, editor }) => {
		let downloadTriggered = false;
		let fileName = '';

		await page.goto( '/wp-admin/edit.php?post_type=otter_form_record' );

		page.on( 'download', async download => {
			await download.path(); // Wait for download to complete.
			downloadTriggered = true;
			fileName = download.suggestedFilename();
		});

		const exportBtn = page.getByRole( 'button', { name: 'Export' });

		await expect( exportBtn ).toBeVisible();

		await exportBtn.click();

		await page.waitForTimeout( 1000 );

		expect( downloadTriggered ).toBeTruthy();
		expect( fileName.startsWith( 'otter_form_submissions' ) ).toBeTruthy();
	});
});
