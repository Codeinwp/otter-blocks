const stripTags = ( html ) => html.replace( /<[^>]+>/g, '' ).trim();

const normalizeBlockName = ( name ) => {
	return name.includes( '/' ) ? name : `core/${ name }`;
};

const parseBlockMarkup = ( html ) => {
	if ( ! html.includes( '<!-- wp:' ) ) {
		return [];
	}

	const blocks = [];
	const pattern = /<!-- wp:([\w/-]+)(\s+(\{[\s\S]*?\}))? -->\s*([\s\S]*?)<!-- \/wp:\1 -->/g;
	let match;

	while ( ( match = pattern.exec( html ) ) !== null ) {
		const [ , rawName, , attrsJson, innerHtml ] = match;
		const name = normalizeBlockName( rawName );
		const attributes = attrsJson ? JSON.parse( attrsJson ) : {};

		if ( 'core/paragraph' === name || 'core/heading' === name ) {
			attributes.content = stripTags( innerHtml );
		}

		blocks.push({
			name,
			attributes,
			innerBlocks: []
		});
	}

	return blocks;
};

const rawHandler = ({ HTML }) => {
	if ( /<ul[\s>]/i.test( HTML ) ) {
		return [{ name: 'core/list', attributes: {}, innerBlocks: [] }];
	}

	const headingMatch = HTML.match( /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/i );

	if ( headingMatch ) {
		return [{
			name: 'core/heading',
			attributes: {
				level: Number( headingMatch[1] ),
				content: stripTags( headingMatch[2] )
			},
			innerBlocks: []
		}];
	}

	return [{
		name: 'core/paragraph',
		attributes: { content: stripTags( HTML ) },
		innerBlocks: []
	}];
};

const createBlock = ( name, attributes = {}, innerBlocks = [] ) => ({
	name,
	attributes,
	innerBlocks
});

const serializeAttributes = ( attributes ) => {
	const keys = Object.keys( attributes || {} );

	if ( ! keys.length ) {
		return '';
	}

	return ` ${ JSON.stringify( attributes ) }`;
};

const serializeBlock = ( block ) => {
	const attrs = serializeAttributes( block.attributes );
	const inner = ( block.innerBlocks || [] ).map( serializeBlock ).join( '' );

	if ( 'core/paragraph' === block.name ) {
		return `<!-- wp:paragraph${ attrs } --><p>${ block.attributes?.content || '' }</p>${ inner }<!-- /wp:paragraph -->`;
	}

	if ( 'core/heading' === block.name ) {
		const level = block.attributes?.level || 2;
		return `<!-- wp:heading${ attrs } --><h${ level }>${ block.attributes?.content || '' }</h${ level }>${ inner }<!-- /wp:heading -->`;
	}

	const serializedName = block.name.replace( /^core\//, '' );

	return `<!-- wp:${ serializedName }${ attrs } -->${ inner }<!-- /wp:${ serializedName } -->`;
};

const cloneBlock = ( block, mergeAttributes = {} ) => ({
	...block,
	attributes: { ...( block.attributes || {} ), ...mergeAttributes },
	innerBlocks: ( block.innerBlocks || [] ).map( ( inner ) => cloneBlock( inner ) )
});

module.exports = {
	createBlock,
	cloneBlock,
	parse: parseBlockMarkup,
	rawHandler,
	serialize: jest.fn( blocks => ( blocks || [] ).map( serializeBlock ).join( '' ) )
};
