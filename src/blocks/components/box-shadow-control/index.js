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
import ControlPanelControl from '../control-panel-control';

const BoxShadowControl = ({
	attributes,
	setAttributes
}) => {
	return (
		<ControlPanelControl
			label={ __( 'Box Shadow', 'otter-blocks' ) }
			attributes={ attributes }
			setAttributes={ setAttributes }
			resetValues={ {
				boxShadow: false,
				boxShadowColor: undefined,
				boxShadowColorOpacity: 50,
				boxShadowBlur: 5,
				boxShadowSpread: 1,
				boxShadowHorizontal: 0,
				boxShadowVertical: 0
			} }
			onClick={ () => setAttributes({ boxShadow: true }) }
		>
			<Fragment>
				<ColorGradientControl
					label={ __( 'Shadow Color', 'otter-blocks' ) }
					colorValue={ attributes.boxShadowColor }
					onColorChange={ e => setAttributes({ boxShadowColor: e }) }
				/>

				<RangeControl
					label={ __( 'Opacity', 'otter-blocks' ) }
					value={ attributes.boxShadowColorOpacity }
					onChange={ e => setAttributes({ boxShadowColorOpacity: e }) }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Blur', 'otter-blocks' ) }
					value={ attributes.boxShadowBlur }
					onChange={ e => setAttributes({ boxShadowBlur: e }) }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Spread', 'otter-blocks' ) }
					value={ attributes.boxShadowSpread }
					onChange={ e => setAttributes({ boxShadowSpread: e }) }
					min={ -100 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Horizontal', 'otter-blocks' ) }
					value={ attributes.boxShadowHorizontal }
					onChange={ e => setAttributes({ boxShadowHorizontal: e }) }
					min={ -100 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Vertical', 'otter-blocks' ) }
					value={ attributes.boxShadowVertical }
					onChange={ e => setAttributes({ boxShadowVertical: e }) }
					min={ -100 }
					max={ 100 }
				/>
			</Fragment>
		</ControlPanelControl>
	);
};

export default BoxShadowControl;
