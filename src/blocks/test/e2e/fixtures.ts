/**
 * WordPress dependencies
 */
import { test as base, expect } from '@wordpress/e2e-test-utils-playwright';

export type MailLogEntry = {
	to: string | string[];
	subject: string;
};

export type FormRecord = {
	id: number;
	title: string;
	status: string;
	form: string | null;
	inputs: Array<{ label: string; value: string }>;

	/* eslint-disable camelcase */
	delivery_status: string;
	delivery_errors: Array<{ action: string; code: string; message: string }> | '';
	/* eslint-enable camelcase */
};

/**
 * Helpers backed by the `otter-e2e/v1` REST namespace exposed by
 * `packages/e2e-tests/mu-plugins/otter-e2e-bootstrap.php`.
 */
export type MigrationStatus = {
	version: string;
	install: number;
	ranMigrations: string[];
	atomicWind: boolean | null;
	atomicWindUnset: boolean;
};

export type OtterUtils = {
	activatePro: () => Promise<unknown>;
	deactivatePro: () => Promise<unknown>;
	setOptions: ( options: Record<string, unknown> ) => Promise<unknown>;
	seedPrompts: () => Promise<unknown>;
	reset: () => Promise<unknown>;

	/** 'fail' makes every wp_mail() fail; both modes clear the mail log. */
	setMailMode: ( mode: 'ok' | 'fail' ) => Promise<unknown>;

	/** Every wp_mail() attempt since the last setMailMode call, in order. */
	getMailLog: () => Promise<MailLogEntry[]>;

	/** Mock the reCAPTCHA verify endpoint: provider outage, rejected token, accepted token, or pass-through. */
	setCaptchaMode: ( mode: 'down' | 'invalid' | 'valid' | 'off' ) => Promise<unknown>;

	/** Stub or pass through /otter/v1/openai/generate (AI block E2E). */
	setOpenAiMode: ( mode: 'stub' | 'off' ) => Promise<unknown>;

	/** Upsert an entry in themeisle_blocks_form_emails; a null value removes the key (simulates legacy entries). */
	upsertFormOption: ( entry: { form: string } & Record<string, unknown> ) => Promise<unknown>;

	/** Mint a `form-verification` nonce for API-driven submissions. */
	getFormVerificationNonce: () => Promise<string>;

	/** All stored Submission Records with their Delivery Status meta. */
	getFormRecords: () => Promise<FormRecord[]>;

	/** Hard-delete all Submission Records. */
	cleanupFormRecords: () => Promise<unknown>;

	/** Reset SDK migration state for Atomic Wind defaulting E2E. */
	resetMigrations: ( options?: { installOffsetSeconds?: number } ) => Promise<{ ok: boolean; status: MigrationStatus }>;

	/** Read SDK migration / Atomic Wind option state. */
	getMigrationStatus: () => Promise<MigrationStatus>;
};

export const test = base.extend<{ otterUtils: OtterUtils }>({
	otterUtils: async({ requestUtils }, use ) => {
		const call = ( path: string, data?: unknown ) =>
			requestUtils.rest({
				method: 'POST',
				path: `/otter-e2e/v1/${ path }`,
				data
			});

		await use({
			activatePro: () => call( 'pro/activate' ),
			deactivatePro: () => call( 'pro/deactivate' ),
			setOptions: ( options ) => call( 'options', options ),
			seedPrompts: () => call( 'prompts/seed' ),
			reset: () => call( 'reset' ),
			setMailMode: ( mode ) => call( 'mail', { mode }),
			getMailLog: () => call( 'mail/log' ) as Promise<MailLogEntry[]>,
			setCaptchaMode: ( mode ) => call( 'captcha', { mode }),
			setOpenAiMode: ( mode ) => call( 'openai', { mode }),
			upsertFormOption: ( entry ) => call( 'form/options', entry ),
			getFormVerificationNonce: async() => {
				const response = ( await call( 'form/nonce' ) ) as { nonce: string };
				return response.nonce;
			},
			getFormRecords: () => call( 'form/records' ) as Promise<FormRecord[]>,
			cleanupFormRecords: () => call( 'form/records/cleanup' ),
			resetMigrations: ( options = {} ) => call( 'migrations/reset', options ) as Promise<{ ok: boolean; status: MigrationStatus }>,
			getMigrationStatus: () => call( 'migrations/status' ) as Promise<MigrationStatus>
		});
	}
});

export { expect };
