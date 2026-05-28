let mockCorePatterns: any[] | undefined = [];

jest.mock( 'uuid', () => ({
	v4: () => 'mocked-uuid'
}) );

jest.mock( '@wordpress/blocks', () => ({
	parse: jest.fn( () => [] )
}) );

jest.mock( '@wordpress/data', () => ({
	select: jest.fn( ( storeName: string ) => {
		if ( 'core' === storeName ) {
			return {
				getBlockPatterns: () => mockCorePatterns
			};
		}

		if ( 'core/block-editor' === storeName ) {
			return {
				getBlock: () => undefined,
				getBlockParents: () => [],
				getSelectedBlockClientId: () => '',
				getBlockRootClientId: () => '',
				getTemplateLock: () => false,
				getBlockIndex: () => 0
			};
		}

		return {};
	}),
	dispatch: jest.fn( () => ({
		updateBlockAttributes: jest.fn(),
		insertBlock: jest.fn(),
		insertBlocks: jest.fn()
	}))
}) );

import {
	buildGetSyncValue,
	getDefaultValue,
	getDefaultValueByField,
	pullOtterPatterns,
	pullPatterns
} from '../../helpers/block-utility';

describe( 'block utility lightweight helpers', () => {
	beforeEach( () => {
		mockCorePatterns = [];
		( window as any ).themeisleGutenberg = {
			blockIDs: [],
			globalDefaults: {}
		};
	});

	describe( 'getDefaultValue', () => {
		it( 'returns global default when present', () => {
			( window as any ).themeisleGutenberg.globalDefaults = {
				'themeisle-blocks/button': {
					color: '#00a0d2'
				}
			};

			const defaultAttributes = {
				color: { default: '#222222' }
			};

			expect(
				getDefaultValue( 'themeisle-blocks/button', 'color', defaultAttributes )
			).toBe( '#00a0d2' );
		});

		it( 'falls back to block attribute default when global default is missing', () => {
			const defaultAttributes = {
				color: { default: '#222222' }
			};

			expect(
				getDefaultValue( 'themeisle-blocks/button', 'color', defaultAttributes )
			).toBe( '#222222' );
		});
	});

	describe( 'getDefaultValueByField', () => {
		it( 'uses default value when field is synced', () => {
			( window as any ).themeisleGutenberg.globalDefaults = {
				'themeisle-blocks/button': {
					color: '#00a0d2'
				}
			};

			const defaultAttributes = {
				color: { default: '#222222' }
			};
			const attributes = {
				isSynced: [ 'color' ],
				color: '#ff0000'
			};

			expect(
				getDefaultValueByField({
					name: 'themeisle-blocks/button',
					field: 'color',
					defaultAttributes,
					attributes
				})
			).toBe( '#00a0d2' );
		});

		it( 'uses attribute value when field is not synced', () => {
			const defaultAttributes = {
				color: { default: '#222222' }
			};
			const attributes = {
				isSynced: [],
				color: '#ff0000'
			};

			expect(
				getDefaultValueByField({
					name: 'themeisle-blocks/button',
					field: 'color',
					defaultAttributes,
					attributes
				})
			).toBe( '#ff0000' );
		});
	});

	describe( 'buildGetSyncValue', () => {
		it( 'returns synced default for synced fields and local value for others', () => {
			( window as any ).themeisleGutenberg.globalDefaults = {
				'themeisle-blocks/button': {
					color: '#00a0d2'
				}
			};

			const defaultAttributes = {
				color: { default: '#222222' },
				size: { default: 'm' }
			};
			const attributes = {
				isSynced: [ 'color' ],
				color: '#ff0000',
				size: 'l'
			};

			const getSyncValue = buildGetSyncValue( 'themeisle-blocks/button', attributes, defaultAttributes );

			expect( getSyncValue( 'color' ) ).toBe( '#00a0d2' );
			expect( getSyncValue( 'size' ) ).toBe( 'l' );
		});
	});

	describe( 'pattern helpers', () => {
		it( 'returns empty list when pattern selector has no data', () => {
			mockCorePatterns = undefined;
			expect( pullPatterns() ).toEqual([]);
		});

		it( 'filters only otter block patterns', () => {
			mockCorePatterns = [
				{ name: 'otter-blocks/hero' },
				{ name: 'otter-pro/pricing' },
				{ name: 'core/columns' },
				{ name: 'theme/custom' }
			];

			expect( pullOtterPatterns().map( pattern => pattern.name ) ).toEqual([
				'otter-blocks/hero',
				'otter-pro/pricing'
			]);
		});
	});
});
