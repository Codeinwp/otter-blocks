const { getEditorIframe } = require( './block-utility' );

import {
	startCase,
	toLower
} from 'lodash';

/**
 * Class that request the fonts and loaded them into the browser.
 */
class GoogleFontsLoader {

	/**
	 * Initialize.
	 */
	constructor() {
		this.fonts = [];
		this.status = 'none';

		this.controller = new AbortController();
		this.request = null;

		this.node = document.createElement( 'style' );
		this.node.type = 'text/css';
		this.node.setAttribute( 'data-generator', 'otter-blocks-fonts-loader' );
		this.isAttaching = false;

		this.usedFonts = [];
	}

	/**
	 * The the loader after is loaded.
	 *
	 * @returns {Promise<GoogleFontsLoader>}
	 */
	async afterLoading() {
		await this.requestFonts();
		return this;
	}

	/**
	 * Get the font.
	 *
	 * @param {string} fontName The name of the font.
	 * @returns {import('../components/google-fonts-control/types').GoogleFontItem}
	 */
	getFont( fontName ) {
		return this.fonts.find( font => font.family === fontName );
	}

	/**
	 * Get the variants of the font.
	 *
	 * @param {string} fontName The name of the font.
	 * @returns {{label: string, value: string}[]}
	 */
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
		return [];
	}

	/**
	 * Load the font to brower document. Can inject to an iframe.
	 *
	 * @param {string} fontName The name of the font.
	 * @param {string} variant The font variant.
	 * @returns {Promise<Error|import('../components/google-fonts-control/types').GoogleFontItem}
	 */
	async loadFontToBrowser( fontName, variant = 'regular' ) {
		if ( ! fontName ) {
			return Error( 'Empty font name.' );
		}

		if ( 'none' === this.status || 'loading' === this.status ) {
			await this.afterLoading();
		}

		const font = this.getFont( fontName );

		if ( ! font ) {
			return Error( 'Font does not exists.' );
		}

		if ( ! this.usedFonts.find( ( _ ) => _.font.family === fontName && _.variant === variant ) ) {
			this.usedFonts.push({ font, variant });
			this.updateCSSNode();
		}

		return font;
	}

	/**
	 * Make a request to get the font list.
	 *
	 * @param {boolen} force Force the request to trigger again.
	 * @returns {Promise<import('../components/google-fonts-control/types').GoogleFontItem[] | Promise<import('../components/google-fonts-control/types').GoogleFontItem[]>>} Return the result or the request that is in pending.
	 */
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

	/**
	 * Update the node CSS.
	 */
	updateCSSNode() {
		this.node.innerHTML = this.renderCSSFont();
	}

	attach() {
		if ( ! this.isAttaching ) {
			this.isAttaching = true;
			setTimeout( () => {
				const currentDocument = getEditorIframe()?.contentWindow?.document ?? document;
				if ( ! currentDocument?.querySelector( '[data-generator*="otter-blocks-fonts-loader"' ) ) {
					currentDocument?.head?.appendChild( this.node );
				}
				this.isAttaching = false;
			}, 500 );
		}
	}


	/**
	 * Render the Font Face for every used font.
	 */
	renderCSSFont() {
		return Array.from( this.usedFonts ).map( ({ font, variant }) => {
			const url = ( font.files?.[variant] ?? font.files?.regular )?.replace( 'http://', 'https://' );
			return `
				@font-face {
					font-family: "${font.family}";
					src: url('${url}'); /* IE9 Compat Modes */
					src: url('${url}')  format('truetype'), /* Safari, Android, iOS */
				}
			`;
		}).join( '\n' );
	}
}

const googleFontsLoader = new GoogleFontsLoader();

Object.seal( googleFontsLoader );

export default googleFontsLoader;
