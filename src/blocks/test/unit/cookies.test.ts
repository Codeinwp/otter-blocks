import { getCookie, setCookie } from '../../helpers/cookies';

describe( 'cookies helpers', () => {
	beforeEach( () => {
		document.cookie.split( ';' ).forEach( c => {
			const eqPos = c.indexOf( '=' );
			const name = eqPos > -1 ? c.substring( 0, eqPos ) : c;
			document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
		});
	});

	it( 'sets and reads a cookie value', () => {
		setCookie( 'otterTest', 'value123', 1 );

		expect( getCookie( 'otterTest' ) ).toBe( 'value123' );
	});

	it( 'returns empty string for missing cookies', () => {
		expect( getCookie( 'missingCookie' ) ).toBe( '' );
	});
});
