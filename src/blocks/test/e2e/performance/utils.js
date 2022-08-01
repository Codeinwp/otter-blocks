/**
 * External dependencies
 */
import { existsSync, readFileSync, unlinkSync } from 'fs';

export function readFile( filePath ) {
	return existsSync( filePath ) ?
		readFileSync( filePath, 'utf8' ).trim() :
		'';
}

export function deleteFile( filePath ) {
	if ( existsSync( filePath ) ) {
		unlinkSync( filePath );
	}
}

function isEvent( item ) {
	return (
		'devtools.timeline' === item.cat &&
         'EventDispatch' === item.name &&
         item.dur &&
         item.args &&
         item.args.data
	);
}

function isKeyDownEvent( item ) {
	return isEvent( item ) && 'keydown' === item.args.data.type;
}

function isKeyPressEvent( item ) {
	return isEvent( item ) && 'keypress' === item.args.data.type;
}

function isKeyUpEvent( item ) {
	return isEvent( item ) && 'keyup' === item.args.data.type;
}

function isFocusEvent( item ) {
	return isEvent( item ) && 'focus' === item.args.data.type;
}

function isClickEvent( item ) {
	return isEvent( item ) && 'click' === item.args.data.type;
}

function isMouseOverEvent( item ) {
	return isEvent( item ) && 'mouseover' === item.args.data.type;
}

function isMouseOutEvent( item ) {
	return isEvent( item ) && 'mouseout' === item.args.data.type;
}

function getEventDurationsForType( trace, filterFunction ) {
	return trace.traceEvents
		.filter( filterFunction )
		.map( ( item ) => item.dur / 1000 );
}

export function getTypingEventDurations( trace ) {
	return [
		getEventDurationsForType( trace, isKeyDownEvent ),
		getEventDurationsForType( trace, isKeyPressEvent ),
		getEventDurationsForType( trace, isKeyUpEvent )
	];
}

export function getSelectionEventDurations( trace ) {
	return [ getEventDurationsForType( trace, isFocusEvent ) ];
}

export function getClickEventDurations( trace ) {
	return [ getEventDurationsForType( trace, isClickEvent ) ];
}

export function getHoverEventDurations( trace ) {
	return [
		getEventDurationsForType( trace, isMouseOverEvent ),
		getEventDurationsForType( trace, isMouseOutEvent )
	];
}

export async function getLoadingDurations() {
	return await page.evaluate( () => {
		const [
			{
				requestStart,
				responseStart,
				responseEnd,
				domContentLoadedEventEnd,
				loadEventEnd
			}
		] = performance.getEntriesByType( 'navigation' );
		const paintTimings = performance.getEntriesByType( 'paint' );
		return {

			// Server side metric.
			serverResponse: responseStart - requestStart,

			// For client side metrics, consider the end of the response (the
			// browser receives the HTML) as the start time (0).
			firstPaint:
                 paintTimings.find( ({ name }) => 'first-paint' === name )
                 	.startTime - responseEnd,
			domContentLoaded: domContentLoadedEventEnd - responseEnd,
			loaded: loadEventEnd - responseEnd,
			firstContentfulPaint:
                 paintTimings.find(
                 	({ name }) => 'first-contentful-paint' === name
                 ).startTime - responseEnd,

			// This is evaluated right after Puppeteer found the block selector.
			firstBlock: performance.now() - responseEnd
		};
	});
}
