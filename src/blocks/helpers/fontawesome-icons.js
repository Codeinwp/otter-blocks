/**
 * Lazy loader for the ~143KB Font Awesome icon metadata. A dynamic import keeps
 * it out of the editor bundle, in its own chunk fetched only when an icon picker
 * (or icon-driven block) needs it.
 */

const PREFIX_BY_STYLE = {
	brands: 'fab',
	solid: 'fas',
	regular: 'far'
};

let rawCache = null;
let rawRequest = null;

/**
 * Lazily load the raw icon map (keyed by name); cached after first load.
 *
 * @return {Promise<Record<string, { unicode: string, label: string, styles: Record<string, string> }>>}
 */
export function loadFontAwesomeIcons() {
	if ( rawCache ) {
		return Promise.resolve( rawCache );
	}

	if ( ! rawRequest ) {
		rawRequest = import( /* webpackChunkName: "fontawesome-icons" */ '../../../assets/fontawesome/fa-icons.json' )
			.then( ({ default: data }) => {
				rawCache = data;
				return rawCache;
			});
	}

	return rawRequest;
}

/**
 * Lazily load the Font Awesome icons as a flat, picker-ready list.
 *
 * @return {Promise<Array<{ name: string, unicode: string, prefix: string, label: string }>>}
 */
export async function loadFontAwesomeIconsList() {
	const data = await loadFontAwesomeIcons();
	const icons = [];

	Object.keys( data ).forEach( name => {
		Object.keys( data[ name ].styles ).forEach( style => {
			icons.push({
				name,
				unicode: data[ name ].unicode,
				prefix: PREFIX_BY_STYLE[ data[ name ].styles[ style ] ] ?? 'fas',
				label: data[ name ].label
			});
		});
	});

	return icons;
}
