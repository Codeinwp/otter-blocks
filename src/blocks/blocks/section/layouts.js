const layouts = {
	1: {
		equal: [ '100' ]
	},
	2: {
		equal: [ '50', '50' ],
		oneTwo: [ '33.34', '66.66' ],
		twoOne: [ '66.66', '33.34' ],
		collapsedRows: [ '100', '100' ]
	},
	3: {
		equal: [ '33.33', '33.33', '33.33' ],
		oneOneTwo: [ '25', '25', '50' ],
		twoOneOne: [ '50', '25', '25' ],
		oneTwoOne: [ '25', '50', '25' ],
		oneThreeOne: [ '20', '60', '20' ],
		collapsedRows: [ '100', '100', '100' ]
	},
	4: {
		equal: [ '25', '25', '25', '25' ],
		twoColumnGrid: [ '100', '100', '100', '100' ],
		collapsedRows: [ '100', '100', '100', '100' ]
	},
	5: {
		equal: [ '20', '20', '20', '20', '20' ],
		collapsedRows: [ '100', '100', '100', '100', '100' ]
	},
	6: {
		equal: [ '16.66', '16.66', '16.66', '16.66', '16.66', '16.66' ],
		twoColumnGrid: [ '100', '100', '100', '100', '100', '100' ],
		threeColumnGrid: [ '100', '100', '100', '100', '100', '100' ],
		collapsedRows: [ '100', '100', '100', '100', '100', '100' ]
	}
};

export default layouts;
