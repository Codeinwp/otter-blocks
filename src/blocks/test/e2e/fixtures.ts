/**
 * WordPress dependencies
 */
import { test as base, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Helpers backed by the `otter-e2e/v1` REST namespace exposed by
 * `packages/e2e-tests/mu-plugins/otter-e2e-bootstrap.php`.
 */
export type OtterUtils = {
	activatePro: () => Promise<unknown>;
	deactivatePro: () => Promise<unknown>;
	setOptions: ( options: Record<string, unknown> ) => Promise<unknown>;
	seedPrompts: () => Promise<unknown>;
	reset: () => Promise<unknown>;
};

export const test = base.extend<{ otterUtils: OtterUtils }>({
	otterUtils: async ({ requestUtils }, use ) => {
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
			reset: () => call( 'reset' )
		});
	}
});

export { expect };
