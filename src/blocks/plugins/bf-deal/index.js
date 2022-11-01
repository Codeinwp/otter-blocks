/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

import {
	select,
	useDispatch,
	useSelect
} from '@wordpress/data';

import { PluginPostPublishPanel } from '@wordpress/edit-post';

import { registerPlugin } from '@wordpress/plugins';

/**
  * Internal dependencies.
  */
import './editor.scss';

const Render = () => {
	const { isBFDealVisible } = useSelect( select => {
		const { isBFDealVisible } = select( 'themeisle-gutenberg/data' );

		return {
			isBFDealVisible: isBFDealVisible()
		};
	});

	const { showBFDeal } = useDispatch( 'themeisle-gutenberg/data' );

	if ( ! isBFDealVisible ) {
		return null;
	}

	return (
		<PluginPostPublishPanel>
			<div className="o-bf-deal">
				<Button
					label={ __( 'Dismiss', 'otter-blocks' ) }
					icon="no-alt"
					showTooltip={ true }
					onClick={ () => {
						showBFDeal( false );
						window.localStorage?.setItem( 'o-show-bf-deal', 'false' );
					} }
				/>

				<img src={ window.themeisleGutenberg.assetsPath + '/images/logo-alt.png' } />

				<div className="o-bf-deal-title">
					{ __( 'Black Friday', 'otter-blocks' ) }
					<br/>
					<span className="red">{ __( ' Private', 'otter-blocks' ) }</span>
					<span className="yellow">{ __( ' Sale', 'otter-blocks' ) }</span>
				</div>

				<div className="o-bf-deal-description">{ __( 'Save big with Lifetime Licenses on all Otter PRO plans. Only 100 licenses, for a limited time!', 'otter-blocks' ) }</div>

				<Button
					isPrimary
					target="_blank"
					href="https://bit.ly/otter-2022bf"
				>
					{ __( 'Get the Deal Now', 'otter-blocks' ) }
				</Button>
			</div>
		</PluginPostPublishPanel>
	);
};

if ( Boolean( window.themeisleGutenberg.isBlockEditor ) && select( 'core/editor' ) ) {
	registerPlugin( 'otter-bf-deal', {
		render: Render
	});
}

