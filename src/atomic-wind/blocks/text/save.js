import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { tagName, content } = attributes;
	const blockProps = useBlockProps.save();

	return (
		<RichText.Content
			{ ...blockProps }
			tagName={ tagName }
			value={ content }
			data-rich-text=""
		/>
	);
}
