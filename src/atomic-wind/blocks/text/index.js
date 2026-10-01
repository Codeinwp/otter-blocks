import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import icon from './icon';
import edit from './edit';
import save from './save';
import { textLabel } from '../labels';

registerBlockType( metadata, {
	icon,
	edit,
	save,
	__experimentalLabel: textLabel,
} );
