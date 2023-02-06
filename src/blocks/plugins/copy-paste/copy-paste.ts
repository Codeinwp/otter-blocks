import { isNil, pickBy } from 'lodash';
import { OtterBlock } from '../../helpers/blocks';
import { compactObject } from '../../helpers/helper-functions';
import { adaptors } from './adaptors';
import { CopyPasteStorage, Storage } from './models';
import { copyAnimations, pasteAnimations } from './plugins';


type Adaptors = Record<string, {
	copy: ( x: any ) => Storage<any>
	paste: ( s: Storage<any> ) => any
}>

class CopyPaste {

	version: string = '1'; // change this number when the structure of SharedAttrs is not backwards compatible.
	storage: CopyPasteStorage = { shared: {}, core: {}, private: {}, copiedBlock: '' };
	isExpired: boolean = false;

	constructor() {
		if ( this.version !== this.getSavedVersion() ) {
			this.updateVersion();
			return;
		}

		this.checkExpirationDate();
		if ( this.isExpired ) {
			this.updateExpirationDate();
			return;
		}

		this.pull();
	}

	copy( block: OtterBlock<unknown> ): 'SUCCESS' | 'NO-ADAPTOR' | 'ERROR' {
		let success: 'SUCCESS' | 'NO-ADAPTOR' | 'ERROR'  = 'ERROR';
		try {
			if ( ! ( adaptors as Adaptors )?.[block.name]) {
				return 'NO-ADAPTOR';
			}

			const copied = compactObject( pickBy( ( adaptors as Adaptors )?.[block.name]?.copy( block.attributes ), x => ! ( isNil( x ) ) ) ) as Storage<unknown>;

			this.storage.copiedBlock = block.name;
			this.storage.shared = copied?.shared;
			this.storage.core = copied?.core;
			this.storage.private = copied?.private;
			this.storage.animations = copyAnimations( block?.attributes?.className );
			this.sync();

			success = 'SUCCESS';
		} catch ( e ) {
			console.error( e );
			this.storage = {};
			this.sync();
		} finally {
			return success;
		}
	}

	paste( block: OtterBlock<unknown> ) {
		let pasted = undefined;
		try {
			if ( ! ( adaptors as Adaptors )?.[block.name]) {
				return undefined;
			}

			const attrs: Storage<unknown> = {
				shared: this.storage.shared,
				private: block.name === this.storage.copiedBlock ? this.storage.private : undefined,
				core: block.name?.startsWith( 'core/' ) ? this.storage.core : undefined
			};

			pasted = ( adaptors as Adaptors )?.[block.name]?.paste( attrs );
			pasted.className = pasteAnimations( block.attributes?.className, this.storage.animations );

			if ( block.name !== this.storage.copiedBlock ) {

				/**
				 * If the blocks are not the same type, copy only the defined values. This will prevent some unwanted override.
				 */
				pasted = compactObject( pasted );
			}

		} catch ( e ) {
			console.error( e );
		} finally {
			return pasted;
		}
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

	updateExpirationDate() {
		localStorage.setItem( 'o-copyPasteStorage-expiration', Date.now().toString() );
		this.isExpired = false;
	}

	checkExpirationDate() {
		const e = localStorage.getItem( 'o-copyPasteStorage-expiration' );
		this.isExpired = Boolean( isNil( e ) || ( e !== undefined && parseInt( e ) + 8 * 60 * 60 * 1000 < Date.now() ) );
	}
}

export default CopyPaste;
