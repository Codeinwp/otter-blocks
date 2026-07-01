/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

const DEFAULT_ATOMIC_WIND_MIGRATION = '20260701120000_default_atomic_wind_blocks';

test.describe( 'Atomic Wind SDK migration', () => {
	test.afterAll( async({ otterUtils }) => {
		// Parallel specs expect Atomic Wind enabled by default in this env.
		await otterUtils.setOptions({ themeisle_blocks_settings_atomic_wind_blocks: '1' });
	});

	test( 'defaults Atomic Wind on the first admin load after a fresh install', async({
		admin,
		otterUtils,
		page
	}) => {
		const reset = await otterUtils.resetMigrations({ installOffsetSeconds: 3600 });

		expect( reset.status.version ).toBe( '' );
		expect( reset.status.atomicWindUnset ).toBe( true );
		expect( reset.status.ranMigrations ).toEqual([]);

		// Do not call other REST helpers here — any request can persist the SDK
		// version before this admin load and prevent the migrator from running.
		await admin.visitAdminPage( 'admin.php?page=otter' );

		const after = await otterUtils.getMigrationStatus();

		expect( after.version ).toBeTruthy();
		expect( after.ranMigrations ).toContain( DEFAULT_ATOMIC_WIND_MIGRATION );
		expect( after.atomicWind ).toBe( true );

		const toggle = page.getByLabel( 'Enable Atomic Wind Blocks' );

		await expect( toggle ).toBeChecked();
	});

	test( 'skips defaulting when the install is older than one day', async({
		admin,
		otterUtils
	}) => {
		await otterUtils.resetMigrations({ installOffsetSeconds: 2 * 24 * 60 * 60 });

		await admin.visitAdminPage( 'admin.php?page=otter' );

		const status = await otterUtils.getMigrationStatus();

		expect( status.atomicWindUnset ).toBe( true );
		expect( status.ranMigrations ).not.toContain( DEFAULT_ATOMIC_WIND_MIGRATION );
	});
});
