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
	Button,
	Tooltip
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import socialList from './services.js';
import SocialIcons from './icons.js';

const Controls = ({ attributes, setAttributes }) => {
	const toggleIcons = ( item ) => {
		setAttributes({ [ item ]: ! attributes[ item ] });
	};

	return (
		<BlockControls>
			<ToolbarGroup>
				{ Object.keys( socialList ).map( ( item ) => {
					const prop = attributes[ item ];

					return (
						<Tooltip
							key={ item.label }

							/* translators: %s Social Website */
							text={ sprintf( __( 'Display %s', 'otter-blocks' ), socialList[ item ].label ) }
						>
							<Button
								className={ classnames(
									'components-button',
									'wp-block-themeisle-toolbar',
									{ 'is-active': prop }
								) }
								onClick={ () => toggleIcons( item ) }
							>
								<SocialIcons icon={ item } />
							</Button>
						</Tooltip>
					);
				}) }
			</ToolbarGroup>
		</BlockControls>
	);
};

export default Controls;
