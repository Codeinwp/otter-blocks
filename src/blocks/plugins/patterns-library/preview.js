/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { parse } from '@wordpress/blocks';

import { BlockPreview } from '@wordpress/block-editor';

import { Button } from '@wordpress/components';

const Preview = ({
	content,
	onBack,
	onInsert
}) => {
	return (
		<>
			<div className="o-library__preview">
				<BlockPreview
					blocks={ parse( content ) }
					viewportWidth={ 1400 }
					additionalStyles={ [
						{ css: ':root { --parent-vh: 850px; }' }
					] }
				/>
			</div>

			<div className="o-library__modal__footer">
				<Button
					variant="tertiary"
					onClick={ onBack }
				>
					{ __( 'Back', 'otter-blocks' ) }
				</Button>

				<Button
					variant="primary"
					onClick={ onInsert }
				>
					{ __( 'Insert', 'otter-blocks' ) }
				</Button>
			</div>
		</>
	);
};

export default Preview;
