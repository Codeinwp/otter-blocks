/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ButtonGroup,
	PanelBody,
	RangeControl
} from '@wordpress/components';

import {
	ColorPalette,
	ContrastChecker
} from '@wordpress/block-editor';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import ColorBaseControl from '../../../../components/color-base-control/index.js';

const ButtonGroupBlock = ({
	blockName,
	defaults,
	changeConfig
}) => {
	const [ hover, setHover ] = useState( false );

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Sizing', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Icon Size', 'otter-blocks' ) }
					value={ defaults.fontSize || '' }
					initialPosition={ 16 }
					onChange={ value => changeConfig( blockName, { fontSize: value }) }
					min={ 12 }
					max={ 140 }
				/>

				<hr/>

				<RangeControl
					label={ __( 'Padding', 'otter-blocks' ) }
					value={ defaults.padding || '' }
					initialPosition={ 5 }
					onChange={ value => changeConfig( blockName, { padding: value }) }
					min={ 0 }
					max={ 100 }
				/>

				<hr/>

				<RangeControl
					label={ __( 'Margin', 'otter-blocks' ) }
					value={ defaults.margin || '' }
					initialPosition={ 5 }
					onChange={ value => changeConfig( blockName, { margin: value }) }
					min={ 0 }
					max={ 100 }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
			>
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

				{ hover ? (
					<Fragment>
						<ColorBaseControl
							label={ __( 'Hover Background', 'otter-blocks' ) }
							colorValue={ defaults.backgroundColorHover }
						>
							<ColorPalette
								label={ __( 'Hover Background', 'otter-blocks' ) }
								value={ defaults.backgroundColorHover }
								onChange={ value => changeConfig( blockName, { backgroundColorHover: value }) }
							/>
						</ColorBaseControl>

						<ColorBaseControl
							label={ __( 'Hover Icon', 'otter-blocks' ) }
							colorValue={ defaults.textColorHover }
						>
							<ColorPalette
								label={ __( 'Hover Icon', 'otter-blocks' ) }
								value={ defaults.textColorHover }
								onChange={ value => changeConfig( blockName, { textColorHover: value }) }
							/>
						</ColorBaseControl>

						<ContrastChecker
							{ ...{
								textColor: defaults.textColorHover,
								backgroundColor: defaults.backgroundColorHover
							} }
						/>
					</Fragment>
				) : (
					<Fragment>
						<ColorBaseControl
							label={ __( 'Background', 'otter-blocks' ) }
							colorValue={ defaults.backgroundColor }
						>
							<ColorPalette
								label={ __( 'Background', 'otter-blocks' ) }
								value={ defaults.backgroundColor }
								onChange={ value => changeConfig( blockName, { backgroundColor: value }) }
							/>
						</ColorBaseControl>

						<ColorBaseControl
							label={ __( 'Icon', 'otter-blocks' ) }
							colorValue={ defaults.textColor }
						>
							<ColorPalette
								label={ __( 'Icon', 'otter-blocks' ) }
								value={ defaults.textColor }
								onChange={ value => changeConfig( blockName, { textColor: value }) }
							/>
						</ColorBaseControl>

						<ContrastChecker
							{ ...{
								textColor: defaults.textColor,
								backgroundColor: defaults.backgroundColor
							} }
						/>
					</Fragment>
				) }
			</PanelBody>
		</Fragment>
	);
};

export default ButtonGroupBlock;
