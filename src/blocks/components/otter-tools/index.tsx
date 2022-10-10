// @ts-nocheck

import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
import { createSlotFill, ExternalLink } from '@wordpress/components';
import { BlockControls } from '@wordpress/block-editor';
import { DropdownMenu, ToolbarGroup, ToolbarDropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { otterIcon } from '../../helpers/icons';

const { Fill, Slot } = createSlotFill( 'OtterControlTools' );

export const useOtterControlTools = () => Fill;

const withOtterTools = createHigherOrderComponent( BlockEdit => {


	/**
	 * Note: The order of the apperence will corespons with the order of imports
	 *
	 */
	return ( props ) => {

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
														<Fragment>
															{fills}
															<div className="o-fp-wrap" style={{ marginRight: '10px' }}>
																{/* <ExternalLink href='/wp-admin/options-general.php?page=otter' target='_blank'>{__( 'Feedback', 'otter-blocks' )}</ExternalLink> */}
																{ applyFilters( 'otter.poweredBy', '' ) }
															</div>
														</Fragment>
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
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withOtterTools' );


addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/otter-tools', withOtterTools );

