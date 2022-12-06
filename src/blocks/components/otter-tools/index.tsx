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

const { Fill, Slot } = createSlotFill( 'OtterControlTools' );

export const OtterControlTools = ({ children, order }) => {
	return <Fill >
		<div key={order ?? 99} order={order ?? 99}>
			{children}
		</div>
	</Fill>;
};

const withOtterTools = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {

		const [ isOpen, setIsOpen ] = useState( false );
		const [ status, setStatus ] = useState( 'notSubmitted' );

		const closeModal = () => {
			setIsOpen( false );
			setStatus( 'notSubmitted' );
		};

		return (
			<Fragment>
				<BlockEdit { ...props } />
				<KeyboardShortcuts

					// Sometime it works, sometime is not. Not to reliable
					shortcuts={
						isAppleOS() ? {
							'mod+ctrl+j': window?.oPlugins?.copy,
							'mod+ctrl+k': window?.oPlugins?.paste
						} : {
							'ctrl+alt+j': window?.oPlugins?.copy,
							'ctrl+alt+k': window?.oPlugins?.paste
						}
					}
					bindGlobal={true}
				/>
				{ ( props.isSelected ) && (
					<Fragment>
						<Slot>
							{
								fills => {

									if ( ! Boolean( fills.length ) ) {
										return null;
									}

									return (
										<BlockControls>

											<ToolbarGroup>
												<ToolbarDropdownMenu
													label={__( 'Otter Tools', 'otter-blocks' )}
													icon={ otterIcon }
												>
													{
														({ onClose }) => (
															<div onClick={onClose}>
																{
																	sortBy( fills ?? [], fill => {
																		return fill[0]?.props.order;
																	}).map( fill => {
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
}, 'withOtterTools' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/otter-tools', withOtterTools );
