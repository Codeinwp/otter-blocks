import { isEmpty, omitBy } from 'lodash';

/**
 * Remove undefined values from the object. Make the value undefined is the object is empty.
 *
 * @param {Object} object
 * @returns {Object}
 */
export const objectCleaner = ( object: Object ) => {
	const filtered = omitBy( object, ( x: any ) => x === undefined || null === x || '' === x );
	return isEmpty( filtered ) ? undefined : filtered;
};
