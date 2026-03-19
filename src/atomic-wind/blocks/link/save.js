import { useBlockProps, useInnerBlocksProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { url, text, opensInNewTab, rel, mode } = attributes;
	const blockProps = useBlockProps.save();
	const target = opensInNewTab ? '_blank' : undefined;
	const relValue = rel || ( opensInNewTab ? 'noopener noreferrer' : undefined );

	if ( mode === 'inner-blocks' ) {
		const innerBlocksProps = useInnerBlocksProps.save( {
			...blockProps,
			href: url,
			target,
			rel: relValue,
		} );

		return <a { ...innerBlocksProps } />;
	}

	return (
		<RichText.Content
			{ ...blockProps }
			tagName="a"
			href={ url }
			value={ text }
			target={ target }
			rel={ relValue }
		/>
	);
}
