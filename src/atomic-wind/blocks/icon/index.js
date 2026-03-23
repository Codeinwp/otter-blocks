import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import blockIcon from '../icon';
import edit from './edit';

const { name, ...settings } = metadata;

registerBlockType( name, {
	...settings,
	icon: blockIcon,
	edit,
	save: () => null,
} );
