/**
 * WordPress dependencies.
 */
import { parse } from '@wordpress/blocks';

import { BlockPreview } from '@wordpress/block-editor';

import { useSelect } from '@wordpress/data';

const Homepage = () => {
	const { template } = useSelect( select => {
		const { getTemplate } = select( 'otter/onboarding' );

		const template = getTemplate({ slug: 'front-page' });
		const parsedTemplate = template?.content?.raw ? parse( template?.content?.raw ) : [];

		return {
			template: parsedTemplate
		};
	});

	return (
		<BlockPreview
			blocks={ template }
		/>
	);
};

export default Homepage;
