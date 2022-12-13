/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	Disabled,
	PanelBody
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import SyncControlDropdown from '../sync-control-dropdown/index';
import ColorDropdownControl from '../color-dropdown-control/index';

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
					className="o-disabled"
				>
					<ColorDropdownControl
						label={ option.label }
						colorValue={ option.value }
						onColorChange={ ( e: string ) => setAttributes({ [ option.slug ]: e }) }
						className={ classnames(
							'is-list',
							{ 'is-first': 0 === index }
						) }
					/>
				</Disabled>
			) ) }

			{ children }
		</PanelBody>
	);
};

export default SyncColorPanel;
