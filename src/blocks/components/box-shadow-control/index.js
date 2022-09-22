/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { __experimentalColorGradientControl as ColorGradientControl } from '@wordpress/block-editor';
import { RangeControl } from '@wordpress/components';

/**
 * Internal Dependencies
 */
import ControlPanelControl from '../control-panel-control/index.js';

const BoxShadowControl = ({
	boxShadow,
	onChange
}) => {
	const defaultBoxShadow = {
		active: false,
		color: undefined,
		colorOpacity: 50,
		blur: 5,
		spread: 1,
		horizontal: 0,
		vertical: 0
	};

	return (
		<ControlPanelControl
			label={ __( 'Box Shadow', 'otter-blocks' ) }
			attributes={ boxShadow }
			setAttributes={ onChange }
			resetValues={ defaultBoxShadow }
			onClick={ () => onChange({ active: true }) }
		>
			<Fragment>
				<ColorGradientControl
					label={ __( 'Shadow Color', 'otter-blocks' ) }
					colorValue={ boxShadow.color }
					onColorChange={ color => onChange({ color }) }
				/>

				<RangeControl
					label={ __( 'Opacity', 'otter-blocks' ) }
					value={ boxShadow.colorOpacity }
					onChange={ colorOpacity => onChange({ colorOpacity }) }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Blur', 'otter-blocks' ) }
					value={ boxShadow.blur }
					onChange={ blur => onChange({ blur }) }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Spread', 'otter-blocks' ) }
					value={ boxShadow.spread }
					onChange={ spread => onChange({ spread }) }
					min={ -100 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Horizontal', 'otter-blocks' ) }
					value={ boxShadow.horizontal }
					onChange={ horizontal => onChange({ horizontal }) }
					min={ -100 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Vertical', 'otter-blocks' ) }
					value={ boxShadow.vertical }
					onChange={ vertical => onChange({ vertical }) }
					min={ -100 }
					max={ 100 }
				/>
			</Fragment>
		</ControlPanelControl>
	);
};

export default BoxShadowControl;
