/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RangeControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */


const SliderControl = ({
	blockName,
	defaults,
	changeConfig
}) => {

	return (
		<Fragment>
			<RangeControl
				label={ __( 'Slides Per Page', 'otter-blocks' ) }
				help={ __( 'A number of visible slides.', 'otter-blocks' ) }
				value={ defaults.perView }
				onChange={ perView => changeConfig( blockName, { perView }) }
				min={ 1 }
				max={ 2 }
			/>

			{ 1 < defaults.perView && (
				<Fragment>
					<RangeControl
						label={ __( 'Gap', 'otter-blocks' ) }
						help={ __( 'A size of the space between slides.', 'otter-blocks' ) }
						value={ defaults.gap }
						onChange={ gap => changeConfig( blockName, { gap }) }
						min={ 0 }
						max={ 100 }
					/>

					<RangeControl
						label={ __( 'Peek', 'otter-blocks' ) }
						help={ __( 'The value of the future slides which have to be visible in the current slide.', 'otter-blocks' ) }
						value={ defaults.peek }
						onChange={ peek => changeConfig( blockName, { peek }) }
						min={ 0 }
						max={ 100 }
					/>
				</Fragment>
			) }

			<ToggleControl
				label={ __( 'Autoplay', 'otter-blocks' ) }
				help={ __( 'Autoplay slider in the front.', 'otter-blocks' ) }
				checked={ defaults.autoplay }
				onChange={ autoplay => changeConfig( blockName, { autoplay }) }
			/>

			{ defaults.autoplay && (
				<RangeControl
					label={ __( 'Delay', 'otter-blocks' ) }
					help={ __( 'Delay in slide change (in seconds).', 'otter-blocks' ) }
					value={ defaults.delay }
					onChange={ delay => changeConfig( blockName, { delay }) }
					min={ 1 }
					max={ 10 }
				/>
			) }

			<RangeControl
				label={ __( 'Height', 'otter-blocks' ) }
				help={ __( 'Slider height in pixels.', 'otter-blocks' ) }
				value={ defaults.height }
				onChange={ height => changeConfig( blockName, { height }) }
				min={ 100 }
				max={ 1400 }
				allowReset={ true }
			/>

			<ToggleControl
				label={ __( 'Hide Arrows', 'otter-blocks' ) }
				help={ __( 'Hide navigation arrows.', 'otter-blocks' ) }
				checked={ defaults.hideArrows }
				onChange={ hideArrows => changeConfig( blockName, { hideArrows }) }
			/>

			<ToggleControl
				label={ __( 'Hide Bullets', 'otter-blocks' ) }
				help={ __( 'Hide navigation bullets.', 'otter-blocks' ) }
				checked={ defaults.hideBullets }
				onChange={ hideBullets => changeConfig( blockName, { hideBullets }) }
			/>

		</Fragment>
	);
};

export default SliderControl;
