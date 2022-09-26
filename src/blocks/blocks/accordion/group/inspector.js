/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	ContrastChecker,
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	RangeControl,
	FontSizePicker,
	ToggleControl,
	__experimentalBoxControl as BoxControl, Disabled
} from '@wordpress/components';

import { select, dispatch } from '@wordpress/data';

import { Fragment, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import GoogleFontsControl from '../../../components/google-fonts-control';
import ClearButton from '../../../components/clear-button';
import BoxShadowControl from '../../../components/box-shadow-control';
import IconPickerControl from '../../../components/icon-picker-control';
import InspectorHeader from '../../../components/inspector-header';
import { InspectorExtensions } from '../../../components/inspector-slot-fill';
import SyncControlDropdown from '../../../components/sync-control-dropdown';
import ButtonToggle from '../../../components/button-toggle-control';
import { changeActiveStyle, getActiveStyle } from '../../../helpers/helper-functions';

const colorControls = [
	{
		label: __( 'Tab title background', 'otter-blocks' ),
		value: 'titleBackground'
	},
	{
		label: __( 'Active tab title background', 'otter-blocks' ),
		value: 'activeTitleBackground'
	},
	{
		label: __( 'Tab title', 'otter-blocks' ),
		value: 'titleColor'
	},
	{
		label: __( 'Active tab title', 'otter-blocks' ),
		value: 'activeTitleColor'
	},
	{
		label: __( 'Content background', 'otter-blocks' ),
		value: 'contentBackground'
	},
	{
		label: __( 'Active Content Background', 'otter-blocks' ),
		value: 'activeContentBackground'
	},
	{
		label: __( 'Border', 'otter-blocks' ),
		value: 'borderColor'
	}
];

const styles = [
	{
		label: __( 'Default', 'otter-blocks' ),
		value: 'default',
		isDefault: true
	},
	{
		label: __( 'Boxed', 'otter-blocks' ),
		value: 'boxed'
	}
];

/**
 *
 * @param {import('./types.js').AccordionGroupInspectorProps} props
 * @returns
 */
const Inspector = ({
	clientId,
	attributes,
	setAttributes,
	getValue
}) => {
	const [ tab, setTab ] = useState( 'settings' );

	const changeFontFamily = value => {
		if ( ! value ) {
			setAttributes({
				fontFamily: value,
				fontVariant: value
			});
		} else {
			setAttributes({
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

	const changeBoxShadow = data => {
		const boxShadow = { ...attributes.boxShadow };
		Object.entries( data ).map( ([ key, val ] = data ) => {
			boxShadow[key] = val;
		});

		setAttributes({ boxShadow });
	};

	const onAlwaysOpenToggle = alwaysOpen => {
		setAttributes({ alwaysOpen });

		if ( true === alwaysOpen ) {
			return;
		}

		const children = select( 'core/block-editor' ).getBlocksByClientId( clientId )[0].innerBlocks;
		children.forEach( child => {
			dispatch( 'core/block-editor' ).updateBlockAttributes( child.clientId, { initialOpen: false });
		});
	};

	const onTagChange = ( targetTag ) => {
		const children = select( 'core/block-editor' ).getBlocksByClientId( clientId )[0].innerBlocks;
		children.forEach( child => {
			dispatch( 'core/block-editor' ).updateBlockAttributes( child.clientId, { tag: targetTag });
		});

		setAttributes({ tag: targetTag });
	};

	const onBorderChange = ( attrName, property, value ) => {
		setAttributes({
			[ attrName ]: { ...attributes[attrName], [ property ]: 'object' === typeof value ? { ...attributes[attrName][property], ...value } : value }
		});
	};

	const changeStyle = value => {
		const classes = changeActiveStyle( attributes?.className, styles, value );
		setAttributes({ className: classes });
	};

	return (
		<InspectorControls>
			<InspectorHeader
				value={ tab }
				options={[
					{
						label: __( 'Settings', 'otter-blocks' ),
						value: 'settings'
					},
					{
						label: __( 'Style', 'otter-blocks' ),
						value: 'style'
					}
				]}
				onChange={ setTab }
			/>

			{ 'settings' === tab && (
				<PanelBody
					title={ __( 'Settings', 'otter-blocks' ) }
				>
					<ToggleControl
						label={ __( 'Place icon before text', 'otter-blocks' ) }
						checked={ attributes.iconFirst }
						onChange={ iconFirst => setAttributes({ iconFirst }) }
					/>
					<ToggleControl
						label={ __( 'Keep multiple items expanded', 'otter-blocks' ) }
						help={ __( 'When enabled, multiple accordion items can be expanded at the same time', 'otter-blocks' ) }
						checked={ attributes.alwaysOpen }
						onChange={ onAlwaysOpenToggle }
					/>
					<SelectControl
						label={ __( 'Title HTML tag', 'otter-blocks' ) }
						value={ attributes.tag || 'div' }
						options={ [
							{ label: __( 'Heading 1', 'otter-blocks' ), value: 'h1' },
							{ label: __( 'Heading 2', 'otter-blocks' ), value: 'h2' },
							{ label: __( 'Heading 3', 'otter-blocks' ), value: 'h3' },
							{ label: __( 'Heading 4', 'otter-blocks' ), value: 'h4' },
							{ label: __( 'Heading 5', 'otter-blocks' ), value: 'h5' },
							{ label: __( 'Heading 6', 'otter-blocks' ), value: 'h6' },
							{ label: __( 'Division', 'otter-blocks' ), value: 'div' }
						] }
						onChange={ onTagChange }
					/>
				</PanelBody>
			) }

			{ 'style' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Style', 'otter-blocks' ) }
					>
						<ButtonToggle
							options={ styles }
							value={ getActiveStyle( styles, attributes?.className ) }
							onChange={ changeStyle }
						/>
					</PanelBody>
					<PanelBody
						title={ __( 'Title Typography', 'otter-blocks' ) }
					>
						<FontSizePicker
							value={ attributes.fontSize }
							fontSizes={ [
								{
									name: __( 'Extra Small', 'otter-blocks' ),
									slug: 'extra-small',
									size: 14
								},
								{
									name: __( 'Small', 'otter-blocks' ),
									slug: 'small',
									size: 16
								},
								{
									name: __( 'Medium', 'otter-blocks' ),
									slug: 'medium',
									size: 18
								},
								{
									name: __( 'Large', 'otter-blocks' ),
									slug: 'large',
									size: 24
								},
								{
									name: __( 'Extra Large', 'otter-blocks' ),
									slug: 'extra-large',
									size: 28
								}
							] }
							onChange={ fontSize => setAttributes({ fontSize }) }
						/>

						<GoogleFontsControl
							label={ __( 'Font Family', 'otter-blocks' ) }
							value={ attributes.fontFamily }
							onChangeFontFamily={ changeFontFamily }
							valueVariant={ attributes.fontVariant }
							onChangeFontVariant={ fontVariant => setAttributes({ fontVariant }) }
							valueStyle={ attributes.fontStyle }
							onChangeFontStyle={ fontStyle => setAttributes({ fontStyle }) }
							valueTransform={ attributes.textTransform }
							onChangeTextTransform={ textTransform => setAttributes({ textTransform }) }
						/>

						<ClearButton
							values={[ 'fontFamily', 'fontVariant', 'fontStyle', 'textTransform' ]}
							setAttributes={ setAttributes }
						/>

						<RangeControl
							label={ __( 'Letter Spacing', 'otter-blocks' ) }
							value={ attributes.letterSpacing }
							onChange={ letterSpacing => setAttributes({ letterSpacing }) }
							min={ -50 }
							max={ 100 }
							allowReset={ true }
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Color', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<SyncControlDropdown
							isSynced={ attributes.isSynced }
							options={ colorControls }
							setAttributes={ setAttributes }
						/>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'backgroundColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Title', 'otter-blocks' ) }
								colorValue={ attributes.titleColor }
								onColorChange={ e => setAttributes({ titleColor: e }) }
							/>
						</Disabled>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'backgroundColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Title Background', 'otter-blocks' ) }
								colorValue={ attributes.titleBackground }
								onColorChange={ e => setAttributes({ titleBackground: e }) }
							/>
						</Disabled>

						<ContrastChecker
							{ ...{
								textColor: getValue( 'titleColor' ),
								backgroundColor: getValue( 'titleBackground' )
							} }
						/>

						<ColorGradientControl
							label={ __( 'Active Title', 'otter-blocks' ) }
							colorValue={ attributes.activeTitleColor }
							onColorChange={ activeTitleColor => setAttributes({ activeTitleColor }) }
						/>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'backgroundColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Active Title Background', 'otter-blocks' ) }
								colorValue={ attributes.activeTitleBackground }
								onColorChange={ activeTitleBackground => setAttributes({ activeTitleBackground }) }
							/>
						</Disabled>

						<ContrastChecker
							{ ...{
								textColor: getValue( 'activeTitleColor' ),
								backgroundColor: getValue( 'activeTitleBackground' )
							} }
						/>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'backgroundColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Content Background', 'otter-blocks' ) }
								colorValue={ attributes.contentBackground }
								onColorChange={ e => setAttributes({ contentBackground: e }) }
							/>
						</Disabled>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'backgroundColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Active Content Background', 'otter-blocks' ) }
								colorValue={ attributes.activeContentBackground }
								onColorChange={ activeContentBackground => setAttributes({ activeContentBackground }) }
							/>
						</Disabled>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'backgroundColor' ) || false }
						>
							<ColorGradientControl
								label={ __( 'Border', 'otter-blocks' ) }
								colorValue={ getValue( 'borderColor' ) }
								onColorChange={ e => setAttributes({ borderColor: e }) }
							/>
						</Disabled>
					</PanelBody>

					<PanelBody
						title={ __( 'Icons', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<IconPickerControl
							label={ __( 'Closed Item Icon', 'otter-blocks' ) }
							library="fontawesome"
							prefix={ attributes.icon?.prefix }
							icon={ attributes.icon?.name }
							allowThemeisleIcons={ false }
							onChange={ icon => setAttributes({ icon }) }
						/>

						<IconPickerControl
							label={ __( 'Open Item Icon', 'otter-blocks' ) }
							library="fontawesome"
							prefix={ attributes.openItemIcon?.prefix }
							icon={ attributes.openItemIcon?.name }
							allowThemeisleIcons={ false }
							onChange={ openItemIcon => setAttributes({ openItemIcon }) }
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Dimensions (Layout)', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<BoxControl
							label={ __( 'Header Padding', 'otter-blocks' ) }
							values={ attributes.headerPadding }
							onChange={ headerPadding => setAttributes({ headerPadding }) }
						/>
						<BoxControl
							label={ __( 'Content Padding', 'otter-blocks' ) }
							values={ attributes.contentPadding }
							onChange={ contentPadding => setAttributes({ contentPadding }) }
						/>
						<SelectControl
							label={ __( 'Gap between panels', 'otter-blocks' ) }
							value={ attributes.gap }
							options={ [
								{ label: __( 'No Gap', 'otter-blocks' ), value: '' },
								{ label: __( 'Narrow (5px)', 'otter-blocks' ), value: 'narrow' },
								{ label: __( 'Wide (10px)', 'otter-blocks' ), value: 'wide' },
								{ label: __( 'Wider (20px)', 'otter-blocks' ), value: 'wider' }
							] }
							onChange={ e => setAttributes({ gap: e }) }
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Borders', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<SelectControl
							label={ __( 'Header Border Style', 'otter-blocks' ) }
							labelPosition="left"
							value={ attributes.headerBorder?.style }
							options={[
								{ label: __( 'Solid', 'otter-blocks' ), value: 'solid' },
								{ label: __( 'Dashed', 'otter-blocks' ), value: 'dashed' },
								{ label: __( 'Dotted', 'otter-blocks' ), value: 'dotted' }
							]}
							onChange={ value => onBorderChange( 'headerBorder', 'style', value ) }
						/>
						<BoxControl
							label={ __( 'Header Border Width', 'otter-blocks' ) }
							values={ attributes.headerBorder?.width || {} }
							onChange={ value => onBorderChange( 'headerBorder', 'width', value ) }
						/>
						<SelectControl
							label={ __( 'Content Border Style', 'otter-blocks' ) }
							labelPosition="left"
							value={ attributes.contentBorder?.style }
							options={[
								{ label: __( 'Solid', 'otter-blocks' ), value: 'solid' },
								{ label: __( 'Dashed', 'otter-blocks' ), value: 'dashed' },
								{ label: __( 'Dotted', 'otter-blocks' ), value: 'dotted' }
							]}
							onChange={ value => onBorderChange( 'contentBorder', 'style', value ) }
						/>
						<BoxControl
							label={ __( 'Content Border Width', 'otter-blocks' ) }
							values={ attributes.contentBorder?.width || {} }
							sides={[ 'right', 'bottom', 'left' ]}
							onChange={ value => onBorderChange( 'contentBorder', 'width', value ) }
						/>
						<BoxShadowControl
							boxShadow={ attributes.boxShadow }
							onChange={ changeBoxShadow }
						/>
					</PanelBody>
				</Fragment>
			) }

			<InspectorExtensions/>
		</InspectorControls>
	);
};

export default Inspector;
