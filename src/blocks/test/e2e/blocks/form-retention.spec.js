/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { expectBlockByName, publishPostReliable } from '../helpers/editor';
import { expectFormOptionSavedNotice, findSavedFormEmail, getEmailNotificationToggle, getSavedFormEmails, insertContactForm, prepareFormOptionsInspector, showFormOption } from '../helpers/forms';
import { expectSuccessMessage } from '../helpers/frontend';

/**
 * Scenarios for the "save first, deliver second" submission retention pipeline, driven through the editor, the
 * frontend and the `otter-e2e/v1` bootstrap endpoints.
 */

const ADMIN_ALERT_SUBJECT = /error with the Form blocks/;

/**
 * Fill the contact-form variation on the frontend and submit it.
 *
 * @param {import('@playwright/test').Page} page The page.
 */
async function fillAndSubmitContactForm( page ) {
	await page.getByLabel( 'Name*' ).fill( 'Ada E2E' );
	await page.getByLabel( 'Email*' ).fill( 'ada@example.com' );

	// Wait out the anti-spam minimum fill time.
	await page.waitForTimeout( 5000 );

	await page.getByRole( 'button', { name: 'Submit' }).click();
}

/**
 * Submit a form through the REST endpoint, the same way the frontend script does.
 * Used for scenarios that cannot be driven through a real browser form (e.g. captcha).
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').RequestUtils} requestUtils The request utils.
 * @param {Record<string, unknown>}                                     payload      Payload overrides (nonceValue, formOption, formId, ...).
 * @return {Promise<Record<string, unknown>>} The form response.
 */
function submitFormViaApi( requestUtils, payload ) {
	return requestUtils.rest({
		method: 'POST',
		path: '/otter/v1/form/frontend',
		data: {
			handler: 'submit',
			payload: {
				postUrl: 'https://example.com/e2e-form-retention',
				postId: 0,
				antiSpamTime: 6000,
				antiSpamHoneyPot: '',
				formInputsData: [
					{
						id: 'wp-block-themeisle-blocks-form-input-e2e00001',
						type: 'text',
						label: 'Name',
						value: 'Ada E2E',
						metadata: { position: 0 }
					},
					{
						id: 'wp-block-themeisle-blocks-form-input-e2e00002',
						type: 'email',
						label: 'Email',
						value: 'ada@example.com',
						metadata: { position: 1 }
					}
				],
				...payload
			}
		}
	});
}

