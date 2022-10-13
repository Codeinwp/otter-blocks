/**
 * External dependencies
 */
import hash from 'object-hash';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { pick } from 'lodash';

import { createHigherOrderComponent } from '@wordpress/compose';

import { select } from '@wordpress/data';

import { addFilter } from '@wordpress/hooks';

import { registerFormatType } from '@wordpress/rich-text';

/**
 * Internal dependencies.
 */
import './autocompleter.js';
import edit from './edit.js';

export const name = 'themeisle-blocks/dynamic-value';

export const format = {
	name,
	title: __( 'Dynamic Value', 'otter-blocks' ),
	tagName: 'o-dynamic',
	className: null,
	attributes: {
		type: 'data-type',
		context: 'data-context',
		before: 'data-before',
		after: 'data-after',
		length: 'data-length',
		dateType: 'data-date-type',
		dateFormat: 'data-date-format',
		dateCustom: 'data-date-custom',
		timeType: 'data-time-type',
		timeFormat: 'data-time-format',
		timeCustom: 'data-time-custom',
		termType: 'data-term-type',
		termSeparator: 'data-term-separator',
		metaKey: 'data-meta-key'
	},
	edit
};

registerFormatType( name, format );

const displayWaitlist = {};

const displayData = ( element, value ) => {
	const el = document.createElement( 'div' );
	el.innerHTML = value;
	value = el.textContent || el.innerText;

	element.innerHTML = '<span>' + element.innerHTML + '</span>';
	element.dataset.preview = value;
};

const withDynamicConditions = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( ! props.isSelected ) {
			const id = `block-${ props.clientId }`;
			const elements = document.querySelectorAll( `#${ id } o-dynamic` );

			if ( ! elements?.length ) {
				return <BlockEdit { ...props } />;
			}

			elements.forEach( element => {
				const context = select( 'core/editor' ).getCurrentPostId();
				const attrs = pick( Object.assign({ context }, element.dataset ), [ 'type', 'context', 'before', 'after', 'length', 'dateType', 'dateFormat', 'dateCustom', 'timeType', 'timeFormat', 'timeCustom', 'termType', 'termSeparator', 'metaKey' ]);

				if ( 'postContent' === attrs.type ) {
					return;
				}

				let value = select( 'themeisle-gutenberg/data' ).getDynamicData( attrs );
				if ( undefined !== value ) {
					displayData( element, value );
				} else {
					const attrsHash = hash( attrs );

					if ( ! displayWaitlist[ attrsHash ]) {
						displayWaitlist[ attrsHash ] = [ element ];

						const interval = setInterval( () => {
							value = select( 'themeisle-gutenberg/data' ).getDynamicData( attrs );

							if ( undefined !== value ) {
								clearInterval( interval );
								displayWaitlist[ attrsHash ].forEach( el => displayData( el, value ) );
								delete displayWaitlist[ attrsHash ];
							}
						}, 5000 );
					} else {
						displayWaitlist[ attrsHash ].push( element );
					}
				}
			});

			return <BlockEdit { ...props } />;
		}

		return <BlockEdit { ...props } />;

	};
}, 'withStickyExtension' );

if ( Boolean( window.themeisleGutenberg.isBlockEditor ) && select( 'core/editor' ) ) {
	addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/dynamic-conditions/preview', withDynamicConditions );
}

