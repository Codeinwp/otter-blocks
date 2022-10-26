/**
 * Wordpress dependencies
 */
import { isEmpty } from 'lodash';

import { useEffect } from '@wordpress/element';
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

	console.log( attributes.file );

	if ( attributes.file.url.endsWith( '.lottie' ) ) {
		return (
			<dotLottie-player
				id={ attributes.id }
				ref={ playerRef }
				autoplay
				controls
				loop
				mode="normal"
				src={ attributes.file.url }
			/>
		);
	}

	return (
		<lottie-player
			id={ attributes.id }
			ref={ playerRef }
			src={ attributes.file.url }
			autoplay
			count={ attributes.count }
			speed={ attributes.speed }
			background={ attributes.backgroundColor || attributes.backgroundGradient }
			direction={ attributes.direction ? -1 : 1 }
			style={ {
				width: ( attributes.width && '%' !== attributes.width.toString().slice( -1 ) ) ? `${ attributes.width }px` : false,
				maxWidth: ( attributes.width && '%' === attributes.width.toString().slice( -1 ) ) ? `${ attributes.width }` : false,
				height: 'auto'
			} }
			mode="normal"
			{ ...( attributes.ariaLabel && { 'aria-label': attributes.ariaLabel }) }
		>
		</lottie-player>
	);
};

export default LottiePlayer;
