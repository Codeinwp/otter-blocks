/**
 *
 * @param {Function} onLoaded
 * @param {string[]} plugins
 */
export const detectLoading = ( onLoaded, plugins, timeLimit = 50 ) => {
	let loaded = 0;
	let trigger = true;

	if ( 0 == plugins.length ) {
		onLoaded?.();
		return;
	}

	// TODO: remove after QA approval
	console.log( '[Detection] Initiate detection with plugins: ' + plugins.join( ', ' ) );

	const triggerWhenLimitExpire = setTimeout( () => {
		if ( trigger ) {

			// TODO: remove after QA approval
			console.log( `[Detection] Trigger function: the limit of ${timeLimit}s has expired` );
			onLoaded?.();
		}
	}, timeLimit * 1000 );

	const load = () => {
		loaded += 1;
		if ( loaded >= plugins.length && trigger ) {

			// TODO: remove after QA approval
			console.log( '%c [Detection] Trigger function: all plugins loaded', 'color: green;' );
			trigger = false;
			clearTimeout( triggerWhenLimitExpire );
			onLoaded?.();
		}
	};

	plugins.forEach( plugins => {
		switch ( plugins ) {
		case 'lottie':
			detectLottieLoading( load );
			break;
		}
	});
};

const detectLottieLoading = ( onLoaded ) => {
	const lottiePlayers = document.querySelectorAll( 'lottie-player' );
	const totalPlayers = lottiePlayers.length;
	const loaded = Array( lottiePlayers.length ).fill( 0 );
	const totalLoaded = () => loaded.reduce( ( acc, x ) => acc + x, 0 );
	let trigger = true;

	const events = [ 'load', 'loop', 'ready', 'complete', 'loop', 'rendered', 'error' ];
	lottiePlayers.forEach( ( player, index ) => {

		const inter = setInterval( () => {
			if ( 0 < player?.shadowRoot?.childElementCount ) {
				loaded[index] = 1;

				// TODO: remove after QA approval
				console.log( '[Detection - Lottie] Shadow Root Change' );

				if ( totalLoaded() >= totalPlayers ) {
					if ( trigger ) {
						trigger = false;

						clearInterval( inter );

						onLoaded?.();
					}

				}
			}
		}, 300 );

		events.forEach( eventName => {
			const listener = () => {
				loaded[index] = 1;

				player.removeEventListener( eventName, listener );
				clearInterval( inter );

				// TODO: remove after QA approval
				console.log( '[Detection - Lottie] ' + eventName );

				if ( totalLoaded() >= totalPlayers ) {
					if ( trigger ) {
						trigger = false;
						onLoaded?.();
					}

				}
			};
			player.addEventListener( eventName, listener );
		});

	});
};
