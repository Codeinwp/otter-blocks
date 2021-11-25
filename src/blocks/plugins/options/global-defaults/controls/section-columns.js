/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
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
import SizingControl from '../../../../components/sizing-control/index.js';

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

	let getPaddingType = () => {
		let value;

		if ( 'Desktop' === getView ) {
			value = defaults.paddingType;
		}
		if ( 'Tablet' === getView ) {
			value = defaults.paddingTypeTablet;
		}
		if ( 'Mobile' === getView ) {
			value = defaults.paddingTypeMobile;
		}

		return value;
	};

	getPaddingType = getPaddingType();

	const changePaddingType = value => {
		if ( 'Desktop' === getView ) {
			changeConfig( blockName, {
				paddingType: value
			});
		}
		if ( 'Tablet' === getView ) {
			changeConfig( blockName, {
				paddingTypeTablet: value
			});
		}
		if ( 'Mobile' === getView ) {
			changeConfig( blockName, {
				paddingTypeMobile: value
			});
		}
	};

	const desktopPaddingType = {
		top: 'paddingTop',
		right: 'paddingRight',
		bottom: 'paddingBottom',
		left: 'paddingLeft'
	};

	const tabletPaddingType = {
		top: 'paddingTopTablet',
		right: 'paddingRightTablet',
		bottom: 'paddingBottomTablet',
		left: 'paddingLeftTablet'
	};

	const mobilePaddingType = {
		top: 'paddingTopMobile',
		right: 'paddingRightMobile',
		bottom: 'paddingBottomMobile',
		left: 'paddingLeftMobile'
	};

	const changePadding = ( type, value ) => {
		if ( 'Desktop' === getView ) {
			if ( 'linked' === defaults.paddingType ) {
				changeConfig( blockName, {
					padding: value
				});
			} else {
				changeConfig( blockName, {
					[desktopPaddingType[type]]: value
				});
			}
		}

		if ( 'Tablet' === getView ) {
			if ( 'linked' === defaults.paddingTypeTablet ) {
				changeConfig( blockName, {
					paddingTablet: value
				});
			} else {
				changeConfig( blockName, {
					[tabletPaddingType[type]]: value
				});
			}
		}

		if ( 'Mobile' === getView ) {
			if ( 'linked' === defaults.paddingTypeMobile ) {
				changeConfig( blockName, {
					paddingMobile: value
				});
			} else {
				changeConfig( blockName, {
					[mobilePaddingType[type]]: value
				});
			}
		}
	};

	const getPadding = type => {
		let value;

		if ( 'top' == type ) {
			if ( 'Desktop' === getView ) {
				value = 'linked' === defaults.paddingType ? defaults.padding : defaults.paddingTop;
			}

			if ( 'Tablet' === getView ) {
				value = 'linked' === defaults.paddingTypeTablet ? defaults.paddingTablet : defaults.paddingTopTablet;
			}

			if ( 'Mobile' === getView ) {
				value = 'linked' === defaults.paddingTypeMobile ? defaults.paddingMobile : defaults.paddingTopMobile;
			}
		}

		if ( 'right' == type ) {
			if ( 'Desktop' === getView ) {
				value = 'linked' === defaults.paddingType ? defaults.padding : defaults.paddingRight;
			}

			if ( 'Tablet' === getView ) {
				value = 'linked' === defaults.paddingTypeTablet ? defaults.paddingTablet : defaults.paddingRightTablet;
			}

			if ( 'Mobile' === getView ) {
				value = 'linked' === defaults.paddingTypeMobile ? defaults.paddingMobile : defaults.paddingRightMobile;
			}
		}

		if ( 'bottom' == type ) {
			if ( 'Desktop' === getView ) {
				value = 'linked' === defaults.paddingType ? defaults.padding : defaults.paddingBottom;
			}

			if ( 'Tablet' === getView ) {
				value = 'linked' === defaults.paddingTypeTablet ? defaults.paddingTablet : defaults.paddingBottomTablet;
			}

			if ( 'Mobile' === getView ) {
				value = 'linked' === defaults.paddingTypeMobile ? defaults.paddingMobile : defaults.paddingBottomMobile;
			}
		}

		if ( 'left' == type ) {
			if ( 'Desktop' === getView ) {
				value = 'linked' === defaults.paddingType ? defaults.padding : defaults.paddingLeft;
			}

			if ( 'Tablet' === getView ) {
				value = 'linked' === defaults.paddingTypeTablet ? defaults.paddingTablet : defaults.paddingLeftTablet;
			}

			if ( 'Mobile' === getView ) {
				value = 'linked' === defaults.paddingTypeMobile ? defaults.paddingMobile : defaults.paddingLeftMobile;
			}
		}

		return value;
	};

	let getMarginType = () => {
		let value;

		if ( 'Desktop' === getView ) {
			value = defaults.marginType;
		}
		if ( 'Tablet' === getView ) {
			value = defaults.marginTypeTablet;
		}
		if ( 'Mobile' === getView ) {
			value = defaults.marginTypeMobile;
		}

		return value;
	};

	getMarginType = getMarginType();

	const changeMarginType = value => {
		if ( 'Desktop' === getView ) {
			changeConfig( blockName, {
				marginType: value
			});
		}
		if ( 'Tablet' === getView ) {
			changeConfig( blockName, {
				marginTypeTablet: value
			});
		}
		if ( 'Mobile' === getView ) {
			changeConfig( blockName, {
				marginTypeMobile: value
			});
		}
	};

	const desktopMarginType = {
		top: 'marginTop',
		bottom: 'marginBottom'
	};

	const tabletMarginType = {
		top: 'marginTopTablet',
		bottom: 'marginBottomTablet'
	};

	const mobileMarginType = {
		top: 'marginTopMobile',
		bottom: 'marginBottomMobile'
	};

	const changeMargin = ( type, value ) => {
		if ( 'Desktop' === getView ) {
			if ( 'linked' === defaults.marginType ) {
				changeConfig( blockName, {
					margin: value
				});
			} else {
				changeConfig( blockName, {
					[desktopMarginType[type]]: value
				});
			}
		}

		if ( 'Tablet' === getView ) {
			if ( 'linked' === defaults.marginTypeTablet ) {
				changeConfig( blockName, {
					marginTablet: value
				});
			} else {
				changeConfig( blockName, {
					[tabletMarginType[type]]: value
				});
			}
		}

		if ( 'Mobile' === getView ) {
			if ( 'linked' === defaults.marginTypeMobile ) {
				changeConfig( blockName, {
					marginMobile: value
				});
			} else {
				changeConfig( blockName, {
					[mobileMarginType[type]]: value
				});
			}
		}
	};

	const getMargin = type => {
		let value;

		if ( 'top' == type ) {
			if ( 'Desktop' === getView ) {
				value = 'linked' === defaults.marginType ? defaults.margin : defaults.marginTop;
			}

			if ( 'Tablet' === getView ) {
				value = 'linked' === defaults.marginTypeTablet ? defaults.marginTablet : defaults.marginTopTablet;
			}

			if ( 'Mobile' === getView ) {
				value = 'linked' === defaults.marginTypeMobile ? defaults.marginMobile : defaults.marginTopMobile;
			}
		}

		if ( 'bottom' == type ) {
			if ( 'Desktop' === getView ) {
				value = 'linked' === defaults.marginType ? defaults.margin : defaults.marginBottom;
			}

			if ( 'Tablet' === getView ) {
				value = 'linked' === defaults.marginTypeTablet ? defaults.marginTablet : defaults.marginBottomTablet;
			}

			if ( 'Mobile' === getView ) {
				value = 'linked' === defaults.marginTypeMobile ? defaults.marginMobile : defaults.marginBottomMobile;
			}
		}

		return value;
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
					label={ __( 'Padding', 'otter-blocks' ) }
				>
					<SizingControl
						type={ getPaddingType }
						min={ 0 }
						max={ 500 }
						changeType={ changePaddingType }
						onChange={ changePadding }
						options={ [
							{
								label: __( 'Top', 'otter-blocks' ),
								type: 'top',
								value: getPadding( 'top' )
							},
							{
								label: __( 'Right', 'otter-blocks' ),
								type: 'right',
								value: getPadding( 'right' )
							},
							{
								label: __( 'Bottom', 'otter-blocks' ),
								type: 'bottom',
								value: getPadding( 'bottom' )
							},
							{
								label: __( 'Left', 'otter-blocks' ),
								type: 'left',
								value: getPadding( 'left' )
							}
						] }
					/>
				</ResponsiveControl>

				<hr/>

				<ResponsiveControl
					label={ __( 'Margin', 'otter-blocks' ) }
				>
					<SizingControl
						type={ getMarginType }
						min={ -500 }
						max={ 500 }
						changeType={ changeMarginType }
						onChange={ changeMargin }
						options={ [
							{
								label: __( 'Top', 'otter-blocks' ),
								type: 'top',
								value: getMargin( 'top' )
							},
							{
								label: __( 'Right', 'otter-blocks' ),
								disabled: true
							},
							{
								label: __( 'Bottom', 'otter-blocks' ),
								type: 'bottom',
								value: getMargin( 'bottom' )
							},
							{
								label: __( 'Left', 'otter-blocks' ),
								disabled: true
							}
						] }
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
