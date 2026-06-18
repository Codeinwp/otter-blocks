import { detectLoading } from '../../helpers/detect-loading';

describe( 'detectLoading', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	});

	afterEach( () => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	it( 'calls onLoaded immediately when plugins list is empty', () => {
		const onLoaded = jest.fn();

		detectLoading( onLoaded, [] );

		expect( onLoaded ).toHaveBeenCalledTimes( 1 );
	});

	it( 'calls onLoaded when no lottie players exist', () => {
		const onLoaded = jest.fn();
		const querySpy = jest.spyOn( document, 'querySelectorAll' ).mockReturnValue([] as unknown as NodeListOf<Element> );

		detectLoading( onLoaded, [ 'lottie' ] );

		expect( querySpy ).toHaveBeenCalledWith( 'lottie-player' );
		expect( onLoaded ).toHaveBeenCalledTimes( 1 );
	});

	it( 'calls onLoaded once when lottie player emits a load event', () => {
		const onLoaded = jest.fn();
		const listeners: Record<string, () => void> = {};
		const player = {
			shadowRoot: { querySelector: () => null },
			addEventListener: jest.fn( ( eventName: string, listener: () => void ) => {
				listeners[eventName] = listener;
			}),
			removeEventListener: jest.fn()
		};

		jest.spyOn( document, 'querySelectorAll' ).mockReturnValue([ player ] as unknown as NodeListOf<Element> );

		detectLoading( onLoaded, [ 'lottie' ] );
		listeners.load?.();
		listeners.ready?.();

		expect( onLoaded ).toHaveBeenCalledTimes( 1 );
	});

	it( 'falls back to timeout when plugin callback does not resolve', () => {
		const onLoaded = jest.fn();

		detectLoading( onLoaded, [ 'unknown-plugin' ], 1 );
		jest.advanceTimersByTime( 1000 );

		expect( onLoaded ).toHaveBeenCalledTimes( 1 );
	});
});
