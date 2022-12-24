/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { __experimentalToolsPanelItem as ToolsPanelItem } from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './editor.scss';
import Edit from './edit';

const EXCEPTED_BLOCK_CONDITIONS = [ '-item', 'form-' ]; // Exclude sub-blocks

const toggleSticky = (
	classes,
	isSticky,
	setAttributes
) => {
	let className = classes?.filter( c => ! c.includes( 'o-sticky' ) ) || [];

	if ( ! isSticky ) {
		className.push( 'o-sticky', 'o-sticky-scope-main-area', 'o-sticky-pos-top', 'o-sticky-bhvr-keep' );
	}

	className = className.join( ' ' );
	setAttributes({ className: '' !== className ? className : undefined });
};

const StickyExtension = ( el, props ) => {
	if ( hasBlockSupport( props.name, 'customClassName', true ) && ! EXCEPTED_BLOCK_CONDITIONS.some( cond => props.name?.includes( cond ) ) ) {
		const classes =  props.attributes?.className?.split( ' ' );
		const isSticky = classes?.includes( 'o-sticky' ) || false;

		return (
			<Fragment>
				{ el }

				<ToolsPanelItem
					hasValue={ () => isSticky }
					label={ __( 'Transform to Sticky', 'otter-blocks' ) }
					onSelect={ () => toggleSticky( classes, isSticky, props.setAttributes ) }
					onDeselect={ () => toggleSticky( classes, isSticky, props.setAttributes ) }
					isShownByDefault={ false }
				>
					{ isSticky && <Edit { ...props } /> }
				</ToolsPanelItem>
			</Fragment>
		);
	}

	return el;
};

addFilter( 'otter.blockTools', 'themeisle-gutenberg/sticky-extension', StickyExtension, 4 );
