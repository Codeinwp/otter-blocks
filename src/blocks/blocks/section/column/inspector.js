/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { pick } from 'lodash';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import {
	__experimentalBoxControl as BoxControl,
	Button,
	Dashicon,
	PanelBody,
	ToggleControl,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import ResponsiveControl from '../../../components/responsive-control/index.js';
import BackgroundSelectorControl from '../../../components/background-selector-control/index.js';
import ControlPanelControl from '../../../components/control-panel-control/index.js';
import SyncControl from '../../../components/sync-control/index.js';
import { isNullObject } from '../../../helpers/helper-functions.js';

/**
 *
 * @param {import('./types.js').SectionColumnInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	getValue,
	parentBlock,
	updateBlockAttributes,
	currentBlockWidth,
	nextBlock,
	nextBlockWidth
}) => {
	const getView = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();
	}, []);

	const [ tab, setTab ] = useState( 'layout' );

	const changeColumnWidth = value => {
		const width = value || 10;
		const nextWidth = ( Number( currentBlockWidth.current ) - width ) + Number( nextBlockWidth.current );
		currentBlockWidth.current = width;
		nextBlockWidth.current = nextWidth;
		setAttributes({ columnWidth: width.toFixed( 2 ) });
		updateBlockAttributes( nextBlock.current, {
			columnWidth: nextWidth.toFixed( 2 )
		});
	};

	const getPaddingField = () => {
		switch ( getView ) {
		case 'Desktop':
			return 'padding';
		case 'Tablet':
			return 'paddingTablet';
		case 'Mobile':
			return 'paddingMobile';
		default:
			return undefined;
		}
	};

	const getPadding = () => {
		switch ( getView ) {
		case 'Desktop':
			return getValue( 'padding' );
		case 'Tablet':
			return getValue( 'paddingTablet' ) ?? getValue( 'padding' );
		case 'Mobile':
			return getValue( 'paddingMobile' ) ?? getValue( 'paddingTablet' ) ?? getValue( 'padding' );
		default:
			return undefined;
		}
	};

	const changePadding = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		switch ( getView ) {
		case 'Desktop':
			return setAttributes({ padding: value });
		case 'Tablet':
			return setAttributes({ paddingTablet: value });
		case 'Mobile':
			return setAttributes({ paddingMobile: value });
		default:
			return undefined;
		}
	};

	const getMarginField = () => {
		switch ( getView ) {
		case 'Desktop':
			return 'margin';
		case 'Tablet':
			return 'marginTablet';
		case 'Mobile':
			return 'marginMobile';
		default:
			return undefined;
		}
	};

	const getMargin = () => {
		switch ( getView ) {
		case 'Desktop':
			return getValue( 'margin' );
		case 'Tablet':
			return getValue( 'marginTablet' ) ?? getValue( 'margin' );
		case 'Mobile':
			return getValue( 'marginMobile' ) ?? getValue( 'marginTablet' ) ?? getValue( 'margin' );
		default:
			return undefined;
		}
	};

	const changeMargin = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		switch ( getView ) {
		case 'Desktop':
			return setAttributes({ margin: value });
		case 'Tablet':
			return setAttributes({ marginTablet: value });
		case 'Mobile':
			return setAttributes({ marginMobile: value });
		default:
			return undefined;
		}
	};

	const changeBorder = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		setAttributes({ border: value });
	};

	const changeBorderRadius = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		setAttributes({ borderRadius: value });
	};

	return (
		<InspectorControls>
			<PanelBody className="o-section-header-panel">
				<Button
					className={ classnames(
						'header-tab',
						{ 'is-selected': 'layout' === tab }
					) }
					onClick={ () => setTab( 'layout' ) }
				>
					<span>
						<Dashicon icon="editor-table"/>
						{ __( 'Layout', 'otter-blocks' ) }
					</span>
				</Button>

				<Button
					className={ classnames(
						'header-tab',
						{ 'is-selected': 'style' === tab }
					) }
					onClick={ () => setTab( 'style' ) }
				>
					<span>
						<Dashicon icon="admin-customizer"/>
						{ __( 'Style', 'otter-blocks' ) }
					</span>
				</Button>

				<Button
					className={ classnames(
						'header-tab',
						{ 'is-selected': 'advanced' === tab }
					) }
					onClick={ () => setTab( 'advanced' ) }
				>
					<span>
						<Dashicon icon="admin-generic"/>
						{ __( 'Advanced', 'otter-blocks' ) }
					</span>
				</Button>
			</PanelBody>

			{ 'layout' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Spacing', 'otter-blocks' ) }
					>
						{ ( 1 < parentBlock.innerBlocks.length ) && (
							<RangeControl
								label={ __( 'Column Width', 'otter-blocks' ) }
								value={ Number( attributes.columnWidth ) }
								onChange={ changeColumnWidth }
								min={ 10 }
								max={ ( Number( attributes.columnWidth ) + Number( nextBlockWidth.current ) ) - 10 }
							/>
						) }

						<ResponsiveControl
							label={ __( 'Screen Type', 'otter-blocks' ) }
							className="otter-section-padding-responsive-control"
						>
							<SyncControl
								field={ getPaddingField() }
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<BoxControl
									label={ __( 'Padding', 'otter-blocks' ) }
									values={ getPadding() }
									inputProps={ {
										min: 0,
										max: 500
									} }
									onChange={ changePadding }
								/>
							</SyncControl>

							<SyncControl
								field={ getMarginField() }
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<BoxControl
									label={ __( 'Margin', 'otter-blocks' ) }
									values={ getMargin() }
									inputProps={ {
										min: -500,
										max: 500
									} }
									onChange={ changeMargin }
								/>
							</SyncControl>
						</ResponsiveControl>
					</PanelBody>
				</Fragment>
			) || 'style' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Background Settings', 'otter-blocks' ) }
					>
						<BackgroundSelectorControl
							backgroundType={ attributes.backgroundType }
							backgroundColor={ attributes.backgroundColor }
							image={ attributes.backgroundImage }
							gradient={ attributes.backgroundGradient }
							focalPoint={ attributes.backgroundPosition }
							backgroundAttachment={ attributes.backgroundAttachment }
							backgroundRepeat={ attributes.backgroundRepeat }
							backgroundSize={ attributes.backgroundSize }
							changeBackgroundType={ value => setAttributes({ backgroundType: value }) }
							changeImage={ media => {
								setAttributes({
									backgroundImage: pick( media, [ 'id', 'url' ])
								});
							}}
							removeImage={ () => setAttributes({ backgroundImage: undefined })}
							changeColor={ value => setAttributes({ backgroundColor: value })}
							changeGradient={ value => setAttributes({ backgroundGradient: value }) }
							changeBackgroundAttachment={ value => setAttributes({ backgroundAttachment: value })}
							changeBackgroundRepeat={ value => setAttributes({ backgroundRepeat: value })}
							changeFocalPoint={ value => setAttributes({ backgroundPosition: value }) }
							changeBackgroundSize={ value => setAttributes({ backgroundSize: value }) }
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Border', 'otter-blocks' ) }
						className="o-section-border-container"
						initialOpen={ false }
					>
						<BoxControl
							label={ __( 'Border Width', 'otter-blocks' ) }
							values={ attributes.border }
							inputProps={ {
								min: 0,
								max: 500
							} }
							units={ [
								{
									value: 'px',
									label: 'px'
								}
							] }
							onChange={ changeBorder }
						/>

						<ColorGradientControl
							label={ __( 'Border Color', 'otter-blocks' ) }
							colorValue={ attributes.borderColor }
							onColorChange={ value => setAttributes({ borderColor: value }) }
						/>

						<BoxControl
							label={ __( 'Border Radius', 'otter-blocks' ) }
							values={ attributes.borderRadius }
							inputProps={ {
								min: 0,
								max: 500
							} }
							units={ [
								{
									value: 'px',
									label: 'px'
								},
								{
									value: '%',
									label: '%'
								}
							] }
							onChange={ changeBorderRadius }
						/>

						<ToggleControl
							label={ __( 'Box Shadow', 'otter-blocks' ) }
							checked={ attributes.boxShadow }
							onChange={ () => setAttributes({ boxShadow: ! attributes.boxShadow }) }
						/>

						{ attributes.boxShadow && (
							<Fragment>
								<ColorGradientControl
									label={ __( 'Shadow Color', 'otter-blocks' ) }
									colorValue={ attributes.boxShadowColor }
									onColorChange={ value => setAttributes({ boxShadowColor: value }) }
								/>

								<ControlPanelControl
									label={ __( 'Shadow Properties', 'otter-blocks' ) }
								>
									<RangeControl
										label={ __( 'Opacity', 'otter-blocks' ) }
										value={ attributes.boxShadowColorOpacity }
										onChange={ value => setAttributes({ boxShadowColorOpacity: value }) }
										min={ 0 }
										max={ 100 }
									/>

									<RangeControl
										label={ __( 'Blur', 'otter-blocks' ) }
										value={ attributes.boxShadowBlur }
										onChange={ value => setAttributes({ boxShadowBlur: value }) }
										min={ 0 }
										max={ 100 }
									/>

									<RangeControl
										label={ __( 'Spread', 'otter-blocks' ) }
										value={ attributes.boxShadowSpread }
										onChange={ value => setAttributes({ boxShadowSpread: value }) }
										min={ -100 }
										max={ 100 }
									/>

									<RangeControl
										label={ __( 'Horizontal', 'otter-blocks' ) }
										value={ attributes.boxShadowHorizontal }
										onChange={ value => setAttributes({ boxShadowHorizontal: value }) }
										min={ -100 }
										max={ 100 }
									/>

									<RangeControl
										label={ __( 'Vertical', 'otter-blocks' ) }
										value={ attributes.boxShadowVertical }
										onChange={ value => setAttributes({ boxShadowVertical: value }) }
										min={ -100 }
										max={ 100 }
									/>
								</ControlPanelControl>
							</Fragment>
						) }
					</PanelBody>
				</Fragment>
			) || 'advanced' === tab && (
				<PanelBody
					title={ __( 'Section Settings', 'otter-blocks' ) }
				>
					<SelectControl
						label={ __( 'HTML Tag', 'otter-blocks' ) }
						value={ attributes.columnsHTMLTag }
						options={ [
							{ label: __( 'Default (div)', 'otter-blocks' ), value: 'div' },
							{ label: 'section', value: 'section' },
							{ label: 'header', value: 'header' },
							{ label: 'footer', value: 'footer' },
							{ label: 'article', value: 'article' },
							{ label: 'main', value: 'main' }
						] }
						onChange={ value => setAttributes({ columnsHTMLTag: value }) }
					/>
				</PanelBody>
			) }
		</InspectorControls>
	);
};

export default Inspector;
