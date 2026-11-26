import { getSafeRedirectUrl } from '../../helpers/frontend-helper-functions';

describe( 'getSafeRedirectUrl', () => {
	it.each([
		'javascript:alert(1)',
		'JavaScript:alert(1)',
		' javascript:alert(1)',
		'\tjava\nscript:alert(1)',
		'data:text/html,<p>hi</p>',
		'vbscript:msgbox(1)',
		'file:///etc/hosts'
	])( 'rejects %j', ( url ) => {
		expect( getSafeRedirectUrl( url ) ).toBeNull();
	});

	it.each([ undefined, null, '', '   ', 42 ])( 'rejects non-string or empty value %j', ( url ) => {
		expect( getSafeRedirectUrl( url ) ).toBeNull();
	});

	it( 'keeps encoded scheme as a same-origin path', () => {
		expect( getSafeRedirectUrl( 'javascript%3Aalert(1)' ) ).toBe( window.location.origin + '/javascript%3Aalert(1)' );
	});

	it( 'allows https and http URLs', () => {
		expect( getSafeRedirectUrl( 'https://example.com/thanks?a=1' ) ).toBe( 'https://example.com/thanks?a=1' );
		expect( getSafeRedirectUrl( 'HTTP://example.com' ) ).toBe( 'http://example.com/' );
	});

	it( 'resolves relative URLs against the current page', () => {
		expect( getSafeRedirectUrl( '/thank-you' ) ).toBe( window.location.origin + '/thank-you' );
	});
});
