const { getEditorIframe } = require( './block-utility' );

import {
	startCase,
	toLower
} from 'lodash';

class GoogleFontsLoader {
	constructor() {
		this.fonts = [];
		this.status = 'none';

		this.controller = new AbortController();
		this.request = null;
	}

	async afterLoading() {
		await this.requestFonts();
		return this;
	}

	getFont( fontName ) {
		return this.fonts.find( font => font.family === fontName );
	}

	getVariants( fontName ) {
		const font = this.getFont( fontName );
		if ( font ) {
			return ( font.variants )
				.filter( o => false === o.includes( 'italic' ) )
				.map( o => {
					return o = {
						'label': startCase( toLower( o ) ),
						'value': o
					};
				});
		}
		return undefined;
	}

	async loadFontToBrowser( fontName, variant = 'regular' ) {
		if ( ! fontName ) {
			return Error( 'Empty font name.' );
		}
		const doc = getEditorIframe()?.contentWindow?.document ?? document;

		if ( GoogleFontsLoader.isFontLoadedInBrowser( fontName, doc ) ) {
			return 'Already loaded: ' + fontName;
		}

		if ( 'none' === this.status || 'loading' === this.status ) {
			await this.afterLoading();
		}

		const font = this.getFont( fontName );

		if ( ! font ) {
			return Error( 'Font does not exists.' );
		}

		const url = ( font.files[variant] ?? font.files?.regular )?.replace( 'http://', 'https://' );
		const fontFace = new FontFace( fontName, `url(${url})` );
		await fontFace.load();
		doc.fonts.add( fontFace );

		return {
			font,
			fontFace
		};
	}

	static isFontLoadedInBrowser( fontName, doc = document ) {
		return doc.fonts.check( `italic bold 16px "${fontName}"` );
	}

	async requestFonts( force = false ) {
		if ( 'done' === this.status ) {
			return this.fonts;
		}
		if ( 'none' === this.status ) {
			this.status = 'loading';
			this.request = new Promise( async( resolve, reject ) => {

				if ( 'done' === this.status && ! force ) {
					resolve( this.fonts );
				}

				if ( force ) {
					this.controller.abort();
				}

				fetch( 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyClGdkPJ1BvgLOol5JAkQY4Mv2lkLYu00k', {
					signal: this.controller.signal
				})
					.then( blob => blob.json() )
					.then( data => {
						this.fonts = data.items;
						this.status = 'done';
						resolve( this.fonts );
					}).catch( e => {
						this.status = 'error';
						reject( e );
					});
			});
		}
		return this.request;
	}
}

const googleFontsLoader = new GoogleFontsLoader();

Object.seal( googleFontsLoader );

export default googleFontsLoader;
