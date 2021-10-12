/**
 * Internal dependencies
 */
import attributes from './attributes.js';

const deprecated = [ {
	attributes: {
		...attributes,
		categories: {
			type: 'string'
		}
	},

	supports: {
		align: [ 'wide', 'full' ],
		html: false
	},

	migrate: oldAttributes => {
		return {
			...oldAttributes,
			categories: [ { id: Number( oldAttributes.categories ) } ]
		};
	},

	isEligible: ({ categories }) => categories && 'string' === typeof categories,

	save: () => null
} ];

export default deprecated;
