/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions';


// Time constants
const _MS_PER_SECONDS = 1000;
const _MS_PER_MINUTES = _MS_PER_SECONDS * 60;
const _MS_PER_HOURS = _MS_PER_MINUTES * 60;
const _MS_PER_DAY = _MS_PER_HOURS * 24;

const COUNTDOWN_RESET = _MS_PER_DAY * 30;

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
	readonly targetDate: number;
	readonly behaviour: 'default' | 'redirectLink' | 'hide' | 'restart';
	readonly trigger?: 'showBlock' | 'hideBlock';
	readonly redirectLink?: string;
	readonly startInterval?: string;
	readonly endInterval?: string;
	readonly hideTime: number;

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
	readonly oneTimeRun: { [key: string]: boolean};

	constructor( elem: HTMLDivElement ) {
		this.id = indexGenerator++;
		this.elem = elem;

		this.elem.classList.add( 'ready' );

		const { date, bhv, mode, timer, redirectLink, intvEnd, intvStart } = elem.dataset;

		this.rawData = date ?? '';
		this.behaviour = bhv as 'redirectLink' | 'hide' | 'restart' | 'default' ?? 'default';

		this.mode = mode as 'timer' | 'interval' | undefined;
		this.timer = timer ?? '0';

		this.redirectLink = redirectLink;
		this.startInterval = intvStart;
		this.endInterval = intvEnd;
		this.hideTime = 0;

		this.oneTimeRun = {
			'hideOrShow': false
		};
		this.currentTime = Date.now();

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

		this.onEndEvents = [ () => this.activateBehaviour(), () => this.activateTriggers() ];

		switch ( this.mode ) {
		case 'timer':
			const lastVisit = localStorage.getItem( `o-countdown-last-visit-${this.elem.id}` );
			const lastVisitTime = localStorage.getItem( `o-countdown-last-visit-time-${this.elem.id}` );

			if (
				! lastVisit ||
				( ( parseInt( lastVisit ) + parseInt( this.timer ) - Date.now() ) > COUNTDOWN_RESET ) ||
				lastVisitTime !== this.timer
			) {
				localStorage.setItem( `o-countdown-last-visit-${this.elem.id}`, Date.now().toString() );
				localStorage.setItem( `o-countdown-last-visit-time-${this.elem.id}`, this.timer );
			}

			this.targetDate = parseInt( localStorage.getItem( `o-countdown-last-visit-${this.elem.id}` )! ) + parseInt( this.timer );

			if ( this.canRestart ) {
				localStorage.setItem( `o-countdown-last-visit-${this.elem.id}`, Date.now().toString() );
				this.targetDate = parseInt( localStorage.getItem( `o-countdown-last-visit-${this.elem.id}` )! ) + parseInt( this.timer );
			}

			break;

		case 'interval':
			this.targetDate = this.endInterval ? ( new Date( this.endInterval + ( window?.themeisleGutenbergCountdown?.timezone ?? '' ) ) ).getTime() : 0;
			this.hideTime = this.startInterval ? ( new Date( this.startInterval + ( window?.themeisleGutenbergCountdown?.timezone ?? '' ) ) ).getTime() : 0;
			break;

		default:
			this.targetDate = this.rawData ?  ( new Date( this.rawData + ( window?.themeisleGutenbergCountdown?.timezone ?? '' ) ) ).getTime() : Date.now();
		}

		this.hideOrShow( ( this.isStopped && 'hide' === this.behaviour ) || this.mustBeHidden );
	}

	update( states: {tag: 'second'| 'minute'| 'hour'| 'day', label: string, value: string}[]) {
		if ( 'interval' === this.mode && ! this.oneTimeRun.hideOrShow ) {
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

	onEnd( f: () => void ): void {
		this.onEndEvents.push( f );
	}

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

	activateBehaviour() {
		switch ( this.behaviour as 'default' | 'redirectLink' | 'showBlock' | 'hideBlock' | 'hide' ) {
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

	activateTriggers() {
		const blockSelectorId = this.connectedBlocksSelector;

		if (  ! blockSelectorId ) {
			return;
		}

		document.querySelectorAll( `${blockSelectorId}.o-cntdn-bhv-hide` ).forEach(
			blockElem => ( blockElem as HTMLDivElement ).classList.add( 'o-cntdn-hide' )
		);

		document.querySelectorAll( `${blockSelectorId}.o-cntdn-bhv-show` ).forEach(
			blockElem => ( blockElem as HTMLDivElement ).classList.remove( 'o-cntdn-bhv-show' )
		);

	}

	hideOrShow( isHidden: boolean ) {
		if ( isHidden ) {
			this.hide();
		} else {
			this.oneTimeRun.hideOrShow = true;
			this.show();
			document.querySelectorAll( `${this.connectedBlocksSelector}.o-cntdn-bhv-hide` ).forEach(
				blockElem => {
					( blockElem as HTMLDivElement ).classList.add( 'o-cntdn-ready' );
				}
			);
		}
	}

	hide() {
		this.elem.classList.add( 'o-hide' );
	}

	show() {
		this.elem.classList.add( 'o-cntdn-ready' );
		this.elem.classList.remove( 'o-hide' );
	}

	get connectedBlocksSelector() {
		if ( this.elem.id === undefined ) {
			return null;
		}
		return `.o-countdown-trigger-on-end-${this.elem.id.split( '-' ).pop()}`;
	}

	get remainingTime(): number {
		return this.targetDate - this.currentTime;
	}

	get isStopped(): boolean {
		return 0  >= this.remainingTime;
	}

	get mustBeHidden(): boolean {
		return this.startInterval !== undefined && 0 <= this.hideTime - this.currentTime;
	}

	get canRestart(): boolean {
		return 'restart' === this.behaviour && 'timer' === this.mode && this.isStopped;
	}

	set time( time: number ) {
		this.currentTime = time;
	}
}

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

	register( countdown: CountdownData ) {
		if ( countdown ) {

			countdown.onEnd( () => {
				this.running.delete( countdown.id );
				this.stopped.add( countdown.id );
			});


			this.countdowns[countdown.id] = countdown;
			this.running.add( countdown.id );

			console.log( countdown );
		}
	}

	startTimer( interval: number = 300 ) {
		this.timer = setInterval( () => {
			const currentTime = Date.now();
			this.running.forEach( ( countdown ) => {
				this.updateCountdown( this.countdowns[countdown] as CountdownData, currentTime );
			});

			if ( 0 === this.running.size ) {
				this.stopTimer();
			}
		}, interval );
	}

	stopTimer() {
		clearInterval( this.timer );
	}

	updateCountdown( countdown: CountdownData, currentTime: number ) {
		const { id } = countdown;
		countdown.time = currentTime;

		try {

			const { remainingTime } = countdown;

			const days = Math.floor( remainingTime / _MS_PER_DAY );
			const hours = Math.floor( remainingTime / _MS_PER_HOURS % 24 );
			const minutes = Math.floor( remainingTime / _MS_PER_MINUTES % 60 );
			const seconds = Math.floor( remainingTime / _MS_PER_SECONDS % 60 );

			const { i18n } = window.themeisleGutenbergCountdown;

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

	runner.startTimer();
});
