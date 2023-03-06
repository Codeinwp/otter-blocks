/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { Button } from '@wordpress/components';

import { useDispatch } from '@wordpress/data';

import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import './editor.scss';

import { setUtm } from '../../helpers/helper-functions.js';

const storageKey = 'o-popup-upsell';

const MONTH_IN_MS = 60 * 60 * 1000 * 24 * 30;

const edit = props => {
	const { removeBlock } = useDispatch( 'core/block-editor' );

	const isEditor = null !== document.querySelector( `#o-upsell-${ props.clientId }` );

	useEffect( () => {
		if ( isEditor && undefined === window.themeisleGutenberg.hasPatternUpsell ) {
			window.themeisleGutenberg.hasPatternUpsell = props.clientId;
		}

		if ( window.themeisleGutenberg.hasPro || ( isEditor && undefined !== window.themeisleGutenberg.hasPatternUpsell && props.clientId !== window.themeisleGutenberg.hasPatternUpsell ) ) {
			removeBlock( props.clientId );
		}

		let status = window.localStorage.getItem( storageKey );

		if ( null !== status ) {
			status = JSON.parse( status );

			if ( 3 <= status.count && MONTH_IN_MS > Date.now() - status.lastDismissal ) {
				removeBlock( props.clientId );
			}
		}
	}, [ isEditor ]);

	return (
		<div
			id={ `o-upsell-${ props.clientId }` }
			className={ classnames( 'o-block-patterns-upsell alignfull', {
				'is-neve': Boolean( window.themeisleGutenberg.hasNeve )
			}) }
		>
			<h3>{ __( 'Get more Patterns with Otter Pro.', 'otter-blocks' ) }</h3>

			<div className="o-block-patterns-upsell__actions">
				<a href={ setUtm( window.themeisleGutenberg.patternsLink, 'patterns' ) } target="_blank">
					{ __( 'Get Otter Pro', 'otter-blocks' ) }
				</a>

				<Button
					icon="no-alt"
					label={ __( 'Dismiss', 'otter-blocks' ) }
					onClick={ () => {
						let status = window.localStorage.getItem( storageKey );

						if ( null === status ) {
							status = {
								count: 1,
								lastDismissal: Date.now()
							};
						} else {
							status = JSON.parse( status );

							if ( MONTH_IN_MS < Date.now() - status.lastDismissal ) {
								status = {
									count: 1,
									lastDismissal: Date.now()
								};
							} else {
								status.count = status.count + 1;
								status.lastDismissal = Date.now();
							}
						}

						window.localStorage.setItem( storageKey, JSON.stringify( status ) );
						removeBlock( props.clientId );
					} }
				/>
			</div>
		</div>
	);
};

registerBlockType( 'themeisle-blocks/patterns-upsell', {
	apiVersion: 2,
	title: __( 'Pro Pattern Notice', 'otter-blocks' ),
	description: __( 'Get more Patterns with Otter Pro.', 'otter-blocks' ),
	supports: {
		inserter: false
	},
	edit,
	save: () => null
});
