/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitContol,
	BaseControl,
	PanelBody
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	ClearButton,
	ResponsiveControl,
	ToogleGroupControl
} from '../../../../components/index.js';

import { isNullObject } from '../../../../helpers/helper-functions.js';

const SectionColumns = ({
	blockName,
	defaults,
	changeConfig
}) => {
	const getView = useSelect( select => {
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' );
		return __experimentalGetPreviewDeviceType();
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

		if ( 'object' === typeof value ) {
			value = Object.fromEntries( Object.entries( value ).filter( ([ _, v ]) => null !== v ) );
		}

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

	const getColumnsWidth = () => {
		switch ( getView ) {
		case 'Desktop':
			return defaults.columnsWidth;
		case 'Tablet':
			return defaults.columnsWidthTablet;
		case 'Mobile':
			return defaults.columnsWidthMobile;
		default:
			return undefined;
		}
	};

	const changeColumnsWidth = value => {
		switch ( getView ) {
		case 'Desktop':
			return changeConfig( blockName, {
				columnsWidth: value
			});
		case 'Tablet':
			return changeConfig( blockName, {
				columnsWidthTablet: value
			});
		case 'Mobile':
			return changeConfig( blockName, {
				columnsWidthMobile: value
			});
		default:
			return undefined;
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

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Sizing', 'otter-blocks' ) }
			>
				<ResponsiveControl
					label={ __( 'Screen Type', 'otter-blocks' ) }
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
				<ResponsiveControl
					label={ __( 'Maximum Content Width', 'otter-blocks' ) }
				>
					<UnitContol
						value={ getColumnsWidth() }
						onChange={ changeColumnsWidth }
					/>
				</ResponsiveControl>

				<ClearButton
					values={[ 'columnsWidth', 'columnsWidthTablet', 'columnsWidthMobile' ]}
					setAttributes={ value => changeConfig( blockName, value ) }
				/>

				{ defaults.columnsWidth && (
					<BaseControl
						label={ __( 'Horizontal Align', 'otter-blocks' ) }
					>
						<ToogleGroupControl
							value={ defaults.horizontalAlign }
							options={[
								{
									icon: 'editor-alignleft',
									label: __( 'Left', 'otter-blocks' ),
									value: 'flex-start'
								},
								{
									icon: 'editor-aligncenter',
									label: __( 'Center', 'otter-blocks' ),
									value: 'center'
								},
								{
									icon: 'editor-alignright',
									label: __( 'Right', 'otter-blocks' ),
									value: 'flex-end'
								}
							]}
							onChange={ align => changeHorizontalAlign( align ) }
							hasIcon
						/>
					</BaseControl>
				) }
			</PanelBody>
		</Fragment>
	);
};

export default SectionColumns;
