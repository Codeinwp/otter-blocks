import { CSS_VERSION } from '../scope-css';

jest.mock( 'tailwindcss', () => ( {
	compile: jest.fn( () => Promise.resolve( { build: () => '.flex{display:flex}' } ) ),
} ) );
jest.mock( 'tailwindcss/index.css', () => '', { virtual: true } );
jest.mock( 'tailwindcss/preflight.css', () => '', { virtual: true } );
jest.mock( 'tailwindcss/theme.css', () => '', { virtual: true } );
jest.mock( 'tailwindcss/utilities.css', () => '', { virtual: true } );

describe( 'frontend generator', () => {
	it( 'stamps the generated sheet with the stylesheet version', async () => {
		require( '../generator-frontend' );

		const ready = new Promise( ( resolve ) => document.addEventListener( 'atomic-wind:css-ready', resolve, { once: true } ) );
		document.dispatchEvent( new Event( 'DOMContentLoaded' ) );
		await ready;

		const sheet = document.getElementById( 'atomic-wind-tailwind' );

		expect( sheet.textContent ).toContain( '.flex' );
		expect( sheet.dataset.cssVersion ).toMatch( /^\d+\.\d+\.\d+$/ );
		expect( sheet.dataset.cssVersion ).toBe( CSS_VERSION );
	} );
} );
