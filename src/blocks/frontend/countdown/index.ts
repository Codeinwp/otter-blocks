/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions';

/**
 * Simple base64 encoding. This is used to hash the url to prevent reusable blocks from accessing and changing the same data --> making them unique per page.
 * @param str The string.
 * @returns
 */
const toBase64 = ( str: string ) => {
	return window.btoa( unescape( encodeURIComponent( str ) ) );
};

// Time constants
const _MS_PER_SECONDS = 1000;
const _MS_PER_MINUTES = _MS_PER_SECONDS * 60;
const _MS_PER_HOURS = _MS_PER_MINUTES * 60;
const _MS_PER_DAY = _MS_PER_HOURS * 24;

// Local storage locations for saving information about user interaction with the page.
const LAST_TIME_VISIT_ON_SITE_RECORD_SOURCE = `o-countdown-last-visit-${ toBase64( window.location.pathname ) }-`;
const TIMER_VALUE_FROM_LAST_TIME_VISIT_ON_SITE_RECORD_SOURCE = `o-countdown-last-visit-time-${ toBase64( window.location.pathname ) }-`;
const TIMER_TIMEZONE_FROM_LAST_VISIT_ON_SITE = `o-countdown-last-visit-timezone-${ toBase64( window.location.pathname ) }-`;

type Settings = {
	exclude: string[]
	keepNeg: boolean
}

let indexGenerator: number = 0;

class CountdownData {

	currentTime: number;

	readonly id: number;
	readonly elem: HTMLDivElement;
	readonly mode?: 'timer' | 'interval';
	readonly rawData: string;
	readonly timer: string;
	readonly settings?: Settings;
	readonly deadline: number;
	readonly behavior: 'default' | 'redirectLink' | 'hide' | 'restart';
	readonly trigger?: 'showBlock' | 'hideBlock';
	readonly redirectLink?: string;
	readonly startInterval?: string;
	readonly endInterval?: string;
	readonly hideTime: number;
	readonly onEndAction?: string;

	readonly components: {
		second?: {
			label?: Element
			value?: Element
		}
		minute?: {
			label?: Element
			value?: Element
		}
		hour?: {
			label?: Element
			value?: Element
		}
		day?: {
			label?: Element
			value?: Element
		}
	};
	readonly onEndEvents: ( () => void )[];
	readonly checks: { [key: string]: boolean};

	constructor( elem: HTMLDivElement ) {
		this.id = indexGenerator++;
		this.elem = elem;

		this.elem.classList.add( 'ready' );

		const { date, bhv, mode, timer, redirectLink, intvEnd, intvStart, onEndAction } = elem.dataset;

		// Extract the data.
		this.rawData = date ?? '';
		this.behavior = bhv as 'redirectLink' | 'hide' | 'restart' | 'default' ?? 'default';
		this.mode = mode as 'timer' | 'interval' | undefined;
		this.timer = timer ?? '0';
		this.redirectLink = redirectLink;
		this.startInterval = intvStart;
		this.endInterval = intvEnd;
		this.hideTime = 0;
		this.onEndAction = onEndAction;

		/**
		 * Add checks that helps the control logic.
		 */
		this.checks = {
			'show': false // Used by Interval mode. Once the countdown is shown, we no longer need to check the display condition.
		};
		this.currentTime = Date.now();

		/**
		 * Get the references to value and label HTML for each time component.
		 */
		this.components = {};
		[ 'second', 'minute', 'hour', 'day' ].forEach(
			( componentName ) => {
				const _elem = elem.querySelector( `div[name=${ componentName }]` );
				if ( _elem ) {
					const labelElem = _elem.querySelector( '.otter-countdown__label' );
					const valueElem = _elem.querySelector( '.otter-countdown__value' );
					this.components[ componentName as 'second'| 'minute'| 'hour'| 'day'] = {
						label: labelElem ?? undefined,
						value: valueElem ?? undefined
					};
				}
			}
		);

		// Add the default End events callbacks.
		this.onEndEvents = [ () => this.activateBehavior(), () => this.activateActions() ];

		/**
		 * Modes
		 * - Evergreen: acts like a timer that reset when it is finished.
		 * - Interval: display only in the given interval.
		 * - Default: display until the given date.
		 */
		switch ( this.mode ) {
		case 'timer':

			// Record when the user was last time on this page.
			const lastVisitTimeRecord = localStorage.getItem( `${LAST_TIME_VISIT_ON_SITE_RECORD_SOURCE}-${this.elem.id}` ) ?? '0';

			// Record with the timer value.
			const timerValueRecorded = localStorage.getItem( `${TIMER_VALUE_FROM_LAST_TIME_VISIT_ON_SITE_RECORD_SOURCE}-${this.elem.id}` );

			// Record with the timezone
			const timezoneRecorded = localStorage.getItem( `${TIMER_TIMEZONE_FROM_LAST_VISIT_ON_SITE}-${this.elem.id}` ) ?? '0';

			// Set the deadline based on the last visit.
			this.deadline = parseInt( lastVisitTimeRecord! ) + parseInt( this.timer );

			/**
			 * Reset conditions:
			 * - the user is first time on the page
			 * - the timer has reach the deadline
			 * - the deadline time was changed
			 * - the timezone has changed
			 */
			if (
				! lastVisitTimeRecord ||
				( 0 > ( parseInt( lastVisitTimeRecord ) + parseInt( this.timer ) - Date.now() ) ) ||
				timerValueRecorded !== this.timer ||
				timezoneRecorded != ( new Date() ).getTimezoneOffset().toString()
			) {

				// Record the current visit and timer time. Set a new deadline.
				localStorage.setItem( `${LAST_TIME_VISIT_ON_SITE_RECORD_SOURCE}-${this.elem.id}`, Date.now().toString() );
				localStorage.setItem( `${TIMER_VALUE_FROM_LAST_TIME_VISIT_ON_SITE_RECORD_SOURCE}-${this.elem.id}`, this.timer );
				localStorage.setItem( `${TIMER_TIMEZONE_FROM_LAST_VISIT_ON_SITE}-${this.elem.id}`, ( new Date() ).getTimezoneOffset().toString() );
				this.deadline = Date.now() + parseInt( this.timer );
			}
			break;

		case 'interval':
			this.deadline = this.endInterval ? ( new Date( this.endInterval + ( window?.themeisleGutenbergCountdown?.timezone ?? '' ) ) ).getTime() : 0;
			this.hideTime = this.startInterval ? ( new Date( this.startInterval + ( window?.themeisleGutenbergCountdown?.timezone ?? '' ) ) ).getTime() : 0;
			break;

		default:
			this.deadline = this.rawData ?  ( new Date( this.rawData + ( window?.themeisleGutenbergCountdown?.timezone ?? '' ) ) ).getTime() : Date.now();
		}

		this.hideOrShow( ( this.isStopped && 'hide' === this.behavior ) || this.mustBeHidden );
	}

