/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Spinner, ToggleControl } from '@wordpress/components';

import { Fragment, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	accordionIcon, aiGeneration,
	buttonsIcon,
	cartIcon,
	circleIcon,
	columnsIcon,
	countdownIcon, faIcon,
	flipIcon,
	formIcon,
	googleMapIcon,
	headingIcon,
	iconListIcon,
	lottieIcon,
	mapIcon, masonryIcon,
	popupIcon,
	postsIcon,
	progressIcon,
	reviewIcon, searchIcon,
	sharingIcon,
	sliderIcon, tabsIcon
} from '../../../blocks/helpers/icons';

import useSettings from '../../../blocks/helpers/use-settings';

const otterBlocks = [
	{
		'slug': 'themeisle-blocks/about-author',
		'name': __( 'About Author', 'otter-blocks' ),
		'icon': 'admin-users'
	},
	{
		'slug': 'themeisle-blocks/accordion',
		'name': __( 'Accordion', 'otter-blocks' ),
		'icon': accordionIcon
	},
	{
		'slug': 'themeisle-blocks/advanced-heading',
		'name': __( 'Advanced Heading', 'otter-blocks' ),
		'icon': headingIcon
	},
	{
		'slug': 'themeisle-blocks/business-hours',
		'name': __( 'Business Hours', 'otter-blocks' ),
		'isPro': true,
		'icon': window?.otterUtils?.icons?.businessHoursIcon
	},
	{
		'slug': 'themeisle-blocks/button-group',
		'name': __( 'Button Group', 'otter-blocks' ),
		'icon': buttonsIcon
	},
	{
		'slug': 'themeisle-blocks/circle-counter',
		'name': __( 'Circle Counter', 'otter-blocks' ),
		'icon': circleIcon
	},
	{
		'slug': 'themeisle-blocks/countdown',
		'name': __( 'Countdown', 'otter-blocks' ),
		'icon': countdownIcon
	},
	{
		'slug': 'themeisle-blocks/flip',
		'name': __( 'Flip Card', 'otter-blocks' ),
		'icon': flipIcon
	},
	{
		'slug': 'themeisle-blocks/font-awesome-icons',
		'name': __( 'Icon', 'otter-blocks' ),
		'icon': faIcon
	},
	{
		'slug': 'themeisle-blocks/form',
		'name': __( 'Form', 'otter-blocks' ),
		'icon': formIcon
	},
	{
		'slug': 'themeisle-blocks/google-map',
		'name': __( 'Google Maps', 'otter-blocks' ),
		'icon': googleMapIcon
	},
	{
		'slug': 'themeisle-blocks/icon-list',
		'name': __( 'Icon List', 'otter-blocks' ),
		'icon': iconListIcon
	},
	{
		'slug': 'themeisle-blocks/leaflet-map',
		'name': __( 'Maps', 'otter-blocks' ),
		'icon': mapIcon
	},
	{
		'slug': 'themeisle-blocks/lottie',
		'name': __( 'Lottie Animation', 'otter-blocks' ),
		'icon': lottieIcon
	},
	{
		'slug': 'themeisle-blocks/plugin-cards',
		'name': __( 'Plugin Card', 'otter-blocks' ),
		'icon': 'admin-plugins'
	},
	{
		'slug': 'themeisle-blocks/popup',
		'name': __( 'Popup', 'otter-blocks' ),
		'icon': popupIcon
	},
	{
		'slug': 'themeisle-blocks/posts-grid',
		'name': __( 'Posts', 'otter-blocks' ),
		'icon': postsIcon
	},
	{
		'slug': 'themeisle-blocks/progress-bar',
		'name': __( 'Progress Bar', 'otter-blocks' ),
		'icon': progressIcon
	},
	{
		'slug': 'themeisle-blocks/review',
		'name': __( 'Product Review', 'otter-blocks' ),
		'icon': reviewIcon
	},
	{
		'slug': 'themeisle-blocks/review-comparison',
		'name': __( 'Review Comparison Table', 'otter-blocks' ),
		'isPro': true,
		'icon': reviewIcon
	},
	{
		'slug': 'themeisle-blocks/advanced-columns',
		'name': __( 'Section', 'otter-blocks' ),
		'icon': columnsIcon
	},
	{
		'slug': 'themeisle-blocks/sharing-icons',
		'name': __( 'Sharing Icons', 'otter-blocks' ),
		'icon': sharingIcon
	},
	{
		'slug': 'themeisle-blocks/slider',
		'name': __( 'Slider', 'otter-blocks' ),
		'icon': sliderIcon
	},
	{
		'slug': 'themeisle-blocks/stripe-checkout',
		'name': __( 'Stripe Checkout', 'otter-blocks' ),
		'icon': cartIcon
	},
	{
		'slug': 'themeisle-blocks/tabs',
		'name': __( 'Tabs', 'otter-blocks' ),
		'icon': tabsIcon
	},
	{
		'slug': 'themeisle-blocks/woo-comparison',
		'name': __( 'WooCommerce Comparison Table', 'otter-blocks' ),
		'isPro': true,
		'icon': 'editor-table'
	},
	{
		'slug': 'themeisle-gutenberg/live-search-attributes', // TODO: find why this can not be disabled.
		'name': __( 'Live Search', 'otter-blocks' ),
		'isPro': true,
		'icon': searchIcon
	},
	{
		'slug': 'themeisle-gutenberg/masonry', // TODO: find why this can not be disabled.
		'name': __( 'Masonry', 'otter-blocks' ),
		'icon': masonryIcon
	},
	{
		'slug': 'themeisle-blocks/content-generator',
		'name': __( 'Content Generator', 'otter-blocks' ),
		'icon': () => aiGeneration
	}
];

