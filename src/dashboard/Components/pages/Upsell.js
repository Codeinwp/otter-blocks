/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

const FEATURES = [
	{
		label: __( 'Visibility Conditions Extension', 'otter-blocks' ),
		description: __( 'Get more conditions in the Visibility Conditions module including WooCommerce & LearnDash conditions.', 'otter-blocks' )
	},
	{
		label: __( 'WooCommerce Builder', 'otter-blocks' ),
		description: __( 'Build custom WooCommerce product pages using the Block Editor with the WooCommerce Builder in Otter Pro.', 'otter-blocks' )
	},
	{
		label: __( 'ACF Extension for Posts Block', 'otter-blocks' ),
		description: __( 'Fetch and display ACF fields in Posts Block with the Advanced Custom Fields Extension', 'otter-blocks' )
	},
	{
		label: __( 'Sticky & Popup Extension', 'otter-blocks' ),
		description: __( 'Get even more options in Otter\' Sticky feature and Popup Block to customize your website even more ways.', 'otter-blocks' )
	},
	{
		label: __( 'Comparison Table for Review Block', 'otter-blocks' ),
		description: __( 'A beautiful way to compare different product reviews made on your website.', 'otter-blocks' )
	},
	{
		label: __( 'Sync Review Block with WooCommerce', 'otter-blocks' ),
		description: __( 'Sync your product reviews with WooCommece so you don\'t have to update the product details manually in two places.', 'otter-blocks' )
	},
	{
		label: __( 'Business Hours Block', 'otter-blocks' ),
		description: __( 'Create and Display your business schedule on your website. Choose between 2 styles, and customize it with the advanced features, making it look the way you want.', 'otter-blocks' )
	}
];

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

				{ FEATURES.map( feature => {
					return (
						<li className="t-row">
							<div className="content">
								<div className="h-wrap">
									<h4>{ feature.label }</h4>
								</div>
								<p>{ feature.description}</p>
							</div>

							<div className="c"><svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path d="M22.5326 10.5767L17.2226 15.8867L22.5326 21.1967L20.4176 23.3117L15.1076 18.0167L9.81262 23.3117L7.68262 21.1817L12.9776 15.8867L7.68262 10.5917L9.81262 8.46167L15.1076 13.7567L20.4176 8.46167L22.5326 10.5767Z" fill="#FF7E65"></path></svg></div>
							<div className="c"><svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path d="M22.9863 7.99243L12.7863 18.1924L8.58633 13.9924L6.48633 16.0924L12.7863 22.3924L25.0863 10.0924" fill="#5FBFD5"></path></svg></div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default Upsell;
