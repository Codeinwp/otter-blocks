/**
 * @param {string} response Preview REST response.
 * @return {Promise<HTMLElement>} Container holding the rendered fields.
 */
const renderFieldsWithPreview = async( response ) => {
	jest.resetModules();

	jest.doMock( '@wordpress/i18n', () => ({
		__: text => text
	}), { virtual: true });

	jest.doMock( '@wordpress/api-fetch', () => () => Promise.resolve( response ), { virtual: true });

	jest.doMock( '@wordpress/data', () => ({
		select: () => ({ getCurrentPostId: () => 1 })
	}), { virtual: true });

	jest.doMock( '@wordpress/components', () => ({
		BaseControl: ({ children }) => children,
		Button: () => null,
		ButtonGroup: () => null,
		ExternalLink: () => null,
		SelectControl: () => null,
		TextControl: () => null,
		ToggleControl: () => null,
		PanelBody: ({ children }) => children,
		Spinner: () => null
	}), { virtual: true });

	jest.doMock( '../../components/notice/index.js', () => () => null );

	window.themeisleGutenberg = { hasPro: true };

	const Fields = require( '../../plugins/dynamic-content/value/fields.js' ).default;

	// Same React instance as the module under test, which loaded after resetModules().
	const { act, createElement } = require( 'react' );
	const { createRoot } = require( 'react-dom/client' );
	const container = document.createElement( 'div' );
	const root = createRoot( container );

	await act( async() => {
		root.render( createElement( Fields, {
			activeAttributes: {},
			attributes: { type: 'postTitle' },
			changeAttributes: jest.fn(),
			onChange: jest.fn(),
			changeType: jest.fn(),
			onRemove: jest.fn()
		}) );
	});

	return container;
};

describe( 'Dynamic value modal preview', () => {
	beforeAll( () => {
		global.IS_REACT_ACT_ENVIRONMENT = true;
	});

	afterAll( () => {
		delete global.IS_REACT_ACT_ENVIRONMENT;
	});

	afterEach( () => {
		delete window.themeisleGutenberg;
	});

	it( 'shows escaped markup in a resolved value as its original text', async() => {
		const container = await renderFieldsWithPreview( '&lt;o-dynamic-link data-type="siteURL">Site</o-dynamic-link> &amp; more' );

		expect( container.querySelector( '.o-dynamic-modal__preview__content' ).textContent ).toBe( '<o-dynamic-link data-type="siteURL">Site</o-dynamic-link> & more' );
	});
});
