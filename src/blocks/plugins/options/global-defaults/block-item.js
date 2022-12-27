/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	Icon
} from '@wordpress/components';

import { useDispatch } from '@wordpress/data';

import { useCallback } from '@wordpress/element';

import { settings } from '@wordpress/icons';

import { NavigatorButton } from '../index.js';

const BlockItem = ({
	block,
	hasSettings,
	hiddenBlocks,
	setSelectedBlock
}) => {
	const { showBlockTypes, hideBlockTypes } = useDispatch( 'core/edit-post' );

	const toggleVisible = useCallback( ( blockName, nextIsChecked ) => {
		if ( nextIsChecked ) {
			showBlockTypes( blockName );
		} else {
			hideBlockTypes( blockName );
		}
	}, []);

	if ( ! block ) {
		return null;
	}

	const isHidden = hiddenBlocks.includes( block.name );

	return (
		<div
			className={ classnames(
				'o-options-block-item',
				{
					'editable': hasSettings,
					'hidden': isHidden
				}
			) }
		>
			<div className="o-options-block-item-icon">
				<Icon
					icon={ block.icon.src }
				/>
			</div>

			<div className="o-options-block-item-label">{ block.title }</div>

			{ hasSettings && (
				<NavigatorButton
					path="/block-settings/global-defaults"
					icon={ settings }
					label={ __( 'Open Settings', 'otter-blocks' ) }
					showTooltip={ true }
					className="o-options-block-item-button"
					onClickAction={ () => setSelectedBlock( block.name ) }
				/>
			)}

			<Button
				icon={ isHidden ? 'hidden' : 'visibility' }
				label={ isHidden ? __( 'Show Block', 'otter-blocks' ) : __( 'Hide Block', 'otter-blocks' ) }
				showTooltip={ true }
				className="o-options-block-item-button"
				onClick={ () => toggleVisible( block.name, isHidden ) }
			/>
		</div>
	);
};

export default BlockItem;
