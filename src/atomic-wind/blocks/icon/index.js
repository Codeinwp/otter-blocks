import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import blockIcon from './icon';
import edit from './edit';
import { iconLabel } from '../labels';

registerBlockType( metadata, {
	icon: blockIcon,
	edit,
	save: () => null,
	__experimentalLabel: iconLabel,
} );
