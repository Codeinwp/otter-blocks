import { getSettings } from '@wordpress/date';
import { getTimezone } from '../../helpers/helper-functions.js';

jest.mock( '@wordpress/date', () => ({
	getSettings: jest.fn()
}) );

const mockedGetSettings = getSettings as jest.MockedFunction<typeof getSettings>;

// `settings.timezone.offset` is the site's UTC offset in (possibly fractional) hours.
const withOffsetHours = ( offset: number ) =>
	mockedGetSettings.mockReturnValue({ timezone: { offset } } as never );

describe( 'getTimezone', () => {
	it( 'returns a valid ISO 8601 offset (±HH:MM) for UTC', () => {
		withOffsetHours( 0 );
		// The bug produced "+0:0", which moment cannot parse as ISO, forcing a
		// fallback to the JS Date constructor (the deprecation warning we are fixing).
		expect( getTimezone() ).toBe( '+00:00' );
	});

	it( 'zero-pads whole positive and negative offsets', () => {
		withOffsetHours( 2 );
		expect( getTimezone() ).toBe( '+02:00' );
		withOffsetHours( -5 );
		expect( getTimezone() ).toBe( '-05:00' );
	});

	it( 'renders fractional offsets as minutes, not decimal hours', () => {
		withOffsetHours( 5.5 );
		expect( getTimezone() ).toBe( '+05:30' );
		withOffsetHours( 5.75 );
		expect( getTimezone() ).toBe( '+05:45' );
		withOffsetHours( -9.5 );
		expect( getTimezone() ).toBe( '-09:30' );
	});
});
