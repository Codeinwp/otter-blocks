/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalBoxControl as BoxControl,
	Button,
	ButtonGroup,
	PanelBody,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	ContrastChecker
} from '@wordpress/block-editor';

import {
	Fragment,
	useState
} from '@wordpress/element';
import { isObjectLike } from 'lodash';
import { makeBox } from '../../../copy-paste/utils';
import { _px } from '../../../../helpers/helper-functions';

const FontAwesomeIcons = ({
	blockName,
	defaults,
	changeConfig
}) => {
	const [ hover, setHover ] = useState( false );

	const changeLibrary = value => {
		changeConfig( blockName, {
			library: value,
			icon: 'fontawesome' === value ? 'themeisle' : 'balance',
			prefix: 'fab'
		});
	};

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Icon', 'otter-blocks' ) }
			>
				<SelectControl
					label={ __( 'Icon Library', 'otter-blocks' ) }
					value={ defaults.library || 'fontawesome' }
					options={ [
						{ label: __( 'Font Awesome', 'otter-blocks' ), value: 'fontawesome' },
						{ label: __( 'ThemeIsle Icons', 'otter-blocks' ), value: 'themeisle-icons' }
					] }
					onChange={ changeLibrary }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Sizing', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Icon Size', 'otter-blocks' ) }
					value={ defaults.fontSize || '' }
					initialPosition={ 16 }
					onChange={ value => changeConfig( blockName, { fontSize: value }) }
					step={ 0.1 }
					min={ 12 }
					max={ 140 }
				/>

				<hr/>

				<BoxControl
					label={ __( 'Padding', 'otter-blocks' ) }
					values={ ! isObjectLike( defaults.padding ) ? makeBox( _px( defaults.padding ?? 5 ) ) : defaults.padding }
					onChange={ padding => changeConfig( blockName, { padding }) }
				/>

				<hr/>

				<BoxControl
					label={ __( 'Margin', 'otter-blocks' ) }
					values={ ! isObjectLike( defaults.margin ) ? makeBox( _px( defaults.margin ?? 5 ) ) : defaults.margin }
					onChange={ margin => changeConfig( blockName, { margin }) }
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
						<ColorGradientControl
							label={ __( 'Hover Background', 'otter-blocks' ) }
							colorValue={ defaults.backgroundColorHover }
							onColorChange={ value => changeConfig( blockName, { backgroundColorHover: value }) }
						/>

						<ColorGradientControl
							label={ __( 'Hover Icon', 'otter-blocks' ) }
							colorValue={ defaults.textColorHover }
							onColorChange={ value => changeConfig( blockName, { textColorHover: value }) }
						/>

						<ContrastChecker
							{ ...{
								textColor: defaults.textColorHover,
								backgroundColor: defaults.backgroundColorHover
							} }
						/>
					</Fragment>
				) : (
					<Fragment>
						<ColorGradientControl
							label={ __( 'Background', 'otter-blocks' ) }
							colorValue={ defaults.backgroundColor }
							onColorChange={ value => changeConfig( blockName, { backgroundColor: value }) }
						/>

						<ColorGradientControl
							label={ __( 'Icon', 'otter-blocks' ) }
							colorValue={ defaults.textColor }
							onColorChange={ value => changeConfig( blockName, { textColor: value }) }
						/>

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

export default FontAwesomeIcons;
