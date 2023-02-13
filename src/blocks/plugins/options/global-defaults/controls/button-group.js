/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	PanelBody,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

import { Fragment, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import TypographySelectorControl from '../../../../components/typography-selector-control/index';
import { ResponsiveControl } from '../../../../components/index.js';
import { useResponsiveAttributes } from '../../../../helpers/utility-hooks.js';
import { _px } from '../../../../helpers/helper-functions';

const ButtonGroupBlock = ({
	blockName,
	defaults: attributes,
	changeConfig
}) => {

	const setAttributes = x => changeConfig( blockName, x );

	const makeBoxFromSplitAxis = ( vertical, horizontal ) => {
		return {
			top: vertical,
			bottom: vertical,
			right: horizontal,
			left: horizontal
		};
	};

	const [ proxyStore, setProxyStore ] = useState({
		padding: makeBoxFromSplitAxis(
			attributes.paddingTopBottom,
			attributes.paddingLeftRight
		),
		paddingTablet: attributes.paddingTablet,
		paddingMobile: attributes.paddingMobile,
		align: attributes.align
	});

	const [ storeChanged, setStoreChanged ] = useState( false );

	const updateStore = attr => setProxyStore({
		padding: makeBoxFromSplitAxis(
			attributes.paddingTopBottom,
			attributes.paddingLeftRight
		),
		paddingTablet: attributes.paddingTablet,
		paddingMobile: attributes.paddingMobile,
		align: attributes.align,
		...attr
	});

	const { responsiveSetAttributes, responsiveGetAttributes } = useResponsiveAttributes( updateStore );

	useEffect( () => {
		if ( storeChanged ) {
			setAttributes({
				paddingTopBottom: proxyStore?.padding?.top,
				paddingLeftRight: proxyStore?.padding?.right,
				paddingTablet: proxyStore?.paddingTablet,
				paddingMobile: proxyStore?.paddingMobile,
				align: proxyStore?.align
			});
			setStoreChanged( false );
		}

	}, [ proxyStore.padding, proxyStore.paddingTablet, proxyStore.paddingMobile, storeChanged ]);

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Dimensions', 'otter-blocks' ) }
			>
				<ResponsiveControl
					label={ __( 'Screen Type', 'otter-blocks' ) }
				>
					<BoxControl
						label={ __( 'Padding', 'otter-blocks' ) }
						values={
							responsiveGetAttributes([
								makeBoxFromSplitAxis(
									attributes.paddingTopBottom,
									attributes.paddingLeftRight
								),
								attributes.paddingTablet,
								attributes.paddingMobile
							]) ?? makeBoxFromSplitAxis( '15px', '20px' )
						}

						onChange={ value => {
							responsiveSetAttributes( value, [ 'padding', 'paddingTablet', 'paddingMobile' ]);
							setStoreChanged( true );
						} }
						splitOnAxis={ true }
					/>

				</ResponsiveControl>

				<UnitControl
					label={ __( 'Spacing', 'otter-blocks' ) }
					value={ _px( attributes.spacing ) }
					onChange={ e => setAttributes({ spacing: e }) }
					step={ 0.1 }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Typography', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<TypographySelectorControl
					enableComponents={{
						fontFamily: true,
						appearance: true,
						lineHeight: true,
						letterCase: true
					}}

					componentsValue={{
						fontSize: attributes.fontSize,
						fontFamily: attributes.fontFamily,
						lineHeight: attributes.lineHeight,
						appearance: attributes.fontVariant,
						letterCase: attributes.fontStyle
					}}

					onChange={ values => {
						setAttributes({
							fontSize: values.fontSize,
							fontFamily: values.fontFamily,
							lineHeight: values.lineHeight,
							fontVariant: values.appearance,
							fontStyle: values.letterCase
						});
					} }
				/>
			</PanelBody>
		</Fragment>
	);
};

export default ButtonGroupBlock;
