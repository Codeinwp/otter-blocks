/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { ColorPalette } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ColorBaseControl from '../../../../components/color-base-control/index.js';
import GoogleFontsControl from '../../../../components/google-fonts-control/index.js';
import ResponsiveControl from '../../../../components/responsive-control/index.js';
import SizingControl from '../../../../components/sizing-control/index.js';

const AdvancedHeading = ({
	blockName,
	defaults,
	changeConfig
}) => {
	const getView = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;

		return __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();
	}, []);

	let getFontSize = () => {
		let value;

		if ( 'Desktop' === getView ) {
			value = defaults.fontSize;
		}

		if ( 'Tablet' === getView ) {
			value = defaults.fontSizeTablet;
		}

		if ( 'Mobile' === getView ) {
			value = defaults.fontSizeMobile;
		}

		return value;
	};

	getFontSize = getFontSize();

	const changeFontSize = value => {
		if ( 'Desktop' === getView ) {
			changeConfig( blockName, {
				fontSize: value
			});
		}

		if ( 'Tablet' === getView ) {
			changeConfig( blockName, {
				fontSizeTablet: value
			});
		}

		if ( 'Mobile' === getView ) {
			changeConfig( blockName, {
				fontSizeMobile: value
			});
		}
	};

	const changeFontFamily = value => {
		if ( ! value ) {
			changeConfig( blockName, {
				fontFamily: value,
				fontVariant: value
			});
		} else {
			changeConfig( blockName, {
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

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

	return (
		<Fragment>
			<PanelBody
				title={ __( 'General Settings', 'otter-blocks' ) }
			>
				<SelectControl
					label={ __( 'HTML Tag', 'otter-blocks' ) }
					value={ defaults.tag }
					options={ [
						{ label: __( 'Heading 1', 'otter-blocks' ), value: 'h1' },
						{ label: __( 'Heading 2', 'otter-blocks' ), value: 'h2' },
						{ label: __( 'Heading 3', 'otter-blocks' ), value: 'h3' },
						{ label: __( 'Heading 4', 'otter-blocks' ), value: 'h4' },
						{ label: __( 'Heading 5', 'otter-blocks' ), value: 'h5' },
						{ label: __( 'Heading 6', 'otter-blocks' ), value: 'h6' },
						{ label: __( 'Division', 'otter-blocks' ), value: 'div' },
						{ label: __( 'Paragraph', 'otter-blocks' ), value: 'p' },
						{ label: __( 'Span', 'otter-blocks' ), value: 'span' }
					] }
					onChange={ value => changeConfig( blockName, { tag: value }) }
				/>

				<ColorBaseControl
					label={ __( 'Heading Color', 'otter-blocks' ) }
					colorValue={ defaults.headingColor }
				>
					<ColorPalette
						value={ defaults.headingColor }
						onChange={ value => changeConfig( blockName, { headingColor: value }) }
					/>
				</ColorBaseControl>

				<hr/>

				<ResponsiveControl
					label={ __( 'Font Size', 'otter-blocks' ) }
				>
					<RangeControl
						value={ getFontSize || '' }
						onChange={ changeFontSize }
						min={ 1 }
						max={ 500 }
					/>
				</ResponsiveControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Typography Settings', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<GoogleFontsControl
					label={ __( 'Font Family', 'otter-blocks' ) }
					value={ defaults.fontFamily }
					onChangeFontFamily={ changeFontFamily }
					valueVariant={ defaults.fontVariant }
					onChangeFontVariant={ value => changeConfig( blockName, { fontVariant: value }) }
					valueStyle={ defaults.fontStyle }
					onChangeFontStyle={ value => changeConfig( blockName, { fontStyle: value }) }
					valueTransform={ defaults.textTransform }
					onChangeTextTransform={ value => changeConfig( blockName, { textTransform: value }) }
				/>

				<hr/>

				<RangeControl
					label={ __( 'Line Height', 'otter-blocks' ) }
					value={ defaults.lineHeight || '' }
					onChange={ value => changeConfig( blockName, { lineHeight: value }) }
					min={ 0 }
					max={ 200 }
				/>

				<hr/>

				<RangeControl
					label={ __( 'Letter Spacing', 'otter-blocks' ) }
					value={ defaults.letterSpacing || '' }
					onChange={ value => changeConfig( blockName, { letterSpacing: value }) }
					min={ -50 }
					max={ 100 }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Spacing', 'otter-blocks' ) }
				initialOpen={ false }
			>
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
		</Fragment>
	);
};

export default AdvancedHeading;
