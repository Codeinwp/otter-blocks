/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	ContrastChecker,
	InspectorControls
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	RangeControl
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import SyncControl from '../../../components/sync-control/index.js';
import GoogleFontsControl from '../../../components/google-fonts-control';
import ClearButton from '../../../components/clear-button';

/**
 *
 * @param {import('./types.js').AccordionGroupInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	getValue
}) => {
	const changeFontFamily = value => {
		if ( ! value ) {
			setAttributes({
				fontFamily: value,
				fontVariant: value
			});
		} else {
			setAttributes({
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<SelectControl
					label={ __( 'Gap', 'otter-blocks' ) }
					value={ attributes.gap }
					options={ [
						{ label: __( 'No Gap', 'otter-blocks' ), value: '' },
						{ label: __( 'Narrow (5px)', 'otter-blocks' ), value: 'narrow' },
						{ label: __( 'Wide (10px)', 'otter-blocks' ), value: 'wide' },
						{ label: __( 'Wider (20px)', 'otter-blocks' ), value: 'wider' }
					] }
					onChange={ e => setAttributes({ gap: e }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<SyncControl
					field="titleColor"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<ColorGradientControl
						label={ __( 'Title', 'otter-blocks' ) }
						colorValue={ attributes.titleColor }
						onColorChange={ e => setAttributes({ titleColor: e }) }
					/>
				</SyncControl>

				<SyncControl
					field="titleBackground"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<ColorGradientControl
						label={ __( 'Title Background', 'otter-blocks' ) }
						colorValue={ attributes.titleBackground }
						onColorChange={ e => setAttributes({ titleBackground: e }) }
					/>
				</SyncControl>

				<ContrastChecker
					{ ...{
						textColor: getValue( 'titleColor' ),
						backgroundColor: getValue( 'titleBackground' )
					} }
				/>

				<SyncControl
					field="contentBackground"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<ColorGradientControl
						label={ __( 'Content Background', 'otter-blocks' ) }
						colorValue={ attributes.contentBackground }
						onColorChange={ e => setAttributes({ contentBackground: e }) }
					/>
				</SyncControl>


				<SyncControl
					field="borderColor"
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<ColorGradientControl
						label={ __( 'Border Color', 'otter-blocks' ) }
						colorValue={ attributes.borderColor }
						onColorChange={ e => setAttributes({ borderColor: e }) }
					/>
				</SyncControl>
			</PanelBody>
			<PanelBody
				title={ __( 'Title Typography', 'otter-blocks' ) }
			>
				<GoogleFontsControl
					label={ __( 'Font Family', 'otter-blocks' ) }
					value={ attributes.fontFamily }
					onChangeFontFamily={ changeFontFamily }
					valueVariant={ attributes.fontVariant }
					onChangeFontVariant={ fontVariant => setAttributes({ fontVariant }) }
					valueStyle={ attributes.fontStyle }
					onChangeFontStyle={ fontStyle => setAttributes({ fontStyle }) }
					valueTransform={ attributes.textTransform }
					onChangeTextTransform={ textTransform => setAttributes({ textTransform }) }
				/>

				<ClearButton
					values={[ 'fontFamily', 'fontVariant', 'fontStyle', 'textTransform' ]}
					setAttributes={ setAttributes }
				/>

				<RangeControl
					label={ __( 'Letter Spacing', 'otter-blocks' ) }
					value={ attributes.letterSpacing }
					onChange={ letterSpacing => setAttributes({ letterSpacing }) }
					min={ -50 }
					max={ 100 }
					allowReset={ true }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