test.describe( 'Form submission retention', () => {

	test.beforeEach( async({ admin, otterUtils }) => {
		await otterUtils.cleanupFormRecords();
		await otterUtils.setCaptchaMode( 'off' );
		await otterUtils.setMailMode( 'ok' );
		await admin.createNewPost();
	});

	// Leave the site in pretend-send state for the specs that run after this one.
	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setCaptchaMode( 'off' );
		await otterUtils.setMailMode( 'ok' );
		await otterUtils.deactivatePro();
	});

	test( 'successful submission stores a Record with Complete delivery', async({ editor, page, otterUtils }) => {
		const formBlock = await insertContactForm({ editor, page });
		const formId = formBlock.attributes.id;

		const postId = await publishPostReliable( editor, page );

		// Clear the mail log of anything the publish flow may have attempted.
		await otterUtils.setMailMode( 'ok' );

		await page.goto( `/?p=${postId}` );
		await fillAndSubmitContactForm( page );
		await expectSuccessMessage( page );

		const records = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );

		expect( records ).toHaveLength( 1 );
		expect( records[0].status ).toBe( 'unread' );
		expect( records[0].delivery_status ).toBe( 'complete' );
		expect( records[0].delivery_errors ).toBeFalsy();
		expect( records[0].inputs.map( ({ value }) => value ) ).toContain( 'ada@example.com' );

		// Exactly one email: the owner notification, no admin alert.
		const mailLog = await otterUtils.getMailLog();
		expect( mailLog ).toHaveLength( 1 );
		expect( mailLog[0].subject ).not.toMatch( ADMIN_ALERT_SUBJECT );
	});

	test( 'failed email keeps the submission, marks delivery Failed and throttles the admin alert', async({ editor, page, otterUtils }) => {
		const formBlock = await insertContactForm({ editor, page });
		const formId = formBlock.attributes.id;

		const postId = await publishPostReliable( editor, page );

		await otterUtils.setMailMode( 'fail' );

		await page.goto( `/?p=${postId}` );
		await fillAndSubmitContactForm( page );

		// The visitor sees an error, not a success message.
		await expect( page.locator( '.o-form-server-response.o-error' ) ).toBeVisible();

		// ...but the submission survived as a Record marked failed for the email action.
		let records = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );

		expect( records ).toHaveLength( 1 );
		expect( records[0].status ).toBe( 'unread' );
		expect( records[0].delivery_status ).toBe( 'failed' );
		expect( records[0].delivery_errors[0].action ).toBe( 'email' );

		// Two attempts: the failed owner email, then the throttled admin alert.
		let mailLog = await otterUtils.getMailLog();
		expect( mailLog ).toHaveLength( 2 );
		expect( mailLog[1].subject ).toMatch( ADMIN_ALERT_SUBJECT );

		// A second failing submission stores another Record but does NOT re-alert within the hour.
		await page.goto( `/?p=${postId}` );
		await fillAndSubmitContactForm( page );
		await expect( page.locator( '.o-form-server-response.o-error' ) ).toBeVisible();

		records = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );
		expect( records ).toHaveLength( 2 );

		mailLog = await otterUtils.getMailLog();
		expect( mailLog ).toHaveLength( 3 );
		expect( mailLog[2].subject ).not.toMatch( ADMIN_ALERT_SUBJECT );
	});

	test( 'Email Notification toggle off skips the owner email but keeps the Record', async({ editor, page, otterUtils }) => {
		let formBlock = await insertContactForm({ editor, page });
		const formId = formBlock.attributes.id;

		const notificationToggle = await prepareFormOptionsInspector( editor, page );

		await expect( notificationToggle ).toBeChecked();
		await notificationToggle.click();
		await expect( notificationToggle ).not.toBeChecked();

		const postId = await publishPostReliable( editor, page );
		await expectFormOptionSavedNotice( page );

		// The toggle is persisted in the form options.
		formBlock = await expectBlockByName( editor, 'themeisle-blocks/form' );
		const savedEmail = findSavedFormEmail( await getSavedFormEmails( page ), formBlock.attributes.optionName );

		expect( savedEmail?.emailNotification ).toBe( false );

		await otterUtils.setMailMode( 'ok' );

		await page.goto( `/?p=${postId}` );
		await fillAndSubmitContactForm( page );
		await expectSuccessMessage( page );

		// No email was attempted, yet the submission is stored with Complete delivery.
		expect( await otterUtils.getMailLog() ).toHaveLength( 0 );

		const records = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );

		expect( records ).toHaveLength( 1 );
		expect( records[0].delivery_status ).toBe( 'complete' );
	});

	test( 'legacy save-location value maps to the toggle and is rewritten on save', async({ admin, editor, page, otterUtils }) => {
		await insertContactForm({ editor, page });

		const postId = await publishPostReliable( editor, page );
		await expectFormOptionSavedNotice( page );

		/*
		 * The form option name is derived from the editor pathname, so it re-keys from the
		 * post-new.php name to the canonical post.php one on the next editor load. Settle on
		 * the canonical name first, then plant the legacy entry under it.
		 */
		await admin.editPost( postId );

		const formBlock = await expectBlockByName( editor, 'themeisle-blocks/form' );
		const { optionName } = formBlock.attributes;

		const saveBtn = page.locator( '.editor-post-publish-button__button' );
		await expect( saveBtn ).toBeEnabled({ timeout: 10_000 });
		await saveBtn.click();
		await expectFormOptionSavedNotice( page );

		// Rewrite the stored entry into the legacy format: save-location only, no toggle.
		await otterUtils.upsertFormOption({
			form: optionName,
			submissionsSaveLocation: 'database',
			emailNotification: null
		});

		await page.reload();

		// Re-select the Form block so the inspector shows its options.
		await page.waitForFunction( () => 0 < window.wp?.data?.select( 'core/block-editor' )?.getBlocks()?.length );
		await page.evaluate( () => {
			const blocks = window.wp.data.select( 'core/block-editor' ).getBlocks();
			const form = blocks.find( block => 'themeisle-blocks/form' === block.name );
			window.wp.data.dispatch( 'core/block-editor' ).selectBlock( form.clientId );
		});
		await editor.openDocumentSettingsSidebar();

		// Read-time migration: legacy `database` means the notification is off.
		const notificationToggle = await getEmailNotificationToggle( page );
		await expect( notificationToggle ).not.toBeChecked();

		// Flip it back on and save the post: the entry must be rewritten to the new format.
		await notificationToggle.click();
		await expect( notificationToggle ).toBeChecked();

		await expect( saveBtn ).toBeEnabled({ timeout: 10_000 });
		await saveBtn.click();
		await expectFormOptionSavedNotice( page );

		const savedEmail = findSavedFormEmail( await getSavedFormEmails( page ), optionName );

		expect( savedEmail?.emailNotification ).toBe( true );
		expect( savedEmail?.submissionsSaveLocation ).toBeUndefined();
	});

	test( 'captcha provider outage saves the Record, skips delivery and alerts the admin once', async({ otterUtils, requestUtils }) => {
		const formOption = `e2e-captcha-down-${Date.now()}`;
		const formId = 'wp-block-themeisle-blocks-form-captchadown';

		await otterUtils.upsertFormOption({
			form: formOption,
			hasCaptcha: true,
			errorMessage: 'Captcha offline.'
		});
		await otterUtils.setCaptchaMode( 'down' );

		const submit = async() => submitFormViaApi( requestUtils, {
			nonceValue: await otterUtils.getFormVerificationNonce(),
			formOption,
			formId,
			token: 'e2e-captcha-token'
		});

		const response = await submit();

		// Infrastructure failure: the visitor sees the configured error...
		expect( response.success ).toBe( false );
		expect( response.code ).toBe( '114' );
		expect( response.displayError ).toBe( 'Captcha offline.' );

		// ...but the submission is saved and marked failed for the captcha action.
		let records = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );

		expect( records ).toHaveLength( 1 );
		expect( records[0].status ).toBe( 'unread' );
		expect( records[0].delivery_status ).toBe( 'failed' );
		expect( records[0].delivery_errors[0].action ).toBe( 'captcha' );

		// Primary delivery was skipped: the only email is the admin alert.
		let mailLog = await otterUtils.getMailLog();
		expect( mailLog ).toHaveLength( 1 );
		expect( mailLog[0].subject ).toMatch( ADMIN_ALERT_SUBJECT );

		// A second submission during the outage is saved too, with no repeated alert.
		const secondResponse = await submit();
		expect( secondResponse.code ).toBe( '114' );

		records = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );
		expect( records ).toHaveLength( 2 );

		mailLog = await otterUtils.getMailLog();
		expect( mailLog ).toHaveLength( 1 );
	});

	test( 'invalid captcha token rejects the submission without a Record', async({ otterUtils, requestUtils }) => {
		const formOption = `e2e-captcha-invalid-${Date.now()}`;
		const formId = 'wp-block-themeisle-blocks-form-captchabad';

		await otterUtils.upsertFormOption({
			form: formOption,
			hasCaptcha: true
		});
		await otterUtils.setCaptchaMode( 'invalid' );

		const response = await submitFormViaApi( requestUtils, {
			nonceValue: await otterUtils.getFormVerificationNonce(),
			formOption,
			formId,
			token: 'e2e-captcha-token'
		});

		// Verification failure (bot suspicion) still rejects with no Record saved.
		expect( response.success ).toBe( false );
		expect( response.code ).toBe( '204' );

		const records = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );
		expect( records ).toHaveLength( 0 );
	});

	test( 'records can be managed from the Submissions dashboard: row, bulk and view actions', async({ page, otterUtils, requestUtils }) => {
		const formOption = `e2e-manage-${Date.now()}`;
		const formId = 'wp-block-themeisle-blocks-form-manage';

		await otterUtils.upsertFormOption({ form: formOption });

		// Seed two stored submissions.
		for ( let i = 0; 2 > i; i++ ) {
			const response = await submitFormViaApi( requestUtils, {
				nonceValue: await otterUtils.getFormVerificationNonce(),
				formOption,
				formId
			});
			expect( response.success ).toBe( true );
		}

		const [ first, second ] = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );

		// Row action: mark the first record as read.
		await page.goto( '/wp-admin/edit.php?post_type=otter_form_record' );

		const firstRow = page.locator( `#post-${first.id}` );
		await firstRow.hover();
		await firstRow.getByRole( 'link', { name: 'Mark as Read' }).click();

		let records = await otterUtils.getFormRecords();
		expect( records.find( record => record.id === first.id ).status ).toBe( 'read' );
		expect( records.find( record => record.id === second.id ).status ).toBe( 'unread' );

		// Bulk action: mark both as unread.
		await page.goto( '/wp-admin/edit.php?post_type=otter_form_record' );
		await page.locator( '#cb-select-all-1' ).check();
		await page.locator( '#bulk-action-selector-top' ).selectOption( 'unread' );
		await page.locator( '#doaction' ).click();

		records = await otterUtils.getFormRecords();
		expect( records.find( record => record.id === first.id ).status ).toBe( 'unread' );
		expect( records.find( record => record.id === second.id ).status ).toBe( 'unread' );

		// Viewing a record flips it to read.
		await page.goto( `/wp-admin/post.php?post=${second.id}&action=edit` );

		records = await otterUtils.getFormRecords();
		expect( records.find( record => record.id === second.id ).status ).toBe( 'read' );
	});

	test( 'failed submissions surface their Delivery Status in the Submissions dashboard', async({ page, otterUtils, requestUtils }) => {
		const formOption = `e2e-dashboard-${Date.now()}`;
		const formId = 'wp-block-themeisle-blocks-form-dashboard';

		await otterUtils.upsertFormOption({ form: formOption });
		await otterUtils.setMailMode( 'fail' );

		const response = await submitFormViaApi( requestUtils, {
			nonceValue: await otterUtils.getFormVerificationNonce(),
			formOption,
			formId
		});

		expect( response.success ).toBe( false );

		const records = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );
		expect( records ).toHaveLength( 1 );
		const [{ id: recordId }] = records;

		// The list table shows the record with a Failed delivery badge.
		await page.goto( '/wp-admin/edit.php?post_type=otter_form_record' );

		await expect( page.locator( `#post-${recordId} a.row-title` ) ).toHaveText( `Submission #${recordId}` );
		await expect( page.locator( `#post-${recordId} .o-delivery-failed` ) ).toHaveText( 'Failed' );

		// The record detail page shows the submitted data and the delivery errors.
		await page.goto( `/wp-admin/post.php?post=${recordId}&action=edit` );

		await expect( page.locator( '#field_values_meta_box' ) ).toBeVisible();
		await expect( page.locator( '.otter_form_record_meta__value' ).first() ).toHaveValue( 'Ada E2E' );
		await expect( page.locator( '#submitpost .metadata' ) ).toContainText( 'Delivery' );
		await expect( page.locator( '#submitpost .metadata' ) ).toContainText( 'Failed' );
		await expect( page.locator( '#submitpost .metadata li' ).first() ).toContainText( 'email' );
		await expect( page.locator( '#submitpost .metadata li' ).first() ).toContainText( 'Email could not be sent' );

		// The Errors meta box lists each recorded issue with its code and message.
		const errorsBox = page.locator( '#form_record_errors_meta_box' );
		await expect( errorsBox ).toBeVisible();
		await expect( errorsBox.locator( 'tbody tr' ).first().locator( 'code' ) ).toHaveText( '106' );
		await expect( errorsBox.locator( 'tbody tr' ).first() ).toContainText( 'Email could not be sent' );

		// A clean record renders Complete delivery and no Errors meta box at all.
		await otterUtils.setMailMode( 'ok' );

		await submitFormViaApi( requestUtils, {
			nonceValue: await otterUtils.getFormVerificationNonce(),
			formOption,
			formId
		});

		const cleanRecord = ( await otterUtils.getFormRecords() )
			.filter( record => record.form === formId )
			.find( record => record.id !== recordId );

		await page.goto( `/wp-admin/post.php?post=${cleanRecord.id}&action=edit` );

		await expect( page.locator( '#submitpost .metadata' ) ).toContainText( 'Complete' );
		await expect( page.locator( '#form_record_errors_meta_box' ) ).toBeHidden();
	});

	test( 'failed webhook marks delivery Failed while the visitor still sees success', async({ page, otterUtils, requestUtils }) => {
		const formOption = `e2e-webhook-${Date.now()}`;
		const formId = 'wp-block-themeisle-blocks-form-webhook0';

		// Webhooks are a Pro delivery action; point one at a dead port.
		await otterUtils.activatePro();
		await otterUtils.setOptions({
			themeisle_webhooks_options: [
				{
					id: 'e2e-dead-webhook',
					name: 'E2E dead webhook',
					url: 'http://127.0.0.1:9/otter-e2e',
					method: 'POST',
					headers: []
				}
			]
		});
		await otterUtils.upsertFormOption({ form: formOption, webhookId: 'e2e-dead-webhook' });

		const response = await submitFormViaApi( requestUtils, {
			nonceValue: await otterUtils.getFormVerificationNonce(),
			formOption,
			formId
		});

		// The webhook failure is only a warning: the visitor gets a success response.
		expect( response.success ).toBe( true );

		// ...but the Record is marked failed for the webhook action.
		const records = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );

		expect( records ).toHaveLength( 1 );
		expect( records[0].delivery_status ).toBe( 'failed' );
		expect( records[0].delivery_errors[0].action ).toBe( 'webhook' );

		const [{ id: recordId }] = records;

		// The record detail page renders the webhook failure in both meta boxes.
		// The message is the raw transport error, so assert action and code only.
		await page.goto( `/wp-admin/post.php?post=${recordId}&action=edit` );

		await expect( page.locator( '#submitpost .metadata' ) ).toContainText( 'Failed' );
		await expect( page.locator( '#submitpost .metadata li' ).first() ).toContainText( 'webhook' );

		const errorsBox = page.locator( '#form_record_errors_meta_box' );
		await expect( errorsBox ).toBeVisible();
		await expect( errorsBox.locator( 'tbody tr' ).first().locator( 'code' ) ).toHaveText( '210' );
	});

	test( 'form filter is a locked upsell on free and filters records with Pro', async({ page, otterUtils, requestUtils }) => {
		const formOption = `e2e-filters-${Date.now()}`;
		const formA = 'wp-block-themeisle-blocks-form-filter-a';
		const formB = 'wp-block-themeisle-blocks-form-filter-b';

		await otterUtils.upsertFormOption({ form: formOption });

		const nonceValue = await otterUtils.getFormVerificationNonce();
		await submitFormViaApi( requestUtils, { nonceValue, formOption, formId: formA });
		await submitFormViaApi( requestUtils, { nonceValue, formOption, formId: formB });

		const records = await otterUtils.getFormRecords();
		const recordA = records.find( record => record.form === formA );
		const recordB = records.find( record => record.form === formB );

		// Free: the filters render as disabled selects with the Pro upsell.
		await page.goto( '/wp-admin/edit.php?post_type=otter_form_record' );

		await expect( page.locator( '.o-filters-locked select' ).first() ).toBeDisabled();

		// Pro: the form dropdown filters the list down to the selected form's records.
		await otterUtils.activatePro();
		await page.reload();

		await page.locator( '#filter-by-form' ).selectOption( formA );
		await page.locator( '#post-query-submit' ).click();

		await expect( page.locator( `#post-${recordA.id}` ) ).toBeVisible();
		await expect( page.locator( `#post-${recordB.id}` ) ).toBeHidden();
	});

	test( 'required multiple-choice field stores its label without the asterisk', async({ editor, page, otterUtils }) => {
		// Regression for the required-field asterisk leaking into the stored/emailed label.
		// The required sign must render in its own span so the frontend extracts only the
		// label text (`.otter-form-input-label__label`) when building the submission payload.
		await editor.insertBlock({
			name: 'themeisle-blocks/form',
			innerBlocks: [
				{
					name: 'themeisle-blocks/form-input',
					attributes: { label: 'Name', type: 'text', isRequired: true }
				},
				{
					name: 'themeisle-blocks/form-input',
					attributes: { label: 'Email', type: 'email', isRequired: true }
				},
				{ name: 'themeisle-blocks/form-nonce' },
				{
					name: 'themeisle-blocks/form-multiple-choice',
					attributes: {
						label: 'Choose',
						type: 'checkbox',
						isRequired: true,
						options: [
							{ isDefault: false, content: 'Option A' },
							{ isDefault: false, content: 'Option B' }
						]
					}
				}
			]
		});

		const formBlock = await expectBlockByName( editor, 'themeisle-blocks/form' );
		const formId = formBlock.attributes.id;

		const postId = await publishPostReliable( editor, page );

		// Clear the mail log of anything the publish flow may have attempted.
		await otterUtils.setMailMode( 'ok' );

		await page.goto( `/?p=${postId}` );

		// The required asterisk renders in the UI, in a span separate from the label text.
		const choiceLabel = page.locator( '.wp-block-themeisle-blocks-form-multiple-choice .otter-form-input-label' );
		await expect( choiceLabel.locator( '.otter-form-input-label__label' ) ).toHaveText( 'Choose' );
		await expect( choiceLabel.locator( '.required' ) ).toHaveText( '*' );

		await page.getByLabel( 'Name*' ).fill( 'Ada E2E' );
		await page.getByLabel( 'Email*' ).fill( 'ada@example.com' );
		await page.getByLabel( 'Option A' ).check();

		// Wait out the anti-spam minimum fill time.
		await page.waitForTimeout( 5000 );

		// Capture the actual submission request so we can assert the wire payload, not just
		// the persisted result. The frontend posts a multipart body whose `form_data` part
		// is the JSON `{ handler, payload }` built from extractFormFields.
		const submitRequestPromise = page.waitForRequest( request =>
			request.url().includes( 'otter/v1/form/frontend' ) && 'POST' === request.method()
		);

		await page.getByRole( 'button', { name: 'Submit' }).click();

		const submitRequest = await submitRequestPromise;
		const sentBody = submitRequest.postData() || '';
		const sentJson = sentBody.match( /name="form_data"[\r\n]+([\s\S]*?)[\r\n]+--/ );
		const sentFields = sentJson ? ( JSON.parse( sentJson[1] )?.payload?.formInputsData ?? [] ) : [];

		// The request sends the multiple-choice field under its plain label, asterisk-free.
		const sentChoice = sentFields.find( field => field.value?.includes( 'Option A' ) );
		expect( sentChoice ).toBeTruthy();
		expect( sentChoice.label ).toBe( 'Choose' );
		sentFields.forEach( field => expect( field.label ?? '' ).not.toContain( '*' ) );

		// The submission is persisted as a Record before delivery, regardless of email outcome.
		await expect( page.locator( '.o-form-server-response' ) ).toBeVisible();

		await expect.poll(
			async() => ( await otterUtils.getFormRecords() ).filter( record => record.form === formId ).length,
			{ timeout: 10_000 }
		).toBe( 1 );

		const records = ( await otterUtils.getFormRecords() ).filter( record => record.form === formId );

		// The multiple-choice field is stored under its plain label, without the asterisk.
		const choiceInput = records[0].inputs.find( input => input.value?.includes( 'Option A' ) );
		expect( choiceInput ).toBeTruthy();
		expect( choiceInput.label ).toBe( 'Choose' );

		// No field label (the required Name/Email included) may carry the required marker.
		records[0].inputs.forEach( input => expect( input.label ).not.toContain( '*' ) );
	});

	test( 'notification email Reply-To defaults to the submitter and honors the Reply-To Email option', async({ admin, editor, page, otterUtils }) => {
		const joinHeaders = ( headers ) => [].concat( headers ?? [] ).join( '\n' );

		await insertContactForm({ editor, page });
		const postId = await publishPostReliable( editor, page );
		await expectFormOptionSavedNotice( page );

		// Clear the mail log of anything the publish flow may have attempted.
		await otterUtils.setMailMode( 'ok' );

		await page.goto( `/?p=${postId}` );
		await fillAndSubmitContactForm( page );
		await expectSuccessMessage( page );

		// Without an explicit option, replies go to the address the visitor entered.
		let mailLog = await otterUtils.getMailLog();
		expect( mailLog ).toHaveLength( 1 );
		expect( joinHeaders( mailLog[0].headers ) ).toContain( 'Reply-To: ada@example.com' );

		// Set an explicit Reply-To through the inspector control.
		await admin.editPost( postId );

		await page.waitForFunction( () => 0 < window.wp?.data?.select( 'core/block-editor' )?.getBlocks()?.length );
		await page.evaluate( () => {
			const blocks = window.wp.data.select( 'core/block-editor' ).getBlocks();
			const form = blocks.find( block => 'themeisle-blocks/form' === block.name );
			window.wp.data.dispatch( 'core/block-editor' ).selectBlock( form.clientId );
		});
		await editor.openDocumentSettingsSidebar();

		// Wait until the Form Options panel is ready, then reveal the hidden-by-default control.
		await getEmailNotificationToggle( page );
		await showFormOption( page, 'Reply-To Email' );
		await page.getByLabel( 'Reply-To Email' ).fill( 'owner-replies@example.com' );

		const saveBtn = page.locator( '.editor-post-publish-button__button' );
		await expect( saveBtn ).toBeEnabled({ timeout: 10_000 });
		await saveBtn.click();
		await expectFormOptionSavedNotice( page );

		await otterUtils.setMailMode( 'ok' );

		await page.goto( `/?p=${postId}` );
		await fillAndSubmitContactForm( page );
		await expectSuccessMessage( page );

		mailLog = await otterUtils.getMailLog();
		expect( mailLog ).toHaveLength( 1 );
		expect( joinHeaders( mailLog[0].headers ) ).toContain( 'Reply-To: owner-replies@example.com' );
	});
});
