import { isNil, pickBy } from 'lodash';
import { OtterBlock } from '../../helpers/blocks';
import { adaptors } from './adaptors';
import { CopyPasteStorage, Storage } from './models';

class CopyPaste {

	version: string = '1'; // change this number when the structure of SharedAttrs is not backwards compatible.
	storage: CopyPasteStorage = { shared: {}, core: {}};

	constructor() {
		if ( this.version === this.getSavedVersion() ) {
			this.pull();
		} else {
			this.updateVersion();
		}
	}

	copy( block: OtterBlock<unknown> ) {
		if ( ! adaptors?.[block.name]) {
			return;
		}

		const copied = pickBy( adaptors[block.name].copy( block.attributes ), x => ! ( isNil( x ) ) );

		this.storage.shared = copied?.shared;
		this.storage.core = copied?.core;
		this.storage[block.name] = copied?.private;
		this.sync();
	}

	paste( block: OtterBlock<unknown> ) {
		if ( adaptors?.[block.name]) {
			const attrs: Storage<unknown> = {
				shared: this.storage.shared,
				private: this.storage[block.name]
			};

			if ( block.name?.startsWith( 'core/' ) ) {
				attrs.core = this.storage.core;
			}

			const pasted = adaptors[block.name].paste( attrs );

			// TODO: remove after review
			console.group( `Block: ${ block.name}` );
			console.log( pasted );
			console.groupEnd();
			return pasted;
		}

		return undefined;
	}

	sync() {
		localStorage.setItem( 'o-copyPasteStorage', JSON.stringify( this.storage ) );
	}

	pull() {
		this.storage = JSON.parse( localStorage.getItem( 'o-copyPasteStorage' ) ?? '{}' ) as CopyPasteStorage;
	}

	getSavedVersion() {
		return localStorage.getItem( 'o-copyPasteStorage-version' );
	}

	updateVersion() {
		localStorage.setItem( 'o-copyPasteStorage-version', this.version );
	}
}

export default CopyPaste;
