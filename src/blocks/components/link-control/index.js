/**
 * External dependencies
 */
import { link, linkOff } from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';

import {
	KeyboardShortcuts,
	Popover,
	ToolbarButton,
	ToolbarGroup
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

import {
	displayShortcut,
	rawShortcut
} from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import './editor.scss';

const LinkControlToolbar = ({
	isSelected,
	url,
	setAttributes,
	opensInNewTab
}) => {
	const [ isURLPickerOpen, setIsURLPickerOpen ] = useState( false );

	const urlIsSet = !! url;
	const urlIsSetandSelected = urlIsSet && isSelected;

	const openLinkControl = () => {
		setIsURLPickerOpen( true );
		return false;
	};

	const unlinkButton = () => {
		setAttributes({
			link: undefined,
			newTab: undefined
		});
		setIsURLPickerOpen( false );
	};

	const linkControl = ( isURLPickerOpen ) && (
		<Popover
			position="bottom right"
			onClose={ () => setIsURLPickerOpen( false ) }
		>
			<LinkControl
				className="wp-block-navigation-link__inline-link-input"
				value={ { url, opensInNewTab } }
				onChange={ ({
					url: newURL = '',
					opensInNewTab: newOpensInNewTab
				}) => {
					setAttributes({ link: newURL });

					if ( opensInNewTab !== newOpensInNewTab ) {
						setAttributes({ newTab: newOpensInNewTab });
					}
				} }
			/>
		</Popover>
	);

	return (
		<Fragment>
			<ToolbarGroup>
				{ ! urlIsSet && (
					<ToolbarButton
						name="link"
						icon={ link }
						title={ __( 'Link', 'otter-blocks' ) }
						shortcut={ displayShortcut.primary( 'k' ) }
						onClick={ openLinkControl }
						className="otter-toolbar-icon"
					/>
				) }

				{ urlIsSetandSelected && (
					<ToolbarButton
						name="link"
						icon={ linkOff }
						title={ __( 'Unlink', 'otter-blocks' ) }
						shortcut={ displayShortcut.primaryShift( 'k' ) }
						onClick={ unlinkButton }
						isActive={ true }
						className="otter-toolbar-icon"
					/>
				) }
			</ToolbarGroup>

			{ isSelected && (
				<KeyboardShortcuts
					bindGlobal
					shortcuts={ {
						[ rawShortcut.primary( 'k' ) ]: openLinkControl,
						[ rawShortcut.primaryShift( 'k' ) ]: unlinkButton
					} }
				/>
			) }

			{ linkControl }
		</Fragment>
	);
};
export default LinkControlToolbar;
