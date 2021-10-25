const attributes = {
	id: {
		type: 'string'
	},
	style: {
		type: 'string',
		default: 'standard'
	},
	location: {
		type: 'string',
		default: 'La Sagrada Familia, Barcelona, Spain'
	},
	latitude: {
		type: 'string'
	},
	longitude: {
		type: 'string'
	},
	type: {
		type: 'string',
		default: 'roadmap'
	},
	zoom: {
		type: 'number',
		default: 15
	},
	height: {
		type: 'number',
		default: 400
	},
	draggable: {
		type: 'boolean',
		default: true
	},
	mapTypeControl: {
		type: 'boolean',
		default: true
	},
	zoomControl: {
		type: 'boolean',
		default: true
	},
	fullscreenControl: {
		type: 'boolean',
		default: true
	},
	streetViewControl: {
		type: 'boolean',
		default: true
	},
	markers: {
		type: 'array',
		default: []
	}
};

export default attributes;
