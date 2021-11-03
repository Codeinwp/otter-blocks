import Inspector from './inspector';
import classnames from 'classnames';

import { RichText, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default ({ attributes, className, setAttributes }) => {

	const tableClasses = classnames([ className, { featured: attributes.isFeatured } ]);

	const Header = () => (
		<div className="o-pricing-header">
			{  attributes.isFeatured && (
				<span className="featured-badge">Best value!</span>
			) }
			<RichText
				identifier="title"
				tagName="h3"
				className="o-pricing-title"
				placeholder={ __( 'Plan Name', 'otter-blocks' ) }
				value={ attributes.title }
				onChange={ title => setAttributes({ title }) }
				style={{
					color: attributes.titleColor
				}}
			/>
			<RichText
				identifier="description"
				tagName="p"
				className="o-pricing-description"
				placeholder={ __( 'Plan Description', 'otter-blocks' ) }
				value={ attributes.description }
				onChange={ description => setAttributes({ description }) }
				style={{
					color: attributes.descriptionColor
				}}
			/>
			<div className="o-pricing-price">
				<h5>
					<del className="full-price">
						<sup>€</sup>
						<span>59</span>
					</del>
					<span
						className="price"
						style={{
							color: attributes.priceColor
						}}
					>
						<sup>€</sup>
						<span>41</span>
					</span>
					<sub className="period">/year</sub>
				</h5>
			</div>
			<div
				className="o-pricing-action-wrap"
			>
				<a
					className="o-pricing-action"
					href={ attributes.buttonLink }
					style={{
						background: attributes.buttonColor
					}}
				>
					{ attributes.buttonText }
				</a>
			</div>
		</div>
	);

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
			<div
				className={ tableClasses }
			>
				<div
					className="pricing-table-wrap"
					style={{
						backgroundColor: attributes.backgroundColor
					}}
				>
					<Header />
					<InnerBlocks
						template={ [ [ 'core/list' ], [ 'core/list' ] ] }
						allowedBlocks={ [ 'core/list' ] }
					/>
					<div className="o-pricing-footer">
						{  attributes.hasTableLink && (
							<a href="#" className="open-features-table">
								{ attributes.linkText }
							</a>
						) }
					</div>
				</div>
			</div>
		</>
	);
};
