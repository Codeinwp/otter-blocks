/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Button, ResizableBox } from '@wordpress/components';

import {
	InnerBlocks,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import {
	Fragment,
	useEffect,
	useRef,
	useState
} from '@wordpress/element';

import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Inspector from './inspector.js';
import PromptPlaceholder from '../../components/prompt';
import { parseFormPromptResponseToBlocks } from '../../helpers/prompt';
import { useDispatch } from '@wordpress/data';

const { attributes: defaultAttributes } = metadata;

const PRESETS = {
	form: {
		title: 'Form Generator',
		description: 'Write what type of form do you want to have.'
	}
};

/**
 * Progress Bar Block
 * @param {import('./types').ContentGeneratorProps} props
 */
const ContentGenerator = ({
	attributes,
	setAttributes,
	isSelected,
	clientId,
	toggleSelection
}) => {

	const blockProps = useBlockProps();

	const [ prompt, setPrompt ] = useState( '' );

	const {
		insertBlock,
		removeBlock,
		replaceInnerBlocks,
		selectBlock,
		moveBlockToPosition
	} = useDispatch( 'core/block-editor' );

	/**
	 * On success callback
	 *
	 * @type {import('../../components/prompt').PromptOnSuccess}
	 */
	const onSuccess = ( result, actions ) => {
		if ( 'form' === attributes.generationType ) {

			const formFields = parseFormPromptResponseToBlocks( result );

			const form = createBlock( 'themeisle-blocks/form', {}, formFields );

			console.log( form );

			actions.clearHistory();

			replaceInnerBlocks( clientId, [ form ]);


		}
	};

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }

			/>

			<div { ...blockProps }>
				<PromptPlaceholder
					promptName={attributes.generationType}
					title={PRESETS?.[attributes.generationType]?.title}
					description={PRESETS?.[attributes.generationType]?.description}
					value={prompt}
					onValueChange={setPrompt}
					onSuccess={onSuccess}
				/>

				<InnerBlocks/>
			</div>

			<div>
				<Button
					variant={ 'primary' }
					onClick={ () => {
						console.log( 'Replace original block with new one' );
					}}
				>
					{ 'Replace' }
				</Button>
			</div>

		</Fragment>
	);
};

export default ContentGenerator;
