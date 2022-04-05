
/**
 * Trigger a function after loading the elements mentioned in the plugins.
 * @param {Function} onLoaded The callbackfunction.
 * @param {string[]} plugins The plugins.
 * @param {number} timeLimit The time limit to do the detection.
 */
export const detectLoading = ( onLoaded, plugins, timeLimit = 50 ) => {
	let loaded = 0;
	let trigger = true;

	if ( 0 == plugins.length ) {
		onLoaded?.();
		return;
	}

	const triggerWhenLimitExpire = setTimeout( () => {
		if ( trigger ) {
			onLoaded?.();
		}
	}, timeLimit * 1000 );

	const load = () => {
		loaded += 1;
		if ( loaded >= plugins.length && trigger ) {
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

	if ( 0 == lottiePlayers.length ) {
		onLoaded?.();
		return;
	}

	const totalPlayers = lottiePlayers.length;
	const loaded = Array( lottiePlayers.length ).fill( 0 );
	const totalLoaded = () => loaded.reduce( ( acc, x ) => acc + x, 0 );
	let trigger = true;

	const events = [ 'load', 'loop', 'ready', 'complete', 'loop', 'rendered', 'error' ];
	lottiePlayers.forEach( ( player, index ) => {

		let checkingTime = 150;

		const checkHTML = () => {
			if ( player?.shadowRoot?.querySelector( 'svg' ) || player?.shadowRoot?.querySelector( '.error' ) ) {
				loaded[index] = 1;

				if ( totalLoaded() >= totalPlayers ) {
					if ( trigger ) {
						trigger = false;
						onLoaded?.();
					}
				}
			} else {
				checkingTime += checkingTime * ( 0.5 + Math.random() );
				setTimeout( checkHTML, checkingTime );
			}
		};

		const inter = setTimeout( checkHTML, checkingTime );

		events.forEach( eventName => {
			const listener = () => {
				loaded[index] = 1;

				player.removeEventListener( eventName, listener );
				clearTimeout( inter );

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
