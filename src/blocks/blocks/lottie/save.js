/**
 * Wordpress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { cloneElement, createElement } from '@wordpress/element';

const Save = ({
	attributes
}) => {
	const blockProps = useBlockProps.save({
		id: attributes.id,
		src: attributes.file ? attributes.file.url : '',
		width: attributes.width
	});

	let LottieElement = createElement( 'lottie-player' );
	if ( attributes.file.url.endsWith( '.lottie' ) ) {
		LottieElement = createElement( 'dotlottie-player' );
	}

	LottieElement = cloneElement( LottieElement, {
		trigger: attributes.trigger,
		background: attributes.backgroundColor || attributes.backgroundGradient,
		...( attributes.ariaLabel && { 'aria-label': attributes.ariaLabel }),
		...blockProps
	});

	if ( 'scroll' === attributes.trigger ) {
		return LottieElement;
	}

	LottieElement = cloneElement( LottieElement, {
		autoplay: ! attributes.trigger || 'none' === attributes.trigger,
		loop: attributes.loop,
		hover: 'hover' === attributes.trigger,
		count: attributes.direction ? attributes.count * -1 : attributes.count,
		speed: attributes.speed,
		direction: attributes.direction ? -1 : 1,
		trigger: attributes.trigger,
		'data-loop': attributes.loop,
		mode: 'normal'
	});

	return LottieElement;
};

export default Save;
