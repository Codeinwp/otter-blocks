/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

import {
	createRoot,
	useState
} from '@wordpress/element';

import { subscribe } from '@wordpress/data';

import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies.
 */
import './editor.scss';
import { otterIcon } from '../../helpers/icons.js';
import Library from './library.js';

const ModalButton = () => {
	const [ isOpen, setOpen ] = useState( false );

	return (
		<>
			{ isOpen && <Library onClose={ () => setOpen( false ) } /> }

			<Button
				variant="secondary"
				icon={ otterIcon }
				className="o-library__button"
				onClick={ () => setOpen( true ) }
			>
				{ __( 'Design Library', 'otter-blocks' ) }
			</Button>
		</>
	);
};

const initPatternsLibrary = () => {
	const buttonDiv = document.createElement( 'div' );
	buttonDiv.classList.add( 'o-library__wrapper' );
	createRoot( buttonDiv ).render( <ModalButton /> );

	subscribe( () => {
		setTimeout( () => {
			const toolbar = document.querySelector( '.edit-post-header-toolbar' );

			if ( toolbar ) {
				toolbar.appendChild( buttonDiv );
			}
		}, 1 );
	});
};

if ( Boolean( window.themeisleGutenberg.hasModule.patternsLibrary ) ) {
	domReady( initPatternsLibrary );
}
