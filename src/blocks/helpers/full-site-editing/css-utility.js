
// LEGACY: ONLY FOR REFERENCE
// export const injectCSSinIframe = () => {
// 	let emotionCSS = [];

// 	const getEmotionCSStags = () =>parent.document.head.querySelectorAll( 'style[data-emotion]' );

// 	const iFrameHead = parent.document.querySelector( 'iframe' )?.contentWindow.document.head;

// 	const cloneCSSNodes = () => {
// 		const tmp = [];
// 		getEmotionCSStags().forEach( cssNode => {
// 			tmp.push( cssNode.cloneNode( true ) );
// 		});
// 		emotionCSS.forEach( cssNode  => {
// 			iFrameHead.removeChild( cssNode );
// 		});
// 		tmp.forEach( cssNode => {
// 			iFrameHead.appendChild( cssNode );
// 		});
// 		emotionCSS = tmp;
// 	};

// 	if ( iFrameHead ) {
// 		const observer = new MutationObserver( mutations => {
// 			mutations.forEach( mutation => {
// 				if ( 'childList' === mutation.type ) {
// 					cloneCSSNodes();
// 				}
// 			});
// 		});

// 		observer.observe( parent.document.head, { childList: true, subtree: true });
// 	}
// };


