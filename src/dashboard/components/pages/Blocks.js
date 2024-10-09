/**
 * External dependencies
 */
import { isString } from 'lodash';
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Spinner, ToggleControl } from '@wordpress/components';

import { Fragment, useEffect, useState } from '@wordpress/element';
import { dispatch, useSelect } from '@wordpress/data';

// Hack: This is by the toolchain to load the 'wp-edit-site' package so that we can use the 'core/preferences' store.
import '@wordpress/edit-site';

/**
 * Internal dependencies
 */
import {
	accordionIcon,
	aiGeneration,
	businessHoursIcon,
	buttonsIcon,
	cartIcon,
	circleIcon,
	columnsIcon,
	comparisonTableIcon,
	countdownIcon,
	faIcon,
	flipIcon,
	formIcon,
	googleMapIcon,
	headingIcon,
	iconListIcon,
	lottieIcon,
	mapIcon,
	popupIcon,
	postsIcon,
	progressIcon,
	reviewIcon,
	searchIcon,
	sharingIcon,
	sliderIcon,
	tabsIcon,
	timelineIcon
} from '../../../blocks/helpers/icons';

/**
 * List with all the blocks that can be disabled.
 *
 * @type {import('../../dashboard').BlocksToDisableList}
 */
const otterBlocks = [
	{
		'slug': 'themeisle-blocks/accordion',
		'name': __( 'Accordion', 'otter-blocks' ),
		'icon': accordionIcon,
		'docLink': 'https://docs.themeisle.com/article/1672-accessibility-blocks#accordion'
	},
	{
		'slug': 'themeisle-blocks/advanced-heading',
		'name': __( 'Advanced Heading', 'otter-blocks' ),
		'icon': headingIcon,
		'docLink': 'https://docs.themeisle.com/article/1686-global-defaults-blocks#advanced-heading'
	},
	{
		'slug': 'themeisle-blocks/business-hours',
		'name': __( 'Business Hours', 'otter-blocks' ),
		'isPro': true,
		'icon': businessHoursIcon,
		'docLink': 'https://docs.themeisle.com/article/1679-business-blocks#business-hours'
	},
	{
		'slug': 'themeisle-blocks/button-group',
		'name': __( 'Button Group', 'otter-blocks' ),
		'icon': buttonsIcon,
		'docLink': 'https://docs.themeisle.com/article/1686-global-defaults-blocks#button-group'
	},
	{
		'slug': 'themeisle-blocks/circle-counter',
		'name': __( 'Circle Counter', 'otter-blocks' ),
		'icon': circleIcon,
		'docLink': 'https://docs.themeisle.com/article/1669-tracking-blocks#circle-counter'
	},
	{
		'slug': 'themeisle-blocks/countdown',
		'name': __( 'Countdown', 'otter-blocks' ),
		'icon': countdownIcon,
		'docLink': 'https://docs.themeisle.com/article/1669-tracking-blocks#countdown'
	},
	{
		'slug': 'themeisle-blocks/flip',
		'name': __( 'Flip Card', 'otter-blocks' ),
		'icon': flipIcon,
		'docLink': 'https://docs.themeisle.com/article/1673-popularity-block#flip-card'
	},
	{
		'slug': 'themeisle-blocks/font-awesome-icons',
		'name': __( 'Icon', 'otter-blocks' ),
		'icon': faIcon,
		'docLink': 'https://docs.themeisle.com/article/1676-useful-blocks#icon'
	},
	{
		'slug': 'themeisle-blocks/form',
		'name': __( 'Form', 'otter-blocks' ),
		'icon': formIcon,
		'docLink': 'https://docs.themeisle.com/article/1674-form-blocks'
	},
	{
		'slug': 'themeisle-blocks/google-map',
		'name': __( 'Google Maps', 'otter-blocks' ),
		'icon': googleMapIcon,
		'docLink': 'https://docs.themeisle.com/article/1675-location-blocks#google-maps'
	},
	{
		'slug': 'themeisle-blocks/icon-list',
		'name': __( 'Icon List', 'otter-blocks' ),
		'icon': iconListIcon,
		'docLink': 'https://docs.themeisle.com/article/1676-useful-blocks#icon-list'
	},
	{
		'slug': 'themeisle-blocks/leaflet-map',
		'name': __( 'Maps', 'otter-blocks' ),
		'icon': mapIcon,
		'docLink': 'https://docs.themeisle.com/article/1675-location-blocks#maps'
	},
	{
		'slug': 'themeisle-blocks/modal',
		'name': __( 'Modal', 'otter-blocks' ),
		'icon': popupIcon,
		'docLink': 'https://docs.themeisle.com/article/2050-modal-block',
		'isPro': true
	},
	{
		'slug': 'themeisle-blocks/lottie',
		'name': __( 'Lottie Animation', 'otter-blocks' ),
		'icon': lottieIcon,
		'docLink': 'https://docs.themeisle.com/article/1668-image-related-blocks#lottie-animation'
	},
	{
		'slug': 'themeisle-blocks/popup',
		'name': __( 'Popup', 'otter-blocks' ),
		'icon': popupIcon,
		'docLink': 'https://docs.themeisle.com/article/1551-the-popup-block-otter-blocks-library'
	},
	{
		'slug': 'themeisle-blocks/posts-grid',
		'name': __( 'Posts', 'otter-blocks' ),
		'icon': postsIcon,
		'docLink': 'https://docs.themeisle.com/article/1530-posts-block'
	},
	{
		'slug': 'themeisle-blocks/progress-bar',
		'name': __( 'Progress Bar', 'otter-blocks' ),
		'icon': progressIcon,
		'docLink': 'https://docs.themeisle.com/article/1669-tracking-blocks#progress-bar'
	},
	{
		'slug': 'themeisle-blocks/review',
		'name': __( 'Product Review', 'otter-blocks' ),
		'icon': reviewIcon,
		'docLink': 'https://docs.themeisle.com/article/1671-shop-related-blocks#product-review'
	},
	{
		'slug': 'themeisle-blocks/review-comparison',
		'name': __( 'Review Comparison Table', 'otter-blocks' ),
		'isPro': true,
		'icon': comparisonTableIcon,
		'docLink': 'https://docs.themeisle.com/article/1671-shop-related-blocks#comparison-table'
	},
	{
		'slug': 'themeisle-blocks/advanced-columns',
		'name': __( 'Section', 'otter-blocks' ),
		'icon': columnsIcon,
		'docLink': 'https://docs.themeisle.com/article/1833-the-section-block-otter-blocks-library'
	},
	{
		'slug': 'themeisle-blocks/sharing-icons',
		'name': __( 'Sharing Icons', 'otter-blocks' ),
		'icon': sharingIcon,
		'docLink': 'https://docs.themeisle.com/article/1673-popularity-block#sharing-icons'
	},
	{
		'slug': 'themeisle-blocks/slider',
		'name': __( 'Image Slider', 'otter-blocks' ),
		'icon': sliderIcon,
		'docLink': 'https://docs.themeisle.com/article/1668-image-related-blocks#slider'
	},
	{
		'slug': 'themeisle-blocks/stripe-checkout',
		'name': __( 'Stripe Checkout', 'otter-blocks' ),
		'icon': cartIcon,
		'docLink': 'https://docs.themeisle.com/article/1688-integrations-related-blocks#stripe-checkout'
	},
	{
		'slug': 'themeisle-blocks/tabs',
		'name': __( 'Tabs', 'otter-blocks' ),
		'icon': tabsIcon,
		'docLink': 'https://docs.themeisle.com/article/1672-accessibility-blocks#tabs'
	},
	{
		'slug': 'themeisle-gutenberg/live-search', // TODO: find why this can not be disabled.
		'name': __( 'Live Search', 'otter-blocks' ),
		'isPro': true,
		'icon': searchIcon,
		'docLink': 'https://docs.themeisle.com/article/1747-the-live-search-feature-otter-features-library'
	},
	{
		'slug': 'themeisle-blocks/content-generator',
		'name': __( 'AI Block', 'otter-blocks' ),
		'icon': () => aiGeneration,
		'docLink': 'https://docs.themeisle.com/article/1917-the-ai-block-otter-blocks-library#content-generator'
	},
	{
		'slug': 'themeisle-blocks/timeline',
		'name': __( 'Timeline', 'otter-blocks' ),
		'icon': timelineIcon,
		'docLink': 'https://docs.themeisle.com/article/2051-timeline-block'
	}
].sort( ( a, b ) => a.name.localeCompare( b.name ) );

