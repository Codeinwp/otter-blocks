// @ts-nocheck

import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
import { createSlotFill } from '@wordpress/components';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarDropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { otterIcon } from '../../helpers/icons';
import { sortBy } from 'lodash';

const { Fill, Slot } = createSlotFill( 'OtterControlTools' );


export const OtterControlTools = ({ children, order }) => {
	return <Fill >
		<Fragment order={order ?? 99}>
			{children}
		</Fragment>
	</Fill>;
};

const withOtterTools = createHigherOrderComponent( BlockEdit => {
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
															{ sortBy( fills ?? [], fill => {
																return fill[0]?.props.order;
															})}
															<div className="o-fp-wrap" style={{ marginRight: '10px' }}>
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

