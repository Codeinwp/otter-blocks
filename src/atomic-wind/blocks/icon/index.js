import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import blockIcon from './icon';
import edit from './edit';
import { iconLabel } from '../labels';

const { name, ...settings } = metadata;

registerBlockType( name, {
	...settings,
	icon: blockIcon,
	edit,
	save: () => null,
	__experimentalLabel: iconLabel,
} );