	/**
	 * Update the displayed time based on the given state.
	 * @param states The state
	 */
	update( states: {tag: 'second'| 'minute'| 'hour'| 'day', label: string, value: string}[]) {

		// Check if the countdown (in Interval Mode) is ready to show up.
		if ( 'interval' === this.mode && ! this.checks.show ) {
			this.hideOrShow( this.mustBeHidden );
		}

		states.forEach( state => {
			if ( this.components?.[ state.tag ]?.label && this.components[ state.tag ]?.label?.innerHTML !== state.label ) {
				this.components[ state.tag ]!.label!.innerHTML = state.label ?? '';
			}

			if ( this.components?.[ state.tag ]?.value ) {
				this.components[ state.tag ]!.value!.innerHTML = state.value;
			}
		});
	}

	/**
	 * Add a callback function that will be called the the timer is over.
	 * @param f Callback function
	 */
	onEnd( f: () => void ): void {
		this.onEndEvents.push( f );
	}

	/**
	 * Trigger all the end function and dispatch a custom event (can be used for integration by third-party).
	 */
	end() {

		// This can be used by other scripts to see when the countdown ends.
		const event = new CustomEvent(
			'o-countdown-stop',
			{
				bubbles: true,
				detail: { countdown: this }
			}
		);

		this.elem.dispatchEvent( event );
		this.onEndEvents.forEach( f => f() );
	}

	/**
	 * Activate the behavior of the countdown when it ends.
	 */
	activateBehavior() {
		switch ( this.behavior as 'default' | 'redirectLink' | 'showBlock' | 'hideBlock' | 'hide' ) {
		case 'default':
			break;
		case 'hide':
			this.hide();
			break;
		case 'redirectLink':
			if ( this.redirectLink ) {
				window.location.replace( this.redirectLink );
			}
			break;
		}
	}

	/**
	 * Activate the actions of the countdown when it ends.
	 * @returns void
	 */
	activateActions() {

		const blockSelectorId = this.connectedBlocksSelector;

		if (  ! blockSelectorId ) {
			return;
		}

		switch ( this.onEndAction ) {
		case 'all':
			document.querySelectorAll( `${blockSelectorId}.o-cntdn-bhv-hide` ).forEach(
				blockElem => ( blockElem as HTMLDivElement ).classList.add( 'o-cntdn-hide' )
			);

			document.querySelectorAll( `${blockSelectorId}.o-cntdn-bhv-show` ).forEach(
				blockElem => ( blockElem as HTMLDivElement ).classList.remove( 'o-cntdn-bhv-show' )
			);
			break;
		default:
			break;
		}


	}

	/**
	 * Hide or show up the countdown.
	 * @param isHidden The value.
	 */
	hideOrShow( isHidden: boolean ) {
		if ( isHidden ) {
			this.hide();
		} else {
			this.checks.show = true;
			this.show();
			document.querySelectorAll( `${this.connectedBlocksSelector}.o-cntdn-bhv-hide` ).forEach(
				blockElem => {
					( blockElem as HTMLDivElement ).classList.add( 'o-cntdn-ready' );
				}
			);
		}
	}

