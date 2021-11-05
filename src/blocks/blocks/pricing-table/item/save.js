import { RichText, InnerBlocks } from '@wordpress/block-editor';
import classnames from 'classnames';

const Save = ({ attributes, className }) => {

	const tableClasses = classnames( className, { featured: attributes.isFeatured });

	return (
		<div className={ tableClasses }>
			<div className="pricing-table-wrap">
				<div className="o-pricing-header">
					{  attributes.isFeatured && (
						<span className="featured-badge">{ attributes.ribbonText }</span>
					) }
					{ ! RichText.isEmpty(  attributes.title ) && (
						<RichText.Content
							identifier="title"
							tagName="h3"
							className="o-pricing-title"
							value={  attributes.title }
						/>
					) }
					{ ! RichText.isEmpty(  attributes.description ) && (
						<RichText.Content
							identifier="description"
							tagName="p"
							className="o-pricing-description"
							value={  attributes.description }
						/>
					) }
					<div className="o-pricing-price">
						<h5>
							<del
								className="full-price"
							>
								<sup>{ attributes.currency }</sup>
								<span>{ attributes.oldPrice }</span>
							</del>
							<span
								className="price"
							>
								<sup>{ attributes.currency }</sup>
								<span>{ attributes.price }</span>
							</span>
							<sub className="period">/{ attributes.period }</sub>
						</h5>
					</div>
					<div
						className="o-pricing-action-wrap"
					>
						<a
							className="o-pricing-action"
							href={ attributes.buttonLink }
						>
							{ attributes.buttonText }
						</a>
					</div>
				</div>
				<InnerBlocks.Content />
				<div className="o-pricing-footer">
					{  attributes.hasTableLink && (
						<a
							href="#"
							className="open-features-table"
							data-selector={  attributes.selector }
						>
							{  attributes.linkText }
						</a>
					) }
				</div>
			</div>
		</div>
	);
};

export default Save;
