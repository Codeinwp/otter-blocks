import { CountdownTimer } from './types';
import { __ } from '@wordpress/i18n';

const _MS_PER_SECONDS = 1000;
const _MS_PER_MINUTES = _MS_PER_SECONDS * 60;
const _MS_PER_HOURS = _MS_PER_MINUTES * 60;
const _MS_PER_DAY = _MS_PER_HOURS * 24;

/**
 *
 */
export const toTimer = ( timer: CountdownTimer ): number => {
	console.log( timer );
	return ( parseInt( timer?.days || '0' ) * _MS_PER_DAY + parseInt( timer?.hours || '0' ) * _MS_PER_HOURS + parseInt( timer?.minutes || '0' ) * _MS_PER_MINUTES + parseInt( timer?.seconds || '0' ) * _MS_PER_SECONDS ) ?? 0;
};

/**
 * Get the time interval from the unix time
 *
 * @param unixTime Time as UNIX
 * @param settings Options to keep a components or/and allow negative time
 * @returns An object with the values for days, hours, minutes, seconds
 */
export const getIntervalFromUnix = ( unixTime: number, settings: { exclude?: string[], keepNeg?: boolean }) => {
	console.log( unixTime );
	unixTime ??= 0; // Check for null/undefined

	const days = Math.floor( unixTime / _MS_PER_DAY );
	const hours = Math.floor( unixTime / _MS_PER_HOURS % 24 );
	const minutes = Math.floor( unixTime / _MS_PER_MINUTES % 60 );
	const seconds = Math.floor( unixTime / _MS_PER_SECONDS % 60 );

	const time = [
		{
			tag: 'day',
			name: 1 < days ? __( 'Days', 'otter-blocks' ) : __( 'Day', 'otter-blocks' ),
			value: days
		},
		{
			tag: 'hour',
			name: 1 < hours ? __( 'Hours', 'otter-blocks' ) : __( 'Hour', 'otter-blocks' ),
			value: hours
		},
		{
			tag: 'minute',
			name: 1 < minutes ? __( 'Minutes', 'otter-blocks' ) : __( 'Minute', 'otter-blocks' ),
			value: minutes
		},
		{
			tag: 'second',
			name: 1 < seconds ? __( 'Seconds', 'otter-blocks' ) : __( 'Second', 'otter-blocks' ),
			value: seconds
		}
	]
		.filter( ({ tag }) => ! settings?.exclude?.includes( tag ) )
		.map( obj => {
			if ( ! settings?.keepNeg ) {
				obj.value = Math.max( 0, obj.value );
			}
			return obj;
		});

	return time;
};

export const timerSerialization = ( timer: CountdownTimer ) => {
	return toTimer( timer ).toString();
};