	/**
	 * Hide the countdown.
	 */
	hide() {
		this.elem.classList.add( 'o-hide' );
	}

	/**
	 * Show the countdown and mark it as ready.
	 */
	show() {
		this.elem.classList.add( 'o-cntdn-ready' );
		this.elem.classList.remove( 'o-hide' );
	}

	/**
	 * Get the blocks that are connected to the countdown End actions.
	 */
	get connectedBlocksSelector() {
		if ( this.elem.id === undefined ) {
			return null;
		}
		return `.o-countdown-trigger-on-end-${this.elem.id.split( '-' ).pop()}`;
	}

	/**
	 * Get the remaining time.
	 */
	get remainingTime(): number {
		return this.deadline - this.currentTime;
	}

	/**
	 * Check if the countdown has stopped.
	 */
	get isStopped(): boolean {
		return 0  >= this.remainingTime;
	}

	/**
	 * Check the countdown must reaming hidden - used the Interval mode.
	 */
	get mustBeHidden(): boolean {
		return this.startInterval !== undefined && 0 <= this.hideTime - this.currentTime;
	}

	/**
	 * Set the current time of the countdown.
	 */
	set time( time: number ) {
		this.currentTime = time;
	}
}

/**
 * The purpose of this class is to act like a centralized clock that update the Countdown by using the same time value.
 * Instead of having time interval for each Countdown, we use a global one, thus reducing the page lag from multiple `setInterval`.
 */
class CountdownRunner {

	countdowns: { [key: string]: CountdownData};
	timer!: ReturnType<typeof setInterval>;
	running: Set<number>;
	stopped: Set<number>;

	constructor() {
		this.countdowns = {};
		this.running = new Set<number>();
		this.stopped = new Set<number>();
	}

	/**
	 * Register a countdown.
	 * @param countdown The countdown data.
	 */
	register( countdown: CountdownData ) {
		if ( countdown ) {

			countdown.onEnd( () => {
				this.running.delete( countdown.id );
				this.stopped.add( countdown.id );
			});


			this.countdowns[countdown.id] = countdown;
			this.running.add( countdown.id );
		}
	}

	/**
	 * Start the global timer.
	 * @param interval The interval time.
	 */
	startTimer( interval: number = 300 ) {
		this.timer = setInterval( () => {
			this.update();
		}, interval );
	}

	/**
	 * Update he countdown using the current time.
	 */
	update() {
		const currentTime = Date.now();
		this.running.forEach( ( countdown ) => {
			this.updateCountdown( this.countdowns[countdown] as CountdownData, currentTime );
		});

		if ( 0 === this.running.size ) {
			this.stopTimer();
		}
	}

	/**
	 * Stop the timer.
	 */
	stopTimer() {
		clearInterval( this.timer );
	}

	/**
	 * Update the countdown based on the given time.
	 * @param countdown The countdown.
	 * @param currentTime The time that needs to be displayed,
	 */
	updateCountdown( countdown: CountdownData, currentTime: number ) {
		const { id } = countdown;
		countdown.time = currentTime;

		try {

			const { remainingTime } = countdown;

			// Compute the time components
			const days = Math.floor( remainingTime / _MS_PER_DAY );
			const hours = Math.floor( remainingTime / _MS_PER_HOURS % 24 );
			const minutes = Math.floor( remainingTime / _MS_PER_MINUTES % 60 );
			const seconds = Math.floor( remainingTime / _MS_PER_SECONDS % 60 );

			const { i18n } = window.themeisleGutenbergCountdown;

			// Bind the components with position and label
			const timeComponents = [
				{
					tag: 'day',
					label: 1 < days ? i18n.days : i18n.day,
					value: days
				},
				{
					tag: 'hour',
					label: 1 < hours ? i18n.hours : i18n.hour,
					value: hours
				},
				{
					tag: 'minute',
					label: 1 < minutes ? i18n.minutes : i18n.minute,
					value: minutes
				},
				{
					tag: 'second',
					label: 1 < seconds ? i18n.seconds : i18n.second,
					value: seconds
				}
			]
				.filter( ({ tag }) => ! countdown.settings?.exclude?.includes( tag ) )
				.map( obj => {
					return {
						...obj,
						value: ! countdown.settings?.keepNeg ? ( Math.max( 0, obj.value ) ).toString() : obj.value.toString()
					};
				}) as {tag: 'second'| 'minute'| 'hour'| 'day', label: string, value: string}[];

			countdown.update( timeComponents );

			if ( countdown.isStopped ) {
				countdown.end();
			}
		} catch ( error ) {

			/**
			 * If if we have problem with a countdown, we eliminate it from the flow.
			 */
			console.error( error );
			this.running.delete( id );
		}
	}
}

domReady( () => {
	const countdowns = document.querySelectorAll( '.wp-block-themeisle-blocks-countdown' );

	const runner = new CountdownRunner();

	countdowns.forEach( countdown => {
		const c = new CountdownData( countdown as HTMLDivElement );
		runner.register( c );
	});

	runner.update();

	runner.startTimer();
});
