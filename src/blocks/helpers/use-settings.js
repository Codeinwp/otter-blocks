/**
 * WordPress dependencies.
 */
import api from '@wordpress/api';

import { __ } from '@wordpress/i18n';

import { dispatch } from '@wordpress/data';

import {
	useEffect,
	useState
} from '@wordpress/element';

/**
 * useSettings Hook.
 *
 * useSettings hook to get/update WordPress' settings database.
 *
 * Setting field needs to be registered to REST for this function to work.
 *
 * This hook works similar to get_option and update_option in PHP just without the option for a default value.
 * For notificiations to work, you need to add a Snackbar section to your React codebase if it isn't being
 * used inside the block editor.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/editor/src/components/editor-snackbars/index.js
 * @author  Hardeep Asrani <hardeepasrani@gmail.com>
 * @version 1.1
 * @returns {[(optionName: string) => any, (option: string, value: any, success?: string, onSuccess: Function) => void, 'loading' | 'loaded' | 'error' | 'saving']} [ getOption, updateOption, status ]
 *
 */
const useSettings = () => {
	const { createNotice } = dispatch( 'core/notices' );

	const [ settings, setSettings ] = useState({});
	const [ status, setStatus ] = useState( 'loading' );

	const getSettings = () => {
		api.loadPromise.then( async() => {
			try {
				const settings = new api.models.Settings();
				const response = await settings.fetch();
				setSettings( response );
			} catch ( error ) {
				setStatus( 'error' );
			} finally {
				setStatus( 'loaded' );
			}
		});
	};

	useEffect( () => {
		getSettings();
	}, []);

	/**
	 * Get the value of the given option.
	 *
	 * @param {string} option Option name.
	 * @returns {any} Option value.
	 */
	const getOption = option => {
		return settings?.[option];
	};

	/**
	 * Set the value of the given option. Also set the message to be displayed on success Notice.
	 *
	 * @param {string} option Option name.
	 * @param {any} value Option value.
	 * @param {string?} success Success message for Notice.
	 * @param {function?} onSuccess Callback function to be executed on success.
	 */
	const updateOption = ( option, value, success = __( 'Settings saved.', 'otter-blocks' ), onSuccess = () => {}) => {
		setStatus( 'saving' );

		const save = new api.models.Settings({ [option]: value }).save();

		save.success( ( response, status ) => {
			if ( 'success' === status ) {
				setStatus( 'loaded' );

				createNotice(
					'success',
					success,
					{
						isDismissible: true,
						type: 'snackbar'
					}
				);
			}

			if ( 'error' === status ) {
				setStatus( 'error' );

				createNotice(
					'error',
					__( 'An unknown error occurred.', 'otter-blocks' ),
					{
						isDismissible: true,
						type: 'snackbar'
					}
				);
			}
			onSuccess?.();
			getSettings();
		});

		save.error( ( response ) => {
			setStatus( 'error' );

			createNotice(
				'error',
				response.responseJSON.message ? response.responseJSON.message : __( 'An unknown error occurred.', 'otter-blocks' ),
				{
					isDismissible: true,
					type: 'snackbar'
				}
			);
		});
	};

	return [ getOption, updateOption, status ];
};

export default useSettings;
