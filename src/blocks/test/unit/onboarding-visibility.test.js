/**
 * @param {Object}            options
 * @param {boolean}           options.serverFlag Value of themeisleGutenberg.showOnboarding.
 * @param {string|null}       options.storage    Stored 'o-show-onboarding' value.
 * @param {boolean|undefined} options.preference Saved 'show-welcome-guide' user preference.
 * @return {boolean} Initial onboarding visibility of the data store.
 */
const loadInitialVisibility = ({ serverFlag = true, storage = null, preference = undefined } = {}) => {
	jest.resetModules();

	/** @type {{ reducer: ( state: ( Object|undefined ), action: { type: string } ) => Object, selectors: { isOnboardingVisible: ( state: Object ) => boolean } }|undefined} */
	let storeConfig;

	jest.doMock( 'object-hash', () => jest.fn() );
	jest.doMock( '@wordpress/api-fetch', () => jest.fn(), { virtual: true } );
	jest.doMock( '../../helpers/helper-functions.js', () => ({
		getQueryStringFromObject: jest.fn()
	}) );

	jest.doMock( '@wordpress/data', () => ({
		registerStore: jest.fn( ( name, config ) => {
			storeConfig = config;
		}),
		select: jest.fn( store => {
			if ( 'core/preferences' === store ) {
				return {
					get: ( scope, name ) => ( 'themeisle/otter-blocks' === scope && 'show-welcome-guide' === name ? preference : undefined )
				};
			}

			return undefined;
		})
	}), { virtual: true } );

	window.themeisleGutenberg = { showOnboarding: serverFlag };
	window.localStorage.clear();

	if ( null !== storage ) {
		window.localStorage.setItem( 'o-show-onboarding', storage );
	}

	require( '../../plugins/data' );

	return storeConfig.selectors.isOnboardingVisible( storeConfig.reducer( undefined, { type: '@@INIT' }) );
};

describe( 'Welcome guide visibility', () => {
	afterEach( () => {
		window.localStorage.clear();
		delete window.themeisleGutenberg;
	});

	it( 'shows the guide when nothing has dismissed it', () => {
		expect( loadInitialVisibility() ).toBe( true );
	});

	it( 'hides the guide when the user dismissed it in another browser', () => {
		expect( loadInitialVisibility({ preference: false }) ).toBe( false );
	});

	it( 'hides the guide when this browser stored the dismissal', () => {
		expect( loadInitialVisibility({ storage: 'false' }) ).toBe( false );
	});

	it( 'hides the guide when the server disables onboarding', () => {
		expect( loadInitialVisibility({ serverFlag: false }) ).toBe( false );
	});
});
