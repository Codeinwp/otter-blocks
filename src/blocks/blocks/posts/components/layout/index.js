/**
 * Internal dependencies
 */
import Grid from './grid.js';
import List from './list.js';

const Layout = ({
	attributes,
	posts,
	categoriesList,
	authors
}) => {
	if ( 'grid' === attributes.style ) {
		return (
			<Grid
				attributes={ attributes }
				posts={ posts }
				categoriesList={ categoriesList }
				authors={ authors }
			/>
		);
	}

	if ( 'list' === attributes.style ) {
		return (
			<List
				attributes={ attributes }
				posts={ posts }
				categoriesList={ categoriesList }
				authors={ authors }
			/>
		);
	}
};

export default Layout;
