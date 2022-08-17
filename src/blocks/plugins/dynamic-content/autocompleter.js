/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import options from './options.js';

const autocompleteOptions = [];

Object.keys( options ).forEach( option => autocompleteOptions.push( ...options[option].options ) );

autocompleteOptions.sort( ( a, b ) => {
	if ( ! a?.isDisabled || ( a?.isDisabled && b?.isDisabled ) ) {
		return false;
	}

	if ( ! a?.isDisabled && b?.isDisabled ) {
		return -1;
	}

	if ( a?.isDisabled && ! b?.isDisabled ) {
		return true;
	}
});

const dynamicValue = {
	name: 'dynamic-value',
	triggerPrefix: '%',
	options: autocompleteOptions,
	className: 'o-dynamic',
	getOptionKeywords({ label, value }) {
		const words = value.split( /\s+/ );
		return [ label, ...words ];
	},
	getOptionLabel: option => (
		<span
			className={ classnames(
				'o-dynamic-list-item',
				{
					'is-disabled': option.isDisabled
				}
			) }
		>
			{ option.label }
		</span>
	),
	isOptionDisabled: option => option.isDisabled,
	getOptionCompletion: ({ label, value }) => (
		<o-dynamic data-type={ value }>{ label }</o-dynamic>
	)
};

const appenddDynamicValueCompleter = completers => [ ...completers, dynamicValue ];

addFilter(
	'editor.Autocomplete.completers',
	'otter-pro/autocompleters/dynamic-value',
	appenddDynamicValueCompleter
);
