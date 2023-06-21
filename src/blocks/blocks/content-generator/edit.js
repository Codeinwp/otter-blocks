/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Button, Disabled, ResizableBox, SelectControl } from '@wordpress/components';

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
import { useDispatch, useSelect } from '@wordpress/data';

const { attributes: defaultAttributes } = metadata;

const PRESETS = {
	form: {
		title: 'Form Generator',
		description: 'Write what type of form do you want to have.'
	}
};

function formatNameBlock( name ) {
	const namePart = name.split( '/' )[1];
	return namePart.split( ' ' ).map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) ).join( ' ' );
}

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
	const [ promptActions, setPromptActions ] = useState({});

	const [ containerCliendId, setContainerCliendId ] = useState( '' );

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

			setPromptActions( actions );

			replaceInnerBlocks( clientId, [ form ]);
		}
	};

	const { hasInnerBlocks, containerId, getBlocks } = useSelect(
		select => {

			const { getBlocks } = select( 'core/block-editor' );

			const blocks = getBlocks?.( clientId ) ?? [];

			return {
				hasInnerBlocks: getBlocks?.( clientId ).length,
				containerId: blocks[0]?.clientId,
				getBlocks
			};
		},
		[ clientId ]
	);

	const validBlocksToReplace = useSelect( select => {
		const { getBlocks } = select( 'core/block-editor' );

		const blocks = getBlocks?.( ) ?? [];

		return blocks
			.filter( block => {
				return 'themeisle-blocks/form' === block?.name;
			})
			.filter( block => block.clientId && block.clientId !== clientId )
			.map( ( block, idx ) => ({
				clientId: block?.clientId,
				name: `${formatNameBlock( block?.name )}#${idx}`
			}) );
	}, [ clientId ]);

	const replaceTargetBlock = () => {

		if ( ! validBlocksToReplace?.some( block => block?.clientId === attributes.blockToReplace ) ) {
			return;
		}

		const blocksToAdd = getBlocks?.( containerId ) ?? [];
		if ( ! blocksToAdd.length ) {
			return;
		}

		replaceInnerBlocks( attributes.blockToReplace, blocksToAdd );
	};

	const showActionsButton = isSelected && hasInnerBlocks;

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

				<Disabled>
					<InnerBlocks renderAppender={false}/>
				</Disabled>


				{
					showActionsButton && (
						<div className="o-actions">
							<Button
								variant={ 'primary' }
								onClick={replaceTargetBlock}
							>
								{ 'Replace Fields' }
							</Button>
							<SelectControl
								value={attributes.blockToReplace}
								options={[
									{
										label: 'Select block to replace',
										value: ''
									},
									...( validBlocksToReplace?.map( block => ({
										label: block.name,
										value: block.clientId
									}) ) ?? [])
								]}
								onChange={value => {
									console.log( 'Replace original block with new one' );
									setAttributes({
										blockToReplace: value
									});
								}}
							/>
						</div>
					)
				}

			</div>
		</Fragment>
	);
};

export default ContentGenerator;