const BlockCard = ({ block, isLoading, onToggle }) => {
	return (
		<div className="o-block-card">
			<div className="o-block-card__icon">
				{ isString( block.icon ) ? <span className={ `dashicons dashicons-${ block.icon }` } /> : block.icon?.() }
			</div>
			<div className="o-block-card__description">
				<h3>
					{ block.name }
				</h3>
				<span>
					Learn More
				</span>
			</div>
			{
				isLoading ? (
					<Spinner />
				) : (
					<ToggleControl checked={! block?.isDisabled} onChange={onToggle} />
				)
			}
		</div>
	);
};

const Header = ({ blocks, onDisableAll, onEnableAll }) => {

	const allEnabled = blocks.every( block => ! block.isDisabled );
	const allDisabled = blocks.every( block => block.isDisabled );

	return <div className="o-blocks-header">
		<div className="o-blocks-header__left">
			<h3>{ __( 'Otter Blocks', 'otter-blocks' ) }</h3>
		</div>
		<div className="o-blocks-header__right">
			<Button variant="secondary" disabled={allDisabled} onClick={onDisableAll} >
				{ __( 'Disable All', 'otter-blocks' ) }
			</Button>
			<Button variant="primary" disabled={allEnabled} onClick={onEnableAll}>
				{ __( 'Enable All', 'otter-blocks' ) }
			</Button>
		</div>
	</div>;
};

const Blocks = () => {

	const [ blocksStatus, setBlocksStatus ] = useState( otterBlocks );

	const [ getOption, updateOption, status ] = useSettings();
	const [ isLoading, setLoading ] = useState( true );

	const sendUpdates = ( blocks ) => {
		const optionValue = blocks.filter( block => Boolean( block.isDisabled ) ).map( block => block.slug );
		updateOption( 'themeisle_disabled_blocks', optionValue, __( 'Blocks Settings updated.', 'otter-blocks' ), 'o-blocks-update' );
	};

	const toggleBlock = ( blockSlug ) => {
		const updatedBlocksStatus = blocksStatus.map( block => {
			if ( block.slug === blockSlug ) {
				block.isDisabled = ! block.isDisabled;
			}

			return block;
		});

		sendUpdates( updatedBlocksStatus );
		setBlocksStatus( updatedBlocksStatus );
	};

	const onDisableAll = () => {
		const updatedBlocksStatus = blocksStatus.map( block => {
			block.isDisabled = true;

			return block;
		});

		sendUpdates( updatedBlocksStatus );
		setBlocksStatus( updatedBlocksStatus );
	};

	const onEnableAll = () => {
		const updatedBlocksStatus = blocksStatus.map( block => {
			block.isDisabled = false;

			return block;
		});

		sendUpdates( updatedBlocksStatus );
		setBlocksStatus( updatedBlocksStatus );
	};


	useEffect( () => {
		if ( isLoading && 'loaded' === status ) {
			setLoading( false );
			const savedValue = getOption( 'themeisle_disabled_blocks' );
			if ( savedValue ) {
				const updatedBlocksStatus = blocksStatus.map( block => {
					if ( savedValue.includes( block.slug ) ) {
						block.isDisabled = true;
					} else {
						block.isDisabled = false;
					}

					return block;
				});

				setBlocksStatus( updatedBlocksStatus );
			}
		}
	}, [ status, isLoading ]);

	return (
		<Fragment>
			<Header blocks={blocksStatus} onDisableAll={onDisableAll} onEnableAll={onEnableAll} />
			<div className="o-block-cards">
				{
					blocksStatus.map( block => {
						return (
							<BlockCard block={ block } isLoading={isLoading} onToggle={() => toggleBlock( block.slug )} />
						);
					})
				}
			</div>
		</Fragment>
	);
};

export default Blocks;
