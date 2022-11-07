/**
 * WordPress dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

domReady( () => {
	const lottieAmin = document.querySelectorAll( 'lottie-player.wp-block-themeisle-blocks-lottie' );
	const dotLottieAnim = document.querySelectorAll( 'dotlottie-player.wp-block-themeisle-blocks-lottie' );

	const initAnimation = animation => {
		if ( 'false' === animation.dataset.loop ) {
			animation.setLooping( false );
		}

		if ( -1 === animation.__direction ) {
			animation.seek( '100%' );
		}

		if ( Boolean( animation.__count ) ) {
			animation.__count = animation.__count - 1;
		}

		if ( -1 === animation.__direction && 'true' === animation.dataset.loop ) {
			animation.setLooping( true );

			if ( Boolean( animation.__count ) ) {
				animation.addEventListener( 'frame', e => {
					if ( e.target.getLottie().playCount === animation.__count && e.target.getLottie().currentFrame ) {
						animation.stop();
					}
				});
			}
		}
	};

	const eventAnim = animation => {
		const trigger = animation.getAttribute( 'trigger' );
		if ( 'scroll' === trigger ) {
			return window.LottieInteractivity.create({
				mode: 'scroll',
				player: animation.getLottie(),
				container: animation,
				actions: [{
					visibility: [ 0, 1 ],
					type: 'seek',
					frames: [ 0, animation.getLottie().totalFrames ]
				}]
			});
		}

		if ( 'hover' === trigger ) {
			initAnimation( animation );
			return -1 === animation.__direction ? animation.pause() : animation.stop();
		}

		if ( 'click' === trigger ) {
			animation.addEventListener( 'click', () => {
				animation.play();
			});

			animation.addEventListener( 'complete', () => animation.stop() );
			initAnimation( animation );
			return -1 === animation.__direction ? animation.pause() : animation.stop();
		}

		return initAnimation( animation );
	};

	const addStyle = animation => {
		if ( animation.getAttribute( 'width' ) ) {
			animation.style.height = 'auto';

			const width = animation.getAttribute( 'width' );
			if ( '%' === width.toString().slice( -1 ) ) {
				animation.style.maxWidth = width;
			} else {
				animation.style.width = ( 'px' !== width.toString().slice( -2 ) ) ? `${width}px` : width;
			}
		}
	};

	lottieAmin.forEach( animation => {
		animation.addEventListener( 'load', e => {
			const animation = e.target;
			eventAnim( animation );
		});

		addStyle( animation );
	});

	dotLottieAnim.forEach( animation => {
		const interval = setInterval( () => {
			if ( animation.load ) {
				animation.load( animation.dataset.src )?.then( () => {
					eventAnim( animation );
				});

				addStyle( animation );
				clearInterval( interval );
			}
		}, 0 );
	});
});
