/**
 * Internal dependencies
 */
import { getSubListAttributes } from '../../blocks/icon-list/sublist';

describe( 'Icon List sub-list seeding', () => {
	test( 'copies the parent list defaults onto the new sub-list', () => {
		const parentAttributes = {
			id: 'abc',
			defaultLibrary: 'themeisle-icons',
			defaultPrefix: 'fas',
			defaultIcon: 'star',
			defaultIconId: 12,
			defaultIconAlt: 'A star',
			defaultContentColor: '#111',
			defaultIconColor: '#222',
			defaultSize: '20px',
			defaultIconSize: '16px',
			sublistIndent: '40px',
			gap: 5
		};

		expect( getSubListAttributes( parentAttributes ) ).toEqual( {
			defaultLibrary: 'themeisle-icons',
			defaultPrefix: 'fas',
			defaultIcon: 'star',
			defaultIconId: 12,
			defaultIconAlt: 'A star',
			defaultContentColor: '#111',
			defaultIconColor: '#222',
			defaultSize: '20px',
			defaultIconSize: '16px'
		} );

		// The indent is not copied: a frozen copy would detach the sub-list
		// from the parent's control. It reaches nested lists by inheritance.
		expect( getSubListAttributes( parentAttributes ) ).not.toHaveProperty( 'sublistIndent' );
	} );

	test( 'omits unset attributes so the block defaults apply', () => {
		expect( getSubListAttributes( { defaultIcon: 'check' } ) ).toEqual( {
			defaultIcon: 'check'
		} );
	} );

	test( 'returns an empty object when the parent has nothing to inherit', () => {
		expect( getSubListAttributes( {} ) ).toEqual( {} );
		expect( getSubListAttributes( undefined ) ).toEqual( {} );
	} );
} );
