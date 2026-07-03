import { aiError, describePromptError, PromptRequestError } from '../../plugins/ai-content/errors';

describe( 'describePromptError', () => {
	const err = ( error: { code?: string | null; message?: string; type?: string }, status?: number ) =>
		new PromptRequestError(
			{ code: error.code ?? null, message: error.message ?? '', type: error.type },
			status
		);

	it( 'classifies auth failures as non-retryable', () => {
		expect( describePromptError( err( { code: 'invalid_api_key' } ) ) ).toMatchObject({ kind: 'auth', retryable: false });
		expect( describePromptError( err( {}, 401 ) ) ).toMatchObject({ kind: 'auth', retryable: false });
		expect( describePromptError( err( {}, 403 ) ) ).toMatchObject({ kind: 'auth', retryable: false });
	});

	it( 'classifies rate limits as retryable', () => {
		expect( describePromptError( err( {}, 429 ) ) ).toMatchObject({ kind: 'rate-limit', retryable: true });
		expect( describePromptError( err( { message: 'Rate limit reached' } ) ) ).toMatchObject({ kind: 'rate-limit' });
	});

	it( 'classifies timeouts as retryable', () => {
		expect( describePromptError( err( {}, 504 ) ) ).toMatchObject({ kind: 'timeout', retryable: true });
		expect( describePromptError( err( { message: 'cURL error 28: timed out' } ) ) ).toMatchObject({ kind: 'timeout' });
	});

	it( 'classifies server and network failures', () => {
		expect( describePromptError( err( {}, 500 ) ) ).toMatchObject({ kind: 'server', retryable: true });
		expect( describePromptError( err( { code: 'http_request_failed' } ) ) ).toMatchObject({ kind: 'network', retryable: true });
	});

	it( 'maps the empty-response code to a meaningful empty error', () => {
		expect( describePromptError( err( { code: 'empty_response' } ) ) ).toMatchObject({ kind: 'empty', retryable: true });
	});

	it( 'falls back to unknown and keeps the backend wording when unclassified', () => {
		const result = describePromptError( err( { code: 'weird_thing', message: 'A very specific backend problem.' } ) );
		expect( result.kind ).toBe( 'unknown' );
		expect( result.retryable ).toBe( true );
		expect( result.message ).toBe( 'A very specific backend problem.' );
	});

	it( 'gives a default message when there is nothing to go on', () => {
		expect( describePromptError( {} ).message ).toBeTruthy();
	});
} );

describe( 'aiError', () => {
	it( 'uses the canned message and retryability for a kind', () => {
		expect( aiError( 'no-provider' ) ).toMatchObject({ kind: 'no-provider', retryable: false });
		expect( aiError( 'no-provider' ).message ).toBeTruthy();
	});

	it( 'accepts a message override', () => {
		expect( aiError( 'unknown', 'Custom.' ).message ).toBe( 'Custom.' );
	});
} );
