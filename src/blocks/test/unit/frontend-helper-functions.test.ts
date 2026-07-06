import {
	debounce,
	domReady,
	easeInOutSine,
	easeInSine,
	easeOutQuad,
	easeOutSine,
	linear,
	range,
	rgb2hsl,
	scrollIntoViewIfNeeded
} from '../../helpers/frontend-helper-functions';

describe( 'range', () => {
	it( 'creates ascending numeric ranges', () => {
		expect( range( 1, 5 ) ).toEqual([ 1, 2, 3, 4, 5 ]);
		expect( range( 1, 5, 2 ) ).toEqual([ 1, 3, 5 ]);
	});

	it( 'creates descending numeric ranges', () => {
		expect( range( 5, 1, 1 ) ).toEqual([ 5, 4, 3, 2, 1 ]);
		expect( range( 5, 1, 2 ) ).toEqual([ 5, 3, 1 ]);
	});

	it( 'supports single-character strings', () => {
		expect( range( 'a', 'd' ) ).toEqual([ 'a', 'b', 'c', 'd' ]);
		expect( range( 'd', 'a' ) ).toEqual([ 'd', 'c', 'b', 'a' ]);
	});

	it( 'throws for invalid arguments', () => {
		expect( () => range( 1, 5, 0 ) ).toThrow( 'Step cannot be zero.' );
		expect( () => range( 1, 'a' ) ).toThrow( 'Start and end arguments must be of same type.' );
		expect( () => range( 'ab', 'd' ) ).toThrow( 'Only strings with one character are supported.' );
	});
});

describe( 'easing helpers', () => {
	it( 'returns expected checkpoint values', () => {
		expect( linear( 0 ) ).toBe( 0 );
		expect( linear( 1 ) ).toBe( 1 );

		expect( easeInSine( 0 ) ).toBeCloseTo( 0 );
		expect( easeInSine( 1 ) ).toBeCloseTo( 1 );

		expect( easeOutSine( 0 ) ).toBeCloseTo( 0 );
		expect( easeOutSine( 1 ) ).toBeCloseTo( 1 );

		expect( easeInOutSine( 0 ) ).toBeCloseTo( 0 );
		expect( easeInOutSine( 1 ) ).toBeCloseTo( 1 );

		expect( easeOutQuad( 0 ) ).toBeCloseTo( 0 );
		expect( easeOutQuad( 1 ) ).toBeCloseTo( 1 );
	});
});

describe( 'domReady', () => {
	it( 'calls callback immediately for complete documents', () => {
		const callback = jest.fn();
		const readyStateSpy = jest.spyOn( document, 'readyState', 'get' ).mockReturnValue( 'complete' );

		domReady( callback );

		expect( callback ).toHaveBeenCalledTimes( 1 );
		readyStateSpy.mockRestore();
	});

	it( 'registers callback when document is still loading', () => {
		const callback = jest.fn();
		const readyStateSpy = jest.spyOn( document, 'readyState', 'get' ).mockReturnValue( 'loading' );
		const addEventSpy = jest.spyOn( document, 'addEventListener' );

		domReady( callback );

		expect( addEventSpy ).toHaveBeenCalledWith( 'DOMContentLoaded', callback );
		readyStateSpy.mockRestore();
		addEventSpy.mockRestore();
	});
});

describe( 'debounce', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	});

	afterEach( () => {
		jest.useRealTimers();
	});

	it( 'invokes function only once with latest args', () => {
		const fn = jest.fn();
		const debounced = debounce( fn, 300 );

		debounced( 'first' );
		debounced( 'second' );
		debounced( 'latest' );

		jest.advanceTimersByTime( 299 );
		expect( fn ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 1 );
		expect( fn ).toHaveBeenCalledTimes( 1 );
		expect( fn ).toHaveBeenCalledWith( 'latest' );
	});
});

describe( 'rgb2hsl', () => {
	it( 'returns values as an array by default', () => {
		const [ h, s, l ] = rgb2hsl( 'rgb(255,0,0)' );

		expect( h ).toBeCloseTo( 0 );
		expect( s ).toBeCloseTo( 100 );
		expect( l ).toBeCloseTo( 50 );
	});

	it( 'returns a string when requested', () => {
		expect( rgb2hsl( 'rgb(255,0,0)', false ) ).toContain( 'hsl(' );
	});
});

describe( 'scrollIntoViewIfNeeded', () => {
	it( 'does nothing when no element is passed', () => {
		expect( () => scrollIntoViewIfNeeded( null as unknown as HTMLElement ) ).not.toThrow();
	});

	it( 'does not scroll if element is already fully visible', () => {
		const el = document.createElement( 'div' );
		const scrollSpy = jest.fn();
		el.scrollIntoView = scrollSpy;
		el.getBoundingClientRect = jest.fn( () => ({
			top: 10,
			left: 10,
			bottom: 20,
			right: 20
		}) as DOMRect );

		scrollIntoViewIfNeeded( el, { behavior: 'smooth' } );

		expect( scrollSpy ).not.toHaveBeenCalled();
	});

	it( 'scrolls when element is not fully visible', () => {
		const el = document.createElement( 'div' );
		const scrollSpy = jest.fn();
		el.scrollIntoView = scrollSpy;
		el.getBoundingClientRect = jest.fn( () => ({
			top: -10,
			left: 0,
			bottom: 20,
			right: 20
		}) as DOMRect );

		scrollIntoViewIfNeeded( el, { behavior: 'smooth' } );

		expect( scrollSpy ).toHaveBeenCalledWith({ behavior: 'smooth' });
	});
});
