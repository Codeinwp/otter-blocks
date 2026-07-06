import { safeGlideDestroy } from '../../blocks/slider/glide-utils.js';

describe( 'safeGlideDestroy', () => {
	it( 'does not throw when instance is missing', () => {
		expect( () => safeGlideDestroy( null as any ) ).not.toThrow();
	} );

	it( 'swallows NotFoundError from Glide.destroy()', () => {
		const glide = {
			destroy: jest.fn( () => {
				const error: any = new Error( 'Failed to execute removeChild' );
				error.name = 'NotFoundError';
				throw error;
			})
		};

		expect( () => safeGlideDestroy( glide as any ) ).not.toThrow();
		expect( glide.destroy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'swallows removeChild errors from Glide.destroy()', () => {
		const glide = {
			destroy: jest.fn( () => {
				throw new Error( 'Failed to execute removeChild on Node' );
			})
		};

		expect( () => safeGlideDestroy( glide as any ) ).not.toThrow();
		expect( glide.destroy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'never throws for unexpected cleanup errors', () => {
		const glide = {
			destroy: jest.fn( () => {
				throw new Error( 'boom' );
			})
		};

		expect( () => safeGlideDestroy( glide as any ) ).not.toThrow();
		expect( glide.destroy ).toHaveBeenCalledTimes( 1 );
	} );
} );
