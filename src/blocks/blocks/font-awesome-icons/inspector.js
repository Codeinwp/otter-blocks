/**
 * External dependencies...
 */
import { isObjectLike } from 'lodash';


/**
 * WordPress dependencies...
 */
import { ContrastChecker, InspectorControls } from '@wordpress/block-editor';
import {
	__experimentalBoxControl as BoxControl,
	Disabled,
	FontSizePicker,
	PanelBody,
	RangeControl
} from '@wordpress/components';
import { Fragment, useState } from '@wordpress/element';
import {
	alignCenter,
	alignLeft,
	alignRight
} from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	ColorDropdownControl,
	IconPickerControl,
	ResponsiveControl,
	SyncControlDropdown,
	ToogleGroupControl
} from '../../components/index.js';
import { _px } from '../../helpers/helper-functions';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';
import { alignHandler } from './edit.js';
import { makeBox } from '../../plugins/copy-paste/utils';

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

/**
 *
 * @param {import('./types.js').IconInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	getValue
}) => {
	const [ hover, setHover ] = useState( false );

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useResponsiveAttributes( setAttributes );

	const changeLibrary = value => {
		setAttributes({
			library: value,
			icon: 'fontawesome' === value ? 'themeisle' : 'balance',
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

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Icon', 'otter-blocks' ) }
			>
				<IconPickerControl
					label={ __( 'Icon Picker', 'otter-blocks' ) }
					library={ attributes.library }
					prefix={ attributes.prefix }
					icon={ attributes.icon }
					changeLibrary={ changeLibrary }
					onChange={ changeIcon }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Dimensions', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<SyncControlDropdown
					isSynced={ attributes.isSynced }
					options={ [
						{
							label: __( 'Size', 'otter-blocks' ),
							value: 'fontSize'
						},
						{
							label: __( 'Padding', 'otter-blocks' ),
							value: 'padding'
						},
						{
							label: __( 'Margin', 'otter-blocks' ),
							value: 'margin'
						}
					] }
					setAttributes={ setAttributes }
				/>

				<Disabled
					isDisabled={ attributes.isSynced?.includes( 'fontSize' ) || false }
					className="o-disabled"
				>
					<FontSizePicker
						fontSizes={ defaultFontSizes }
						withReset
						value={ attributes.fontSize ?? '16px' }
						onChange={ fontSize =>  setAttributes({ fontSize }) }
					/>
				</Disabled>

				<Disabled
					isDisabled={ attributes.isSynced?.includes( 'padding' ) || false }
					className="o-disabled"
				>
					<BoxControl
						label={ __( 'Padding', 'otter-blocks' ) }
						values={ ! isObjectLike( attributes.padding ) ? makeBox( _px( attributes.padding ?? 5 ) ) : attributes.padding }
						onChange={ padding => setAttributes({ padding }) }
					/>
				</Disabled>

				<Disabled
					isDisabled={ attributes.isSynced?.includes( 'margin' ) || false }
					className="o-disabled"
				>
					<BoxControl
						label={ __( 'Margin', 'otter-blocks' ) }
						values={ ! isObjectLike( attributes.margin ) ? makeBox( _px( attributes.margin ?? 5 ) ) : attributes.margin }
						onChange={ margin => setAttributes({ margin }) }
					/>
				</Disabled>

				<ResponsiveControl
					label={ __( 'Alignment', 'otter-blocks' ) }
					className="buttons-alignment-control"
				>
					<ToogleGroupControl
						value={ responsiveGetAttributes([ alignHandler( attributes.align )?.desktop, alignHandler( attributes.align )?.tablet, alignHandler( attributes.align )?.mobile ]) ?? 'center' }
						onChange={ value => responsiveSetAttributes( '' === value ? undefined : value, [ 'align.desktop', 'align.tablet', 'align.mobile' ], alignHandler( attributes.align ) )}
						options={[
							{
								icon: alignLeft,
								label: __( 'Left', 'otter-blocks' ),
								value: 'flex-start'
							},
							{
								icon: alignCenter,
								label: __( 'Center', 'otter-blocks' ),
								value: 'center'
							},
							{
								icon: alignRight,
								label: __( 'Right', 'otter-blocks' ),
								value: 'flex-end'
							}
						]}
						hasIcon
					/>
				</ResponsiveControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<SyncControlDropdown
					isSynced={ attributes.isSynced }
					options={ [
						{
							label: __( 'Background', 'otter-blocks' ),
							value: 'backgroundColor'
						},
						{
							label: __( 'Icon', 'otter-blocks' ),
							value: 'textColor'
						},
						{
							label: __( 'Hover Background', 'otter-blocks' ),
							value: 'backgroundColorHover'
						},
						{
							label: __( 'Hover Icon', 'otter-blocks' ),
							value: 'textColorHover'
						}
					] }
					setAttributes={ setAttributes }
				/>

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
							isDisabled={ attributes.isSynced?.includes( 'backgroundColorHover' ) || false }
							className="o-disabled"
						>
							<ColorDropdownControl
								label={ __( 'Background', 'otter-blocks' ) }
								colorValue={ getValue( 'backgroundColorHover' ) }
								onColorChange={ backgroundColorHover => setAttributes({ backgroundColorHover }) }
								className="is-list is-first"
							/>
						</Disabled>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'textColorHover' ) || false }
							className="o-disabled"
						>
							<ColorDropdownControl
								label={ __( 'Icon', 'otter-blocks' ) }
								colorValue={ getValue( 'textColorHover' ) }
								onColorChange={ textColorHover => setAttributes({ textColorHover }) }
								className="is-list"
							/>
						</Disabled>

						<ColorDropdownControl
							label={ __( 'Hover Border', 'otter-blocks' ) }
							colorValue={ attributes.borderColorHover }
							onColorChange={ borderColorHover => setAttributes({ borderColorHover }) }
							className="is-list is-last"
						/>

						<br/>

						<ContrastChecker
							{ ...{
								textColor: getValue( 'textColorHover' ),
								backgroundColor: getValue( 'backgroundColorHover' )
							} }
						/>
					</Fragment>
				) : (
					<Fragment>
						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'backgroundColor' ) || false }
							className="o-disabled"
						>
							<ColorDropdownControl
								label={ __( 'Background', 'otter-blocks' ) }
								colorValue={ getValue( 'backgroundColor' ) }
								onColorChange={ e => setAttributes({ backgroundColor: e }) }
								className="is-list is-first"
							/>
						</Disabled>

						<Disabled
							isDisabled={ attributes.isSynced?.includes( 'textColor' ) || false }
							className="o-disabled"
						>
							<ColorDropdownControl
								label={ __( 'Icon', 'otter-blocks' ) }
								colorValue={ getValue( 'textColor' ) }
								onColorChange={ e => setAttributes({ textColor: e }) }
								className="is-list"
							/>
						</Disabled>

						<ColorDropdownControl
							label={ __( 'Border', 'otter-blocks' ) }
							colorValue={ attributes.borderColor }
							onColorChange={ e => setAttributes({ borderColor: e }) }
							className="is-list is-last"
						/>

						<br/>

						<ContrastChecker
							{ ...{
								textColor: getValue( 'textColor' ),
								backgroundColor: getValue( 'backgroundColor' )
							} }
						/>
					</Fragment>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Border Settings', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<RangeControl
					label={ __( 'Border Size', 'otter-blocks' ) }
					value={ attributes.borderSize }
					onChange={ e => setAttributes({ borderSize: e }) }
					step={ 0.1 }
					min={ 0 }
					max={ 120 }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					value={ attributes.borderRadius }
					onChange={ e => setAttributes({ borderRadius: e }) }
					step={ 0.1 }
					min={ 0 }
					max={ 100 }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
