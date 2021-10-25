/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import {
	Button,
	ButtonGroup,
	PanelBody,
	RangeControl,
	Placeholder,
	SelectControl,
	Spinner
} from '@wordpress/components';

import {
	Fragment,
	lazy,
	Suspense,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import ControlPanelControl from '../../../components/control-panel-control/index.js';
const IconPickerControl = lazy( () => import( '../../../components/icon-picker-control/index.js' ) );

const Inspector = ({
	attributes,
	setAttributes
}) => {
	const [ hover, setHover ] = useState( false );

	const changeLibrary = value => {
		setAttributes({
			library: value,
			icon: undefined,
			prefix: 'fab'
		});
	};

	const changeIcon = value => {
		if ( 'object' === typeof value ) {
			setAttributes({
				icon: value.name,
				prefix: value.prefix
			});
		} else {
			setAttributes({ icon: value });
		}
	};

	const HoverControl = () => {
		return (
			<ButtonGroup>
				<Button
					isSmall
					isSecondary={ hover }
					isPrimary={ ! hover }
					onClick={ () => setHover( false ) }
				>
					{ __( 'Normal', 'otter-blocks' ) }
				</Button>

				<Button
					isSmall
					isSecondary={ ! hover }
					isPrimary={ hover }
					onClick={ () => setHover( true ) }
				>
					{ __( 'Hover', 'otter-blocks' ) }
				</Button>
			</ButtonGroup>

		);
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Color', 'otter-blocks' ) }
			>
				<HoverControl/>

				{ ! hover ? (
					<Fragment key="without-hover">
						<ColorGradientControl
							label={ __( 'Color', 'otter-blocks' ) }
							colorValue={ attributes.color }
							onColorChange={ e => setAttributes({ color: e }) }
						/>

						<ColorGradientControl
							label={ __( 'Background', 'otter-blocks' ) }
							colorValue={ attributes.background }
							gradientValue={ attributes.backgroundGradient }
							onColorChange={ e => setAttributes({ background: e }) }
							onGradientChange={ e => setAttributes({ backgroundGradient: e }) }
						/>
					</Fragment>
				) : (
					<Fragment key="with-hover">
						<ColorGradientControl
							label={ __( 'Hover Color', 'otter-blocks' ) }
							colorValue={ attributes.hoverColor }
							onColorChange={ e => setAttributes({ hoverColor: e }) }
						/>

						<ColorGradientControl
							label={ __( 'Hover Background', 'otter-blocks' ) }
							colorValue={ attributes.hoverBackground }
							gradientValue={ attributes.hoverBackgroundGradient }
							onColorChange={ e => setAttributes({ hoverBackground: e }) }
							onGradientChange={ e => setAttributes({ hoverBackgroundGradient: e }) }
						/>
					</Fragment>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Border & Box Shadow', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<HoverControl/>

				{ ! hover ? (
					<ColorGradientControl
						label={ __( 'Border', 'otter-blocks' ) }
						colorValue={ attributes.border }
						onColorChange={ e => setAttributes({ border: e }) }
					/>
				) : (
					<ColorGradientControl
						label={ __( 'Hover Border', 'otter-blocks' ) }
						colorValue={ attributes.hoverBorder }
						onColorChange={ e => setAttributes({ hoverBorder: e }) }
					/>
				) }

				<RangeControl
					label={ __( 'Border Width', 'otter-blocks' ) }
					value={ attributes.borderSize }
					onChange={ e => setAttributes({ borderSize: e }) }
					min={ 0 }
					max={ 10 }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					value={ attributes.borderRadius }
					onChange={ e => setAttributes({ borderRadius: e }) }
					min={ 0 }
					max={ 100 }
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

			<PanelBody
				title={ __( 'Icon Settings', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<SelectControl
					label={ __( 'Icon Position', 'otter-blocks' ) }
					value={ attributes.iconType }
					options={ [
						{ label: __( 'No Icon', 'otter-blocks' ), value: 'none' },
						{ label: __( 'Left', 'otter-blocks' ), value: 'left' },
						{ label: __( 'Right', 'otter-blocks' ), value: 'right' },
						{ label: __( 'Icon Only', 'otter-blocks' ), value: 'only' }
					] }
					onChange={ e => setAttributes({ iconType: e }) }
				/>

				{ 'none' !== attributes.iconType && (
					<Suspense fallback={<Placeholder><Spinner/></Placeholder>}>
						<IconPickerControl
							label={ __( 'Icon Picker', 'otter-blocks' ) }
							library={ attributes.library }
							prefix={ attributes.prefix }
							icon={ attributes.icon }
							changeLibrary={ changeLibrary }
							onChange={ changeIcon }
						/>
					</Suspense>
				) }
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
