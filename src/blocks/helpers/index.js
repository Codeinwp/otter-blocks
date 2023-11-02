/**
 * Internal dependencies
 */
import domReady from '@wordpress/dom-ready';
import { blockInit } from './block-utility.js';

import * as icons from './icons.js';

import useSettings from './use-settings.js';

window.otterUtils = {};

window.otterUtils.blockInit = blockInit;
window.otterUtils.icons = icons;
window.otterUtils.useSettings = useSettings;

domReady( () => {
	window.oTrk = window?.tiTrk?.with( 'otter' );
});
