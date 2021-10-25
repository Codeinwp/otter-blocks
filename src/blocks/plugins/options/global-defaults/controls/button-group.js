/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	PanelBody,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import SizingControl from '../../../../components/sizing-control/index.js';
import GoogleFontsControl from '../../../../components/google-fonts-control/index.js';

const ButtonGroupBlock = ({
	blockName,
	defaults,
	changeConfig
}) => {
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

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Spacing', 'otter-blocks' ) }
			>
				<SizingControl
					label={ __( 'Button Padding', 'otter-blocks' ) }
					min={ 0 }
					max={ 100 }
					onChange={ ( key, value ) => changeConfig( blockName, { [key]: value }) }
					options={ [
						{
							label: __( 'Top', 'otter-blocks' ),
							type: 'paddingTopBottom',
							value: defaults.paddingTopBottom
						},
						{
							label: __( 'Right', 'otter-blocks' ),
							type: 'paddingLeftRight',
							value: defaults.paddingLeftRight
						},
						{
							label: __( 'Bottom', 'otter-blocks' ),
							type: 'paddingTopBottom',
							value: defaults.paddingTopBottom
						},
						{
							label: __( 'Left', 'otter-blocks' ),
							type: 'paddingLeftRight',
							value: defaults.paddingLeftRight
						}
					] }
				/>

				<hr/>

				<RangeControl
					label={ __( 'Group Spacing', 'otter-blocks' ) }
					value={ defaults.spacing }
					onChange={ value => changeConfig( blockName, { spacing: value }) }
					min={ 0 }
					max={ 50 }
				/>

				<hr/>

				<SelectControl
					label={ __( 'Collapse On', 'otter-blocks' ) }
					value={ defaults.collapse }
					options={ [
						{ label: __( 'None', 'otter-blocks' ), value: 'collapse-none' },
						{ label: __( 'Desktop', 'otter-blocks' ), value: 'collapse-desktop' },
						{ label: __( 'Tablet', 'otter-blocks' ), value: 'collapse-tablet' },
						{ label: __( 'Mobile', 'otter-blocks' ), value: 'collapse-mobile' }
					] }
					onChange={ value => changeConfig( blockName, { collapse: value }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Typography Settings', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<RangeControl
					label={ __( 'Font Size', 'otter-blocks' ) }
					value={ defaults.fontSize || '' }
					onChange={ value => changeConfig( blockName, { fontSize: value }) }
					min={ 0 }
					max={ 50 }
				/>

				<hr/>

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
			</PanelBody>
		</Fragment>
	);
};

export default ButtonGroupBlock;
