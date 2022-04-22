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
	RichText,
	useBlockProps
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
	clientId
}) => {
	const contentRef = useRef( null );

	const {
		parentClientId
	} = useSelect( select => {
		const {
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );

		const parentClientId = getBlockRootClientId( clientId );
		const parentBlock = getBlock( parentClientId );

		return {
			parentClientId: parentBlock.clientId
		};
	}, []);

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

	const blockProps = useBlockProps({
		ref: contentRef
	});

	return (
		<Fragment>
			<Inspector
				setAttributes={ setAttributes }
				selectParent={ () => selectBlock( parentClientId ) }
			/>

			<div { ...blockProps }>
				<RichText
					placeholder={ __( 'Add title…', 'otter-blocks' ) }
					value={ attributes.title }
					onChange={ value => setAttributes({ title: value }) }
					className={ classnames(
						'wp-block-themeisle-blocks-tabs-item__header',
						{
							'active': attributes.defaultOpen ? attributes.defaultOpen : false
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
