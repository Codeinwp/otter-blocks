import { BlockSettingsMenuControls } from '@wordpress/block-editor';
import { MenuItem } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import blockIcon from '../blocks/icon';

const WrapInControls = () => {
	const { clientIds, blocks } = useSelect( ( select ) => {
		const { getSelectedBlockClientIds, getBlocksByClientId } = select( 'core/block-editor' );
		const ids = getSelectedBlockClientIds();
		return { clientIds: ids, blocks: getBlocksByClientId( ids ) };
	}, [] );

	const { replaceBlocks } = useDispatch( 'core/block-editor' );

	const allAtomic = blocks.length > 0 && blocks.every( ( b ) => b?.name?.startsWith( 'atomic-wind/' ) );
	if ( ! allAtomic ) {
		return null;
	}

	const wrapIn = ( wrapperName, attrs = {} ) => {
		const wrapper = createBlock(
			wrapperName,
			attrs,
			blocks.map( ( b ) => createBlock( b.name, b.attributes, b.innerBlocks ) )
		);
		replaceBlocks( clientIds, [ wrapper ] );
	};

	return (
		<BlockSettingsMenuControls>
			{ ( { onClose } ) => (
				<>
					<MenuItem
						icon={ blockIcon }
						onClick={ () => {
							wrapIn( 'atomic-wind/box' );
							onClose();
						} }
					>
						{ __( 'Wrap in Box', 'otter-blocks' ) }
					</MenuItem>
					<MenuItem
						icon={ blockIcon }
						onClick={ () => {
							wrapIn( 'atomic-wind/link', { mode: 'inner-blocks' } );
							onClose();
						} }
					>
						{ __( 'Wrap in Link', 'otter-blocks' ) }
					</MenuItem>
				</>
			) }
		</BlockSettingsMenuControls>
	);
};

registerPlugin( 'atomic-wind-wrap-in', { render: WrapInControls } );
