import { getSafeRedirectUrl } from '../../helpers/frontend-helper-functions';

const { origin } = window.location;

// Same inputs as the PHP tests for Registration::sanitize_redirect_url().
describe( 'getSafeRedirectUrl', () => {
	it.each([
		'javascript:alert(1)',
		'JavaScript:x',
		' javascript:x',
		'java\tscript:x',
		'java\nscript:x',
		'data:text/html,x',
		'vbscript:x',
		'file:///etc/hosts'
	])( 'rejects %j', ( url ) => {
		expect( getSafeRedirectUrl( url ) ).toBeNull();
	});

	it.each([ undefined, null, '', '   ', 42 ])( 'rejects non-string or empty value %j', ( url ) => {
		expect( getSafeRedirectUrl( url ) ).toBeNull();
	});

	it( 'keeps encoded scheme as a same-origin path', () => {
		expect( getSafeRedirectUrl( 'javascript%3Aalert(1)' ) ).toBe( origin + '/javascript%3Aalert(1)' );
	});

	it.each([
		[ 'https://example.com/thanks?a=1&b=2', 'https://example.com/thanks?a=1&b=2' ],
		[ 'http://example.com/', 'http://example.com/' ],
		[ 'HTTPS://example.com/', 'https://example.com/' ],
		[ ' https://x.com ', 'https://x.com/' ],
		[ '../thanks', origin + '/thanks' ],
		[ '../thanks?t=12:30', origin + '/thanks?t=12:30' ],
		[ 'thank-you', origin + '/thank-you' ],
		[ '/thank-you', origin + '/thank-you' ],
		[ '?step=2', origin + '/?step=2' ],
		[ '#done', origin + '/#done' ],
		[ '//example.com/thanks', window.location.protocol + '//example.com/thanks' ]
	])( 'keeps %j', ( url, expected ) => {
		expect( getSafeRedirectUrl( url ) ).toBe( expected );
	});
});