/**
 * Dashboard Block Card component.
 * @param {import('../../dashboard').BlockCardProps} props Component props.
 */
const BlockCard = ({ block, isLoading, onToggle }) => {
	return (
		<div className="o-block-card">
			<div className={classNames( 'o-block-card__icon', { 'is-disabled': block?.isPro && ! otterObj?.hasPro })}>
				{ isString( block.icon ) ? <span className={ `dashicons dashicons-${ block.icon }` } /> : block.icon?.() }
			</div>
			<div className="o-block-card__description">
				<h3>
					{ block.name }
				</h3>
				<a href={block?.docLink ?? 'https://docs.themeisle.com/category/1611-blocks-library'} target="_blank" rel="noopener noreferrer">
					Learn More
				</a>
				{
					( block?.isPro && ! otterObj?.hasPro ) && (
						<Fragment>
							|
							<a href={ otterObj.upgradeLink } target="_blank" rel="noopener noreferrer">
								{ __( 'Get Pro', 'otter-blocks' ) }
							</a>
						</Fragment>
					)
				}
			</div>
			<div className="o-block-card__action">
				{
					isLoading ? (
						<Spinner />
					) : (
						( block?.isPro && ! ( otterObj?.hasPro && 'valid' === otterObj?.license.valid ) ) ? (
							<span className="o-block-upsell" >
								{ __( 'Pro', 'otter-blocks' ) }
							</span>
						) : (
							<ToggleControl checked={! block?.isDisabled} onChange={onToggle} />
						)
					)
				}
			</div>
		</div>
	);
};

