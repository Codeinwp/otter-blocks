import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { url, alt } = attributes;

	const blockProps = useBlockProps.save();

	return <img { ...blockProps } src={ url || '' } alt={ alt || '' } />;
}
