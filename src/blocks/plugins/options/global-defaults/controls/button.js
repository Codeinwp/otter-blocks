/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { __experimentalColorGradientControl as ColorGradientControl } from '@wordpress/block-editor';

import {
	Button,
	ButtonGroup,
	PanelBody,
	RangeControl
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

const ButtonBlock = ({
	blockName,
	defaults,
	changeConfig
}) => {
	const [ hover, setHover ] = useState( false );

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
		<Fragment>
			<PanelBody
				title={ __( 'Color', 'otter-blocks' ) }
			>
				<HoverControl/>

				{ ! hover ? (
					<Fragment key="without-hover">
						<ColorGradientControl
							label={ __( 'Color', 'otter-blocks' ) }
							colorValue={ defaults.color }
							onColorChange={ value => changeConfig( blockName, { color: value }) }
						/>

						<ColorGradientControl
							label={ __( 'Background', 'otter-blocks' ) }
							colorValue={ defaults.background }
							onColorChange={ value => changeConfig( blockName, { background: value }) }
						/>
					</Fragment>
				) : (
					<Fragment key="with-hover">
						<ColorGradientControl
							label={ __( 'Hover Color', 'otter-blocks' ) }
							colorValue={ defaults.hoverColor }
							onColorChange={ value => changeConfig( blockName, { hoverColor: value }) }
						/>

						<ColorGradientControl
							label={ __( 'Hover Background', 'otter-blocks' ) }
							colorValue={ defaults.hoverBackground }
							onColorChange={ value => changeConfig( blockName, { hoverBackground: value }) }
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
						colorValue={ defaults.border }
						onColorChange={ value => changeConfig( blockName, { border: value }) }
					/>
				) : (
					<ColorGradientControl
						label={ __( 'Hover Border', 'otter-blocks' ) }
						colorValue={ defaults.hoverBorder }
						onColorChange={ value => changeConfig( blockName, { hoverBorder: value }) }
					/>
				) }

				<RangeControl
					label={ __( 'Border Width', 'otter-blocks' ) }
					value={ defaults.borderSize }
					onChange={ value => changeConfig( blockName, { borderSize: value }) }
					min={ 0 }
					max={ 10 }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					value={ defaults.borderRadius }
					onChange={ value => changeConfig( blockName, { borderRadius: value }) }
					min={ 0 }
					max={ 100 }
				/>
			</PanelBody>
		</Fragment>
	);
};

export default ButtonBlock;
