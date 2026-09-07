import { observePreviewBody } from '../preview-observer';

describe( 'observePreviewBody', () => {
	it( 'waits for preview frames to create their body before observing it', () => {
		const callbacks = [];
		const observer = { observe: jest.fn() };
		const onAttach = jest.fn();
		const doc = { body: null };
		const frameWindow = {
			requestAnimationFrame: ( callback ) => callbacks.push( callback ),
		};

		observePreviewBody( observer, onAttach, doc, frameWindow );

		expect( observer.observe ).not.toHaveBeenCalled();
		expect( callbacks ).toHaveLength( 1 );

		doc.body = {};
		callbacks.shift()();

		expect( observer.observe ).toHaveBeenCalledWith( doc.body, {
			attributes: true,
			attributeFilter: [ 'class' ],
			childList: true,
			subtree: true,
		} );
		expect( onAttach ).toHaveBeenCalledTimes( 1 );
	} );
} );
