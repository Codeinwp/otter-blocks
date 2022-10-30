/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { addFilter } from '@wordpress/hooks';

import { select } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import options from './options.js';

let autocompleteOptions = [];

Object.keys( options ).forEach( option => autocompleteOptions.push( ...options[option].options ) );

autocompleteOptions =  [ ...autocompleteOptions.filter( i => true !== i.isDisabled ), ...autocompleteOptions.filter( i => true === i.isDisabled ) ];

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
	getOptionCompletion: ({ label, value }) => {
		const {
			getSelectedBlock,
			getBlockParentsByBlockName
		} = select( 'core/block-editor' );

		const currentBlock = getSelectedBlock();
		const isQueryChild = 0 < getBlockParentsByBlockName( currentBlock?.clientId, 'core/query' ).length;

		if ( isQueryChild ) {
			return <o-dynamic data-type={ value } data-context="query">{ label }</o-dynamic>;
		}

		return <o-dynamic data-type={ value }>{ label }</o-dynamic>;
	}
};

const appenddDynamicValueCompleter = completers => [ ...completers, dynamicValue ];

addFilter(
	'editor.Autocomplete.completers',
	'otter-pro/autocompleters/dynamic-value',
	appenddDynamicValueCompleter
);
