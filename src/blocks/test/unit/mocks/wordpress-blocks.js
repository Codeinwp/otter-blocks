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

module.exports = {
	parse: parseBlockMarkup,
	rawHandler,
	serialize: jest.fn( () => '' )
};
