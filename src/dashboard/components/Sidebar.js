/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies.
 */
import Infobox from './Infobox.js';

import LicenseField from './LicenseField.js';
import  { setUtm } from '../../blocks/helpers/helper-functions.js';

const YOUTUBE_PLAYLIST_URL = 'https://youtube.com/playlist?list=PLmRasCVwuvpSep2MOsIoE0ncO9JE3FcKP&si=hjTkWi5YkPK5JgtL';

/**
 * Component to display YouTube playlist card
 */
const YouTubePlaylistCard = ({ playlistUrl, playlistData }) => {
	const { videoTitle, thumbnail } = playlistData || {};

	return (
		<div className="otter-youtube-card">
			{ thumbnail && (
				<a
					href={ playlistUrl }
					target="_blank"
					rel="noopener noreferrer"
					className="otter-youtube-card__thumbnail"
				>
					<span className="otter-youtube-card__play-button" aria-hidden="true">
						<span className="otter-youtube-card__play-icon" />
					</span>
					<img
						src={ thumbnail }
						alt={ videoTitle || __( 'Otter YouTube playlist', 'otter-blocks' ) }
						loading="lazy"
					/>
				</a>
			) }
			<div className="otter-youtube-card__content">
				{ videoTitle && (
					<p className="otter-youtube-card__title">
						<strong>{ videoTitle }</strong>
					</p>
				) }
			</div>
			<div className="otter-info-button-group is-single">
				<Button
					variant="secondary"
					isSecondary
					target="_blank"
					href={ playlistUrl }
				>
					{ __( 'Watch the complete playlist', 'otter-blocks' ) }
				</Button>
			</div>
		</div>
	);
};

const Sidebar = ({
	setTab
}) => {
	return (
		<Fragment>
			{ Boolean( window.otterObj.hasPro ) ? (
				<LicenseField />
			) : (
				<Infobox
					title={ __( 'Otter Pro', 'otter-blocks' ) }
				>
					<ul>
						<li>{ __( 'Pro Block Addons', 'otter-blocks' ) }</li>
						<li>{ __( 'Pro Block Patterns', 'otter-blocks' ) }</li>
						<li>{ __( 'Dynamic Content', 'otter-blocks' ) }</li>
						<li>{ __( 'Block Conditions', 'otter-blocks' ) }</li>
						<li>{ __( 'WooCommerce Product Builder', 'otter-blocks' ) }</li>
						<li>{ __( 'Priority Support', 'otter-blocks' ) }</li>
					</ul>

					<div className="otter-info-button-group">
						<Button
							variant="secondary"
							isSecondary
							onClick={ () => setTab( 'upsell' ) }
						>
							{ __( 'Learn More', 'otter-blocks' ) }
						</Button>

						<Button
							variant="primary"
							isPrimary
							target="_blank"
							href={ setUtm( window.otterObj.upgradeLink, 'infobox' ) }
						>
							{ __( 'Explore Otter Pro', 'otter-blocks' ) }
						</Button>
					</div>
				</Infobox>
			) }

			<Infobox
				title={ __( 'Useful links', 'otter-blocks' ) }
			>
				<ul className="otter-info-links">
					<li><a href="https://wordpress.org/support/plugin/otter-blocks" target="_blank" rel="noreferrer">{ __( 'Support', 'otter-blocks' ) }</a></li>
					<li><a href="https://github.com/Codeinwp/otter-blocks/discussions" target="_blank" rel="noreferrer">{ __( 'Feature request', 'otter-blocks' ) }</a></li>
					<li><a href="https://wordpress.org/support/plugin/otter-blocks/reviews/#new-post" target="_blank" rel="noreferrer">{ __( 'Leave a review', 'otter-blocks' ) }</a></li>
				</ul>

				<div className="otter-info-button-group is-single">
					<Button
						variant="secondary"
						isSecondary
						target="_blank"
						href={ window.otterObj.docsLink }
					>
						{ __( 'Documentation', 'otter-blocks' ) }
					</Button>
				</div>
			</Infobox>

			<Infobox
				title={ __( 'Otter YouTube Tutorials', 'otter-blocks' ) }
			>
				<YouTubePlaylistCard
					playlistUrl={ YOUTUBE_PLAYLIST_URL }
					playlistData={ window.otterObj?.youtubePlaylistData }
				/>
			</Infobox>
		</Fragment>
	);
};

export default Sidebar;
