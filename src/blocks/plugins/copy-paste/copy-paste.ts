import { isNil, pickBy } from 'lodash';
import { OtterBlock } from '../../helpers/blocks';
import { adaptors, implementedAdaptors } from './adaptors';
import { CopyPasteStorage } from './models';

class CopyPaste {

	storage: CopyPasteStorage;

	constructor() {
		this.pull();
	}

	copy( block: OtterBlock<unknown> ) {
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


}

export default CopyPaste;
