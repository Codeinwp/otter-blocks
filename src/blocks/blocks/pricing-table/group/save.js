

import { InnerBlocks, RichText } from '@wordpress/block-editor';


export default ({ attributes }) => {
	const { hasMoneyBackSection, title, text } = attributes;
	return (
		<>
			<div className="ti-pricing-table-group-wrap">
				<InnerBlocks.Content />
			</div>
			{ hasMoneyBackSection && (
				<div className="ti-money-back">
					<div className="icon">
						<img

							alt="Money back icon"
							width="95"
							height="95"
						/>
					</div>
					<div className="content">
						{ ! RichText.isEmpty( title ) && (
							<RichText.Content
								identifier="money-back-title"
								value={ title }
								tagName="h3"
							/>
						) }
						{ ! RichText.isEmpty( text ) && (
							<RichText.Content
								identifier="money-back-text"
								value={ text }
								tagName="p"
							/>
						) }
					</div>
				</div>
			) }
		</>
	);
};
