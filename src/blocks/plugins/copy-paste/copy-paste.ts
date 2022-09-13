import { isNil, pickBy } from 'lodash';
import { OtterBlock } from '../../helpers/blocks';
import { adaptors, implementedAdaptors } from './adaptors';
import { CopyPasteStorage } from './models';

class CopyPaste {

	version: '2'; // change this number when the structure of SharedAttrs is not backwards compatible.
	storage: CopyPasteStorage = { shared: {}};

	constructor() {
		if ( this.version === this.getSavedVersion() ) {
			this.pull();
		} else {
			this.updateVersion();
		}
	}

	copy( block: OtterBlock<unknown> ) {
		console.log( block );
		const adaptor = implementedAdaptors.find( a => a === block.name );
		if ( adaptor ) {
			const copied = pickBy( adaptors[adaptor].copy( block.attributes ), x => ! ( isNil( x ) ) );

			this.storage.shared = copied?.shared;
			this.storage[block.name] = copied?.private;
			this.sync();
		}
	}

	paste( block: OtterBlock<unknown> ) {
		const adaptor = implementedAdaptors.find( a => a === block.name );
		if ( adaptor ) {
			const pasted = adaptors[adaptor].paste({
				shared: this.storage.shared,
				private: this.storage[block.name]
			});

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
