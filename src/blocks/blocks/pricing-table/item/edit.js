import Inspector from './inspector';
import classnames from 'classnames';

import { RichText, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default ({ attributes, className, setAttributes }) => {
	const {
		title,
		description,
		isFeatured,
		buttonText,
		hasTableLink,
		linkText
	} = attributes;

	const tableClasses = classnames([ className, { featured: isFeatured } ]);

	const Header = () => (
		<div className="o-pricing-header">
			{ isFeatured && (
				<span className="featured-badge">Best value!</span>
			) }
			<RichText
				identifier="title"
				tagName="h3"
				className="o-pricing-title"
				placeholder={ __( 'Plan Name', 'otter-blocks' ) }
				value={ title }
				onChange={ ( nextTitle ) =>
					setAttributes({ title: nextTitle })
				}
			/>
			<RichText
				identifier="description"
				tagName="p"
				className="o-pricing-description"
				placeholder={ __( 'Plan Description', 'otter-blocks' ) }
				value={ description }
				onChange={ ( nextDescription ) =>
					setAttributes({ description: nextDescription })
				}
			/>
			<div className="o-pricing-price">
				<h5>
					<del className="full-price">
						<sup>€</sup>
						<span>59</span>
					</del>
					<span className="price">
						<sup>€</sup>
						<span>41</span>
					</span>
					<sub className="period">/year</sub>
				</h5>
			</div>
			<div className="o-pricing-action-wrap">
				<a className="o-pricing-action" href="#">
					{ buttonText }
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
			<div className={ tableClasses }>
				<div className="pricing-table-wrap">
					<Header />
					<InnerBlocks
						template={ [ [ 'core/list' ], [ 'core/list' ] ] }
						allowedBlocks={ [ 'core/list' ] }
					/>
					<div className="o-pricing-footer">
						{ hasTableLink && (
							<a href="#" className="open-features-table">
								{ linkText }
							</a>
						) }
					</div>
				</div>
			</div>
		</>
	);
};