/**
 * Dashboard Header component.
 * @param {import('../../dashboard').BlockCardHeaderProps} props Component props.
 */
const Header = ({ blocks, onDisableAll, onEnableAll, canDisplayBtn }) => {

	const allEnabled = blocks.every( block => ! block.isDisabled );
	const allDisabled = blocks.every( block => block.isDisabled );

	return <div className="o-blocks-header">
		<div className="o-blocks-header__left">
			<h3>{ __( 'Otter Blocks', 'otter-blocks' ) }</h3>
		</div>
		{
			canDisplayBtn && (
				<div className="o-blocks-header__right">
					<Button variant="secondary" disabled={allDisabled} onClick={onDisableAll} >
						{ __( 'Disable All', 'otter-blocks' ) }
					</Button>
					<Button variant="primary" disabled={allEnabled} onClick={onEnableAll}>
						{ __( 'Enable All', 'otter-blocks' ) }
					</Button>
				</div>
			)
		}
	</div>;
};

/**
 * Dashboard Blocks component page.
 */
const Blocks = () => {

	const [ blocksStatus, setBlocksStatus ] = useState( otterBlocks );
	const [ canShowNotice, canShowNoticeSet ] = useState( false );

	const { preferencesHiddenBlocks, isLoading } = useSelect( ( select ) => {

		/**
		 * Array of hidden block types.
		 * @type {Array<string>|undefined}
		 */
		const hiddenBlocks = select( 'core/preferences' )?.get( 'core/edit-post', 'hiddenBlockTypes' );

		const isResolving = select( 'core/preferences' ).isResolving( 'get', [ 'hiddenBlockTypes' ]);

		return {
			preferencesHiddenBlocks: hiddenBlocks ? new Set( hiddenBlocks ) : undefined,
			isLoading: isResolving
		};
	}, [ blocksStatus ]);


	/**
	 * Update the WP Option with the new value.
	 * @param {import('../../dashboard').BlocksToDisableList} blocks Blocks to be updated.
	 */
	const sendUpdates = ( blocks ) => {

		const newPreferencesHiddenBlocks = new Set();

		// Copy the old preferences.
		if ( preferencesHiddenBlocks ) {
			preferencesHiddenBlocks.forEach( block => {
				newPreferencesHiddenBlocks.add( block );
			});
		}

		// Add the new preferences.
		blocks.forEach( block => {
			if ( block.isDisabled ) {
				newPreferencesHiddenBlocks.add( block.slug );
			} else {
				newPreferencesHiddenBlocks.delete( block.slug );
			}
		});

		dispatch( 'core/preferences' ).set( 'core/edit-post', 'hiddenBlockTypes', [ ...newPreferencesHiddenBlocks ]);
	};

	/**
	 * Toggle the block status.
	 * @param {string} blockSlug Block slug.
	 */
	const toggleBlock = ( blockSlug ) => {
		const updatedBlocksStatus = blocksStatus.map( block => {
			if ( block.slug === blockSlug ) {
				block.isDisabled = ! block.isDisabled;
			}

			return block;
		});

		sendUpdates( updatedBlocksStatus );
		setBlocksStatus( updatedBlocksStatus );
		canShowNoticeSet( true );
	};

	/**
	 * Disable all blocks and update the WP Option.
	 */
	const onDisableAll = () => {
		const updatedBlocksStatus = blocksStatus.map( block => {

			if ( block.isPro && ! otterObj.hasPro ) {
				return block;
			}

			block.isDisabled = true;

			return block;
		});

		sendUpdates( updatedBlocksStatus );
		setBlocksStatus( updatedBlocksStatus );
		canShowNoticeSet( true );
	};

	/**
	 * Enable all blocks and update the WP Option.
	 */
	const onEnableAll = () => {
		const updatedBlocksStatus = blocksStatus.map( block => {
			block.isDisabled = false;

			return block;
		});

		sendUpdates( updatedBlocksStatus );
		setBlocksStatus( updatedBlocksStatus );
		canShowNoticeSet( true );
	};


	/**
	 * Initiate the blocks' status.
	 */
	useEffect( () => {
		if ( isLoading ) {
			return;
		}

		const updatedBlocksStatus = blocksStatus.map( block => {
			if ( preferencesHiddenBlocks?.has( block.slug ) ) {
				block.isDisabled = true;
			} else {
				block.isDisabled = false;
			}

			return block;
		});

		setBlocksStatus( updatedBlocksStatus );
	}, [ isLoading ]);

	useEffect( () => {
		if ( ! canShowNotice || isLoading ) {
			return;
		}

		dispatch?.( 'core/notices' )?.createNotice( 'info', __( 'Option Updated.', 'otter-blocks' ), { isDismissible: true, type: 'snackbar', id: 'saved-options' });
		canShowNoticeSet( false );
	}, [ canShowNotice, preferencesHiddenBlocks, isLoading ]);

	return (
		<Fragment>
			<Header blocks={ blocksStatus } onDisableAll={ onDisableAll } onEnableAll={ onEnableAll } canDisplayBtn={ ! isLoading } />
			<div className="o-block-cards">
				{
					blocksStatus.map( block => {
						return (
							<BlockCard key={block.slug} block={ block } isLoading={isLoading} onToggle={() => toggleBlock( block.slug )} />
						);
					})
				}
			</div>
		</Fragment>
	);
};

export default Blocks;
