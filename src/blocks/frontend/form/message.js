class DisplayFormMessage {

	/**
	 * The construct
	 * @param {HTMLDivElement} form The form.
	 */
	constructor( form ) {
		this.form = form;
		this.anchor = form.querySelector( '.wp-block-button' );
		this.anchor?.classList.add( 'has-submit-msg' );

		this.msgElem = document.createElement( 'div' );
		this.msgElem.classList.add( 'o-form-server-response' );
		this.anchor.appendChild( this.msgElem );

		this.isVisible = false;
		this.visibilityTimeout = undefined;
		this.visibilityDuration = 12_000; // ms
	}

	/**
	 * Toggle the visibility of the message.
	 * @param {boolean} value
	 */
	toggle( value ) {
		this.isVisible = undefined !== value ? value : ! this.isVisible;
		this.msgElem.style.display = this.isVisible ? 'block' : 'none';
	}

	/**
	 * Set the message from global themeisleGutenbergForm?.messages
	 * @param {string} msgSlug
	 * @param {'error'|'warning'|'success'} type
	 * @returns {DisplayFormMessage}
	 */
	pullMsg( msgSlug, type ) {
		return this.setMsg(
			window?.themeisleGutenbergForm?.messages[msgSlug] || 'Messages are missing!',
			type
		);
	}

	/**
	 * Set the message.
	 * @param {string} msg
	 * @param {'error'|'warning'|'success'} type
	 * @returns {DisplayFormMessage}
	 */
	setMsg( msg, type ) {
		this.msgElem.innerHTML = msg;
		this.clean();
		switch ( type ) {
		case 'error':
			this.msgElem.classList.toggle( 'o-error', true );
			break;
		case 'warning':
			this.msgElem.classList.toggle( 'o-warning', true );
			break;
		default:
			this.msgElem.classList.toggle( 'o-success', true );
		}
		return this;
	}

	/**
	 * Show the message for a limited amount of time.
	 * @param {number} durationMS
	 */
	show( durationMS ) {
		clearTimeout( this.visibilityTimeout );
		this.toggle( true );
		this.visibilityTimeout = setTimeout( () => {
			this.toggle( false );
		}, durationMS || this.visibilityDuration );
	}

	/**
	 * Clean the CSS classes.
	 */
	clean() {
		this.msgElem.classList.toggle( 'o-error', false );
		this.msgElem.classList.toggle( 'o-warning', false );
		this.msgElem.classList.toggle( 'o-success', false );
	}
}

export default DisplayFormMessage;
