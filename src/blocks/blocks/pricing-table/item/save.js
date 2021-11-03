import { RichText, InnerBlocks } from '@wordpress/block-editor';
import classnames from 'classnames';

export default ( { attributes } ) => {
	const {
		title,
		description,
		isFeatured,
		variations,
		buttonText,
		className,
		hasTableLink,
		linkText,
		selector,
	} = attributes;

	const tableClasses = classnames( className, { featured: isFeatured } );

	const Header = () => (
		<div className="o-pricing-header">
			{ isFeatured && (
				<span className="featured-badge">Best value!</span>
			) }
			{ ! RichText.isEmpty( title ) && (
				<RichText.Content
					identifier="title"
					tagName="h3"
					className="o-pricing-title"
					value={ title }
				/>
			) }
			{ ! RichText.isEmpty( description ) && (
				<RichText.Content
					identifier="description"
					tagName="p"
					className="o-pricing-description"
					value={ description }
				/>
			) }
			<div className="o-pricing-price">
				{ variations.map( ( variation, index ) => {
					const classes = classnames( [
						variation,
						`variation-${ index + 1 }`,
						'fsc-bind-price',
						'fast-spring',
					] );

					const variationStyle =
						1 < variations.length ? { display: 'none' } : {};

					return (
						<h5
							style={ variationStyle }
							className={ classes }
							key={ index }
						>
							<del
								className="full-price"
								data-fsc-item-path={ variation }
								data-fsc-item-priceTotal=""
							/>
							<span
								className="price"
								data-fsc-item-path={ variation }
								data-fsc-item-total=""
							/>
							<sub className="period">/year</sub>
						</h5>
					);
				} ) }
			</div>
			<div className="o-pricing-action-wrap">
				<ActionButton />
			</div>
		</div>
	);

	const ActionButton = () =>
		variations.map( ( variation, index ) => {
			const classes = classnames( [
				variation,
				`variation-${ index + 1 }`,
				'o-pricing-action',
				'fast-spring',
			] );

			const btnStyle = 1 < variations.length ? { display: 'none' } : {};

			return (
				<a
					href="#"
					key={ index }
					style={ btnStyle }
					data-fsc-action="Reset,Add,Promocode,Checkout"
					data-fsc-item-path-value={ variation }
					data-fsc-item-path={ variation }
					className={ classes }
				>
					{ buttonText }
				</a>
			);
		} );

	return (
		<div className={ tableClasses }>
			<div className="pricing-table-wrap">
				<Header />
				<InnerBlocks.Content />
				<div className="o-pricing-footer">
					{ hasTableLink && (
						<a
							href="#"
							className="open-features-table"
							data-selector={ selector }
						>
							{ linkText }
						</a>
					) }
				</div>
			</div>
		</div>
	);
};
