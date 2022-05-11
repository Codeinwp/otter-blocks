/**
 * WordPress dependencies...
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ButtonGroup,
	PanelBody,
	Placeholder,
	RangeControl,
	Spinner
} from '@wordpress/components';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	ContrastChecker,
	InspectorControls
} from '@wordpress/block-editor';

import {
	Fragment,
	lazy,
	Suspense,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
const IconPickerControl = lazy( () => import( '../../components/icon-picker-control/index.js' ) );
import SyncControl from '../../components/sync-control/index.js';

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
			</PanelBody>

			<PanelBody
				title={ __( 'Icon Sizes', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<SyncControl
					field="fontSize"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<RangeControl
						label={ __( 'Icon Size', 'otter-blocks' ) }
						value={ getValue( 'fontSize' ) }
						initialPosition={ 16 }
						onChange={ e => setAttributes({ fontSize: e }) }
						min={ 12 }
						max={ 140 }
					/>
				</SyncControl>

				<SyncControl
					field="padding"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<RangeControl
						label={ __( 'Padding', 'otter-blocks' ) }
						value={ getValue( 'padding' ) }
						initialPosition={ 5 }
						onChange={ e => setAttributes({ padding: e }) }
						min={ 0 }
						max={ 100 }
					/>
				</SyncControl>

				<SyncControl
					field="margin"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<RangeControl
						label={ __( 'Margin', 'otter-blocks' ) }
						value={ getValue( 'margin' ) }
						initialPosition={ 5 }
						onChange={ e => setAttributes({ margin: e }) }
						min={ 0 }
						max={ 100 }
					/>
				</SyncControl>
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
					min={ 0 }
					max={ 120 }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					value={ attributes.borderRadius }
					onChange={ e => setAttributes({ borderRadius: e }) }
					min={ 0 }
					max={ 100 }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
