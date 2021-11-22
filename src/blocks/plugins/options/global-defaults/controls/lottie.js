/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RangeControl,
	ToggleControl,
	TextControl,
	SelectControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */


const LottieControl = ({
	blockName,
	defaults,
	changeConfig
}) => {

	return (
		<Fragment>
			<SelectControl
				label={ __( 'Trigger', 'otter-blocks' ) }
				help={ __( 'Animation trigger. This will only work on the front-end.', 'otter-blocks' ) }
				value={ defaults.trigger }
				options={ [
					{ label: __( 'None', 'otter-blocks' ), value: 'none' },
					{ label: __( 'Scroll', 'otter-blocks' ), value: 'scroll' },
					{ label: __( 'Hover', 'otter-blocks' ), value: 'hover' },
					{ label: __( 'Click', 'otter-blocks' ), value: 'click' }
				] }
				onChange={ trigger => changeConfig( blockName, { trigger }) }
			/>

			{ 'scroll' !== defaults.trigger && (
				<Fragment>
					<ToggleControl
						label={ __( 'Loop', 'otter-blocks' ) }
						help={ __( 'Whether to loop animation.', 'otter-blocks' ) }
						checked={ defaults.loop }
						onChange={ loop => changeConfig( blockName, { loop }) }
					/>

					{ defaults.loop && (
						<TextControl
							label={ __( 'Numbers of loops', 'otter-blocks' ) }
							help={ __( 'Number of times to loop animation.', 'otter-blocks' ) }
							type="number"
							value={ defaults.count }
							onChange={ count => changeConfig( blockName, { count }) }
						/>
					) }

					<RangeControl
						label={ __( 'Speed', 'otter-blocks' ) }
						help={ __( 'Animation speed.', 'otter-blocks' ) }
						value={ defaults.speed }
						onChange={ speed => changeConfig( blockName, { speed }) }
						step={ 0.1 }
						min={ 0.1 }
						max={ 5 }
						allowReset={true}
					/>

					<ToggleControl
						label={ __( 'Reverse', 'otter-blocks' ) }
						help={ __( 'Direction of animation.', 'otter-blocks' ) }
						checked={ defaults.direction }
						onChange={ direction => changeConfig( blockName, { direction }) }
					/>
				</Fragment>
			) }

			<RangeControl
				label={ __( 'Width', 'otter-blocks' ) }
				help={ __( 'Container width in pixels.', 'otter-blocks' ) }
				value={ defaults.width }
				onChange={ width => changeConfig( blockName, { width }) }
				min={ 100 }
				max={ 1000 }
				allowReset={ true }
			/>
		</Fragment>
	);
};

export default LottieControl;
