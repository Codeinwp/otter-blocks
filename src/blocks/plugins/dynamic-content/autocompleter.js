/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { addFilter } from '@wordpress/hooks';

const options = [
	{
		label: __( 'Post', 'otter-blocks' ),
		value: 'post',
		isDisabled: true
	},
	{
		label: __( 'ID', 'otter-blocks' ),
		value: 'postID'
	},
	{
		label: __( 'Title', 'otter-blocks' ),
		value: 'postTitle'
	}
];

const dynamicValue = {
	name: 'dynamic-value',
	triggerPrefix: '%',
	options: options,
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
