/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import { injectCSSinIframe } from './helpers/full-site-editing/css-utility';

window.addEventListener( 'load', () => {
	setTimeout( () => {
		injectCSSinIframe();
	}, 3000 );

});
