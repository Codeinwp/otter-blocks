/**
 * External dependencies
 */
import { isObjectLike } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ContrastChecker } from '@wordpress/block-editor';
import {
	__experimentalBoxControl as BoxControl,
	Disabled,
	FontSizePicker,
	PanelBody,
	SelectControl
} from '@wordpress/components';
import { Fragment, useState } from '@wordpress/element';
import { ColorDropdownControl, ToogleGroupControl } from '../../../../components';
import { makeBox } from '../../../copy-paste/utils';
import { _px } from '../../../../helpers/helper-functions';

const defaultFontSizes = [
	{
		name: __( 'Small', 'otter-blocks' ),
		size: '16px',
		slug: 'small'
	},
	{
		name: __( 'Medium', 'otter-blocks' ),
		size: '32px',
		slug: 'medium'
	},
	{
		name: __( 'Large', 'otter-blocks' ),
		size: '48px',
		slug: 'large'
	},
	{
		name: __( 'XL', 'otter-blocks' ),
		size: '60px',
		slug: 'xl'
	}
];

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
				<FontSizePicker
					fontSizes={ defaultFontSizes }
					withReset
					value={ defaults.fontSize ?? '16px' }
					onChange={ fontSize =>  changeConfig( blockName, { fontSize }) }
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

				<br/>

				{ hover ? (
					<Fragment>
						<Disabled
							isDisabled={ defaults.isSynced?.includes( 'backgroundColorHover' ) || false }
							className="o-disabled"
						>
							<ColorDropdownControl
								label={ __( 'Background', 'otter-blocks' ) }
								colorValue={ defaults.backgroundColorHover }
								onColorChange={ backgroundColorHover => changeConfig( blockName, { backgroundColorHover }) }
								className="is-list is-first"
							/>
						</Disabled>

						<Disabled
							isDisabled={ defaults.isSynced?.includes( 'textColorHover' ) || false }
							className="o-disabled"
						>
							<ColorDropdownControl
								label={ __( 'Icon', 'otter-blocks' ) }
								colorValue={ defaults.textColorHover }
								onColorChange={ textColorHover => changeConfig( blockName, { textColorHover }) }
								className="is-list is-last"
							/>
						</Disabled>

						<br/>

						<ContrastChecker
							{ ...{
								textColor: defaults.textColorHover,
								backgroundColor: defaults.backgroundColorHover
							} }
						/>
					</Fragment>
				) : (
					<Fragment>
						<Disabled
							isDisabled={ defaults.isSynced?.includes( 'backgroundColor' ) || false }
							className="o-disabled"
						>
							<ColorDropdownControl
								label={ __( 'Background', 'otter-blocks' ) }
								colorValue={ defaults.backgroundColor }
								onColorChange={ backgroundColor => changeConfig( blockName, { backgroundColor }) }
								className="is-list is-first"
							/>
						</Disabled>

						<Disabled
							isDisabled={ defaults.isSynced?.includes( 'textColor' ) || false }
							className="o-disabled"
						>
							<ColorDropdownControl
								label={ __( 'Icon', 'otter-blocks' ) }
								colorValue={ defaults.textColor }
								onColorChange={ textColor => changeConfig( blockName, { textColor }) }
								className="is-list is-last"
							/>
						</Disabled>

						<br/>

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
