/**
 * WordPress Dependencies
 */
import {
	SelectControl,
	Button, MenuGroup, MenuItemsChoice, MenuItem, DropdownMenu,
} from '@wordpress/components';
import { alignNone, positionLeft, positionCenter, positionRight, stretchFullWidth, arrowDown } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import classnames from 'classnames';
import { BlockAlignmentToolbar } from "@wordpress/block-editor";
import { __ } from '@wordpress/i18n';

const InspectorAlignmentControl = (
	value,
	onChange,
	controls
) => {
	return(
		<MenuGroup label={ __( 'Alignment', 'otter-blocks' ) }>
			<MenuItemsChoice
				choices={ [
					{
						value: 'none',
						icon: alignNone,
						label: __( 'None', 'otter-blocks' ),
					},
					{
						value: 'left',
						icon: positionLeft,
						label: __( 'Align left', 'otter-blocks' ),
					},
					{
						value: 'center',
						icon: positionCenter,
						label: __( 'Align center', 'otter-blocks' ),
					},
					{
						value: 'right',
						icon: positionRight,
						label: __( 'Align right', 'otter-blocks' ),
					},
					{
						value: 'full',
						icon: stretchFullWidth,
						label: __( 'Full width', 'otter-blocks' ),
					}
				] }
				icon={ arrowDown }
				onSelect={ (e) =>console.log(e) }
				value="text">
			</MenuItemsChoice>
		</MenuGroup>
	)
}

export default InspectorAlignmentControl;
