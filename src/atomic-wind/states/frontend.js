document.addEventListener( 'DOMContentLoaded', () => {
	const triggers = document.querySelectorAll( '[data-state-trigger]' );
	const targets = document.querySelectorAll( '[data-show-if], [data-hide-if]' );

	if ( ! triggers.length && ! targets.length ) {
		return;
	}

	const state = {};

	// Build initial state from triggers with data-state-default.
	triggers.forEach( ( el ) => {
		if ( ! el.hasAttribute( 'data-state-default' ) ) {
			return;
		}

		const name = el.dataset.stateTrigger;
		const action = el.dataset.stateAction || 'toggle';

		if ( action === 'set' ) {
			state[ name ] = el.dataset.stateValue || '';
		} else {
			state[ name ] = true;
		}
	} );

	function parseCondition( condition ) {
		const idx = condition.indexOf( ':' );
		if ( idx === -1 ) {
			return { name: condition, value: null };
		}
		return { name: condition.substring( 0, idx ), value: condition.substring( idx + 1 ) };
	}

	function testCondition( condition ) {
		const { name, value } = parseCondition( condition );
		if ( value !== null ) {
			return state[ name ] === value;
		}
		return !! state[ name ];
	}

	function updateVisibility() {
		targets.forEach( ( el ) => {
			const showIf = el.dataset.showIf;
			const hideIf = el.dataset.hideIf;

			if ( showIf ) {
				el.hidden = ! testCondition( showIf );
			}

			if ( hideIf ) {
				el.hidden = testCondition( hideIf );
			}
		} );
	}

	function updateTriggers() {
		triggers.forEach( ( el ) => {
			const name = el.dataset.stateTrigger;
			const action = el.dataset.stateAction || 'toggle';

			let isActive = false;

			if ( action === 'set' ) {
				isActive = state[ name ] === ( el.dataset.stateValue || '' );
			} else {
				isActive = !! state[ name ];
			}

			if ( isActive ) {
				el.setAttribute( 'data-active', '' );
			} else {
				el.removeAttribute( 'data-active' );
			}
		} );
	}

	triggers.forEach( ( el ) => {
		el.addEventListener( 'click', ( e ) => {
			e.preventDefault();

			const name = el.dataset.stateTrigger;
			const action = el.dataset.stateAction || 'toggle';

			if ( action === 'set' ) {
				state[ name ] = el.dataset.stateValue || '';
			} else {
				state[ name ] = ! state[ name ];
			}

			updateTriggers();
			updateVisibility();
		} );
	} );

	updateTriggers();
	updateVisibility();
} );
