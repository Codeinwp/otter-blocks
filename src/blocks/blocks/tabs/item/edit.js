/**
 * External dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	RichText
} from '@wordpress/block-editor';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	Fragment,
	useRef
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import Inspector from './inspector.js';

const Edit = ({
	attributes,
	setAttributes,
	className,
	clientId
}) => {
	const contentRef = useRef( null );

	const {
		parentClientId,
		isFirstBlock
	} = useSelect( select => {
		const {
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );

		const parentClientId = getBlockRootClientId( clientId );
		const parentBlock = getBlock( parentClientId );

		return {
			parentClientId: parentBlock.clientId,
			isFirstBlock: clientId === parentBlock.innerBlocks[0].clientId
		};
	});

	const { selectBlock } = useDispatch( 'core/block-editor' );

	const switchActiveState = () => {
		const tabs = document.querySelectorAll( `#block-${ parentClientId } .wp-block-themeisle-blocks-tabs__content .wp-block-themeisle-blocks-tabs-item` );

		if ( tabs ) {
			tabs.forEach( tab => {
				tab.querySelector( '.wp-block-themeisle-blocks-tabs-item__header' )?.classList.remove( 'active' );
				tab.querySelector( '.wp-block-themeisle-blocks-tabs-item__content' )?.classList.remove( 'active' );
			});
		}

		if ( contentRef.current ) {
			contentRef.current.querySelector( '.wp-block-themeisle-blocks-tabs-item__header' )?.classList.add( 'active' );
			contentRef.current.querySelector( '.wp-block-themeisle-blocks-tabs-item__content' )?.classList.add( 'active' );
		}
	};

	return (
		<Fragment>
			<Inspector
				setAttributes={ setAttributes }
				selectParent={ () => selectBlock( parentClientId ) }
			/>

			<div
				className={ className }
				ref={ contentRef }
			>
				<RichText
					placeholder={ __( 'Add title…', 'otter-blocks' ) }
					value={ attributes.title }
					onChange={ value => setAttributes({ title: value }) }
					className={ classnames(
						'wp-block-themeisle-blocks-tabs-item__header',
						{
							'active': isFirstBlock
						}
					) }
					tagName="div"
					onClick={ switchActiveState }
					withoutInteractiveFormatting
				/>

				<div className="wp-block-themeisle-blocks-tabs-item__content">
					<InnerBlocks
						template={ [ [ 'core/paragraph' ] ] } />
				</div>
			</div>
		</Fragment>
	);
};

export default Edit;
