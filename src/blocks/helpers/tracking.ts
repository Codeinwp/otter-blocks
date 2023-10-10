import hash from 'object-hash';

import { __ } from '@wordpress/i18n';

import { OtterBlock } from './blocks';
import { getChoice } from './helper-functions';

const TRACKING_URL = 'http://localhost:3000/track';
const TRACKING_BULK_URL = 'http://localhost:3000/bulk-tracking';

type TrackingData = {
    block?: string,
    env?: string,
    action?: 'block-created' | 'block-updated' | 'block-deleted',
    attributeName?: string,

    feature?: string,
	featureComponent?: string,
	featureValue?: string,

    userPrompt?: string,
    hasOpenAIKey?: boolean,
}

export type TrackingPayload = {
    slug: 'otter',
    site: string,
    license: string,
    data: TrackingData,
    createdAt: string,
}

function sendTracking( payload: TrackingPayload ) {
	return fetch( TRACKING_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify( payload )
	});
};

function sendBulkTracking( payload: TrackingPayload[]) {
	return fetch( TRACKING_BULK_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify( payload )
	});
}

/**
 * Add common metadata to the tracking data. Metadata includes the environment, etc. It does not overwrite the given data.
 *
 * @param data - Tracking data to be sent.
 * @returns - Tracking data with the common metadata.
 */
export function trkMetadata( data: TrackingData ) {
	return {
		env: getChoice([
			[ window.location.href.includes( 'customize.php' ), 'customizer' ],
			[ window.location.href.includes( 'site-editor.php' ), 'site-editor' ],
			[ window.location.href.includes( 'widgets.php' ), 'widgets' ],
			[ 'post-editor' ]
		]),
		...( data ?? {})
	};
}

type EventResponse = {
	error?: string,
	success?: boolean,
	response?: any,
}

type EventOptions = {

	/**
	 * If true, the data will be saved without any modification from the accumulator. Check the `trkMetadata` function for more details.
	 */
	directSave?: boolean,

	/**
	 * Bypass the consent check. Use this for data that does not need consent.
	 */
	consent?: boolean,
}

export class EventTrackingAccumulator {
	private events: Map<string, TrackingData> = new Map();
	private eventsLimit = 3;
	private listeners: ( ( result: EventResponse ) => void )[] = [];
	private interval: number | null = null;

	constructor() {

		// When tab is closed, send all events.
		window.addEventListener( 'beforeunload', () => {
			this.sendAll();
		});
	}

	/**
	 * Set tracking data to the accumulator. If the key already exists, it will overwrite the existing data.
	 *
	 * @param key - The key to store the data under. With the same key, the data will be overwritten.
	 * @param data - Tracking data to be sent.
	 * @param options - Options to be passed to the accumulator.
	 */
	set( key: string, data: TrackingData, options?: EventOptions ) {
		const enhancedData = options?.directSave ? data : trkMetadata( data );
		if ( options?.consent || this.hasConsent() ) {
			this.events.set( key, enhancedData );
		}
		console.log( 'Added tracking event', enhancedData );
		this.sendIfLimitReached();
	}

	/**
	 * Add tracking data to the accumulator. If the hash of the data already exists, it will overwrite the existing data.
	 *
	 * @param data - Tracking data to be sent.
	 * @param options - Options to be passed to the accumulator.
	 * @returns - Hash of the data.
	 */
	add( data: TrackingData, options?: EventOptions ) {
		const h = hash( data );
		this.set( h, data, options );
		return h;
	}

	/**
	 * Send all the events in the accumulator. Clears the accumulator after sending. All the listeners will be notified.
	 */
	async sendAll() {
		const events = Array.from( this.events.values() );
		this.events.clear();
		const response = await sendBulkTracking( events.map( event => ({
			slug: 'otter',
			site: window.location.href,
			license: '32klhuioqbiuehri23',
			data: event,
			createdAt: new Date().toISOString()
		}) ) );

		if ( ! response.ok ) {
			this.listeners.forEach( listener => listener({ success: false, error: __( 'Failed to send tracking events' ) }) );
		}

		const body = await response.json();
		this.listeners.forEach( listener => listener({ success: true, response: body }) );
	}

	/**
	 * Automatically send all the events if the limit is reached.
	 * @returns - Promise that resolves when all the events are sent.
	 */
	sendIfLimitReached() {
		if ( this.events.size >= this.eventsLimit ) {
			return this.sendAll();
		}
	}

	/**
	 * Subscribe to the event when the events are sent.
	 *
	 * @param callback - Callback to be called when the events are sent.
	 * @returns - Function to unsubscribe from the event.
	 */
	subscribe( callback: () => void ) {
		this.listeners.push( callback );
		return () => {
			this.listeners = this.listeners.filter( listener => listener !== callback );
		};
	}

	/**
	 * Check if the user has given consent to send the events.
	 *
	 * @returns - True if the user has given consent to send the events.
	 */
	hasConsent() {

		// TODO: Add the real consent check.
		return true;
	}

	/**
	 * Start the interval to send the events automatically.
	 */
	start() {
		if ( this.interval ) {
			return;
		}

		this.interval = window.setInterval( () => {
			this.sendAll();
		}, 5 * 60 * 1000 ); // 5 minutes
	}

	/**
	 * Stop the interval to send the events automatically.
	 */
	stop() {
		if ( this.interval ) {
			window.clearInterval( this.interval );
			this.interval = null;
		}
	}

	/**
	 * Refresh the interval to send the events automatically.
	 */
	refreshTimer() {
		this.stop();
		this.start();
	}
}

window.oTrk = new EventTrackingAccumulator();
window.oTrk.start();

export default EventTrackingAccumulator;
