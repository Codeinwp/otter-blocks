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
	SelectControl
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import SyncControl from '../../../components/sync-control/index.js';

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
		</InspectorControls>
	);
};

export default Inspector;
