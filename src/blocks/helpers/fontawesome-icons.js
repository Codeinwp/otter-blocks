/**
 * Font Awesome icon metadata loader.
 *
 * The icon metadata JSON is ~143KB. Importing it statically pulls the whole
 * file into the main editor bundle, where it is downloaded and parsed on every
 * editor load even when no icon is ever inserted. Loading it through a dynamic
 * import keeps it in its own chunk that is fetched once — and only when an icon
 * picker (or an icon-driven block such as the accordion) actually needs it.
 */

const PREFIX_BY_STYLE = {
	brands: 'fab',
	solid: 'fas',
	regular: 'far'
};

let rawCache = null;
let rawRequest = null;

/**
 * Lazily load the raw Font Awesome icon map (keyed by icon name).
 *
 * The result is cached so the chunk is fetched and parsed at most once.
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
