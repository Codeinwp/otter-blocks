import api from '@wordpress/api';
import { isFunction, isObject, isObjectLike, pick } from 'lodash';

class DeferredWpOptionsSave {
	constructor() {

		/**
		 * We will create a global variable to store the instance of this class.
		 * This will prevent multiple instances of this class to be created.
         */
		if ( window?.deferredWpOptionsSave ) {
			return window?.deferredWpOptionsSave;
		}

		this.changes = [];
		this.wpOptions = {};
		this.timeout = null;
		this.timeoutTime = 1500;
		this.abort = null;

		window.deferredWpOptionsSave = this;

		return this;
	}

	/**
	 * Create a new instance of the Settings model that can fetch the WP Options.
	 * @returns {api.models.Settings}
	 */
	createSettings() {
		return ( new api.models.Settings() );
	}

	/**
	 * Save the option to the server.
	 * @param {string} optionType - The option type to save. Internal identifier.
	 * @param {string|number|array|object|((currentValue: any) => any)} value - The value to save. It can be a function that receives the current value and returns the new value. If it does not exists, it will receive null.
	 * @param {(options: Object, error: any|null) => void} callback - The callback to call after the save is done. It will receive the response from the server and the error if any.
	 */
	save( optionType, value, callback = () => {}) {
		this.changes.push({ optionType, value, callback });

		if ( this.timeout ) {

			this.abort?.abort?.();
			clearTimeout( this.timeout );
		}

		this.timeout = setTimeout( () => {
			this.commitChanges();
		}, this.timeoutTime );
	}

	commitChanges() {
		this.abort = new AbortController();
		this.createSettings().fetch({
			signal: this.abort.signal
		}).done( ( response ) => {

			// Get the WP options.
			this.wpOptions = response;

			/**
			 * We will store the options that changed in a Set.
			 * @type {Set<string>}
			 */
			const optionsChanged = new Set();

			/**
			 * Apply the changes to the options.
			 */
			this.changes.forEach( ( change ) => {
				const payload = isFunction( change.value ) ? change.value( null ) : change.value;

				/**
				 * Options related to individual fields.
				 */
				if ( 'field_options' === change.optionType && this.wpOptions['themeisle_blocks_form_fields_option']) {
					const fieldOptions = this.wpOptions['themeisle_blocks_form_fields_option'];

					if ( ! fieldOptions ) {
						return;
					}

					const fieldIndex = fieldOptions.findIndex( ( field ) => {

						// console.log( field.fieldOptionName, change.value.fieldOptionName );
						return field.fieldOptionName === payload.fieldOptionName;
					});

					if ( -1 !== fieldIndex ) {
						fieldOptions[fieldIndex] = isFunction( change.value ) ? change.value( fieldOptions[fieldIndex]) : payload;
					} else {
						fieldOptions.push( payload );
					}

					optionsChanged.add( 'themeisle_blocks_form_fields_option' );
				}

				/**
				 * Options related to the form.
				 */
				if ( 'form_options' === change.optionType && this.wpOptions['themeisle_blocks_form_emails']) {
					const formOptions = this.wpOptions['themeisle_blocks_form_emails'];

					if ( ! formOptions ) {
						return;
					}

					const formIndex = formOptions.findIndex( ({ form }) => form === payload.form );

					if ( -1 !== formIndex ) {
						formOptions[formIndex] = isFunction( change.value ) ? change.value( formOptions[formIndex]) : payload;
					} else {
						formOptions.push( payload );
					}

					optionsChanged.add( 'themeisle_blocks_form_emails' );
				}
			});

			// Pick only the options that changed.
			const dataToSave = pick( this.wpOptions, Array.from( optionsChanged ) );

			// Save the options.
			( new api.models.Settings( dataToSave ) )
				.save( )
				.then( ( response ) => {
					this.wpOptions = response;
					this.changes.forEach( ( change ) => {
						change?.callback?.( response, null );
					});
					this.changes = [];
				})
				.catch( ( error ) => {
					this.changes.forEach( ( change ) => {
						change?.callback?.( this.wpOptions, error );
					});
					this.changes = [];
				});
		});
	}
}

export default DeferredWpOptionsSave;
