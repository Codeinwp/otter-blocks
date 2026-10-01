/**
 * Atomic Wind block titles must stay translatable in the editor (#3081).
 */
const BLOCKS = {
	box: 'Box',
	text: 'Text',
	image: 'Image',
	link: 'Link',
	icon: 'Icon',
};

// uuid ships ESM-only, which Jest cannot parse.
jest.mock( 'uuid', () => ( { v4: () => 'uuid' } ) );
jest.mock( '../box/edit', () => () => null );
jest.mock( '../box/save', () => () => null );
jest.mock( '../text/edit', () => () => null );
jest.mock( '../text/save', () => () => null );
jest.mock( '../image/edit', () => () => null );
jest.mock( '../image/save', () => () => null );
jest.mock( '../link/edit', () => () => null );
jest.mock( '../link/save', () => () => null );
jest.mock( '../icon/edit', () => () => null );

const registerAll = ( blocks ) => {
	// Registered server-side in production.
	blocks.setCategories( [ ...blocks.getCategories(), { slug: 'atomic-wind', title: 'Atomic Wind' }] );
	Object.keys( BLOCKS ).forEach( ( block ) => require( `../${ block }/index.js` ) );
};

describe( 'atomic-wind block registration i18n (#3081)', () => {
	it( 'keeps the server-translated title and description', () => {
		jest.isolateModules( () => {
			const blocks = require( '@wordpress/blocks' );

			blocks.unstable__bootstrapServerSideBlockDefinitions(
				Object.fromEntries(
					Object.entries( BLOCKS ).map( ( [ block, title ] ) => [
						`atomic-wind/${ block }`,
						{
							...require( `../${ block }/block.json` ),
							title: `translated ${ title }`,
							description: `translated ${ block } description`,
						},
					] )
				)
			);

			registerAll( blocks );

			Object.entries( BLOCKS ).forEach( ( [ block, title ] ) => {
				const blockType = blocks.getBlockType( `atomic-wind/${ block }` );

				expect( blockType.title ).toBe( `translated ${ title }` );
				expect( blockType.description ).toBe( `translated ${ block } description` );
			} );
		} );
	} );

	it( 'translates the title through the otter-blocks domain without a server definition', () => {
		jest.isolateModules( () => {
			const blocks = require( '@wordpress/blocks' );
			const { setLocaleData } = require( '@wordpress/i18n' );

			setLocaleData(
				Object.fromEntries(
					Object.values( BLOCKS ).map( ( title ) => [ `block title\u0004${ title }`, [ `otter ${ title }` ]] )
				),
				'otter-blocks'
			);

			registerAll( blocks );

			Object.entries( BLOCKS ).forEach( ( [ block, title ] ) => {
				expect( blocks.getBlockType( `atomic-wind/${ block }` ).title ).toBe( `otter ${ title }` );
			} );
		} );
	} );
} );
