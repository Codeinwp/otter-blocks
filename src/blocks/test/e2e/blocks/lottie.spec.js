/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Lottie animation whose position property carries an After Effects expression.
 *
 * @param {string} route Name the expression records when it runs.
 * @return {string} Animation JSON.
 */
const animationWithExpression = ( route ) => JSON.stringify({
	v: '5.7.4',
	fr: 30,
	ip: 0,
	op: 60,
	w: 100,
	h: 100,
	nm: route,
	ddd: 0,
	assets: [],
	layers: [{
		ddd: 0,
		ind: 1,
		ty: 4,
		nm: route,
		sr: 1,
		ks: {
			o: { a: 0, k: 100 },
			r: { a: 0, k: 0 },
			p: { a: 0, k: [ 50, 50, 0 ], x: `var $bm_rt; $bm_rt = [ 50, 50, 0 ]; self.otterLottieExpressions = ( self.otterLottieExpressions || [] ).concat( '${ route }' );` },
			a: { a: 0, k: [ 0, 0, 0 ] },
			s: { a: 0, k: [ 100, 100, 100 ] }
		},
		ao: 0,
		shapes: [
			{ ty: 'rc', d: 1, s: { a: 0, k: [ 100, 100 ] }, p: { a: 0, k: [ 0, 0 ] }, r: { a: 0, k: 0 }},
			{ ty: 'fl', c: { a: 0, k: [ 1, 0, 0, 1 ] }, o: { a: 0, k: 100 }, r: 1, nm: 'fill' }
		],
		ip: 0,
		op: 60,
		st: 0,
		bm: 0
	}],
	markers: []
});

const attr = ( value ) => value.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' );

test( 'renders Lottie animation data without evaluating its expressions', async({ page, requestUtils }) => {
	const markup = [
		`<lottie-player src="${ attr( animationWithExpression( 'lottie-player' ) ) }" autoplay loop></lottie-player>`,
		`<div class="lottie" data-bm-path="${ attr( 'data:application/json,' + animationWithExpression( 'lottie-web' ) ) }"></div>`,
		`<dotlottie-player class="wp-block-themeisle-blocks-lottie" data-src="${ attr( animationWithExpression( 'dotlottie-player' ) ) }" autoplay loop></dotlottie-player>`
	].join( '' );
	const post = await requestUtils.createPost({
		title: `Lottie expressions ${ Date.now() }`,
		status: 'publish',
		content: `<!-- wp:themeisle-blocks/lottie /--><!-- wp:html -->${ markup }<!-- /wp:html -->`
	});

	try {
		await page.goto( `/?p=${ post.id }` );

		await expect.poll( () => page.evaluate( () => [
			document.querySelector( 'lottie-player' ),
			document.querySelector( 'div.lottie' ),
			document.querySelector( 'dotlottie-player' )
		].map( ( element ) => Boolean( ( element.shadowRoot || element ).querySelector( 'svg g' ) ) ) ) ).toEqual( [ true, true, true ]);

		expect( await page.evaluate( () => window.otterLottieExpressions ) ).toBeUndefined();
	} finally {
		await requestUtils.rest({
			method: 'DELETE',
			path: `/wp/v2/posts/${ post.id }`,
			params: { force: true }
		});
	}
});
