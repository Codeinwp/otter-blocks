/**
 * Wordpress dependencies
 */
import { isEmpty } from 'lodash';

import { useEffect } from '@wordpress/element';

const LottiePlayer = ({
	attributes,
	isSelected,
	playerRef
}) => {
	useEffect( () => {
		if ( ! isEmpty( attributes.file ) && attributes.loop && null !== playerRef.current ) {
			playerRef.current.addEventListener( 'complete', initLoop );
		}
	}, []);

	useEffect( () => {
		if ( isSelected ) {
			playerRef.current.play();

			if ( attributes.direction ) {
				playerRef.current.seek( '100%' );
			}
		} else {
			playerRef.current.stop();
		}
	}, [ isSelected ]);

	const initLoop = () => {
		if ( playerRef.current ) {
			playerRef.current.setLooping( attributes.loop );
			playerRef.current.play();
			playerRef.current.removeEventListener( 'complete', initLoop );
		}
	};

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
				width: ( attributes.width && '%' !== attributes.width.toString().slice( -1 ) ) ? `${ attributes.width }` : false,
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
