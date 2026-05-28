/**
 * WordPress dependencies
 */
import { expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { insertAndGetBlock } from './editor';

const FORM_BLOCK = 'themeisle-blocks/form';
const CONTACT_FORM_VARIATION = 'Contact form for clients';

export async function insertContactForm({ editor, page, blockConfig = { name: FORM_BLOCK }}) {
	const formBlock = await insertAndGetBlock( editor, blockConfig, FORM_BLOCK );

	await page.getByRole( 'button', { name: CONTACT_FORM_VARIATION }).click();

	return formBlock;
}

export async function openFormOptions( page ) {
	await page.getByRole( 'button', { name: 'Form Options options' }).click();
}

export async function showFormOption( page, optionName ) {
	await openFormOptions( page );
	await page.getByRole( 'menuitemcheckbox', { name: optionName }).click();
	await openFormOptions( page );
}

export async function getSavedFormEmails( page ) {
	return page.evaluate( async() => {
		// eslint-disable-next-line camelcase
		const { themeisle_blocks_form_emails } = await ( new wp.api.models.Settings() ).fetch();

		// eslint-disable-next-line camelcase
		return themeisle_blocks_form_emails;
	});
}

export async function expectFormOptionSavedNotice( page ) {
	await expect(
		page.getByRole( 'button', { name: 'Dismiss this notice' }).filter({
			hasText: 'Form options have been saved.'
		})
	).toBeVisible();
}

export function findSavedFormEmail( databaseEmails, optionName ) {
	return databaseEmails.find( email => email?.form === optionName );
}
