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
import { tool } from '@wordpress/icons';

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


		if ( props.isSelected ) {
			const isSupportedBlock = ( props.name?.startsWith( 'core/' ) || props.name?.startsWith( 'themeisle-blocks/' ) );

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
												icon={ isSupportedBlock ? otterIcon : tool  }
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
