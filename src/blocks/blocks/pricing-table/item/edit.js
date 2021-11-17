/** @jsx jsx */
import Inspector from './inspector';
import classnames from 'classnames';

import {
	css,
	jsx
} from '@emotion/react';

import {
	useEffect
} from '@wordpress/element';

import { RichText, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import defaultAttributes from './attributes.js';
import { blockInit } from '../../../helpers/block-utility';

const Edit = ({ attributes, className, setAttributes, clientId }) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, []);

	const tableClasses = classnames([ className, { featured: attributes.isFeatured } ]);

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
					className="o-pricing-table-wrap"
					style={{
						backgroundColor: attributes.backgroundColor,
						borderWidth: attributes.borderWidth,
						borderColor: attributes.borderColor,
						borderStyle: attributes.borderStyle
					}}
				>
					<div className="o-pricing-header">
						{  attributes.isFeatured && (
							<span
								className="featured-badge"
								style={{
									backgroundColor: attributes.ribbonColor
								}}
								css={
									css`
									&:before {
										background-color: ${attributes.ribbonColor};
									}
									&:after {
										border-top-color: ${attributes.ribbonColor};
										border-bottom-color: ${attributes.ribbonColor};
									}
									`
								}
							>
								{ attributes.ribbonText }
							</span>
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
								{
									attributes.isSale && (
										<del
											className="full-price"
											style={{
												color: attributes.oldPriceColor
											}}
										>
											<sup>{ attributes.currency }</sup>
											<span>{ attributes.oldPrice }</span>
										</del>
									)
								}
								<span
									className="price"
									style={{
										color: attributes.priceColor
									}}
								>
									<sup>{ attributes.currency }</sup>
									<span>{ attributes.price }</span>
								</span>
								<sub
									className="period"
									style={{
										color: attributes.priceColor
									}}
								>/{ attributes.period }</sub>
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

export default Edit;
