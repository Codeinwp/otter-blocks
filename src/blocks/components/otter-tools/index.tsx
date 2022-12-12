// @ts-nocheck
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { sortBy } from 'lodash';

import { BlockControls } from '@wordpress/block-editor';

import {
	Button,
	ToolbarDropdownMenu,
	ToolbarGroup,
	createSlotFill,
	KeyboardShortcuts
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment, useState } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';
import { isAppleOS } from '@wordpress/keycodes';


/**
 * Internal dependencies.
 */
import { otterIcon } from '../../helpers/icons';
import { FeedbackModalComponent } from '../../plugins/feedback';

const { Fill, Slot } = createSlotFill('OtterControlTools');

export const OtterControlTools = ({ children, order, source }) => {
	return <Fill >
		<div key={order ?? 99} order={order ?? 99} source={source}>
			{children}
		</div>
	</Fill>;
};

const withOtterTools = createHigherOrderComponent(BlockEdit => {
	return (props) => {

		const [isOpen, setIsOpen] = useState(false);
		const [status, setStatus] = useState('notSubmitted');

		const closeModal = () => {
			setIsOpen(false);
			setStatus('notSubmitted');
		};

		return (
			<Fragment>
				<BlockEdit {...props} />

				{(props.isSelected) && (
					<Fragment>
						<Slot>
							{
								fills => {

									if (!Boolean(fills.length)) {
										return null;
									}

									return (
										<BlockControls>
											{
												fills.some(x => 'copy-paste' === x[0].props?.source) && (
													<KeyboardShortcuts
														shortcuts={
															isAppleOS() ? {
																'ctrl+c': window?.oPlugins?.copy,
																'ctrl+v': window?.oPlugins?.paste
															} : {
																'alt+c': window?.oPlugins?.copy,
																'alt+x': window?.oPlugins?.paste
															}
														}
														bindGlobal={true}
													/>
												)
											}

											<ToolbarGroup>
												<ToolbarDropdownMenu
													label={__('Otter Tools', 'otter-blocks')}
													icon={otterIcon}
												>
													{
														({ onClose }) => (
															<div onClick={onClose}>
																{
																	sortBy(fills ?? [], fill => {
																		return fill[0]?.props.order;
																	}).map(fill => {
																		return fill[0]?.props?.children;
																	})
																}
															</div>
														)
													}
												</ToolbarDropdownMenu>
											</ToolbarGroup>
										</BlockControls>
									);
								}
							}
						</Slot>
					</Fragment>
				)}

			</Fragment>
		);
	};
}, 'withOtterTools');

addFilter('editor.BlockEdit', 'themeisle-gutenberg/otter-tools', withOtterTools);
