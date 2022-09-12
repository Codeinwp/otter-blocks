/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import { setUtm } from '../../../blocks/helpers/helper-functions.js';

const FEATURES = [
	{
		label: __( 'More than 30 Custom Blocks', 'otter-blocks' ),
		description: __( 'Harness the potential of the new WordPress era with the growing list of 30+ page building blocks, covering all the elements needed to build a website.', 'otter-blocks' ),
		inFree: true
	},
	{
		label: __( 'Extra Functionalities for all Blocks', 'otter-blocks' ),
		description: __( 'Otter Blocks adds extra functionality such as Custom CSS, Animations and Visibility Conditions to default or third party blocks present on your website.', 'otter-blocks' ),
		inFree: true
	},
	{
		label: __( 'Premium Blocks', 'otter-blocks' ),
		description: __( 'Enhance your website\'s design with powerful Pro Blocks, like the Add to Cart Block, Business Hours Block and more blocks are coming soon.', 'otter-blocks' )
	},
	{
		label: __( 'Extended Visibility Conditions & Sticky Blocks functionality', 'otter-blocks' ),
		description: __( 'The Visibility Conditions feature allows you to set which conditions should be met for your chosen blocks to be displayed on the page. While the Sticky feature lets you set a Block as sticky, so that it sticks to its parent. ', 'otter-blocks' )
	},
	{
		label: __( 'Dynamic Values', 'otter-blocks' ),
		description: __( 'Streamline your Workflow with Otter Dynamic Values, which allows you to bind certain elements in the editor - with the dynamic data from your website database.', 'otter-blocks' )
	},
	{
		label: __( 'Review Comparison Table', 'otter-blocks' ),
		description: __( 'Allows you to display and compare a selection of product reviews made on the website.', 'otter-blocks' )
	},
	{
		label: __( 'WooCommerce Builder Blocks', 'otter-blocks' ),
		description: __( 'Build custom Single Product Pages using WooCommerce Builder Blocks by Otter. All the new features from Otter Pro are designed to maximize your conversion rate.', 'otter-blocks' )
	},
	{
		label: __( 'Extended Popups', 'otter-blocks' ),
		description: __( 'Display your content in beautiful popup with many customization options. Otter Pro extends the functionality of the popups in the free Otter version, with more advanced options.', 'otter-blocks' )
	},
	{
		label: __( 'Priority Support', 'otter-blocks' ),
		description: __( 'Our Happiness Engineers are happy to help you get the best results from our products. On average, Otter Pro user get a reply in five hours or less.', 'otter-blocks' )
	}
];

const crossIcon = <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path d="M22.5326 10.5767L17.2226 15.8867L22.5326 21.1967L20.4176 23.3117L15.1076 18.0167L9.81262 23.3117L7.68262 21.1817L12.9776 15.8867L7.68262 10.5917L9.81262 8.46167L15.1076 13.7567L20.4176 8.46167L22.5326 10.5767Z" fill="#FF7E65"></path></svg>;
const checkIcon = <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path d="M22.9863 7.99243L12.7863 18.1924L8.58633 13.9924L6.48633 16.0924L12.7863 22.3924L25.0863 10.0924" fill="#5FBFD5"></path></svg>;

const Upsell = () => {
	return (
		<div className="otter-upsell">
			<div className="upsell-title">
				<h2>{ __( 'Powerful features available only in Otter Pro', 'otter-blocks' ) }</h2>
			</div>

			<ul className="upsell-table">
				<li className="t-head">
					<div></div>
					<div className="c">{ __( 'Free', 'otter-blocks' ) }</div>
					<div className="c">{ __( 'Pro', 'otter-blocks' ) }</div>
				</li>

				{ FEATURES.map( ( feature, i ) => {
					return (
						<li
							key={ i }
							className="t-row"
						>
							<div className="content">
								<div className="h-wrap">
									<h4>{ feature.label }</h4>
								</div>
								<p>{ feature.description}</p>
							</div>

							<div className="c">{ feature?.inFree ? checkIcon : crossIcon }</div>
							<div className="c">{ checkIcon }</div>
						</li>
					);
				})}
			</ul>

			<Button
				variant="primary"
				href={ setUtm( window.otterObj.upgradeLink, 'viewallfvsp' ) }
				target="_blank"
			>
				{ __( 'View all Otter Pro features', 'otter-blocks' ) }
			</Button>
		</div>
	);
};

export default Upsell;
