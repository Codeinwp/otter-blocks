/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './editor.scss';

type BlockAppenderButtonProps = {
	buttonText?: string,
	clientId: string,
	allowedBlock: string,
} & Button.Props;

/**
 * Button to append a block. Allows a single block type.
 *
 * @param buttonText The text to display in the button.
 * @param clientId Root client ID.
 * @param allowedBlock The allowed block type.
 * @param props Button props.
 */
const BlockAppender = ({
	buttonText = __( 'Add Item' ),
	clientId,
	allowedBlock,
	...props
}: BlockAppenderButtonProps ) => {
	const { insertBlock } = useDispatch( 'core/block-editor' );
	const { getBlock } = useSelect(
		( select:( store: string ) => any ) => select( 'core/block-editor' ),
		[]);

	const onClick = () => {
		const { innerBlocks } = getBlock( clientId );
		const newBlock = createBlock( allowedBlock );
		insertBlock( newBlock, innerBlocks.length, clientId );
	};

	const { className, ...restProps } = props;

	return (
		<Button
			onClick={ onClick }
			className={ classnames(
				'o-block-appender-button',
				className
			) }
			{ ...restProps }
		>
			{ buttonText }
		</Button>
	);
};

export default BlockAppender;
