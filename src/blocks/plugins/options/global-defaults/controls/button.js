/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { __experimentalColorGradientControl as ColorGradientControl } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';
import { ColorDropdownControl, ControlPanelControl, ToogleGroupControl } from '../../../../components';
import { objectOrNumberAsBox } from '../../../../helpers/helper-functions';

const ButtonBlock = ({
	blockName,
	defaults: attributes,
	changeConfig
}) => {
	const [ hover, setHover ] = useState( false );

	const HoverControl = () => {
		return (
			<Fragment>
				<ToogleGroupControl
					onChange={ value => setHover( value ) }
					value={ hover }
					options={[
						{
							value: false,
							label: __( 'Normal', 'otter-blocks' )
						},
						{
							value: true,
							label: __( 'Hover', 'otter-blocks' )
						}
					]}
				/>
				<br />
			</Fragment>
		);
	};

	const setAttributes = x => {
		changeConfig( blockName, x );
	};

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Colors', 'otter-blocks' ) }
			>
				<HoverControl/>

				{ ! hover ? (
					<Fragment key="without-hover">
						<ColorDropdownControl
							label={ __( 'Text', 'otter-blocks' ) }
							colorValue={ attributes.color }
							onColorChange={ color => setAttributes({ color }) }
							className="is-list is-first"
						/>

						<ColorDropdownControl
							label={ __( 'Background', 'otter-blocks' ) }
							colorValue={ attributes.background }
							onColorChange={ background => setAttributes({ background: background })}
							className="is-list"
						/>

						<ColorDropdownControl
							label={ __( 'Border', 'otter-blocks' ) }
							colorValue={ attributes.border }
							onColorChange={ border => setAttributes({ border }) }
							className="is-list"
						/>
					</Fragment>
				) : (
					<Fragment key="with-hover">
						<ColorDropdownControl
							label={ __( 'Text', 'otter-blocks' ) }
							colorValue={ attributes.hoverColor }
							onColorChange={ hoverColor => setAttributes({ hoverColor }) }
							className="is-list is-first"
						/>

						<ColorDropdownControl
							label={ __( 'Background', 'otter-blocks' ) }
							colorValue={ attributes.hoverBackground }
							onColorChange={ hoverBackground => setAttributes({ hoverBackground }) }
							className="is-list"
						/>

						<ColorDropdownControl
							label={ __( 'Border', 'otter-blocks' ) }
							colorValue={ attributes.hoverBorder }
							onColorChange={ hoverBorder => setAttributes({ hoverBorder }) }
							className="is-list"
						/>
					</Fragment>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Border & Box Shadow', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<BoxControl
					label={ __( 'Border Width', 'otter-blocks' ) }
					values={ objectOrNumberAsBox( attributes.borderSize ) }
					onChange={ borderSize => setAttributes({ borderSize }) }
				/>

				<BoxControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					values={ objectOrNumberAsBox( attributes.borderRadius ) }
					onChange={ borderRadius => setAttributes({ borderRadius }) }
				/>

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
						boxShadowVertical: 0,
						hoverBoxShadowColor: undefined,
						hoverBoxShadowColorOpacity: 50,
						hoverBoxShadowBlur: 5,
						hoverBoxShadowSpread: 1,
						hoverBoxShadowHorizontal: 0,
						hoverBoxShadowVertical: 0
					} }
					onClick={ () => setAttributes({ boxShadow: true }) }
				>
					<HoverControl/>

					{ ! hover ? (
						<Fragment key="without-hover">
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
					) : (
						<Fragment key="with-hover">
							<ColorGradientControl
								label={ __( 'Shadow Color on Hover', 'otter-blocks' ) }
								colorValue={ attributes.hoverBoxShadowColor }
								onColorChange={ e => setAttributes({ hoverBoxShadowColor: e }) }
							/>

							<RangeControl
								label={ __( 'Opacity', 'otter-blocks' ) }
								value={ attributes.hoverBoxShadowColorOpacity }
								onChange={ e => setAttributes({ hoverBoxShadowColorOpacity: e }) }
								min={ 0 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Blur', 'otter-blocks' ) }
								value={ attributes.hoverBoxShadowBlur }
								onChange={ e => setAttributes({ hoverBoxShadowBlur: e }) }
								min={ 0 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Spread', 'otter-blocks' ) }
								value={ attributes.hoverBoxShadowSpread }
								onChange={ e => setAttributes({ hoverBoxShadowSpread: e }) }
								min={ -100 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Horizontal', 'otter-blocks' ) }
								value={ attributes.hoverBoxShadowHorizontal }
								onChange={ e => setAttributes({ hoverBoxShadowHorizontal: e }) }
								min={ -100 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Vertical', 'otter-blocks' ) }
								value={ attributes.hoverBoxShadowVertical }
								onChange={ e => setAttributes({ hoverBoxShadowVertical: e }) }
								min={ -100 }
								max={ 100 }
							/>
						</Fragment>
					) }
				</ControlPanelControl>
			</PanelBody>
		</Fragment>
	);
};

export default ButtonBlock;
