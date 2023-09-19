import api from '@wordpress/api';
import { pick } from 'lodash';

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

	createSettings() {
		return ( new api.models.Settings() );
	}

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

			this.wpOptions = response;
			const optionsChanged = new Set();
			this.changes.forEach( ( change ) => {
				if ( 'field_options' === change.optionType && this.wpOptions['themeisle_blocks_form_fields_option']) {
					const fieldOptions = this.wpOptions['themeisle_blocks_form_fields_option'];

					if ( ! fieldOptions ) {
						return;
					}

					const fieldIndex = fieldOptions.findIndex( ( field ) => {

						// console.log( field.fieldOptionName, change.value.fieldOptionName );
						return field.fieldOptionName === change.value.fieldOptionName;
					});

					if ( -1 !== fieldIndex ) {
						fieldOptions[fieldIndex] = change.value;
					} else {
						fieldOptions.push( change.value );
					}

					optionsChanged.add( 'themeisle_blocks_form_fields_option' );
				}

				if ( 'form_options' === change.optionType && this.wpOptions['themeisle_blocks_form_emails']) {
					const formOptions = this.wpOptions['themeisle_blocks_form_emails'];

					if ( ! formOptions ) {
						return;
					}

					const formIndex = formOptions.findIndex( ({ form }) => form === change.value.form );

					if ( -1 !== formIndex ) {
						formOptions[formIndex] = change.value;
					} else {
						formOptions.push( change.value );
					}

					optionsChanged.add( 'themeisle_blocks_form_emails' );
				}
			});

			const dataToSave = pick( this.wpOptions, Array.from( optionsChanged ) );

			console.log( 'Data send', { data: dataToSave }); // TODO: Remove after QA

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
