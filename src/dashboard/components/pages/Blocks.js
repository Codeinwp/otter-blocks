import { __ } from '@wordpress/i18n';
import {
	accordionIcon,
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
	mapIcon,
	popupIcon,
	postsIcon,
	progressIcon,
	reviewIcon,
	sharingIcon,
	sliderIcon, tabsIcon
} from '../../../blocks/helpers/icons';
import { ToggleControl } from '@wordpress/components';
import { isString } from 'lodash';

const otterBlocks = [
	{
		'slug': 'about-author',
		'name': __( 'About Author', 'otter-blocks' ),
		'icon': 'admin-users'
	},
	{
		'slug': 'accordion',
		'name': __( 'Accordion', 'otter-blocks' ),
		'icon': accordionIcon
	},
	{
		'slug': 'advanced-heading',
		'name': __( 'Advanced Heading', 'otter-blocks' ),
		'icon': headingIcon
	},
	{
		'slug': 'business-hours',
		'name': __( 'Business Hours', 'otter-blocks' ),
		'isPro': true,
		'icon': window?.otterUtils?.icons?.businessHoursIcon
	},
	{
		'slug': 'button-group',
		'name': __( 'Button Group', 'otter-blocks' ),
		'icon': buttonsIcon
	},
	{
		'slug': 'circle-counter',
		'name': __( 'Circle Counter', 'otter-blocks' ),
		'icon': circleIcon
	},
	{
		'slug': 'countdown',
		'name': __( 'Countdown', 'otter-blocks' ),
		'icon': countdownIcon
	},
	{
		'slug': 'flip',
		'name': __( 'Flip Card', 'otter-blocks' ),
		'icon': flipIcon
	},
	{
		'slug': 'font-awesome-icons',
		'name': __( 'Icon', 'otter-blocks' ),
		'icon': faIcon
	},
	{
		'slug': 'form',
		'name': __( 'Form', 'otter-blocks' ),
		'icon': formIcon
	},
	{
		'slug': 'google-map',
		'name': __( 'Google Maps', 'otter-blocks' ),
		'icon': googleMapIcon
	},
	{
		'slug': 'icon-list',
		'name': __( 'Icon List', 'otter-blocks' ),
		'icon': iconListIcon
	},
	{
		'slug': 'leaflet-map',
		'name': __( 'Maps', 'otter-blocks' ),
		'icon': mapIcon
	},
	{
		'slug': 'lottie',
		'name': __( 'Lottie Animation', 'otter-blocks' ),
		'icon': lottieIcon
	},
	{
		'slug': 'plugin-cards',
		'name': __( 'Plugin Card', 'otter-blocks' ),
		'icon': 'admin-plugins'
	},
	{
		'slug': 'popup',
		'name': __( 'Popup', 'otter-blocks' ),
		'icon': popupIcon
	},
	{
		'slug': 'posts-grid',
		'name': __( 'Posts', 'otter-blocks' ),
		'icon': postsIcon
	},
	{
		'slug': 'progress-bar',
		'name': __( 'Progress Bar', 'otter-blocks' ),
		'icon': progressIcon
	},
	{
		'slug': 'review',
		'name': __( 'Product Review', 'otter-blocks' ),
		'icon': reviewIcon
	},
	{
		'slug': 'review-comparison',
		'name': __( 'Review Comparison Table', 'otter-blocks' ),
		'isPro': true,
		'icon': reviewIcon
	},
	{
		'slug': 'advanced-columns',
		'name': __( 'Section', 'otter-blocks' ),
		'icon': columnsIcon
	},
	{
		'slug': 'sharing-icons',
		'name': __( 'Sharing Icons', 'otter-blocks' ),
		'icon': sharingIcon
	},
	{
		'slug': 'slider',
		'name': __( 'Slider', 'otter-blocks' ),
		'icon': sliderIcon
	},
	{
		'slug': 'stripe-checkout',
		'name': __( 'Stripe Checkout', 'otter-blocks' ),
		'icon': cartIcon
	},
	{
		'slug': 'tabs',
		'name': __( 'Tabs', 'otter-blocks' ),
		'icon': tabsIcon
	},
	{
		'slug': 'woo-comparison',
		'name': __( 'WooCommerce Comparison Table', 'otter-blocks' ),
		'isPro': true,
		'icon': 'editor-table'
	}
];

const BlockCard = ({ block }) => {
	console.log( block );
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
			<ToggleControl />
		</div>
	);
};

const Blocks = () => {
	return (
		<div className="o-block-cards">
			{
				otterBlocks.map( block => {
					return (
						<BlockCard block={ block } />
					);
				})
			}
		</div>
	);
};

export default Blocks;
