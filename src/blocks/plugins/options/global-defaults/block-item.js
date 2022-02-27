/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { getBlockType } from '@wordpress/blocks';

import {
	Button,
	Icon,
	Modal
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

const BlockItem = ({
	blockName,
	saveConfig,
	resetConfig,
	children
}) => {
	const block = getBlockType( blockName );

	const [ isOpen, setOpen ] = useState( false );
	const [ isLoading, setLoading ] = useState( false );

	if ( ! block ) {
		return null;
	}

	return (
		<Fragment>
			<Button
				className="o-options-global-defaults-list-item block-editor-block-types-list__item"
				onClick={ () => setOpen( true ) }
			>
				<div className="o-options-global-defaults-list-item-icon">
					<Icon
						icon={ block.icon.src }
					/>
				</div>

				<div className="o-options-global-defaults-list-item-title">
					{ block.title }
				</div>
			</Button>

			{ isOpen && (
				<Modal
					title={ block.title }
					onRequestClose={ () => setOpen( false ) }
					shouldCloseOnClickOutside={ false }
					overlayClassName="o-options-global-defaults-modal"
				>
					{ children }

					<div className="o-options-global-defaults-actions">
						<Button
							isLink
							isDestructive
							onClick={ () => resetConfig( blockName ) }
						>
							{ __( 'Reset', 'otter-blocks' ) }
						</Button>

						<div className="o-options-global-defaults-actions-primary">
							<Button
								isSecondary
								onClick={ () => setOpen( false ) }
							>
								{ __( 'Close', 'otter-blocks' ) }
							</Button>

							<Button
								isPrimary
								isBusy={ isLoading }
								onClick={ async() => {
									setLoading( true );
									await saveConfig();
									setLoading( false );
								} }
							>
								{ __( 'Save', 'otter-blocks' ) }
							</Button>
						</div>
					</div>
				</Modal>
			) }
		</Fragment>
	);
};

export default BlockItem;
