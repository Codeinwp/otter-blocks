// eslint-disable-next-line import/no-unresolved
import * as tailwindcss from 'tailwindcss';
import indexCSS from 'tailwindcss/index.css';
import preflightCSS from 'tailwindcss/preflight.css';
import themeCSS from 'tailwindcss/theme.css';
import utilitiesCSS from 'tailwindcss/utilities.css';

const assets = {
	index: indexCSS,
	preflight: preflightCSS,
	theme: themeCSS,
	utilities: utilitiesCSS,
};

const stylesheetMap = {
	tailwindcss: { path: 'virtual:tailwindcss/index.css', content: assets.index },
	'tailwindcss/preflight': { path: 'virtual:tailwindcss/preflight.css', content: assets.preflight },
	'tailwindcss/preflight.css': { path: 'virtual:tailwindcss/preflight.css', content: assets.preflight },
	'./preflight.css': { path: 'virtual:tailwindcss/preflight.css', content: assets.preflight },
	'tailwindcss/theme': { path: 'virtual:tailwindcss/theme.css', content: assets.theme },
	'tailwindcss/theme.css': { path: 'virtual:tailwindcss/theme.css', content: assets.theme },
	'./theme.css': { path: 'virtual:tailwindcss/theme.css', content: assets.theme },
	'tailwindcss/utilities': { path: 'virtual:tailwindcss/utilities.css', content: assets.utilities },
	'tailwindcss/utilities.css': { path: 'virtual:tailwindcss/utilities.css', content: assets.utilities },
	'./utilities.css': { path: 'virtual:tailwindcss/utilities.css', content: assets.utilities },
};

let compiler;
const classes = new Set();
let buildQueue = Promise.resolve();
const sheet = document.createElement( 'style' );
sheet.id = 'atomic-wind-tailwind';

async function loadStylesheet( id, base ) {
	const entry = stylesheetMap[ id ];
	if ( ! entry ) {
		throw new Error( `Unsupported @import "${ id }"` );
	}
	return { path: entry.path, base, content: entry.content };
}

async function loadModule() {
	throw new Error( 'Plugins and config files are not supported in the browser build.' );
}

async function createCompiler() {
	compiler = await tailwindcss.compile(
		'@import "tailwindcss";\n',
		{ base: '/', loadStylesheet, loadModule }
	);
	classes.clear();
}

async function build( kind ) {
	if ( ! compiler ) {
		return;
	}

	const newClasses = new Set();

	for ( const el of document.querySelectorAll( '[class]' ) ) {
		for ( const c of el.classList ) {
			if ( ! classes.has( c ) ) {
				classes.add( c );
				newClasses.add( c );
			}
		}
	}

	if ( newClasses.size === 0 && kind === 'incremental' ) {
		return;
	}

	sheet.textContent = compiler.build( Array.from( newClasses ) );
}

function rebuild( kind ) {
	buildQueue = buildQueue
		.then( async () => {
			if ( kind === 'full' ) {
				await createCompiler();
			}
			await build( kind );
		} )
		.catch( console.error );
}

new MutationObserver( ( records ) => {
	const full = 0;
	let incremental = 0;

	for ( const record of records ) {
		for ( const node of record.addedNodes ) {
			if ( node.nodeType !== Node.ELEMENT_NODE ) {
				continue;
			}
			incremental++;
		}

		if ( record.type === 'attributes' ) {
			incremental++;
		}
	}

	if ( full > 0 ) {
		rebuild( 'full' );
	} else if ( incremental > 0 ) {
		rebuild( 'incremental' );
	}
} ).observe( document.documentElement, {
	attributes: true,
	attributeFilter: [ 'class' ],
	childList: true,
	subtree: true,
} );

document.addEventListener( 'DOMContentLoaded', () => {
	buildQueue = buildQueue
		.then( async () => {
			await createCompiler();
			await build( 'full' );
			document.head.append( sheet );
			document.dispatchEvent( new CustomEvent( 'atomic-wind:css-ready' ) );
		} )
		.catch( console.error );
} );
