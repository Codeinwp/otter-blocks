/**
 * WordPress dependencies.
 */
import api from '@wordpress/api';

import { __ } from '@wordpress/i18n';

import {
	dispatch,
	useSelect
} from '@wordpress/data';

import { useState } from '@wordpress/element';

/**
 * useSettings Hook, modifed for Otter usage.
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
 * @returns {[(optionName: string) => any, (option: string, value: any, success?: string, noticeId?: string, onSuccess: Function) => void, 'loading' | 'loaded' | 'error' | 'saving']} [ getOption, updateOption, status ]
 *
 */
const useSettings = () => {
	const { createNotice } = dispatch( 'core/notices' );

	const [ status, setStatus ] = useState( 'loading' );
	const [ settings, setSettings ] = useState({});

	useSelect( select => {
		const { getEntityRecord } = select( 'core' );

		// Bail out if settings are already loaded.
		if ( Object.keys( settings ).length ) {
			return;
		}

		const request = getEntityRecord( 'root', 'site' );

		if ( request ) {
			setStatus( 'loaded' );
			setSettings( request );
		}
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
	 * @param {string?} noticeId Notice ID.
	 * @param {function?} onSuccess Callback function to be executed on success.
	 * @param {function?} onError Callback function to be executed on error.
	 */
	const updateOption = ( option, value, success = __( 'Settings saved.', 'otter-blocks' ), noticeId = undefined, onSuccess = () => {}, onError = () => {}) => {
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
						type: 'snackbar',
						id: noticeId
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
						type: 'snackbar',
						id: noticeId
					}
				);
			}

			setSettings( response );
			onSuccess?.( response );
		});

		save.error( ( response ) => {
			setStatus( 'error' );

			createNotice(
				'error',
				response?.responseJSON?.message ?? __( 'An unknown error occurred.', 'otter-blocks' ),
				{
					isDismissible: true,
					type: 'snackbar',
					id: noticeId
				}
			);

			onError?.( response );
		});
	};

	return [ getOption, updateOption, status ];
};

export default useSettings;
