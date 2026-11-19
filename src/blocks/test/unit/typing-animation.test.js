describe( 'Typing animation', () => {
	beforeEach( () => {
		jest.useFakeTimers();

		window.IntersectionObserver = class {
			constructor( callback ) {
				this.callback = callback;
			}

			observe( elem ) {
				this.callback([{ isIntersecting: true, intersectionRect: { height: 1 }, target: elem }]);
			}

			unobserve() {}
		};
	});

	afterEach( () => {
		jest.useRealTimers();
		document.head.innerHTML = '';
		document.body.innerHTML = '';
		delete window.IntersectionObserver;
		jest.resetModules();
	});

	const startTyping = () => {
		document.body.innerHTML = '<h2 class="has-text-align-center o-typing-fast"><o-anim-typing>Hello</o-anim-typing></h2>';
		require( '../../../animation/frontend/typing' );
		jest.advanceTimersByTime( 100 );

		return document.querySelector( 'o-anim-typing' );
	};

	it( 'keeps the hidden remainder in step with the typed text', () => {
		const elem = startTyping();
		const steps = [];

		while ( elem.querySelector( '.o-anim-typing-caret' ) ) {
			const [ typed, remainder ] = elem.children;
			steps.push( typed.textContent + remainder.textContent );
			jest.advanceTimersByTime( 50 );
		}

		expect( steps.length ).toBeGreaterThan( 1 );
		steps.forEach( ( step ) => expect( step ).toBe( 'Hello' ) );
		expect( elem.innerHTML ).toBe( 'Hello' );
	});

	it( 'positions the caret so it takes no space in the line', () => {
		startTyping();

		// The script sets innerText, which jsdom keeps as a plain property.
		const styles = document.head.querySelector( 'style' ).innerText;

		expect( styles ).toMatch( /\.o-anim-typing-caret\s*\{\s*position:\s*relative;\s*\}/ );
		expect( styles ).toMatch( /\.o-anim-typing-caret::after\s*\{\s*position:\s*absolute;/ );
	});
});
