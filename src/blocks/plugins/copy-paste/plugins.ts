import { uniq } from 'lodash';
import { animationsList, outAnimation, delayList, speedList } from '../../../animation/data';

export const copyAnimations = ( className: string | undefined ) => {
	if ( className === undefined || ! className?.includes( 'animated' ) ) {
		return undefined;
	}

	const allClasses = uniq( className.split( ' ' ) );

	const animations = [
		'animated',
		...animationsList.map( x => x.value ),
		...outAnimation,
		...delayList.map( x => x.value ),
		...speedList
	];

	return allClasses.filter( c => {
		return 0 < c.length && animations.some( a => c === a );
	});
};

export const pasteAnimations = ( className: string | undefined, animList: string[] | undefined ) => {

	if ( animList === undefined ) {
		return className;
	}

	const currentClasses = uniq( ( className ?? '' ).split( ' ' ) );

	const animations = [
		'animated',
		...animationsList.map( x => x.value ),
		...outAnimation,
		...delayList.map( x => x.value ),
		...speedList
	];

	const cleaned = currentClasses
		.filter( c => {
			return ! animations.some( a => c === a ) && 0 < c.length;
		});

	return uniq([ ...( cleaned ?? []), ...( animList ?? []) ]).join( ' ' ).trim();
};

export default {
	copyAnimations,
	pasteAnimations
};
