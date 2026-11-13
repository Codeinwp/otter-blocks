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
	addBlockId,
	addGlobalDefaults,
	buildGetSyncValue,
	getDefaultValue,
	getDefaultValueByField,
	pullOtterPatterns,
	pullPatterns,
	sanitizeBlockId
} from '../../helpers/block-utility';

describe( 'block utility lightweight helpers', () => {
	beforeEach( () => {
		mockCorePatterns = [];
		( window as any ).themeisleGutenberg = {
			blockIDs: [],
			globalDefaults: {}
		};
	});

	describe( 'addGlobalDefaults', () => {
		it( 'is a no-op when globalDefaults is null (empty or corrupt option)', () => {
			( window as any ).themeisleGutenberg.globalDefaults = null;
			const setAttributes = jest.fn();

			expect( () =>
				addGlobalDefaults({}, setAttributes, 'themeisle-blocks/button-group', {})
			).not.toThrow();
			expect( setAttributes ).not.toHaveBeenCalled();
		});

		it( 'applies global defaults to attributes still at their block defaults', () => {
			( window as any ).themeisleGutenberg.globalDefaults = {
				'themeisle-blocks/button-group': {
					fontSize: '20px'
				}
			};
			const setAttributes = jest.fn();

			addGlobalDefaults(
				{ fontSize: undefined },
				setAttributes,
				'themeisle-blocks/button-group',
				{ fontSize: { default: undefined } }
			);

			expect( setAttributes ).toHaveBeenCalledWith({ fontSize: '20px' });
		});

		it( 'does not override attributes the user already changed', () => {
			( window as any ).themeisleGutenberg.globalDefaults = {
				'themeisle-blocks/button-group': {
					fontSize: '20px'
				}
			};
			const setAttributes = jest.fn();

			addGlobalDefaults(
				{ fontSize: '36px' },
				setAttributes,
				'themeisle-blocks/button-group',
				{ fontSize: { default: undefined } }
			);

			expect( setAttributes ).toHaveBeenCalledWith({});
		});
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

	describe( 'sanitizeBlockId', () => {
		it( 'strips punctuation and whitespace but keeps hyphens and underscores', () => {
			expect( sanitizeBlockId( 'bad id.with:chars_and spaces' ) ).toBe( 'badidwithchars_andspaces' );
			expect( sanitizeBlockId( 'my-anchor.x' ) ).toBe( 'my-anchorx' );
		});

		it( 'keeps ids that are already valid selectors byte for byte', () => {
			expect( sanitizeBlockId( 'my_section' ) ).toBe( 'my_section' );
			expect( sanitizeBlockId( 'café' ) ).toBe( 'café' );
			expect( sanitizeBlockId( 'sección_1' ) ).toBe( 'sección_1' );
			expect( sanitizeBlockId( 'wp-block-themeisle-blocks-advanced-heading-1a2b3c4d' ) ).toBe( 'wp-block-themeisle-blocks-advanced-heading-1a2b3c4d' );
		});

		it( 'returns an empty string for non-string values', () => {
			expect( sanitizeBlockId( undefined ) ).toBe( '' );
			expect( sanitizeBlockId( 42 ) ).toBe( '' );
		});
	});

	describe( 'addBlockId stored ids', () => {
		it( 'adopts the sanitized form of a stored id', () => {
			const setAttributes = jest.fn();

			addBlockId({
				attributes: { id: 'bad id.x' },
				setAttributes,
				clientId: 'aaaa1111',
				name: 'themeisle-blocks/advanced-heading-sanitize-adopt',
				defaultAttributes: {}
			});

			expect( setAttributes ).toHaveBeenCalledWith({ id: 'badidx' });
		});

		it( 'leaves a valid stored id as is', () => {
			const setAttributes = jest.fn();

			addBlockId({
				attributes: { id: 'wp-block-themeisle-blocks-advanced-heading-1a2b3c4d' },
				setAttributes,
				clientId: 'bbbb2222',
				name: 'themeisle-blocks/advanced-heading-sanitize-valid',
				defaultAttributes: {}
			});

			expect( setAttributes ).not.toHaveBeenCalled();
		});

		it( 'regenerates when the sanitized id collides with another block', () => {
			addBlockId({
				attributes: { id: 'foo.bar' },
				setAttributes: jest.fn(),
				clientId: 'cccc3333',
				name: 'themeisle-blocks/advanced-heading-sanitize-collide',
				idPrefix: 'wp-block-test-',
				defaultAttributes: {}
			});

			const setAttributes = jest.fn();
			addBlockId({
				attributes: { id: 'foo:bar' },
				setAttributes,
				clientId: 'dddd4444',
				name: 'themeisle-blocks/advanced-heading-sanitize-collide',
				idPrefix: 'wp-block-test-',
				defaultAttributes: {}
			});

			expect( setAttributes ).toHaveBeenCalledWith({ id: 'wp-block-test-dddd4444' });
		});

		it( 'regenerates when another block type already uses the sanitized id', () => {
			addBlockId({
				attributes: { id: 'foobar' },
				setAttributes: jest.fn(),
				clientId: 'gggg7777',
				name: 'themeisle-blocks/button-sanitize-collide-page',
				defaultAttributes: {}
			});

			const setAttributes = jest.fn();
			addBlockId({
				attributes: { id: 'foo.bar' },
				setAttributes,
				clientId: 'hhhh8888',
				name: 'themeisle-blocks/advanced-heading-sanitize-collide-page',
				idPrefix: 'wp-block-test-',
				defaultAttributes: {}
			});

			expect( setAttributes ).toHaveBeenCalledWith({ id: 'wp-block-test-hhhh8888' });
		});

		it( 'forgets the adopted id when a caller cleans up with its pre-sanitizing id', () => {
			// Mirrors blocks like Popup that mount blockInit once and pass the initially
			// captured attributes.id to the returned cleanup on unmount.
			const unsubscribe = addBlockId({
				attributes: { id: 'bad id.y' },
				setAttributes: jest.fn(),
				clientId: 'ffff6666',
				name: 'themeisle-blocks/advanced-heading-sanitize-cleanup',
				defaultAttributes: {}
			});

			unsubscribe( 'bad id.y' );

			const setAttributes = jest.fn();
			addBlockId({
				attributes: { id: 'badidy' },
				setAttributes,
				clientId: 'ffff6666',
				name: 'themeisle-blocks/advanced-heading-sanitize-cleanup',
				defaultAttributes: {}
			});

			expect( setAttributes ).not.toHaveBeenCalled();
		});

		it( 'regenerates when sanitizing empties the stored id', () => {
			const setAttributes = jest.fn();

			addBlockId({
				attributes: { id: '!!!' },
				setAttributes,
				clientId: 'eeee5555',
				name: 'themeisle-blocks/advanced-heading-sanitize-empty',
				idPrefix: 'wp-block-test-',
				defaultAttributes: {}
			});

			expect( setAttributes ).toHaveBeenCalledWith({ id: 'wp-block-test-eeee5555' });
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
