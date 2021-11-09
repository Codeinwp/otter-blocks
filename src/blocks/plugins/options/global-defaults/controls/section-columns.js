/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalBoxControl as BoxControl,
	BaseControl,
	Button,
	ButtonGroup,
	Icon,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	topIcon,
	middleIcon,
	bottomIcon
} from '../../../../helpers/icons.js';
import ResponsiveControl from '../../../../components/responsive-control/index.js';
import { isNullObject } from '../../../../helpers/helper-functions.js';

const SectionColumns = ({
	blockName,
	defaults,
	changeConfig
}) => {
	const getView = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();
	}, []);

	const getPadding = () => {
		switch ( getView ) {
		case 'Desktop':
			return defaults.padding;
		case 'Tablet':
			return defaults.paddingTablet;
		case 'Mobile':
			return defaults.paddingMobile;
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
			return changeConfig( blockName, {
				padding: value
			});
		case 'Tablet':
			return changeConfig( blockName, {
				paddingTablet: value
			});
		case 'Mobile':
			return changeConfig( blockName, {
				paddingMobile: value
			});
		default:
			return undefined;
		}
	};

	const getMargin = () => {
		switch ( getView ) {
		case 'Desktop':
			return defaults.margin;
		case 'Tablet':
			return defaults.marginTablet;
		case 'Mobile':
			return defaults.marginMobile;
		default:
			return undefined;
		}
	};

	const changeMargin = value => {
		if ( isNullObject( value ) ) {
			value = undefined;
		}

		value = Object.fromEntries( Object.entries( value ).filter( ([ _, v ]) => null !== v ) );

		switch ( getView ) {
		case 'Desktop':
			return changeConfig( blockName, {
				margin: value
			});
		case 'Tablet':
			return changeConfig( blockName, {
				marginTablet: value
			});
		case 'Mobile':
			return changeConfig( blockName, {
				marginMobile: value
			});
		default:
			return undefined;
		}
	};

	const changeColumnsWidth = value => {
		if ( ( 0 <= value && 1200 >= value ) || undefined === value ) {
			changeConfig( blockName, {
				columnsWidth: value
			});
		}
	};

	const changeHorizontalAlign = value => {
		if ( defaults.horizontalAlign === value ) {
			return changeConfig( blockName, {
				horizontalAlign: 'unset'
			});
		}

		changeConfig( blockName, {
			horizontalAlign: value
		});
	};

	let getColumnsHeightCustom = () => {
		let value;

		if ( 'Desktop' === getView ) {
			value = defaults.columnsHeightCustom;
		}

		if ( 'Tablet' === getView ) {
			value = defaults.columnsHeightCustomTablet;
		}

		if ( 'Mobile' === getView ) {
			value = defaults.columnsHeightCustomMobile;
		}

		return value;
	};

	getColumnsHeightCustom = getColumnsHeightCustom();

	const changeColumnsHeightCustom = value => {
		if ( 'Desktop' === getView ) {
			changeConfig( blockName, {
				columnsHeightCustom: value
			});
		}

		if ( 'Tablet' === getView ) {
			changeConfig( blockName, {
				columnsHeightCustomTablet: value
			});
		}

		if ( 'Mobile' === getView ) {
			changeConfig( blockName, {
				columnsHeightCustomMobile: value
			});
		}
	};

	const changeVerticalAlign = value => {
		if ( defaults.verticalAlign === value ) {
			return changeConfig( blockName, {
				verticalAlign: 'unset'
			});
		}

		changeConfig( blockName, {
			verticalAlign: value
		});
	};

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Sizing', 'otter-blocks' ) }
			>
				<SelectControl
					label={ __( 'Columns Gap', 'otter-blocks' ) }
					value={ defaults.columnsGap }
					options={ [
						{ label: __( 'Default (10px)', 'otter-blocks' ), value: 'default' },
						{ label: __( 'No Gap', 'otter-blocks' ), value: 'nogap' },
						{ label: __( 'Narrow (5px)', 'otter-blocks' ), value: 'narrow' },
						{ label: __( 'Extended (15px)', 'otter-blocks' ), value: 'extended' },
						{ label: __( 'Wide (20px)', 'otter-blocks' ), value: 'wide' },
						{ label: __( 'Wider (30px)', 'otter-blocks' ), value: 'wider' }
					] }
					onChange={ value => changeConfig( blockName, { columnsGap: value }) }
				/>

				<ResponsiveControl
					label={ __( 'Screen Type', 'otter-blocks' ) }
					className="otter-section-padding-responsive-control"
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

					<hr/>

					<BoxControl
						label={ __( 'Margin', 'otter-blocks' ) }
						values={ getMargin() }
						inputProps={ {
							min: -500,
							max: 500
						} }
						sides={ [ 'top', 'bottom' ] }
						onChange={ changeMargin }
					/>
				</ResponsiveControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Section Structure', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<SelectControl
					label={ __( 'HTML Tag', 'otter-blocks' ) }
					value={ defaults.columnsHTMLTag }
					options={ [
						{ label: __( 'Default (div)', 'otter-blocks' ), value: 'div' },
						{ label: 'section', value: 'section' },
						{ label: 'header', value: 'header' },
						{ label: 'footer', value: 'footer' },
						{ label: 'article', value: 'article' },
						{ label: 'main', value: 'main' }
					] }
					onChange={ value => changeConfig( blockName, { columnsHTMLTag: value }) }
				/>

				<hr/>

				<RangeControl
					label={ __( 'Maximum Content Width', 'otter-blocks' ) }
					value={ defaults.columnsWidth || '' }
					onChange={ changeColumnsWidth }
					min={ 0 }
					max={ 1200 }
				/>

				<hr/>

				{ defaults.columnsWidth && (
					<Fragment>
						<BaseControl
							label={ __( 'Horizontal Align', 'otter-blocks' ) }
						>
							<ButtonGroup className="wp-block-themeisle-icon-buttom-group">
								<Button
									icon="editor-alignleft"
									label={ __( 'Left', 'otter-blocks' ) }
									showTooltip={ true }
									isLarge
									isPrimary={ 'flex-start' === defaults.horizontalAlign }
									onClick={ () => changeHorizontalAlign( 'flex-start' ) }
								/>

								<Button
									icon="editor-aligncenter"
									label={ __( 'Center', 'otter-blocks' ) }
									showTooltip={ true }
									isLarge
									isPrimary={ 'center' === defaults.horizontalAlign }
									onClick={ () => changeHorizontalAlign( 'center' ) }
								/>

								<Button
									icon="editor-alignright"
									label={ __( 'Right', 'otter-blocks' ) }
									showTooltip={ true }
									isLarge
									isPrimary={ 'flex-end' === defaults.horizontalAlign }
									onClick={ () => changeHorizontalAlign( 'flex-end' ) }
								/>
							</ButtonGroup>
						</BaseControl>

						<hr/>
					</Fragment>
				) }

				<SelectControl
					label={ __( 'Minimum Height', 'otter-blocks' ) }
					value={ defaults.columnsHeight }
					options={ [
						{ label: __( 'Default', 'otter-blocks' ), value: 'auto' },
						{ label: __( 'Fit to Screen', 'otter-blocks' ), value: '100vh' },
						{ label: __( 'Custom', 'otter-blocks' ), value: 'custom' }
					] }
					onChange={ value => changeConfig( blockName, { columnsHeight: value }) }
				/>

				<hr/>

				{ 'custom' === defaults.columnsHeight && (
					<Fragment>
						<ResponsiveControl
							label={ __( 'Custom Height', 'otter-blocks' ) }
						>
							<RangeControl
								value={ getColumnsHeightCustom || '' }
								onChange={ changeColumnsHeightCustom }
								min={ 0 }
								max={ 1000 }
							/>
						</ResponsiveControl>

						<hr/>
					</Fragment>
				) }

				<BaseControl
					label={ __( 'Vertical Align', 'otter-blocks' ) }
				>
					<ButtonGroup className="wp-block-themeisle-icon-buttom-group">
						<Button
							icon={ <Icon
								icon={ topIcon }
								size={ 20 }
							/> }
							label={ __( 'Top', 'otter-blocks' ) }
							showTooltip={ true }
							isLarge
							isPrimary={ 'flex-start' === defaults.verticalAlign }
							onClick={ () => changeVerticalAlign( 'flex-start' ) }
						/>

						<Button
							icon={ <Icon
								icon={ middleIcon }
								size={ 20 }
							/> }
							label={ __( 'Middle', 'otter-blocks' ) }
							showTooltip={ true }
							isLarge
							isPrimary={ 'center' === defaults.verticalAlign }
							onClick={ () => changeVerticalAlign( 'center' ) }
						/>

						<Button
							icon={ <Icon
								icon={ bottomIcon }
								size={ 20 }
							/> }
							label={ __( 'Bottom', 'otter-blocks' ) }
							showTooltip={ true }
							isLarge
							isPrimary={ 'flex-end' === defaults.verticalAlign }
							onClick={ () => changeVerticalAlign( 'flex-end' ) }
						/>
					</ButtonGroup>
				</BaseControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Responsive', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Hide this section on Desktop devices?', 'otter-blocks' ) }
					checked={ defaults.hide }
					onChange={ value => changeConfig( blockName, { hide: value }) }
				/>

				<ToggleControl
					label={ __( 'Hide this section on Tablet devices?', 'otter-blocks' ) }
					checked={ defaults.hideTablet }
					onChange={ value => changeConfig( blockName, { hideTablet: value }) }
				/>

				<ToggleControl
					label={ __( 'Hide this section on Mobile devices?', 'otter-blocks' ) }
					checked={ defaults.hideMobile }
					onChange={ value => changeConfig( blockName, { hideMobile: value }) }
				/>
			</PanelBody>
		</Fragment>
	);
};

export default SectionColumns;
