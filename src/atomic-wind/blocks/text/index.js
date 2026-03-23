import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import icon from '../icon';
import edit from './edit';
import save from './save';

const { name, ...settings } = metadata;

registerBlockType( name, {
	...settings,
	icon,
	edit,
	save,
} );
