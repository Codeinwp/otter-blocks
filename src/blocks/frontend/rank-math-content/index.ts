import { domReady } from '../../helpers/frontend-helper-functions';

domReady( () => {
	console.log( 'Loaded' );
	const postsHtml = document.querySelectorAll( '.wp-block-themeisle-blocks-posts-grid' );

	const content = Array.from( postsHtml ).map( ( post ) => post.innerHTML ).join( '' );

	window.wp.hooks.addFilter( 'rank_math_content', 'rank-math', () => {
		console.log( 'rank_math_content' );
		return content;
	});

	window?.rankMathEditor?.refresh( 'content' );
});
