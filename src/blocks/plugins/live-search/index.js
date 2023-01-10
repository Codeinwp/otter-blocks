/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { Fragment } from '@wordpress/element';
import { Button, Disabled, ExternalLink, PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Notice from '../../components/notice';
import { setUtm } from '../../helpers/helper-functions';
import './editor.scss';

const liveSearchDocUrl = 'https://docs.themeisle.com/article/1747-the-live-search-feature-otter-features-library';

const liveSearchUpsell = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( 'core/search' !== props.name ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody
						className="o-live-search"
						title={ __( 'Live Search', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<img
							src={ window.themeisleGutenberg.assetsPath + '/images/live-search-thumbnail.png' }
							alt={ __( 'Thumbnail of live search feature', 'otter-blocks' ) }
							className="otter-live-search-thumbnail-image"
						/>
						<Disabled>
							<ToggleControl
								label={ __( 'Enable Live Search', 'otter-blocks' ) }
								checked={ false }
								onChange={ () => {} }
								className="o-disabled"
							/>
						</Disabled>
						<Notice
							notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'search-block' ) }>{ __( 'Unlock this with Otter Pro.', 'otter-blocks' ) }</ExternalLink> }
							variant="upsell"
						/>
						<Button
							className="o-live-search__doc"
							variant="secondary"
							href={ liveSearchDocUrl }
							target="_blank"
						>
							{ __( 'Learn more', 'otter-blocks' ) }
						</Button>
					</PanelBody>
				</InspectorControls>

				<BlockEdit { ...props } />
			</Fragment>
		);
	};
}, 'liveSearchUpsell' );

if ( ! Boolean( window.themeisleGutenberg.hasPro ) ) {
	addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/live-search-upsell', liveSearchUpsell );
}
