/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { Fragment } from '@wordpress/element';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Notice from '../../components/notice';
import { setUtm } from '../../helpers/helper-functions';


const liveSearchUpsell = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( 'core/search' !== props.name ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<Fragment>
				<InspectorControls>
					{ ! ( Boolean( window.themeisleGutenberg.hasPro ) ) && (
						<Notice
							notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'search-block' ) }>{ __( 'Get Live Search Results with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
							variant="upsell"
							outsidePanel
						/>
					) }
				</InspectorControls>
				<BlockEdit { ...props } />
			</Fragment>
		);
	};
}, 'liveSearchUpsell' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/live-search-upsell', liveSearchUpsell );
