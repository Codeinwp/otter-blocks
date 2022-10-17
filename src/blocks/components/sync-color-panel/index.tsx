/**
 * WordPress dependencies
 */
import {

	// @ts-ignore
	__experimentalColorGradientControl as ColorGradientControl
} from '@wordpress/block-editor';

import {
	Disabled,
	PanelBody
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import SyncControlDropdown from '../sync-control-dropdown/index.js';

type SyncColorPanelProps = {
    label: string,
    initialOpen?: boolean,
    isSynced: string[],
    options: { label: string, slug: string, value: string }[],
    setAttributes: Function,
    children: React.ReactNode
};

const SyncColorPanel = ( props: SyncColorPanelProps ) => {
	const {
		label,
		initialOpen = false,
		isSynced,
		options,
		setAttributes,
		children
	} = props;

	return (
		<PanelBody
			title={ label }
			initialOpen={ initialOpen }
			className="o-sync-color-panel"
		>
			<SyncControlDropdown
				isSynced={ isSynced }
				options={ options?.map( option => ({
					label: option.label,
					value: option.slug
				}) )}
				setAttributes={ setAttributes }
			/>

			{ options.map( ( option, index ) => (
				<Disabled
					key={ index }

					// @ts-ignore
					isDisabled={ isSynced?.includes( option.slug ) || false }
				>
					<ColorGradientControl
						label={ option.label }
						colorValue={ option.value }
						onColorChange={ ( e: string ) => setAttributes({ [ option.slug ]: e }) }
					/>
				</Disabled>
			) ) }

			{ children }
		</PanelBody>
	);
};

export default SyncColorPanel;
