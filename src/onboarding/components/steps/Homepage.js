/**
 * WordPress dependencies.
 */
import { parse } from '@wordpress/blocks';

import { BlockPreview } from '@wordpress/block-editor';

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import { resolvePatternBlocks } from '../../utils';

const Homepage = () => {
	const { template } = useSelect( select => {
		const { getTemplate } = select( 'otter/onboarding' );
		const core = select( 'core' );
		const patterns = ( 'function' === typeof core?.getBlockPatterns ) ? ( core.getBlockPatterns() ?? []) : [];

		const template = getTemplate({ slug: 'front-page' });
		const parsedTemplate = template?.content?.raw ? parse( template?.content?.raw ) : [];

		return {
			template: resolvePatternBlocks( parsedTemplate, patterns )
		};
	});

	return (
		<BlockPreview
			viewportWidth={ 0 }
			blocks={ template }
		/>
	);
};

export default Homepage;
