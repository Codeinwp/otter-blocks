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
	createSlotFill
} from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment, useState } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import { otterIcon } from '../../helpers/icons';
import { FeedbackModalComponent } from '../../plugins/feedback';

const { Fill, Slot } = createSlotFill( 'OtterControlTools' );

export const OtterControlTools = ({ children, order }) => {
	return <Fill >
		<Fragment order={ order ?? 99 }>
			{ children }
		</Fragment>
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

		if ( props.isSelected ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />
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
															{ sortBy( fills ?? [], fill => {
																return fill[0]?.props.order;
															})}
															<Button
																id="o-feedback"
																variant={ 'link' }
																onClick={() => {
																	setIsOpen( ! isOpen );
																	onClose();
																}}
																style={{
																	paddingLeft: '8px'
																}}
															>
																{ __( 'Help us improve Otter Blocks', 'otter-blocks' ) }
															</Button>
														</div>
													)
												}
											</ToolbarDropdownMenu>
										</ToolbarGroup>
										<FeedbackModalComponent
											isOpen={isOpen}
											status={status}
											closeModal={closeModal}
											source={'control-tools'}
											setStatus={ setStatus }
										/>
									</BlockControls>
								);
							}
						}
					</Slot>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withOtterTools' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/otter-tools', withOtterTools );
