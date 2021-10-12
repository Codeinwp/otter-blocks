/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { BlockControls } from '@wordpress/block-editor';

import {
	Toolbar,
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
		setAttributes({ [ item ]: ! attributes[item] });
	};

	return (
		<BlockControls>
			<Toolbar>
				{ Object.keys( socialList ).map( ( item ) => {
					let prop = attributes[item];

					return (
						<Tooltip text={ __( `Display ${ socialList[item].label }`, 'otter-blocks' )	}>
							<Button
								className={ classnames(
									'components-button',
									'wp-block-themeisle-toolbar',
									{ 'is-active': prop }
								) }
								onClick={ () => toggleIcons( item ) }
							>
								<SocialIcons icon={ item }/>
							</Button>
						</Tooltip>
					);
				}) }
			</Toolbar>
		</BlockControls>
	);
};

export default Controls;
