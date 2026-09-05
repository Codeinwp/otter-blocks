export const observePreviewBody = ( observer, onAttach, doc = document, frameWindow = window ) => {
	const attach = () => {
		if ( ! doc.body ) {
			( frameWindow.requestAnimationFrame || frameWindow.setTimeout )( attach );
			return;
		}

		observer.observe( doc.body, {
			attributes: true,
			attributeFilter: [ 'class' ],
			childList: true,
			subtree: true,
		} );
		onAttach();
	};

	attach();
};
