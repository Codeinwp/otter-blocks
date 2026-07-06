/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import { BlockControls } from '@wordpress/block-editor';

import {
	ToolbarGroup,
	ToolbarButton
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import SocialIcons from './icons.js';

const Controls = ({
	attributes,
	setAttributes,
	socialList
}) => {
	const toggleIcons = ( item ) => {
		const newValue = { ...attributes[ item ] };
		newValue.active = ! newValue?.active;

		setAttributes({ [ item ]: { ...newValue }});
	};

	return (
		<BlockControls>
			<ToolbarGroup>
				{ Object.keys( socialList ).map( ( item ) => {
					const prop = attributes[ item ]?.active ?? attributes?.[ item ];

					return (
						<ToolbarButton
							key={ item }
							label={
								sprintf(
									/* translators: %s Label */
									__( 'Display %s', 'otter-blocks' ),
									socialList[ item ].label
								)
							}
							showTooltip={ true }
							className={ classnames(
								'components-button',
								'wp-block-themeisle-toolbar',
								{ 'is-active': prop }
							) }
							onClick={ () => toggleIcons( item ) }
						>
							<SocialIcons icon={ item } />
						</ToolbarButton>
					);
				}) }
			</ToolbarGroup>
		</BlockControls>
	);
};

export default Controls;
