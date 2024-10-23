/**
 * WordPress dependencies.
 */
import { filter } from 'lodash';

import { SnackbarList } from '@wordpress/components';

import {
	useSelect,
	useDispatch
} from '@wordpress/data';

import { store as noticesStore } from '@wordpress/notices';

const Notices = () => {
	const notices = useSelect(
		( select ) => select( noticesStore ).getNotices(),
		[]
	);

	const { removeNotice } = useDispatch( noticesStore );

	const snackbarNotices = filter( notices, {
		type: 'snackbar'
	});

	return (
		<SnackbarList
			notices={ snackbarNotices }
			className="components-editor-notices__snackbar"
			onRemove={ removeNotice }
		/>
	);
};

export default Notices;
