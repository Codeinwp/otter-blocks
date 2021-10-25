const attributes = {
	id: {
		type: 'string'
	},
	location: {
		type: 'string',
		default: 'La Sagrada Familia, Barcelona, Spain'
	},
	latitude: {
		type: 'string',
		default: '41.4034789'
	},
	longitude: {
		type: 'string',
		default: '2.174410333009705'
	},
	bbox: {
		type: 'string',
		default: '2.1207046508789067%2C41.34807736149302%2C2.2288513183593754%2C41.45816618938139'
	},
	zoom: {
		type: 'number',
		default: 13
	},
	height: {
		type: 'number',
		default: 400
	},
	markers: {
		type: 'array',
		default: []
	},
	zoomControl: {
		type: 'boolean',
		default: true
	},
	draggable: {
		type: 'boolean',
		default: true
	}
};

export default attributes;
