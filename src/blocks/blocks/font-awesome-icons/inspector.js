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
	ColorPalette,
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
import ColorBaseControl from '../../components/color-base-control/index.js';

const Inspector = ({
	attributes,
	setAttributes
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
				<RangeControl
					label={ __( 'Icon Size', 'otter-blocks' ) }
					value={ attributes.fontSize || '' }
					initialPosition={ 16 }
					onChange={ e => setAttributes({ fontSize: e }) }
					min={ 12 }
					max={ 140 }
				/>

				<RangeControl
					label={ __( 'Padding', 'otter-blocks' ) }
					value={ attributes.padding || '' }
					initialPosition={ 5 }
					onChange={ e => setAttributes({ padding: e }) }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Margin', 'otter-blocks' ) }
					value={ attributes.margin || '' }
					initialPosition={ 5 }
					onChange={ e => setAttributes({ margin: e }) }
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
							colorValue={ attributes.backgroundColorHover }
						>
							<ColorPalette
								label={ __( 'Hover Background', 'otter-blocks' ) }
								value={ attributes.backgroundColorHover }
								onChange={ e => setAttributes({ backgroundColorHover: e }) }
							/>
						</ColorBaseControl>

						<ColorBaseControl
							label={ __( 'Hover Icon', 'otter-blocks' ) }
							colorValue={ attributes.textColorHover }
						>
							<ColorPalette
								label={ __( 'Hover Icon', 'otter-blocks' ) }
								value={ attributes.textColorHover }
								onChange={ e => setAttributes({ textColorHover: e }) }
							/>
						</ColorBaseControl>

						<ColorBaseControl
							label={ __( 'Hover Border', 'otter-blocks' ) }
							colorValue={ attributes.borderColorHover }
						>
							<ColorPalette
								label={ __( 'Hover Border', 'otter-blocks' ) }
								value={ attributes.borderColorHover }
								onChange={ e => setAttributes({ borderColorHover: e }) }
							/>
						</ColorBaseControl>

						<ContrastChecker
							{ ...{
								textColor: attributes.textColorHover,
								backgroundColor: attributes.backgroundColorHover
							} }
						/>
					</Fragment>
				) : (
					<Fragment>
						<ColorBaseControl
							label={ __( 'Background', 'otter-blocks' ) }
							colorValue={ attributes.backgroundColor }
						>
							<ColorPalette
								label={ __( 'Background', 'otter-blocks' ) }
								value={ attributes.backgroundColor }
								onChange={ e => setAttributes({ backgroundColor: e }) }
							/>
						</ColorBaseControl>

						<ColorBaseControl
							label={ __( 'Icon', 'otter-blocks' ) }
							colorValue={ attributes.textColor }
						>
							<ColorPalette
								label={ __( 'Icon', 'otter-blocks' ) }
								value={ attributes.textColor }
								onChange={ e => setAttributes({ textColor: e }) }
							/>
						</ColorBaseControl>

						<ColorBaseControl
							label={ __( 'Border', 'otter-blocks' ) }
							colorValue={ attributes.borderColor }
						>
							<ColorPalette
								label={ __( 'Border', 'otter-blocks' ) }
								value={ attributes.borderColor }
								onChange={ e => setAttributes({ borderColor: e }) }
							/>
						</ColorBaseControl>

						<ContrastChecker
							{ ...{
								textColor: attributes.textColor,
								backgroundColor: attributes.backgroundColor
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
