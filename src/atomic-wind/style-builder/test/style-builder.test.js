/**
 * @param {Record<string, unknown>} config     `atomicWindStyleBuilder` data.
 * @param {Record<string, unknown>} [combined] `atomicWindCombinedStyle` data.
 * @return {Promise<Array<[string, {body: string}]>>} Requests sent before `css-saved`.
 */
async function buildStyles( config, combined ) {
	const sheet = document.createElement( 'style' );
	sheet.id = 'atomic-wind-tailwind';
	sheet.textContent = '.flex{display:flex}';
	document.body.append( sheet );

	window.atomicWindStyleBuilder = config;
	window.atomicWindCombinedStyle = combined;
	global.fetch = jest.fn( () => Promise.resolve( {} ) );

	const saved = new Promise( ( resolve ) => document.addEventListener( 'atomic-wind:css-saved', resolve, { once: true } ) );
	document.dispatchEvent( new CustomEvent( 'atomic-wind:css-ready' ) );
	await saved;

	return global.fetch.mock.calls;
}

describe( 'style builder', () => {
	// Its listener reads the page config on each event, so one load serves every test.
	beforeAll( () => {
		require( '../index' );
	} );

	afterEach( () => {
		document.body.innerHTML = '';
		delete window.atomicWindStyleBuilder;
		delete window.atomicWindCombinedStyle;
		delete global.fetch;
	} );

	it( 'saves the combined stylesheet without a post to save to', async () => {
		const calls = await buildStyles(
			{ postId: '0', restUrl: '/wp-json/otter/v1/atomic-wind', nonce: 'n' },
			{ postIds: [ 4, 9 ], cacheKey: 'atomic_wind_css_key' }
		);

		expect( calls ).toHaveLength( 1 );
		expect( calls[ 0 ][ 0 ] ).toBe( '/wp-json/otter/v1/atomic-wind/combined-style' );
		expect( JSON.parse( calls[ 0 ][ 1 ].body ) ).toEqual( {
			css: '.flex{display:flex}',
			postIds: [ 4, 9 ],
			cacheKey: 'atomic_wind_css_key',
		} );
	} );

	it( 'saves the post and the combined stylesheet from one compile', async () => {
		const calls = await buildStyles(
			{ postId: '4', restUrl: '/wp-json/otter/v1/atomic-wind', nonce: 'n' },
			{ postIds: [ 7, 9 ], cacheKey: 'atomic_wind_css_key' }
		);

		expect( calls.map( ( [ url ] ) => url ) ).toEqual( [
			'/wp-json/otter/v1/atomic-wind/style',
			'/wp-json/otter/v1/atomic-wind/combined-style',
		] );
		expect( JSON.parse( calls[ 0 ][ 1 ].body ) ).toEqual( { css: '.flex{display:flex}', postId: 4 } );
	} );
} );
