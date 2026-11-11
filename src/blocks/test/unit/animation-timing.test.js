describe( 'Animation timing values', () => {
	afterEach( () => {
		document.body.innerHTML = '';
		jest.resetModules();
	} );

	it( 'ignores malformed custom timing values', () => {
		document.body.innerHTML = [
			'<div class="animated o-anim-custom-delay o-anim-value-delay-250ms">Valid</div>',
			'<div class="animated o-anim-custom-speed o-anim-value-speed-1.5s">Valid</div>',
			'<div class="animated o-anim-custom-delay o-anim-value-delay-1second">Invalid</div>',
			'<div class="animated o-anim-custom-speed o-anim-value-speed-fast">Invalid</div>'
		].join( '' );

		require( '../../../animation/frontend' );
		window.dispatchEvent( new Event( 'load' ) );

		const timingStyles = document.querySelector( '#o-anim-custom-values' );

		expect( timingStyles.textContent ).toContain( 'animation-delay: 250ms' );
		expect( timingStyles.textContent ).toContain( 'animation-duration: 1.5s' );
		expect( timingStyles.textContent ).not.toContain( '1second' );
		expect( timingStyles.textContent ).not.toContain( 'fast' );
	} );
} );
