/**
 * Wordpress dependencies
 */
import { isEmpty } from 'lodash';
import { cloneElement, createElement, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { copyScriptAssetToIframe, getEditorIframe } from '../../../helpers/block-utility';

const LottiePlayer = ({
	attributes,
	playerRef
}) => {
	useEffect( () => {
		const iframe = getEditorIframe();

		if ( Boolean( iframe ) ) {
			copyScriptAssetToIframe( '#lottie-player-js', () => {
				if ( ! isEmpty( attributes.file ) && attributes.loop && null !== playerRef.current ) {
					playerRef.current.addEventListener( 'complete', initLoop );
				}
			});
			copyScriptAssetToIframe( '#dotlottie-player-js', () => {
				if ( ! isEmpty( attributes.file ) && attributes.loop && null !== playerRef.current ) {
					playerRef.current.addEventListener( 'complete', initLoop );
				}
			});
		} else {
			if ( ! isEmpty( attributes.file ) && attributes.loop && null !== playerRef.current ) {
				playerRef.current.addEventListener( 'complete', initLoop );
			}
		}
	}, []);

	const initLoop = () => {
		if ( playerRef.current ) {
			playerRef.current.setLooping( attributes.loop );
			playerRef.current.play();
			playerRef.current.removeEventListener( 'complete', initLoop );
		}
	};

	let LottieElement = createElement( 'lottie-player' );
	if ( attributes.file.url.endsWith( '.lottie' ) ) {
		LottieElement = createElement( 'dotlottie-player' );
	}

	return cloneElement( LottieElement, {
		id: attributes.id,
		ref: playerRef,
		src: attributes.file.url,
		autoplay: ! attributes.trigger || 'none' === attributes.trigger,
		loop: attributes.loop,
		count: attributes.direction ? attributes.count * -1 : attributes.count,
		speed: attributes.speed,
		background: attributes.backgroundColor || attributes.backgroundGradient,
		direction: attributes.direction ? -1 : 1,
		trigger: attributes.trigger,
		'data-loop': attributes.loop,
		mode: 'normal',
		style: {
			width: ( attributes.width && '%' !== attributes.width.toString().slice( -1 ) ) ? `${ attributes.width }px` : false,
			maxWidth: ( attributes.width && '%' === attributes.width.toString().slice( -1 ) ) ? `${ attributes.width }` : false,
			height: 'auto'
		},
		...( 'hover' === attributes.trigger && { hover: 'hover' }),
		...( attributes.ariaLabel && { 'aria-label': attributes.ariaLabel })
	});
};

export default LottiePlayer;
