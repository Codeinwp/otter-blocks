/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalBlockNavigationList,
	__experimentalBlockNavigationTree,
	BlockControls
} from '@wordpress/block-editor';

import {
	Button,
	Modal,
	Toolbar
} from '@wordpress/components';

import {
	useSelect,
	useDispatch
} from '@wordpress/data';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { navigatorIcon } from '../../helpers/icons.js';

const BlockNavigatorControl = ({ clientId }) => {
	const {
		block,
		selectedBlockClientId
	} = useSelect( select => {
		const {
			getSelectedBlockClientId,
			getBlock
		} = select( 'core/block-editor' );

		return {
			block: getBlock( clientId ),
			selectedBlockClientId: getSelectedBlockClientId()
		};
	}, []);

	const { selectBlock } = useDispatch( 'core/block-editor' );

	const [ isOpen, setOpen ] = useState( false );

	const BlockNavigation = __experimentalBlockNavigationList || __experimentalBlockNavigationTree;

	return (
		<Fragment>
			<BlockControls>
				<Toolbar>
					<Button
						className="components-toolbar__control"
						label={ __( 'Open block navigator', 'otter-blocks' ) }
						showTooltip={ true }
						onClick={ () => setOpen( true ) }
						icon={ navigatorIcon }
					/>
				</Toolbar>
			</BlockControls>

			{ isOpen && (
				<Modal
					title={ __( 'Block Navigator', 'otter-blocks' ) }
					closeLabel={ __( 'Close', 'otter-blocks' ) }
					onRequestClose={ () => setOpen( false ) }
				>
					<BlockNavigation
						blocks={ [ block ] }
						selectedBlockClientId={ selectedBlockClientId }
						selectBlock={ selectBlock }
						showNestedBlocks
					/>
				</Modal>
			) }
		</Fragment>
	);
};

export default BlockNavigatorControl;
