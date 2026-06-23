/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	useInnerBlocksProps
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { ArrowIcon } from './components/icons.js';

const Save = ({
	attributes
}) => {
	const {
		id,
		autoplay,
		delay,
		showArrows,
		showDots,
		loop,
		slidesPerView,
		gap,
		height,
		arrowsColor,
		arrowsBackgroundColor,
		dotsColor,
		dotsActiveColor
	} = attributes;

	const style = {
		'--o-per-view': slidesPerView || 1,
		'--o-gap': undefined !== gap ? `${ gap }px` : undefined,
		'--o-height': height || undefined,
		'--o-arrow-color': arrowsColor || undefined,
		'--o-arrow-bg': arrowsBackgroundColor || undefined,
		'--o-dot-color': dotsColor || undefined,
		'--o-dot-active-color': dotsActiveColor || undefined
	};

	const blockProps = useBlockProps.save({
		id,
		className: 'o-content-slider',
		style,
		role: 'region',
		'aria-roledescription': 'carousel',
		'aria-label': __( 'Content slider', 'otter-blocks' ),
		'data-autoplay': autoplay ? 'true' : 'false',
		'data-delay': delay,
		'data-loop': loop ? 'true' : 'false'
	});

	const innerBlocksProps = useInnerBlocksProps.save({
		className: 'o-content-track'
	});

	return (
		<div { ...blockProps }>
			<div { ...innerBlocksProps } />

			{ showArrows && (
				<div className="o-content-arrows">
					<button
						type="button"
						className="o-content-arrow o-content-arrow--prev"
						aria-label={ __( 'Previous slide', 'otter-blocks' ) }
					>
						<ArrowIcon />
					</button>
					<button
						type="button"
						className="o-content-arrow o-content-arrow--next"
						aria-label={ __( 'Next slide', 'otter-blocks' ) }
					>
						<ArrowIcon />
					</button>
				</div>
			) }

			{ showDots && (
				<div className="o-content-dots" />
			) }
		</div>
	);
};

export default Save;
