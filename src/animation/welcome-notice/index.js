/* global otterAnimationWelcodeNoticeData, jQuery */

import './style.scss';
import { installPlugin, activatePlugin } from './common/plugin-install';

function handleWelcomeNotice( $ ) {
	const {
		activating,
		installing,
		done,
		activationUrl,
		ajaxUrl,
		nonce,
		otterStatus
	} = otterAnimationWelcodeNoticeData;

	const installBtn = $( '.otter-animation-welcome-notice #otter-animation-install-otter' );
	const dismissBtn = $( '.otter-animation-welcome-notice .notice-dismiss' );
	const notice = $( '.otter-animation-welcome-notice' );
	const installText = installBtn.find( '.text' );
	const installSpinner = installBtn.find( '.dashicons' );

	const hideAndRemoveNotice = () => {
		notice.fadeTo( 100, 0, () => {
			notice.slideUp( 100, () => {
				notice.remove();
				window.location.reload();
			});
		});
	};

	const activateBlocksAnimation = async() => {
		installText.text( activating );
		await activatePlugin( activationUrl );
		installSpinner.removeClass( 'dashicons-update' );
		installSpinner.addClass( 'dashicons-yes' );
		installText.text( done );
		setTimeout( hideAndRemoveNotice, 1500 );
	};

	$( installBtn ).on( 'click', async() => {
		installSpinner.removeClass( 'hidden' );
		installBtn.attr( 'disabled', true );

		if ( 'installed' === otterStatus ) {
			await activateBlocksAnimation();
			return;
		}

		installText.text( installing );
		await installPlugin( 'otter-blocks' );
		await activateBlocksAnimation();
	});

	$( dismissBtn ).on( 'click', () => {
		$.post( ajaxUrl, {
			nonce,
			action: 'otter_animation_dismiss_welcome_notice',
			success: hideAndRemoveNotice
		});
	});
}

document.addEventListener( 'DOMContentLoaded', () => {
	handleWelcomeNotice( jQuery );
});
