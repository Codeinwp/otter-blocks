/**
 * External dependencies...
 */
import {
	alignCenter,
	alignLeft,
	alignRight
} from '@wordpress/icons';

/**
 * WordPress dependencies...
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ButtonGroup,
	PanelBody,
	RangeControl,
	FontSizePicker,
	__experimentalBoxControl as BoxControl
} from '@wordpress/components';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	ContrastChecker,
	InspectorControls
} from '@wordpress/block-editor';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	IconPickerControl,
	ResponsiveControl,
	SyncControl,
	ToogleGroupControl
} from '../../components/index.js';

import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';

import { alignHandler } from './edit.js';
import { isObjectLike } from 'lodash';
import { makeBox } from '../../plugins/copy-paste/utils';
import { _px } from '../../helpers/helper-functions';

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
				<SyncControl
					field="fontSize"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<FontSizePicker
						fontSizes={ defaultFontSizes }
						withReset
						value={ attributes.fontSize ?? '16px' }
						onChange={ fontSize =>  setAttributes({ fontSize }) }
					/>
				</SyncControl>

				<SyncControl
					field="padding"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<BoxControl
						label={ __( 'Padding', 'otter-blocks' ) }
						values={ ! isObjectLike( attributes.padding ) ? makeBox( _px( attributes.padding ?? 5 ) ) : attributes.padding }
						onChange={ padding => setAttributes({ padding }) }
					/>
				</SyncControl>

				{/*todo*/}
				<SyncControl
					field="margin"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<BoxControl
						label={ __( 'Margin', 'otter-blocks' ) }
						values={ ! isObjectLike( attributes.margin ) ? makeBox( _px( attributes.margin ?? 5 ) ) : attributes.margin }
						onChange={ margin => setAttributes({ margin }) }
					/>
				</SyncControl>

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
						<SyncControl
							field="backgroundColorHover"
							isSynced={ attributes.isSynced }
							setAttributes={ setAttributes }
						>
							<ColorGradientControl
								label={ __( 'Hover Background', 'otter-blocks' ) }
								colorValue={ getValue( 'backgroundColorHover' ) }
								onColorChange={ e => setAttributes({ backgroundColorHover: e }) }
							/>
						</SyncControl>

						<SyncControl
							field="textColorHover"
							isSynced={ attributes.isSynced }
							setAttributes={ setAttributes }
						>
							<ColorGradientControl
								label={ __( 'Hover Icon', 'otter-blocks' ) }
								colorValue={ getValue( 'textColorHover' ) }
								onColorChange={ e => setAttributes({ textColorHover: e }) }
							/>
						</SyncControl>

						<ContrastChecker
							{ ...{
								textColor: getValue( 'textColorHover' ),
								backgroundColor: getValue( 'backgroundColorHover' )
							} }
						/>

						<ColorGradientControl
							label={ __( 'Hover Border', 'otter-blocks' ) }
							colorValue={ attributes.borderColorHover }
							onColorChange={ e => setAttributes({ borderColorHover: e }) }
						/>
					</Fragment>
				) : (
					<Fragment>
						<SyncControl
							field="backgroundColor"
							isSynced={ attributes.isSynced }
							setAttributes={ setAttributes }
						>
							<ColorGradientControl
								label={ __( 'Background', 'otter-blocks' ) }
								colorValue={ getValue( 'backgroundColor' ) }
								onColorChange={ e => setAttributes({ backgroundColor: e }) }
							/>
						</SyncControl>

						<SyncControl
							field="textColor"
							isSynced={ attributes.isSynced }
							setAttributes={ setAttributes }
						>
							<ColorGradientControl
								label={ __( 'Icon', 'otter-blocks' ) }
								colorValue={ getValue( 'textColor' ) }
								onColorChange={ e => setAttributes({ textColor: e }) }
							/>
						</SyncControl>

						<ContrastChecker
							{ ...{
								textColor: getValue( 'textColor' ),
								backgroundColor: getValue( 'backgroundColor' )
							} }
						/>

						<ColorGradientControl
							label={ __( 'Border', 'otter-blocks' ) }
							colorValue={ attributes.borderColor }
							onColorChange={ e => setAttributes({ borderColor: e }) }
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
